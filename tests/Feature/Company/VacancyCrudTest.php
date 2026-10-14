<?php

namespace Tests\Feature\Company;

use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancyCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_can_view_vacancies_list(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        Vacancy::factory()->create(['company_profile_id' => $company->id, 'title' => 'Web Developer']);

        $response = $this->actingAs($user)->get('/company/vacancies');
        $response->assertOk();
    }

    public function test_company_can_create_vacancy_with_accessibilities(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        CompanyProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post('/company/vacancies', [
            'title' => 'Frontend Accessible Engineer',
            'description' => 'Deskripsi pekerjaan yang jelas.',
            'job_type' => 'full-time',
            'work_model' => 'remote',
            'location' => 'Jakarta / Remote',
            'salary_min' => 8000000,
            'salary_max' => 12000000,
            'is_salary_public' => true,
            'experience_level' => 'junior',
            'requirements' => ['Bisa React', 'Paham WCAG'],
            'skills_required' => ['React', 'TypeScript', 'Aria'],
            'status' => 'active',
            'deadline' => now()->addDays(20)->format('Y-m-d'),
            'accessibilities' => [
                ['accommodation_type' => 'screen_reader_software', 'description' => 'Menyediakan NVDA dan JAWS'],
                ['accommodation_type' => 'remote_option', 'description' => 'Kerja jarak jauh penuh'],
            ],
        ]);

        $response->assertRedirect('/company/vacancies');

        $vacancy = Vacancy::where('title', 'Frontend Accessible Engineer')->first();
        $this->assertNotNull($vacancy);
        $this->assertEquals('remote', $vacancy->work_model);
        $this->assertCount(2, $vacancy->accessibilities);
    }

    public function test_company_can_view_edit_vacancy_page(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $response = $this->actingAs($user)->get('/company/vacancies/' . $vacancy->id . '/edit');
        $response->assertOk();
    }

    public function test_company_can_update_own_vacancy(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'title' => 'Old Title',
        ]);

        $response = $this->actingAs($user)->put('/company/vacancies/' . $vacancy->id, [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'job_type' => 'full-time',
            'work_model' => 'remote',
            'location' => 'Bandung',
            'experience_level' => 'mid',
            'status' => 'active',
        ]);

        $response->assertRedirect('/company/vacancies');
        $this->assertEquals('Updated Title', $vacancy->fresh()->title);
    }

    public function test_company_cannot_edit_other_company_vacancy(): void
    {
        $user1 = User::factory()->create(['role' => 'perusahaan']);
        $company1 = CompanyProfile::factory()->create(['user_id' => $user1->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company1->id]);

        $user2 = User::factory()->create(['role' => 'perusahaan']);
        CompanyProfile::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user2)->put('/company/vacancies/' . $vacancy->id, [
            'title' => 'Hacked Title',
            'description' => 'New Description',
            'job_type' => 'full-time',
            'work_model' => 'onsite',
            'location' => 'Jakarta',
            'experience_level' => 'junior',
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }

    public function test_company_can_delete_own_vacancy(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $response = $this->actingAs($user)->delete('/company/vacancies/' . $vacancy->id);
        $response->assertRedirect('/company/vacancies');

        $this->assertSoftDeleted('vacancies', ['id' => $vacancy->id]);
    }
}
