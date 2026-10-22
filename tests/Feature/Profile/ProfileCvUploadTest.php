<?php

namespace Tests\Feature\Profile;

use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileCvUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_upload_primary_cv(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        $profile = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $file = UploadedFile::fake()->create('CV_Budi.pdf', 750, 'application/pdf');

        $response = $this->actingAs($user)->post('/app/profile/cv', [
            'cv' => $file,
        ]);

        $response->assertRedirect();
        $profile->refresh();
        $this->assertNotNull($profile->cv_path);
        $this->assertTrue(Storage::disk('public')->exists($profile->cv_path));
    }

    public function test_pelamar_can_delete_primary_cv(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('cvs/profile/sample.pdf', 'sample');

        $user = User::factory()->create(['role' => 'pelamar']);
        $profile = JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'cv_path' => 'cvs/profile/sample.pdf',
        ]);

        $response = $this->actingAs($user)->delete('/app/profile/cv');

        $response->assertRedirect();
        $this->assertNull($profile->fresh()->cv_path);
        $this->assertFalse(Storage::disk('public')->exists('cvs/profile/sample.pdf'));
    }

    public function test_profile_cv_rejects_invalid_file_type(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $file = UploadedFile::fake()->create('malware.exe', 100);

        $response = $this->actingAs($user)->post('/app/profile/cv', [
            'cv' => $file,
        ]);

        $response->assertInvalid('cv');
    }
}
