<?php

namespace Tests\Unit\Models;

use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_seeker_profile_belongs_to_user_and_has_correct_casts(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $profile = JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'profile_completed_percentage' => '75',
        ]);

        $this->assertEquals($user->id, $profile->user_id);
        $this->assertEquals($user->id, $profile->user->id);
        $this->assertSame(75, $profile->profile_completed_percentage);
        $this->assertInstanceOf(JobSeekerProfile::class, $user->jobSeekerProfile);
    }

    public function test_company_profile_belongs_to_user_and_has_boolean_is_approved(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create([
            'user_id' => $user->id,
            'is_approved' => 1,
        ]);

        $this->assertTrue($company->is_approved);
        $this->assertEquals($user->id, $company->user->id);
        $this->assertInstanceOf(CompanyProfile::class, $user->companyProfile);
    }

    public function test_user_preference_casts_booleans_and_integer_scale(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $pref = UserPreference::factory()->create([
            'user_id' => $user->id,
            'text_scale' => '110',
            'tts_enabled' => 1,
            'high_contrast' => 0,
        ]);

        $this->assertSame(110, $pref->text_scale);
        $this->assertTrue($pref->tts_enabled);
        $this->assertFalse($pref->high_contrast);
        $this->assertInstanceOf(UserPreference::class, $user->preference);
    }

    public function test_seeker_accessibility_profile_casts_json_arrays(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $acc = SeekerAccessibilityProfile::factory()->create([
            'user_id' => $user->id,
            'disability_types' => ['netra', 'rungu'],
            'accommodations_needed' => ['screen_reader'],
        ]);

        $this->assertIsArray($acc->disability_types);
        $this->assertContains('netra', $acc->disability_types);
        $this->assertContains('screen_reader', $acc->accommodations_needed);
        $this->assertInstanceOf(SeekerAccessibilityProfile::class, $user->accessibilityProfile);
    }
}
