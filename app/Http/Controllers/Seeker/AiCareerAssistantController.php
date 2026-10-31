<?php

namespace App\Http\Controllers\Seeker;

use App\Contracts\AiProviderInterface;
use App\Http\Controllers\Controller;
use App\Models\AiHistory;
use App\Models\AiJobMatch;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Smalot\PdfParser\Parser as PdfParser;
use Throwable;

class AiCareerAssistantController extends Controller
{
    public function __construct(private AiProviderInterface $aiProvider) {}

    private function getSeekerProfile(Request $request): JobSeekerProfile
    {
        $seeker = $request->user()->jobSeekerProfile;
        if (! $seeker) {
            $seeker = JobSeekerProfile::create([
                'user_id' => $request->user()->id,
            ]);
        }

        return $seeker;
    }

    public function index(Request $request): Response
    {
        $seeker = $this->getSeekerProfile($request);

        // Fetch user's saved matches or recommended active vacancies
        $matches = AiJobMatch::where('job_seeker_profile_id', $seeker->id)
            ->with(['vacancy.companyProfile', 'vacancy.accessibilities'])
            ->orderByDesc('match_percentage')
            ->get();

        $activeVacancies = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->latest()
            ->limit(8)
            ->get();

        $aiHistories = $seeker->aiHistories()
            ->latest('analyzed_at')
            ->limit(40)
            ->get()
            ->map(static fn (AiHistory $history): array => [
                'id' => $history->id,
                'type' => $history->type,
                'payload' => $history->payload,
                'metadata_source' => $history->metadata_source,
                'analyzed_at' => $history->analyzed_at?->toIso8601String(),
            ]);

        return Inertia::render('app/ai-assistant/index', [
            'seeker' => $seeker->load('user.accessibilityProfile'),
            'savedMatches' => $matches,
            'activeVacancies' => $activeVacancies,
            'aiHistories' => $aiHistories,
            'profileCv' => [
                'has_cv' => filled($seeker->cv_path),
                'name' => $seeker->cv_path ? basename($seeker->cv_path) : null,
                'updated_at' => $seeker->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function matchVacancy(Request $request, Vacancy $vacancy): JsonResponse
    {
        $seeker = $this->getSeekerProfile($request);

        $this->ensureHistoryCapacity($seeker, 'job_match');

        // Reuse cached matching data, then derive skill gap from selected vacancy.
        $match = AiJobMatch::where('vacancy_id', $vacancy->id)
            ->where('job_seeker_profile_id', $seeker->id)
            ->first();

        if ($match) {
            $payload = $this->appendSkillGap($match->toArray(), $seeker, $vacancy);
        } else {
            // Run AI matching, then derive skill gap from the same selected vacancy.
            $result = $this->aiProvider->matchJob($seeker, $vacancy);

            $savedMatch = AiJobMatch::create([
                'vacancy_id' => $vacancy->id,
                'job_seeker_profile_id' => $seeker->id,
                'match_percentage' => $result['match_percentage'],
                'competency_score' => $result['competency_score'],
                'accessibility_score' => $result['accessibility_score'],
                'matching_points' => $result['matching_points'],
                'gaps' => $result['gaps'],
                'summary' => $result['summary'],
            ]);

            $payload = $this->appendSkillGap($savedMatch->toArray(), $seeker, $vacancy);
        }

        $this->saveAiHistory($seeker, 'job_match', $payload, (string) $vacancy->id);

        return response()->json($payload);
    }

    private function saveAiHistory(JobSeekerProfile $seeker, string $type, array $payload, string $source): void
    {
        $seeker->aiHistories()->create([
            'type' => $type,
            'payload' => $payload,
            'metadata_source' => $source,
            'analyzed_at' => now(),
        ]);
    }

    private function profileSkills(JobSeekerProfile $seeker): array
    {
        if (is_array($seeker->skills) && $seeker->skills !== []) {
            return array_values(array_filter($seeker->skills, 'is_string'));
        }

        $parts = array_filter([
            $seeker->current_job_title,
            $seeker->education,
            $seeker->experience,
            $seeker->bio,
        ]);

        return array_values(array_filter(preg_split('/[,\n;]+/u', implode(' ', $parts)) ?: [], static fn (string $skill): bool => trim($skill) !== ''));
    }

    private function appendSkillGap(array $matchPayload, JobSeekerProfile $seeker, Vacancy $vacancy): array
    {
        $vacancy->loadMissing(['companyProfile', 'accessibilities']);
        $matchPayload['vacancy'] = $vacancy->toArray();
        $matchPayload['skill_gap'] = $this->aiProvider->analyzeSkillGap(
            $this->profileSkills($seeker),
            array_values(array_filter($vacancy->skills_required ?? [], 'is_string'))
        );

        return $matchPayload;
    }

    public function skillGap(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'my_skills' => ['required', 'array'],
            'my_skills.*' => ['string'],
            'target_skills' => ['required', 'array'],
            'target_skills.*' => ['string'],
        ]);

        $result = $this->aiProvider->analyzeSkillGap(
            $validated['my_skills'],
            $validated['target_skills']
        );

        return response()->json($result);
    }

    private function ensureHistoryCapacity(JobSeekerProfile $seeker, string $type): void
    {
        $count = $seeker->aiHistories()->where('type', $type)->count();
        if ($count >= 20) {
            throw ValidationException::withMessages([
                'history' => 'Riwayat analisis untuk jenis ini sudah penuh (maksimal 20). Silakan hapus riwayat lama.',
            ]);
        }
    }

    public function listAiHistory(Request $request): JsonResponse
    {
        $seeker = $this->getSeekerProfile($request);
        $history = $seeker->aiHistories()
            ->latest('analyzed_at')
            ->limit(40)
            ->get()
            ->map(static fn (AiHistory $h): array => [
                'id' => $h->id,
                'type' => $h->type,
                'payload' => $h->payload,
                'metadata_source' => $h->metadata_source,
                'analyzed_at' => $h->analyzed_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $history]);
    }

    public function deleteAiHistory(Request $request, AiHistory $history): JsonResponse
    {
        $seeker = $request->user()->jobSeekerProfile;
        if ($history->job_seeker_profile_id !== $seeker->id) {
            abort(403);
        }

        $history->delete();

        return response()->json(null, 204);
    }

    public function cvReview(Request $request): JsonResponse
    {
        if ($request->filled('cv_text')) {
            $validated = $request->validate([
                'cv_text' => ['required', 'string', 'min:10'],
                'target_skills' => ['nullable', 'array'],
                'target_skills.*' => ['string'],
            ]);

            $seeker = $this->getSeekerProfile($request);
            $this->ensureHistoryCapacity($seeker, 'cv_analysis');
            $result = $this->normalizeCvResult(
                $this->aiProvider->reviewCvAts(
                    $validated['cv_text'],
                    $validated['target_skills'] ?? []
                ),
                $validated['target_skills'] ?? []
            );
            $this->saveAiHistory($seeker, 'cv_analysis', $result, 'text');

            return response()->json($result);
        }

        $validated = $request->validate([
            'source' => ['required', 'in:profile,upload'],
        ]);

        return $validated['source'] === 'profile'
            ? $this->reviewProfileCv($request)
            : $this->reviewUploadedCv($request);
    }

    private function reviewProfileCv(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_skills' => ['nullable', 'array'],
            'target_skills.*' => ['string'],
        ]);

        $seeker = $request->user()->jobSeekerProfile;
        if (empty($seeker?->cv_path)) {
            throw ValidationException::withMessages([
                'source' => 'CV profil belum tersedia. Silakan unggah CV terlebih dahulu.',
            ]);
        }

        if (! Storage::disk('public')->exists($seeker->cv_path)) {
            throw ValidationException::withMessages([
                'source' => 'File CV profil tidak ditemukan di sistem.',
            ]);
        }

        $this->ensureHistoryCapacity($seeker, 'cv_analysis');
        $cvText = $this->extractCvText($seeker->cv_path);
        $result = $this->normalizeCvResult($this->aiProvider->reviewCvAts($cvText, $validated['target_skills'] ?? []), $validated['target_skills'] ?? []);
        $this->saveAiHistory($seeker, 'cv_analysis', $result, 'profile');

        return response()->json($result);
    }

    private function reviewUploadedCv(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'target_skills' => ['nullable', 'array'],
            'target_skills.*' => ['string'],
        ]);

        $cvText = $this->extractUploadedCvText($request->file('cv'));
        $this->ensureHistoryCapacity($request->user()->jobSeekerProfile, 'cv_analysis');
        $result = $this->normalizeCvResult($this->aiProvider->reviewCvAts(
            $cvText,
            $validated['target_skills'] ?? []
        ), $validated['target_skills'] ?? []);
        $this->saveAiHistory(
            $request->user()->jobSeekerProfile,
            'cv_analysis',
            $result,
            $request->file('cv')->getClientOriginalName(),
        );

        return response()->json($result);
    }

    private function normalizeCvResult(array $result, array $targetSkills = []): array
    {
        $baseScore = max(0, min(100, (int) ($result['ats_score'] ?? 0)));
        $result['summary'] ??= 'Ringkasan analisis belum tersedia.';
        $result['category_scores'] = is_array($result['category_scores'] ?? null)
            ? array_filter($result['category_scores'], static fn (mixed $score): bool => is_numeric($score))
            : [];
        $result['strengths'] = array_values(array_filter($result['strengths'] ?? [], 'is_string'));
        $result['improvements'] = array_values(array_filter($result['improvements'] ?? [], 'is_string'));
        $result['strengths_detailed'] = $this->normalizeDetails($result['strengths_detailed'] ?? null, $result['strengths']);
        $result['improvements_detailed'] = $this->normalizeDetails($result['improvements_detailed'] ?? null, $result['improvements']);
        $result['suggested_keywords'] = array_values(array_filter($result['suggested_keywords'] ?? [], 'is_string'));
        $result['action_recommendations'] = array_values(array_filter($result['action_recommendations'] ?? [], 'is_string'));

        return $result;
    }

    private function normalizeDetails(mixed $details, array $fallbackTitles): array
    {
        if (is_array($details) && $details !== []) {
            return array_values(array_filter($details, static fn (mixed $detail): bool => is_array($detail) && is_string($detail['title'] ?? null)
            ));
        }

        return array_map(
            static fn (string $title): array => ['title' => $title, 'description' => ''],
            $fallbackTitles
        );
    }

    private function extractCvText(string $path): string
    {
        return $this->extractFileText(Storage::disk('public')->path($path), pathinfo($path, PATHINFO_EXTENSION));
    }

    private function extractUploadedCvText(UploadedFile $file): string
    {
        return $this->extractFileText($file->getRealPath(), $file->getClientOriginalExtension());
    }

    private function extractFileText(string $path, string $extension): string
    {
        $extension = strtolower($extension);

        try {
            if ($extension === 'pdf') {
                return $this->extractPdfText($path);
            }

            if ($extension === 'docx') {
                return $this->extractDocxText($path);
            }

            if ($extension === 'doc') {
                throw ValidationException::withMessages([
                    'cv' => 'Format DOC belum dapat dibaca otomatis. Simpan CV sebagai PDF atau DOCX lalu coba lagi.',
                ]);
            }

            $text = file_get_contents($path);
            if (is_string($text) && trim($text) !== '') {
                return trim($text);
            }
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
        }

        throw ValidationException::withMessages([
            'cv' => 'Isi CV tidak dapat dibaca. Gunakan file PDF atau DOCX yang tidak rusak.',
        ]);
    }

    private function extractPdfText(string $path): string
    {
        try {
            $text = trim((new PdfParser)->parseFile($path)->getText());
            if ($text !== '') {
                return $text;
            }
        } catch (Throwable) {
            // Some PDF generators omit a conventional object list; try simple text streams below.
        }

        $contents = file_get_contents($path);
        if (is_string($contents) && preg_match_all('/\(([^()]*)\)\s*Tj/', $contents, $matches)) {
            $text = trim(implode(' ', array_map(
                static fn (string $value): string => stripcslashes($value),
                $matches[1]
            )));
            if ($text !== '') {
                return $text;
            }
        }

        throw new \RuntimeException('PDF text could not be extracted.');
    }

    private function extractDocxText(string $path): string
    {
        $archive = file_get_contents($path);
        if (! is_string($archive)) {
            throw new \RuntimeException('DOCX archive could not be read.');
        }

        $entry = 'word/document.xml';
        $offset = 0;
        while (($offset = strpos($archive, "PK\x03\x04", $offset)) !== false) {
            $header = unpack('vmethod/Vcrc/Vcompressed/Vuncompressed/vnameLength/vextraLength', substr($archive, $offset + 8, 22));
            if (! is_array($header)) {
                break;
            }

            $nameStart = $offset + 30;
            $name = substr($archive, $nameStart, $header['nameLength']);
            $dataStart = $nameStart + $header['nameLength'] + $header['extraLength'];
            $compressed = substr($archive, $dataStart, $header['compressed']);

            if ($name === $entry) {
                $xml = match ($header['method']) {
                    0 => $compressed,
                    8 => gzinflate($compressed),
                    default => false,
                };

                if (! is_string($xml)) {
                    throw new \RuntimeException('DOCX compression is not supported.');
                }

                $xml = str_replace(['</w:p>', '</w:tr>'], ["\n", "\n"], $xml);
                $text = html_entity_decode(strip_tags($xml), ENT_QUOTES | ENT_XML1, 'UTF-8');

                return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
            }

            $offset = $dataStart + $header['compressed'];
        }

        throw new \RuntimeException('DOCX document body is missing.');
    }
}
