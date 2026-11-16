<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class OpenAiProvider implements AiProviderInterface
{
    private MockAiProvider $fallback;

    public function __construct(
        private string $apiKey,
        private string $model = 'gpt-4o-mini',
        private string $baseUrl = 'https://api.openai.com/v1',
        private int $timeout = 20,
        private float $temperature = 0.2,
        private int $maxTokens = 1500
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
Anda adalah asisten AI rekrutmen inklusif untuk portal kerja Profabel (Akses Karier Ramah Disabilitas).
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

Berikan evaluasi dalam format JSON murni dengan struktur berikut:
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
            $response = $this->callOpenAi($prompt);
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
            Log::warning('OpenAI matchJob failed, falling back to MockAiProvider: ' . $e->getMessage());
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
Anda adalah AI Career Coach untuk penyandang disabilitas di Profabel.
Bandingkan keterampilan pelamar dengan keterampilan yang dibutuhkan posisi pekerjaan target.

Keterampilan Pelamar: {$mySkillsStr}
Keterampilan Target: {$targetSkillsStr}

Berikan respons dalam format JSON murni:
{
  "match_score": <integer 0-100>,
  "matched_skills": ["skill cocok 1", "skill cocok 2"],
  "missing_skills": ["skill kurang 1", "skill kurang 2"],
  "learning_recommendations": ["rekomendasi belajar 1", "rekomendasi belajar 2"]
}
PROMPT;

        try {
            $response = $this->callOpenAi($prompt);
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
            Log::warning('OpenAI analyzeSkillGap failed: ' . $e->getMessage());
        }

        return $this->fallback->analyzeSkillGap($seekerSkills, $vacancySkills);
    }

    public function reviewCvAts(string $cvText, array $targetSkills = []): array
    {
        $fallbackResult = $this->fallback->reviewCvAts($cvText, $targetSkills);

        if (empty($this->apiKey)) {
            return $fallbackResult;
        }

        $targetSkillsStr = empty($targetSkills) ? 'Umum / Relevan dengan profil' : implode(', ', $targetSkills);

        $prompt = <<<PROMPT
Anda adalah ATS CV Reviewer & Career Coach untuk pelamar penyandang disabilitas di Profabel.
Analisis isi CV berikut untuk efektivitas sistem ATS dan keterbacaan rekruter:

KETERAMPILAN TARGET: {$targetSkillsStr}

TEKS CV:
{$cvText}

Berikan evaluasi dalam format JSON murni:
{
  "ats_score": <integer 0-100>,
  "formatting_grade": "<Sangat Baik (A) / Baik (B) / Cukup (C) / Perlu Perbaikan (D)>",
  "summary": "ringkasan objektif 2-3 kalimat",
  "category_scores": {
    "ats_compatibility": <integer 0-100>,
    "structure_format": <integer 0-100>,
    "content_relevance": <integer 0-100>,
    "keyword_usage": <integer 0-100>,
    "experience_achievement": <integer 0-100>,
    "project_portfolio": <integer 0-100>
  },
  "strengths": ["kelebihan 1", "kelebihan 2"],
  "improvements": ["perbaikan 1", "perbaikan 2"],
  "strengths_detailed": [{"title": "judul singkat", "description": "penjelasan"}],
  "improvements_detailed": [{"title": "judul singkat", "description": "penjelasan"}],
  "suggested_keywords": ["kata kunci 1", "kata kunci 2"],
  "action_recommendations": ["tindakan 1", "tindakan 2"],
  "accessibility_tips": ["tips aksesibilitas 1", "tips 2"]
}
PROMPT;

        try {
            $response = $this->callOpenAi($prompt);
            $parsed = $this->extractJson($response);

            if (isset($parsed['ats_score'], $parsed['strengths'])) {
                return [
                    'ats_score' => (int) $parsed['ats_score'],
                    'formatting_grade' => (string) ($parsed['formatting_grade'] ?? $fallbackResult['formatting_grade']),
                    'summary' => (string) ($parsed['summary'] ?? $fallbackResult['summary']),
                    'category_scores' => is_array($parsed['category_scores'] ?? null) ? $parsed['category_scores'] : ($fallbackResult['category_scores'] ?? []),
                    'strengths' => (array) ($parsed['strengths'] ?? $fallbackResult['strengths']),
                    'improvements' => (array) ($parsed['improvements'] ?? $fallbackResult['improvements']),
                    'strengths_detailed' => (array) ($parsed['strengths_detailed'] ?? $fallbackResult['strengths_detailed']),
                    'improvements_detailed' => (array) ($parsed['improvements_detailed'] ?? $fallbackResult['improvements_detailed']),
                    'suggested_keywords' => (array) ($parsed['suggested_keywords'] ?? $fallbackResult['suggested_keywords']),
                    'action_recommendations' => (array) ($parsed['action_recommendations'] ?? $fallbackResult['action_recommendations']),
                    'accessibility_tips' => (array) ($parsed['accessibility_tips'] ?? $fallbackResult['accessibility_tips']),
                ];
            }
        } catch (Throwable $e) {
            Log::warning('OpenAI reviewCvAts failed: ' . $e->getMessage());
        }

        return $fallbackResult;
    }

    private function callOpenAi(string $prompt): string
    {
        $endpoint = rtrim($this->baseUrl, '/') . '/chat/completions';

        $response = Http::timeout($this->timeout)
            ->withToken($this->apiKey)
            ->post($endpoint, [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Anda adalah asisten AI profesional untuk portal karier disabilitas Profabel. Selalu berikan respons dalam JSON murni tanpa markdown.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => $this->temperature,
                'max_tokens' => $this->maxTokens,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('OpenAI API returned status ' . $response->status() . ': ' . $response->body());
        }

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? '';
    }

    private function extractJson(string $rawText): array
    {
        $cleaned = trim($rawText);

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
