<?php

namespace Tests\Feature\Dashboard;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoleDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_dashboard_shows_aggregate_stats(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);

        $v1 = Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'active']);
        $v2 = Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'closed']);

        Application::factory()->create(['vacancy_id' => $v1->id, 'status' => 'submitted']);
        Application::factory()->create(['vacancy_id' => $v1->id, 'status' => 'interview']);

        $response = $this->actingAs($user)->get('/company/dashboard');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('company/dashboard')
            ->where('stats.total_vacancies', 2)
            ->where('stats.active_vacancies', 1)
            ->where('stats.total_applicants', 2)
            ->where('stats.interview', 1)
        );
    }

    public function test_pelamar_dashboard_shows_application_summary(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create();

        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($user)->get('/app/dashboard');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('app/dashboard')
            ->where('stats.total_applied', 1)
            ->where('stats.in_review', 1)
        );
    }
}
