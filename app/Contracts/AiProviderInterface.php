<?php

namespace App\Contracts;

use App\Models\JobSeekerProfile;
use App\Models\Vacancy;

interface AiProviderInterface
{
    /**
     * Cocokkan profil pelamar dengan lowongan berdasarkan kompetensi dan aksesibilitas.
     *
     * @return array{
     *     match_percentage: int,
     *     competency_score: int,
     *     accessibility_score: int,
     *     matching_points: array<string>,
     *     gaps: array<string>,
     *     summary: string
     * }
     */
    public function matchJob(JobSeekerProfile $seeker, Vacancy $vacancy): array;

    /**
     * Analisis perbedaan skill pelamar dengan kebutuhan lowongan.
     *
     * @param array<string> $seekerSkills
     * @param array<string> $vacancySkills
     * @return array{
     *     match_score: int,
     *     matched_skills: array<string>,
     *     missing_skills: array<string>,
     *     learning_recommendations: array<string>
     * }
     */
    public function analyzeSkillGap(array $seekerSkills, array $vacancySkills): array;

    /**
     * Evaluasi keterbacaan ATS dan format CV pelamar.
     *
     * @param array<string> $targetSkills
     * @return array{
     *     ats_score: int,
     *     formatting_grade: string,
     *     strengths: array<string>,
     *     improvements: array<string>,
     *     accessibility_tips: array<string>
     * }
     */
    public function reviewCvAts(string $cvText, array $targetSkills = []): array;
}
