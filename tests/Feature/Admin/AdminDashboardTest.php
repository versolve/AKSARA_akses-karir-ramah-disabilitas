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

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_dashboard_with_metrics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create sample data
        User::factory()->count(3)->create(['role' => 'pelamar']);
        $companyUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $companyUser->id, 'is_approved' => true]);

        Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'active']);
        Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'closed']);

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('stats.total_users')
            ->has('stats.total_seekers')
            ->has('stats.total_companies')
            ->has('stats.active_vacancies')
            ->has('stats.total_applications')
        );
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $perusahaan = User::factory()->create(['role' => 'perusahaan']);

        $this->actingAs($pelamar)->get('/admin/dashboard')->assertStatus(403);
        $this->actingAs($perusahaan)->get('/admin/dashboard')->assertStatus(403);
    }
}
