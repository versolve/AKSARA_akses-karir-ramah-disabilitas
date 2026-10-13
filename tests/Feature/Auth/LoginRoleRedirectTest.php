<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginRoleRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_logging_in_as_pelamar_redirects_to_pelamar_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'pelamar@test.com',
            'password' => bcrypt('password123'),
            'role' => 'pelamar',
        ]);

        $response = $this->post('/login', [
            'email' => 'pelamar@test.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/app/dashboard');
    }

    public function test_logging_in_as_perusahaan_redirects_to_company_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'hr@test.com',
            'password' => bcrypt('password123'),
            'role' => 'perusahaan',
        ]);

        $response = $this->post('/login', [
            'email' => 'hr@test.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/company/dashboard');
    }

    public function test_logging_in_as_admin_redirects_to_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/admin/dashboard');
    }
}
