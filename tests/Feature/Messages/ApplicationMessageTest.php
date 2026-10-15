<?php

namespace Tests\Feature\Messages;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\Message;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_send_message_on_their_application(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $vacancy = Vacancy::factory()->create();
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $response = $this->actingAs($seekerUser)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Halo, apakah saya perlu mempersiapkan portofolio tambahan?',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'application_id' => $application->id,
            'sender_id' => $seekerUser->id,
            'body' => 'Halo, apakah saya perlu mempersiapkan portofolio tambahan?',
        ]);
    }

    public function test_hr_can_reply_message_on_candidate_application(): void
    {
        $hrUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $hrUser->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $response = $this->actingAs($hrUser)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Ya silakan bawa portofolio saat wawancara.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'application_id' => $application->id,
            'sender_id' => $hrUser->id,
            'body' => 'Ya silakan bawa portofolio saat wawancara.',
        ]);
    }

    public function test_unauthorized_user_cannot_access_or_send_messages(): void
    {
        $seekerUser1 = User::factory()->create(['role' => 'pelamar']);
        $seeker1 = JobSeekerProfile::factory()->create(['user_id' => $seekerUser1->id]);
        $vacancy = Vacancy::factory()->create();
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker1->id]);

        $otherSeeker = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($otherSeeker)->get('/applications/' . $application->id . '/messages');
        $response->assertStatus(403);

        $postResponse = $this->actingAs($otherSeeker)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Pesan penyusup.',
        ]);
        $postResponse->assertStatus(403);
    }
}
