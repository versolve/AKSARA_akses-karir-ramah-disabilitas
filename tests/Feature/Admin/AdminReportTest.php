<?php

namespace Tests\Feature\Admin;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_real_business_intelligence_metrics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seeker = User::factory()->create(['role' => 'pelamar', 'created_at' => '2026-01-15']);
        JobSeekerProfile::factory()->create(['user_id' => $seeker->id, 'domicile' => 'Jakarta']);
        $companyUser = User::factory()->create(['role' => 'perusahaan', 'created_at' => '2026-02-15']);
        $company = CompanyProfile::factory()->create([
            'user_id' => $companyUser->id,
            'industry' => 'Teknologi Informasi',
            'is_approved' => true,
        ]);
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'work_model' => 'remote',
            'created_at' => '2026-02-20',
        ]);
        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->jobSeekerProfile->id,
            'status' => 'hired',
            'applied_at' => '2026-02-25',
        ]);

        $response = $this->actingAs($admin)->get('/admin/reports?from=2026-01-01&to=2026-02-28&tab=summary');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->where('filters.from', '2026-01-01')
            ->where('filters.to', '2026-02-28')
            ->where('filters.tab', 'summary')
            ->where('summary.total_users', 2)
            ->where('summary.total_seekers', 1)
            ->where('summary.total_companies', 1)
            ->where('summary.total_vacancies', 1)
            ->where('summary.total_applications', 1)
            ->where('summary.monthly_users.0.seekers', 1)
            ->where('summary.monthly_users.1.companies', 1)
            ->where('summary.work_models.remote', 1)
            ->where('summary.application_statuses.hired', 1)
        );
    }

    public function test_business_intelligence_tab_returns_real_tab_payload(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $companyUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $companyUser->id, 'industry' => 'Keuangan']);
        Vacancy::factory()->count(2)->create(['company_profile_id' => $company->id, 'status' => 'active']);

        $response = $this->actingAs($admin)->get('/admin/reports?tab=companies');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->where('filters.tab', 'companies')
            ->where('companies.total', 1)
            ->where('companies.top_industries.0.label', 'Keuangan')
            ->where('companies.top_industries.0.value', 1)
        );
    }

    public function test_admin_can_export_filtered_business_intelligence_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'pelamar', 'created_at' => '2026-03-03']);

        $response = $this->actingAs($admin)->get('/admin/reports/export?from=2026-03-01&to=2026-03-31');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('metric,value', $response->streamedContent());
        $this->assertStringContainsString('total_seekers,1', $response->streamedContent());
    }

    public function test_non_admin_cannot_access_business_intelligence(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $perusahaan = User::factory()->create(['role' => 'perusahaan']);

        $this->actingAs($pelamar)->get('/admin/reports')->assertStatus(403);
        $this->actingAs($perusahaan)->get('/admin/reports/export')->assertStatus(403);
    }
}
