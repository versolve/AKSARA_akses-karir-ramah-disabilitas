<?php

namespace Tests\Feature\Admin;

use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_list_with_role_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'pelamar', 'name' => 'Budi Pelamar']);
        User::factory()->create(['role' => 'perusahaan', 'name' => 'PT Harapan']);

        $response = $this->actingAs($admin)->get('/admin/users?role=pelamar');
        $response->assertOk();
        $response->assertSee('Budi Pelamar');
    }

    public function test_admin_can_verify_and_unverify_company(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $companyUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $companyUser->id, 'is_approved' => false]);

        $this->assertFalse($company->fresh()->is_approved);

        // Approve
        $response = $this->actingAs($admin)->post('/admin/companies/' . $company->id . '/verify', [
            'is_approved' => true,
        ]);
        $response->assertRedirect();
        $this->assertTrue($company->fresh()->is_approved);

        // Unverify
        $response2 = $this->actingAs($admin)->post('/admin/companies/' . $company->id . '/verify', [
            'is_approved' => false,
        ]);
        $response2->assertRedirect();
        $this->assertFalse($company->fresh()->is_approved);
    }
}
