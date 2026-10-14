<?php

namespace Tests\Feature\Seeker;

use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_apply_to_active_vacancy_with_cv(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['status' => 'active']);

        $cvFile = UploadedFile::fake()->create('curriculum-vitae.pdf', 500, 'application/pdf');

        $response = $this->actingAs($user)->post('/app/vacancies/' . $vacancy->id . '/apply', [
            'cover_letter' => 'Saya tertarik melamar posisi ini.',
            'cv' => $cvFile,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('applications', [
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $application = Application::first();
        Storage::disk('public')->assertExists($application->cv_path);
    }

    public function test_cannot_apply_twice_to_same_vacancy(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['status' => 'active']);

        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
        ]);

        $cvFile = UploadedFile::fake()->create('cv.pdf', 300, 'application/pdf');

        $response = $this->actingAs($user)->post('/app/vacancies/' . $vacancy->id . '/apply', [
            'cover_letter' => 'Melamar lagi.',
            'cv' => $cvFile,
        ]);

        $response->assertInvalid(['vacancy' => 'Anda sudah pernah melamar lowongan ini.']);
    }

    public function test_cannot_apply_to_closed_vacancy(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['status' => 'closed']);

        $cvFile = UploadedFile::fake()->create('cv.pdf', 300, 'application/pdf');

        $response = $this->actingAs($user)->post('/app/vacancies/' . $vacancy->id . '/apply', [
            'cv' => $cvFile,
        ]);

        $response->assertStatus(400);
    }

    public function test_invalid_cv_file_extension_rejected(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create(['status' => 'active']);

        $invalidFile = UploadedFile::fake()->create('script.exe', 500);

        $response = $this->actingAs($user)->post('/app/vacancies/' . $vacancy->id . '/apply', [
            'cv' => $invalidFile,
        ]);

        $response->assertInvalid('cv');
    }
}
