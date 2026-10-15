<?php

namespace Tests\Feature\Notifications;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Notifications\ApplicationStatusChanged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ApplicationNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_application_status_sends_notification_to_applicant(): void
    {
        Notification::fake();

        $hrUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $hrUser->id, 'company_name' => 'PT Ramah Inklusi']);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id, 'title' => 'Staf Administrasi']);

        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);

        $application = Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($hrUser)->patch('/company/applications/' . $application->id . '/status', [
            'status' => 'interview',
            'status_notes' => 'Undangan wawancara online via Google Meet.',
        ]);

        $response->assertRedirect();

        Notification::assertSentTo(
            $seekerUser,
            ApplicationStatusChanged::class,
            function ($notification) use ($application) {
                return $notification->application->id === $application->id &&
                       $notification->newStatus === 'interview';
            }
        );
    }

    public function test_pelamar_can_view_notifications_list(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($seekerUser)->get('/app/notifications');
        $response->assertOk();
    }

    public function test_pelamar_can_mark_notification_as_read(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $seekerUser->notify(new ApplicationStatusChanged($application, 'interview', 'Catatan test'));

        $notification = $seekerUser->unreadNotifications()->first();
        $this->assertNotNull($notification);

        $response = $this->actingAs($seekerUser)->post('/app/notifications/' . $notification->id . '/read');
        $response->assertRedirect();

        $this->assertEquals(0, $seekerUser->fresh()->unreadNotifications()->count());
    }
}
