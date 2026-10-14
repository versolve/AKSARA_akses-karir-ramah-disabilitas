<?php

namespace Tests\Unit\Models;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecruitmentModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_vacancy_belongs_to_company_profile(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $this->assertEquals($company->id, $vacancy->companyProfile->id);
        $this->assertTrue($company->vacancies->contains($vacancy));
    }

    public function test_vacancy_has_many_accessibilities(): void
    {
        $vacancy = Vacancy::factory()->create();
        $acc = VacancyAccessibility::factory()->create([
            'vacancy_id' => $vacancy->id,
            'accommodation_type' => 'ramp_access',
        ]);

        $this->assertTrue($vacancy->accessibilities->contains($acc));
        $this->assertEquals($vacancy->id, $acc->vacancy->id);
    }

    public function test_application_links_seeker_and_vacancy(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $vacancy = Vacancy::factory()->create();

        $application = Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $this->assertEquals($vacancy->id, $application->vacancy->id);
        $this->assertEquals($seeker->id, $application->jobSeekerProfile->id);
        $this->assertTrue($seeker->applications->contains($application));
        $this->assertTrue($vacancy->applications->contains($application));
    }

    public function test_vacancy_casts_json_requirements_and_skills(): void
    {
        $vacancy = Vacancy::factory()->create([
            'requirements' => ['Minimal D3', 'Pengalaman 1 tahun'],
            'skills_required' => ['React', 'Laravel'],
        ]);

        $this->assertIsArray($vacancy->requirements);
        $this->assertContains('Minimal D3', $vacancy->requirements);
        $this->assertContains('React', $vacancy->skills_required);
    }

    public function test_vacancy_active_scope_only_returns_active_vacancies(): void
    {
        Vacancy::factory()->create(['status' => 'active']);
        Vacancy::factory()->create(['status' => 'draft']);
        Vacancy::factory()->create(['status' => 'closed']);

        $activeVacancies = Vacancy::active()->get();
        $this->assertCount(1, $activeVacancies);
    }
}
