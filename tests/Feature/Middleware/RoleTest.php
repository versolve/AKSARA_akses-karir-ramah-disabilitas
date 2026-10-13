<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/app/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_wrong_role_cannot_access_pelamar_route(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $this->actingAs($user);

        $response = $this->get('/app/dashboard');

        $response->assertStatus(403);
    }

    public function test_right_role_can_access_their_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($user);

        $response = $this->get('/app/dashboard');

        $response->assertOk();
    }

    public function test_logged_in_pelamar_redirects_to_their_dashboard_on_home(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($pelamar);

        $response = $this->get('/');

        $response->assertRedirect('/app/dashboard');
    }

    public function test_logged_in_perusahaan_redirects_to_their_dashboard_on_home(): void
    {
        $perusahaan = User::factory()->create(['role' => 'perusahaan']);
        $this->actingAs($perusahaan);

        $response = $this->get('/');

        $response->assertRedirect('/company/dashboard');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $response = $this->get('/admin/dashboard');

        $response->assertOk();
    }

    public function test_pelamar_cannot_access_admin_dashboard(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($pelamar);

        $response = $this->get('/admin/dashboard');

        $response->assertStatus(403);
    }
}
