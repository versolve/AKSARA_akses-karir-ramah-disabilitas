<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRegistrationBlockedTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_rejects_admin_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Attacker',
            'email' => 'attacker@admin.local',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertInvalid('role');

        // No user created with admin role via public registration
        $this->assertDatabaseMissing('users', [
            'email' => 'attacker@admin.local',
            'role' => 'admin',
        ]);
    }

    public function test_public_registration_allows_pelamar_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Job Seeker',
            'email' => 'seeker@valid.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertRedirect('/app/dashboard');
    }

    public function test_public_registration_allows_perusahaan_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'PT Sukses',
            'email' => 'hr@sukses.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'perusahaan',
        ]);

        $response->assertRedirect('/company/dashboard');
    }
}
