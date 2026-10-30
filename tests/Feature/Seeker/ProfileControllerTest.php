<?php

namespace Tests\Feature\Seeker;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_view_their_profile_page(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->get('/app/profile');

        $response->assertOk();
    }

    public function test_pelamar_profile_page_shares_avatar_url(): void
    {
        $user = User::factory()->create([
            'role' => 'pelamar',
            'avatar' => '/storage/avatars/test.webp',
            'name' => 'Budi Santoso',
        ]);

        $response = $this->actingAs($user)->get('/app/profile');

        $response->assertInertia(fn (Assert $page) =>
            $page->component('app/profile')
                ->where('user.avatar', '/storage/avatars/test.webp')
        );
    }

    public function test_pelamar_can_update_their_profile(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/profile', [
            'phone' => '081234567890',
            'bio' => 'Saya seorang frontend developer',
            'education' => 'S1 Teknik Informatika',
            'experience' => '2 tahun',
            'current_job_title' => 'Frontend Developer',
        ]);

        $response->assertRedirect();
        $profile = $user->jobSeekerProfile()->first();

        $this->assertNotNull($profile);
        $this->assertSame('081234567890', $profile->phone);
        $this->assertSame('Frontend Developer', $profile->current_job_title);
    }

    public function test_profile_update_is_created_if_not_exists(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $this->assertNull($user->jobSeekerProfile()->first());

        $this->actingAs($user)->post('/app/profile', [
            'phone' => '0899000111',
            'bio' => 'Bio baru',
            'education' => 'D3 Sistem Informasi',
            'experience' => 'Fresh graduate',
            'current_job_title' => 'Junior Developer',
        ]);

        $this->assertNotNull($user->jobSeekerProfile()->first());
    }

    public function test_perusahaan_cannot_access_pelamar_profile(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->get('/app/profile');

        $response->assertStatus(403);
    }

    public function test_pelamar_can_view_accessibility_profile_page(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->get('/app/accessibility-profile');

        $response->assertOk();
    }

    public function test_pelamar_can_update_accessibility_profile(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/accessibility-profile', [
            'disability_types' => ['netra', 'rungu'],
            'accommodations_needed' => ['screen_reader'],
            'notes' => 'Butuh screen reader untuk membaca dokumen',
        ]);

        $response->assertRedirect();
        $accessibility = $user->accessibilityProfile()->first();

        $this->assertNotNull($accessibility);
        $this->assertSame(['netra', 'rungu'], $accessibility->disability_types);
        $this->assertSame(['screen_reader'], $accessibility->accommodations_needed);
        $this->assertSame('Butuh screen reader untuk membaca dokumen', $accessibility->notes);
    }

    public function test_accessibility_profile_update_is_created_if_not_exists(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $this->assertNull($user->accessibilityProfile()->first());

        $this->actingAs($user)->post('/app/accessibility-profile', [
            'disability_types' => ['fisik'],
            'accommodations_needed' => ['ramp'],
            'notes' => null,
        ]);

        $accessibility = $user->accessibilityProfile()->first();
        $this->assertNotNull($accessibility);
        $this->assertSame(['fisik'], $accessibility->disability_types);
    }

    public function test_accessibility_profile_validation_rejects_invalid_array_values(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/accessibility-profile', [
            'disability_types' => 'bukan-array',
            'accommodations_needed' => ['ramp'],
        ]);

        $response->assertInvalid('disability_types');
    }

    public function test_profile_update_validates_phone_max_length(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/profile', [
            'phone' => str_repeat('1', 25),
            'bio' => null,
            'education' => null,
            'experience' => null,
            'current_job_title' => null,
        ]);

        $response->assertInvalid('phone');
    }
}
