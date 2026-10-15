<?php

namespace Tests\Unit\Models;

use App\Models\AiJobMatch;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiJobMatchModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_job_match_persists_and_casts_json_attributes(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $match = AiJobMatch::create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'match_percentage' => 88,
            'competency_score' => 85,
            'accessibility_score' => 92,
            'matching_points' => ['Kompetensi React cocok', 'Dukungan screen reader tersedia'],
            'gaps' => ['Belum terbiasa dengan TypeScript'],
            'summary' => 'Sangat direkomendasikan untuk pelamar.',
        ]);

        $this->assertEquals(88, $match->match_percentage);
        $this->assertIsArray($match->matching_points);
        $this->assertContains('Kompetensi React cocok', $match->matching_points);
        $this->assertEquals($vacancy->id, $match->vacancy->id);
        $this->assertEquals($seeker->id, $match->jobSeekerProfile->id);
    }
}
