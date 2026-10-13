<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationWithRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_page_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_pelamar_users_can_register_with_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Budi Pelajar',
            'email' => 'budi@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertRedirect('/app/dashboard');
    }

    public function test_new_perusahaan_users_can_register_with_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'PT Maju Jaya',
            'email' => 'hr@maju.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'perusahaan',
        ]);

        $response->assertRedirect('/company/dashboard');
    }

    public function test_invalid_email_format_rejected_gracefully(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertInvalid('email');
    }

    public function test_duplicate_email_blocked(): void
    {
        $this->post('/register', [
            'name' => 'First User',
            'email' => 'dup@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        // Logout first user so second registration can happen as guest
        \Illuminate\Support\Facades\Auth::logout();

        $response = $this->post('/register', [
            'name' => 'Second User',
            'email' => 'dup@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertInvalid('email');
    }

    public function test_password_must_be_confirmed(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'pass@test.com',
            'password' => 'secret123',
            'password_confirmation' => 'different456',
            'role' => 'perusahaan',
        ]);

        $response->assertInvalid('password');
    }

    public function test_pelamar_has_is_verified_true_by_default(): void
    {
        $this->post('/register', [
            'name' => 'Pelamar User',
            'email' => 'user@seeker.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        /** @var \App\Models\User */
        $user = \App\Models\User::where('email', 'user@seeker.id')->first();
        $this->assertTrue($user->is_verified);
    }

    public function test_registration_creates_personal_team(): void
    {
        $this->post('/register', [
            'name' => 'Team User',
            'email' => 'team@maker.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        /** @var \App\Models\User */
        $user = \App\Models\User::where('email', 'team@maker.id')->first();
        $this->assertEquals($user->id, $user->current_team_id);
    }
}
