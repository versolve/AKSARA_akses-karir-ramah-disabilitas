<?php

namespace Tests\Feature\Profile;

use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtendedProfileFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_update_extended_profile_fields(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post('/app/profile', [
            'name' => 'Budi Santoso Baru',
            'email' => 'budi.baru@example.com',
            'phone' => '081234567890',
            'bio' => 'Desainer produk digital.',
            'education' => 'S1 Desain Komunikasi Visual',
            'experience' => '2 tahun desain UI/UX',
            'current_job_title' => 'UI/UX Designer',
            'birth_date' => '2000-06-06',
            'domicile' => 'Jakarta, Indonesia',
            'gender' => 'Laki-laki',
            'linkedin_url' => 'https://www.linkedin.com/in/budi',
            'portfolio_url' => 'https://www.behance.net/budi',
        ]);

        $response->assertRedirect();
        $profile = $user->jobSeekerProfile()->first();

        $this->assertSame('2000-06-06', $profile->birth_date->format('Y-m-d'));
        $this->assertSame('Jakarta, Indonesia', $profile->domicile);
        $this->assertSame('Laki-laki', $profile->gender);
        $this->assertSame('https://www.linkedin.com/in/budi', $profile->linkedin_url);
        $this->assertSame('https://www.behance.net/budi', $profile->portfolio_url);
    }

    public function test_extended_profile_fields_are_validated(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/profile', [
            'birth_date' => 'not-a-date',
            'linkedin_url' => 'not-a-url',
            'portfolio_url' => 'not-a-url',
        ]);

        $response->assertInvalid(['birth_date', 'linkedin_url', 'portfolio_url']);
    }
}
