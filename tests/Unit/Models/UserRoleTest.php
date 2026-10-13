<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    public function test_user_role_helpers_identify_pelamar(): void
    {
        $user = User::factory()->make(['role' => 'pelamar']);
        $this->assertTrue($user->isPelamar());
        $this->assertFalse($user->isPerusahaan());
        $this->assertFalse($user->isAdmin());
        $this->assertEquals('/app/dashboard', $user->getDashboardRoute());
    }

    public function test_user_role_helpers_identify_perusahaan(): void
    {
        $user = User::factory()->make(['role' => 'perusahaan']);
        $this->assertFalse($user->isPelamar());
        $this->assertTrue($user->isPerusahaan());
        $this->assertFalse($user->isAdmin());
        $this->assertEquals('/company/dashboard', $user->getDashboardRoute());
    }

    public function test_user_role_helpers_identify_admin(): void
    {
        $user = User::factory()->make(['role' => 'admin']);
        $this->assertFalse($user->isPelamar());
        $this->assertFalse($user->isPerusahaan());
        $this->assertTrue($user->isAdmin());
        $this->assertEquals('/admin/dashboard', $user->getDashboardRoute());
    }
}
