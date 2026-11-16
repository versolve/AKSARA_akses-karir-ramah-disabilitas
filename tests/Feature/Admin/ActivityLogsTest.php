<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_activity_logs(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $perusahaan = User::factory()->create(['role' => 'perusahaan']);

        $this->actingAs($pelamar)->get('/admin/activity-logs')->assertStatus(403);
        $this->actingAs($perusahaan)->get('/admin/activity-logs')->assertStatus(403);
    }

    public function test_admin_can_access_activity_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        ActivityLog::create([
            'actor_name' => 'Admin Test',
            'actor_email' => 'admin@test.com',
            'actor_role' => 'admin',
            'action' => 'update',
            'module' => 'system',
            'description' => 'Test log description',
            'severity' => 'info',
            'ip_address' => '127.0.0.1',
            'browser' => 'Chrome',
        ]);

        $response = $this->actingAs($admin)->get('/admin/activity-logs');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/activity-logs/index')
            ->has('logs')
            ->has('metrics')
            ->has('modules_list')
            ->has('actions_list')
        );
    }

    public function test_admin_can_export_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/admin/activity-logs/export');
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type') ?? '');
    }
}
