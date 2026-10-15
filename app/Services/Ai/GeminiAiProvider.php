<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiAiProvider implements AiProviderInterface
{
    private MockAiProvider $fallback;

    public function __construct(
        private string $apiKey,
        private string $model = 'gemini-1.5-flash',
        private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
        private int $timeout = 15
    ) {
        $this->fallback = new MockAiProvider();
    }

    public function matchJob(JobSeekerProfile $seeker, Vacancy $vacancy): array
    {
        if (empty($this->apiKey)) {
            return $this->fallback->matchJob($seeker, $vacancy);
        }

        $accProfile = $seeker->user?->accessibilityProfile ?? $seeker->accessibilityProfile;

        $prompt = <<<PROMPT
Anda adalah asisten AI rekrutmen inklusif untuk portal kerja AKSARA (Akses Karier Ramah Disabilitas).
Tugas Anda: Evaluasi kecocokan antara profil pencari kerja penyandang disabilitas dengan lowongan pekerjaan.

DATA PELAMAR:
- Judul Pekerjaan / Keahlian: {$seeker->current_job_title}
- Pendidikan: {$seeker->education}
- Pengalaman: {$seeker->experience}
- Ringkasan Bio: {$seeker->bio}
- Ragam Disabilitas: {$this->formatJson($accProfile?->disability_types)}
- Kebutuhan Akomodasi Tempat Kerja: {$this->formatJson($accProfile?->accommodations_needed)}
- Catatan Aksesibilitas: {$accProfile?->notes}

DATA LOWONGAN:
- Judul: {$vacancy->title}
- Perusahaan: {$vacancy->companyProfile?->company_name}
- Model Kerja: {$vacancy->work_model}
- Deskripsi: {$vacancy->description}
- Keterampilan yang Dibutuhkan: {$this->formatJson($vacancy->skills_required)}
- Fasilitas Aksesibilitas Disediakan Perusahaan: {$this->formatAccessibilities($vacancy)}

Berikan evaluasi dalam format JSON murni (tanpa format markdown tambahan) dengan struktur persis berikut:
{
  "match_percentage": <integer 0-100>,
  "competency_score": <integer 0-100>,
  "accessibility_score": <integer 0-100>,
  "matching_points": ["poin kelebihan 1", "poin kelebihan 2"],
  "gaps": ["gap 1 jika ada", "gap 2 jika ada"],
  "summary": "Ringkasan analisis 2 kalimat berbahasa Indonesia yang empatik dan objektif."
}
PROMPT;

        try {
            $response = $this->callGemini($prompt);
            $parsed = $this->extractJson($response);

            if (isset($parsed['match_percentage'], $parsed['competency_score'])) {
                return [
                    'match_percentage' => (int) $parsed['match_percentage'],
                    'competency_score' => (int) $parsed['competency_score'],
                    'accessibility_score' => (int) ($parsed['accessibility_score'] ?? 80),
                    'matching_points' => (array) ($parsed['matching_points'] ?? []),
                    'gaps' => (array) ($parsed['gaps'] ?? []),
                    'summary' => (string) ($parsed['summary'] ?? ''),
                ];
            }
        } catch (Throwable $e) {
            Log::warning('Gemini AI matchJob failed, falling back to MockAiProvider: ' . $e->getMessage());
        }

        return $this->fallback->matchJob($seeker, $vacancy);
    }

    public function analyzeSkillGap(array $seekerSkills, array $vacancySkills): array
    {
        if (empty($this->apiKey)) {
            return $this->fallback->analyzeSkillGap($seekerSkills, $vacancySkills);
        }

        $mySkillsStr = implode(', ', $seekerSkills);
        $targetSkillsStr = implode(', ', $vacancySkills);

        $prompt = <<<PROMPT
Anda adalah AI Career Coach untuk penyandang disabilitas di AKSARA.
Bandingkan keterampilan pelamar dengan keterampilan yang dibutuhkan posisi pekerjaan target.

Keterampilan Pelamar: {$mySkillsStr}
Keterampilan Target: {$targetSkillsStr}

Keluarkan response JSON murni dengan format:
{
  "match_score": <integer 0-100>,
  "matched_skills": ["skill cocok 1", "skill cocok 2"],
  "missing_skills": ["skill kurang 1", "skill kurang 2"],
  "learning_recommendations": ["Rekomendasi belajar 1", "Rekomendasi belajar 2"]
}
PROMPT;

        try {
            $response = $this->callGemini($prompt);
            $parsed = $this->extractJson($response);

            if (isset($parsed['match_score'], $parsed['matched_skills'])) {
                return [
                    'match_score' => (int) $parsed['match_score'],
                    'matched_skills' => (array) $parsed['matched_skills'],
                    'missing_skills' => (array) ($parsed['missing_skills'] ?? []),
                    'learning_recommendations' => (array) ($parsed['learning_recommendations'] ?? []),
                ];
            }
        } catch (Throwable $e) {
            Log::warning('Gemini AI analyzeSkillGap failed: ' . $e->getMessage());
        }

        return $this->fallback->analyzeSkillGap($seekerSkills, $vacancySkills);
    }

    public function reviewCvAts(string $cvText, array $targetSkills = []): array
    {
        if (empty($this->apiKey)) {
            return $this->fallback->reviewCvAts($cvText, $targetSkills);
        }

        $skillsStr = implode(', ', $targetSkills);

        $prompt = <<<PROMPT
Anda adalah spesialis pemindai CV ATS dan konsultan karier disabilitas di AKSARA.
Analisis isi CV berikut dari sudut pandang keterbacaan mesin ATS dan keramahan pembaca layar (screen reader).

Target Keterampilan Posisi (jika ada): {$skillsStr}

ISI TEKS CV:
{$cvText}

Kembalikan evaluasi dalam format JSON murni:
{
  "ats_score": <integer 0-100>,
  "formatting_grade": "<Sangat Baik (A) / Baik (B) / Cukup (C) / Perlu Perbaikan (D)>",
  "strengths": ["kelebihan 1", "kelebihan 2"],
  "improvements": ["perbaikan kata kunci/format 1", "perbaikan 2"],
  "accessibility_tips": ["tips aksesibilitas untuk screen reader/format ramah disabilitas 1", "tips 2"]
}
PROMPT;

        try {
            $response = $this->callGemini($prompt);
            $parsed = $this->extractJson($response);

            if (isset($parsed['ats_score'], $parsed['strengths'])) {
                return [
                    'ats_score' => (int) $parsed['ats_score'],
                    'formatting_grade' => (string) ($parsed['formatting_grade'] ?? 'Baik (B)'),
                    'strengths' => (array) $parsed['strengths'],
                    'improvements' => (array) ($parsed['improvements'] ?? []),
                    'accessibility_tips' => (array) ($parsed['accessibility_tips'] ?? []),
                ];
            }
        } catch (Throwable $e) {
            Log::warning('Gemini AI reviewCvAts failed: ' . $e->getMessage());
        }

        return $this->fallback->reviewCvAts($cvText, $targetSkills);
    }

    private function callGemini(string $prompt): string
    {
        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::timeout($this->timeout)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 1200,
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Gemini API returned status ' . $response->status() . ': ' . $response->body());
        }

        $data = $response->json();
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    private function extractJson(string $rawText): array
    {
        $cleaned = trim($rawText);

        // Remove markdown ```json ``` markers if present
        if (str_starts_with($cleaned, '```json')) {
            $cleaned = substr($cleaned, 7);
        } elseif (str_starts_with($cleaned, '```')) {
            $cleaned = substr($cleaned, 3);
        }

        if (str_ends_with($cleaned, '```')) {
            $cleaned = substr($cleaned, 0, -3);
        }

        $decoded = json_decode(trim($cleaned), true);

        return is_array($decoded) ? $decoded : [];
    }

    private function formatJson(?array $items): string
    {
        return empty($items) ? 'Tidak ada data spesifik' : implode(', ', $items);
    }

    private function formatAccessibilities(Vacancy $vacancy): string
    {
        $items = $vacancy->accessibilities->map(fn ($a) => "{$a->accommodation_type}: {$a->description}")->toArray();
        return empty($items) ? 'Fasilitas umum' : implode('; ', $items);
    }
}
