<?php

namespace Tests\Feature\Seeker;

use App\Models\AiJobMatch;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiCareerAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_access_ai_assistant_page(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/app/ai-assistant');
        $response->assertOk();
    }

    public function test_pelamar_can_request_ai_match_for_a_vacancy(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'current_job_title' => 'Frontend Developer',
        ]);
        SeekerAccessibilityProfile::factory()->create([
            'user_id' => $user->id,
            'disability_types' => ['netra'],
            'accommodations_needed' => ['screen_reader_software'],
        ]);

        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'skills_required' => ['React', 'JavaScript'],
        ]);
        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vacancy->id,
            'accommodation_type' => 'screen_reader_software',
        ]);

        $response = $this->actingAs($user)->post('/app/ai/match/' . $vacancy->id);

        $response->assertOk();
        $response->assertJsonStructure([
            'match_percentage',
            'competency_score',
            'accessibility_score',
            'matching_points',
            'gaps',
            'summary',
        ]);

        $this->assertDatabaseHas('ai_job_matches', [
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
        ]);
    }

    public function test_pelamar_can_run_skill_gap_analysis(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/skill-gap', [
            'my_skills' => ['HTML', 'CSS', 'JavaScript'],
            'target_skills' => ['JavaScript', 'React', 'TypeScript'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'match_score',
            'matched_skills',
            'missing_skills',
            'learning_recommendations',
        ]);
    }

    public function test_pelamar_can_scan_cv_for_ats_readability(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', [
            'cv_text' => "Nama: Budi\nPengalaman: 2 tahun web development dengan React dan CSS.",
            'target_skills' => ['React'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'ats_score',
            'formatting_grade',
            'strengths',
            'improvements',
            'accessibility_tips',
        ]);
    }
}
