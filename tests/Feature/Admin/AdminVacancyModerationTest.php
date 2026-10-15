<?php

namespace Tests\Feature\Admin;

use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVacancyModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_all_vacancies_across_companies(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $company = CompanyProfile::factory()->create();
        Vacancy::factory()->create(['company_profile_id' => $company->id, 'title' => 'Software Engineer']);

        $response = $this->actingAs($admin)->get('/admin/vacancies');
        $response->assertOk();
        $response->assertSee('Software Engineer');
    }

    public function test_admin_can_moderate_vacancy_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->patch('/admin/vacancies/' . $vacancy->id . '/status', [
            'status' => 'closed',
        ]);

        $response->assertRedirect();
        $this->assertEquals('closed', $vacancy->fresh()->status);
    }

    public function test_admin_can_takedown_vacancy(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $response = $this->actingAs($admin)->delete('/admin/vacancies/' . $vacancy->id);

        $response->assertRedirect();
        $this->assertSoftDeleted('vacancies', ['id' => $vacancy->id]);
    }
}
