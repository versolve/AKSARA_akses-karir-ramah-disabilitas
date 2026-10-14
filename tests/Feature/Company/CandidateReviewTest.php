<?php

namespace Tests\Feature\Company;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CandidateReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_can_view_applicants_for_their_vacancies(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);

        $seekerUser = User::factory()->create(['name' => 'Kandidat Hebat']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);

        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
        ]);

        $response = $this->actingAs($user)->get('/company/applications');
        $response->assertOk();
        $response->assertSee('Kandidat Hebat');
    }

    public function test_company_can_update_application_status(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);
        $application = Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($user)->patch('/company/applications/' . $application->id . '/status', [
            'status' => 'interview',
            'status_notes' => 'Jadwal wawancara tanggal 20 Oktober.',
        ]);

        $response->assertRedirect();
        $this->assertEquals('interview', $application->fresh()->status);
        $this->assertEquals('Jadwal wawancara tanggal 20 Oktober.', $application->fresh()->status_notes);
    }

    public function test_company_cannot_update_other_company_application(): void
    {
        $user1 = User::factory()->create(['role' => 'perusahaan']);
        $company1 = CompanyProfile::factory()->create(['user_id' => $user1->id]);
        $vacancy1 = Vacancy::factory()->create(['company_profile_id' => $company1->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy1->id]);

        $user2 = User::factory()->create(['role' => 'perusahaan']);
        CompanyProfile::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user2)->patch('/company/applications/' . $application->id . '/status', [
            'status' => 'rejected',
        ]);

        $response->assertStatus(403);
    }
}
