<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;

class MockAiProvider implements AiProviderInterface
{
    public function matchJob(JobSeekerProfile $seeker, Vacancy $vacancy): array
    {
        $matchingPoints = [];
        $gaps = [];

        // 1. Evaluate Accessibility Match
        $accProfile = $seeker->user?->accessibilityProfile ?? $seeker->accessibilityProfile;
        $seekerAccommodations = $accProfile->accommodations_needed ?? [];
        $vacancyAccommodations = $vacancy->accessibilities->pluck('accommodation_type')->toArray();

        $matchedAcc = array_intersect($seekerAccommodations, $vacancyAccommodations);
        $totalAccNeeded = count($seekerAccommodations);

        if ($totalAccNeeded === 0) {
            $accessibilityScore = 90;
            $matchingPoints[] = 'Kebutuhan fasilitas aksesibilitas bersifat umum dan terpenuhi.';
        } else {
            $accRatio = count($matchedAcc) / max($totalAccNeeded, 1);
            $accessibilityScore = (int) round(50 + ($accRatio * 50));

            if (count($matchedAcc) > 0) {
                $matchingPoints[] = 'Fasilitas aksesibilitas utama (' . implode(', ', $matchedAcc) . ') disediakan oleh perusahaan.';
            }

            $unmatchedAcc = array_diff($seekerAccommodations, $vacancyAccommodations);
            if (count($unmatchedAcc) > 0) {
                $gaps[] = 'Beberapa akomodasi khusus (' . implode(', ', $unmatchedAcc) . ') belum terdata secara spesifik pada lowongan ini.';
            }
        }

        // 2. Evaluate Competency Match
        $vacancySkills = array_map('strtolower', $vacancy->skills_required ?? []);
        $seekerTitle = strtolower($seeker->current_job_title ?? '');
        $seekerBio = strtolower(($seeker->bio ?? '') . ' ' . ($seeker->experience ?? ''));

        $competencyPoints = 0;
        $maxPoints = max(count($vacancySkills), 1);

        if (!empty($seekerTitle) && str_contains(strtolower($vacancy->title), $seekerTitle)) {
            $competencyPoints += 2;
            $matchingPoints[] = 'Latar belakang posisi pekerjaan sebelumnya relevan dengan judul lowongan.';
        }

        foreach ($vacancySkills as $skill) {
            if (str_contains($seekerTitle, $skill) || str_contains($seekerBio, $skill)) {
                $competencyPoints++;
                $matchingPoints[] = "Memiliki keahlian yang relevan: {$skill}.";
            } else {
                $gaps[] = "Perlu peningkatan pada keterampilan: {$skill}.";
            }
        }

        $competencyScore = min(100, (int) round(40 + (($competencyPoints / $maxPoints) * 55)));

        // 3. Combined Match Percentage
        $matchPercentage = (int) round(($competencyScore * 0.55) + ($accessibilityScore * 0.45));

        $summary = "Kecocokan keseluruhan sebesar {$matchPercentage}%. Posisi ini memiliki tingkat kesesuaian fasilitas aksesibilitas {$accessibilityScore}% dan kesesuaian kompetensi {$competencyScore}%.";

        return [
            'match_percentage' => $matchPercentage,
            'competency_score' => $competencyScore,
            'accessibility_score' => $accessibilityScore,
            'matching_points' => array_values(array_unique($matchingPoints)),
            'gaps' => array_values(array_unique($gaps)),
            'summary' => $summary,
        ];
    }

    public function analyzeSkillGap(array $seekerSkills, array $vacancySkills): array
    {
        $normalizedSeeker = array_map('strtolower', array_map('trim', $seekerSkills));
        $matched = [];
        $missing = [];

        foreach ($vacancySkills as $vSkill) {
            $norm = strtolower(trim($vSkill));
            if (in_array($norm, $normalizedSeeker, true)) {
                $matched[] = $vSkill;
            } else {
                $missing[] = $vSkill;
            }
        }

        $total = max(count($vacancySkills), 1);
        $matchScore = (int) round((count($matched) / $total) * 100);

        $recommendations = [];
        foreach ($missing as $skill) {
            $recommendations[] = "Pelajari modul fundamental {$skill} melalui tutorial daring yang mendukung subtitle atau transkrip teks ramah disabilitas.";
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Seluruh keterampilan utama telah terpenuhi! Persiapkan portofolio nyata untuk sesi wawancara.';
        }

        return [
            'match_score' => $matchScore,
            'matched_skills' => array_values($matched),
            'missing_skills' => array_values($missing),
            'learning_recommendations' => $recommendations,
        ];
    }

    public function reviewCvAts(string $cvText, array $targetSkills = []): array
    {
        $words = str_word_count($cvText);

        $strengths = [];
        $improvements = [];
        $accessibilityTips = [];
        $strengthsDetailed = [];
        $improvementsDetailed = [];
        $suggestedKeywords = [];
        $actionRecommendations = [];

        $score = 60;

        if ($words >= 50) {
            $score += 15;
            $strengths[] = 'Panjang teks CV memadai untuk dipindai oleh mesin ATS.';
            $strengthsDetailed[] = ['title' => 'Panjang & kedalaman', 'description' => 'Deskripsi pengalaman kerja cukup detail dan mudah dibaca.'];
        } else {
            $improvements[] = 'Deskripsi pengalaman kerja terlalu singkat. Tambahkan rincian tanggung jawab dan pencapaian.';
            $improvementsDetailed[] = ['title' => 'Detail Pengalaman', 'description' => 'Tambahkan jumlah tahun, peran spesifik, dan hasil yang terukur.'];
        }

        // Check target skill occurrences
        $foundSkills = 0;
        foreach ($targetSkills as $skill) {
            if (stripos($cvText, $skill) !== false) {
                $foundSkills++;
                $strengths[] = "Memuat kata kunci yang relevan dengan posisi: {$skill}.";
                $suggestedKeywords[] = $skill;
            } else {
                $improvements[] = "Tambahkan kata kunci '{$skill}' pada bagian keahlian atau ringkasan pengalaman.";
            }
        }

        if (!empty($targetSkills)) {
            $score += min(20, (int) round(($foundSkills / count($targetSkills)) * 20));
        } else {
            $score += 10;
        }

        $actionRecommendations[] = 'Periksa ulang format tanggal dan urutan kronologis pengalaman kerja.';
        $actionRecommendations[] = 'Gunakan angka kuantitatif untuk menunjukkan pencapaian (misal: "meningkatkan performa 30%").';
        $actionRecommendations[] = 'Pastikan setiap posisi mencantumkan setidaknya 3-4 poin tanggung jawab utama.';

        $actionRecommendations[] = 'Tambahkan link portofolio atau repositori GitHub jika relevan.';
        $accessibilityTips = [
            'Gunakan heading yang jelas agar CV mudah dinavigasi dengan screen reader.',
            'Hindari tabel kompleks, kolom dekoratif, dan teks di dalam gambar.',
        ];

        $score = min(100, max(20, $score));

        $grade = match (true) {
            $score >= 85 => 'Sangat Baik (A)',
            $score >= 70 => 'Baik (B)',
            $score >= 50 => 'Cukup (C)',
            default => 'Perlu Perbaikan (D)',
        };

        return [
            'ats_score' => $score,
            'formatting_grade' => $grade,
            'summary' => "CV Anda sudah memiliki struktur yang baik, namun ada beberapa area yang perlu ditingkatkan agar lebih menarik bagi perekrut.",
            'category_scores' => [
                'ats_compatibility' => max($score - 5, 60),
                'structure_format' => max($score, 65),
                'content_relevance' => max($score - 10, 50),
                'keyword_usage' => !empty($targetSkills) ? max($score, 70) : 60,
                'experience_achievement' => max($score - 5, 55),
                'project_portfolio' => max($score - 10, 45),
            ],
            'strengths' => $strengths,
            'improvements' => $improvements,
            'strengths_detailed' => $strengthsDetailed,
            'improvements_detailed' => $improvementsDetailed,
            'suggested_keywords' => $suggestedKeywords,
            'action_recommendations' => $actionRecommendations,
            'accessibility_tips' => $accessibilityTips,
        ];
    }
}
