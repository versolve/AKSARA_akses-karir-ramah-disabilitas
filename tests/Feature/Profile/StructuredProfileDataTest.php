<?php

namespace Tests\Feature\Profile;

use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StructuredProfileDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_save_structured_skills_projects_and_certifications(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post('/app/profile/portfolio', [
            'skills' => ['UI/UX Design', 'Figma', 'User Research'],
            'work_experiences' => [[
                'company' => 'PT Digital Kreatif Indonesia',
                'position' => 'UI/UX Designer',
                'start_date' => '2022-01-01',
                'end_date' => '2023-12-31',
                'location' => 'Bandung, Jawa Barat',
                'description' => 'Merancang UI/UX aplikasi web dan mobile.',
            ]],
            'educations' => [[
                'institution' => 'Universitas Indonesia',
                'degree' => 'S1 Desain Komunikasi Visual',
                'start_year' => 2018,
                'end_year' => 2022,
                'location' => 'Depok, Indonesia',
            ]],
            'projects' => [[
                'name' => 'Aksesikku',
                'description' => 'Aplikasi fasilitas publik ramah akses.',
                'url' => 'https://example.com/aksesikku',
                'skills' => ['UI/UX Design', 'Accessibility'],
            ]],
            'certifications' => [[
                'name' => 'Google UX Design Professional Certificate',
                'issuer' => 'Google',
                'year' => 2023,
                'credential_url' => 'https://example.com/certificate',
            ]],
        ]);

        $response->assertRedirect();
        $profile = $user->jobSeekerProfile()->first();

        $this->assertSame(['UI/UX Design', 'Figma', 'User Research'], $profile->skills);
        $this->assertSame('PT Digital Kreatif Indonesia', $profile->work_experiences[0]['company']);
        $this->assertSame('Universitas Indonesia', $profile->educations[0]['institution']);
        $this->assertSame('Aksesikku', $profile->projects[0]['name']);
        $this->assertSame('Google UX Design Professional Certificate', $profile->certifications[0]['name']);
    }

    public function test_structured_profile_payload_is_validated(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->post('/app/profile/portfolio', [
            'skills' => 'not-an-array',
            'projects' => [['name' => '', 'url' => 'not-a-url']],
            'certifications' => [['name' => '', 'year' => 'invalid']],
        ]);

        $response->assertInvalid(['skills', 'projects.0.name', 'projects.0.url', 'certifications.0.name', 'certifications.0.year']);
    }
}
