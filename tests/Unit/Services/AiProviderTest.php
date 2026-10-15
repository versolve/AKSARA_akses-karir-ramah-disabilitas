<?php

namespace Tests\Unit\Services;

use App\Contracts\AiProviderInterface;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use App\Services\Ai\AiManager;
use App\Services\Ai\MockAiProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_mock_provider_matches_job_and_returns_structured_result(): void
    {
        $provider = new MockAiProvider();

        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'current_job_title' => 'Frontend Developer',
        ]);
        SeekerAccessibilityProfile::factory()->create([
            'user_id' => $user->id,
            'disability_types' => ['netra'],
            'accommodations_needed' => ['screen_reader_software', 'remote_option'],
        ]);

        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'title' => 'Frontend React Engineer',
            'work_model' => 'remote',
            'skills_required' => ['React', 'TypeScript', 'Frontend'],
        ]);
        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vacancy->id,
            'accommodation_type' => 'screen_reader_software',
        ]);

        $result = $provider->matchJob($seeker, $vacancy);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('match_percentage', $result);
        $this->assertArrayHasKey('competency_score', $result);
        $this->assertArrayHasKey('accessibility_score', $result);
        $this->assertArrayHasKey('matching_points', $result);
        $this->assertArrayHasKey('gaps', $result);
        $this->assertArrayHasKey('summary', $result);
        $this->assertGreaterThanOrEqual(50, $result['match_percentage']);
    }

    public function test_mock_provider_analyzes_skill_gap(): void
    {
        $provider = new MockAiProvider();

        $seekerSkills = ['HTML', 'CSS', 'JavaScript'];
        $vacancySkills = ['JavaScript', 'React', 'TypeScript', 'Tailwind CSS'];

        $result = $provider->analyzeSkillGap($seekerSkills, $vacancySkills);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('match_score', $result);
        $this->assertArrayHasKey('matched_skills', $result);
        $this->assertArrayHasKey('missing_skills', $result);
        $this->assertArrayHasKey('learning_recommendations', $result);
        $this->assertContains('JavaScript', $result['matched_skills']);
        $this->assertContains('React', $result['missing_skills']);
    }

    public function test_mock_provider_reviews_cv_ats(): void
    {
        $provider = new MockAiProvider();

        $cvText = "Nama: Budi Santoso\nKeahlian: React, HTML, CSS, JavaScript\nPengalaman: 2 tahun frontend developer.";
        $targetSkills = ['React', 'TypeScript'];

        $result = $provider->reviewCvAts($cvText, $targetSkills);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('ats_score', $result);
        $this->assertArrayHasKey('formatting_grade', $result);
        $this->assertArrayHasKey('strengths', $result);
        $this->assertArrayHasKey('improvements', $result);
        $this->assertArrayHasKey('accessibility_tips', $result);
        $this->assertGreaterThanOrEqual(1, $result['ats_score']);
    }

    public function test_ai_manager_resolves_default_driver(): void
    {
        config(['ai.default' => 'mock']);

        /** @var AiManager $manager */
        $manager = app(AiManager::class);
        $driver = $manager->driver();

        $this->assertInstanceOf(MockAiProvider::class, $driver);
    }
}
