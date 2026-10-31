<?php

namespace Tests\Feature\Admin;

use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
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
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('counts.pelamar', 1)
            ->where('counts.perusahaan', 1)
            ->where('filters.role', 'pelamar')
        );
    }

    public function test_user_account_lifecycle_fields_are_cast(): void
    {
        $user = User::factory()->create()->refresh();

        $this->assertFalse($user->is_disabled);
        $this->assertNull($user->disabled_at);
        $this->assertNull($user->scheduled_deletion_at);

        $user->update([
            'is_disabled' => true,
            'disabled_at' => now(),
            'scheduled_deletion_at' => now()->addDays(30),
        ]);

        $user->refresh();

        $this->assertTrue($user->is_disabled);
        $this->assertInstanceOf(\DateTimeInterface::class, $user->disabled_at);
        $this->assertInstanceOf(\DateTimeInterface::class, $user->scheduled_deletion_at);
    }

    public function test_admin_cannot_disable_admin_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $anotherAdmin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post("/admin/users/$anotherAdmin->id/deactivate", [
            'current_password' => 'password',
        ]);

        $response->assertForbidden();

        $anotherAdmin->refresh();
        $this->assertFalse($anotherAdmin->is_disabled);
        $this->assertNull($anotherAdmin->disabled_at);
        $this->assertNull($anotherAdmin->scheduled_deletion_at);
    }

    public function test_user_cannot_disable_themself(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->post("/admin/users/$user->id/deactivate", [
            'current_password' => 'password',
        ]);

        $response->assertForbidden();

        $user->refresh();
        $this->assertFalse($user->is_disabled);
        $this->assertNull($user->disabled_at);
        $this->assertNull($user->scheduled_deletion_at);
    }

    public function test_admin_wrong_password_fails_deactivate(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => Hash::make('correct-password')]);
        $target = User::factory()->create(['role' => 'perusahaan', 'password' => Hash::make('target-password')]);

        $response = $this->actingAs($admin)->post("/admin/users/$target->id/deactivate", [
            'current_password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('current_password');

        $target->refresh();
        $this->assertFalse($target->is_disabled);
        $this->assertNull($target->disabled_at);
        $this->assertNull($target->scheduled_deletion_at);
    }

    public function test_admin_can_deactivate_and_activate(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => Hash::make('admin-pass')]);
        $target = User::factory()->create(['role' => 'perusahaan', 'password' => Hash::make('target-pass')]);

        $response = $this->actingAs($admin)->post("/admin/users/$target->id/deactivate", [
            'current_password' => 'admin-pass',
        ]);

        $response->assertRedirect();
        $target->refresh();
        $this->assertTrue($target->is_disabled);
        $this->assertNotNull($target->disabled_at);
        $this->assertEqualsWithDelta(now()->addDays(30)->timestamp, $target->scheduled_deletion_at->timestamp, 2);

        // Activate
        $response2 = $this->actingAs($admin)->post("/admin/users/$target->id/activate", [
            'current_password' => 'admin-pass',
        ]);

        $response2->assertRedirect();

        $target->refresh();
        $this->assertFalse($target->is_disabled);
        $this->assertNull($target->disabled_at);
        $this->assertNull($target->scheduled_deletion_at);
    }

    public function test_admin_can_permanently_delete_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => Hash::make('admin-pass')]);
        $target = User::factory()->create(['role' => 'pelamar', 'password' => Hash::make('target-pass')]);

        $response = $this->actingAs($admin)->delete("/admin/users/$target->id", [
            'current_password' => 'admin-pass',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_admin_wrong_password_fails_delete(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => Hash::make('admin-pass')]);
        $target = User::factory()->create(['role' => 'pelamar', 'password' => Hash::make('target-pass')]);

        $response = $this->actingAs($admin)->delete("/admin/users/$target->id", [
            'current_password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors(['current_password'])
                 ->assertStatus(302);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_delete_admin_user(): void
    {
        $admin1 = User::factory()->create(['role' => 'admin', 'password' => Hash::make('admin-pass')]);
        $admin2 = User::factory()->create(['role' => 'admin', 'password' => Hash::make('admin2-pass')]);

        $response = $this->actingAs($admin1)->delete("/admin/users/$admin2->id", [
            'current_password' => 'admin-pass',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $admin2->id]);
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan', 'password' => Hash::make('user-pass')]);

        $response = $this->actingAs($user)->delete("/admin/users/$user->id", [
            'current_password' => 'user-pass',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_expired_disabled_users_are_deleted_by_command(): void
    {
        $expired = User::factory()->create([
            'role' => 'pelamar',
            'is_disabled' => true,
            'disabled_at' => now()->subDays(31),
            'scheduled_deletion_at' => now()->subMinute(),
        ]);
        $future = User::factory()->create([
            'role' => 'perusahaan',
            'is_disabled' => true,
            'disabled_at' => now(),
            'scheduled_deletion_at' => now()->addDay(),
        ]);
        $active = User::factory()->create([
            'role' => 'pelamar',
            'is_disabled' => false,
            'scheduled_deletion_at' => now()->subMinute(),
        ]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_disabled' => true,
            'disabled_at' => now()->subDays(31),
            'scheduled_deletion_at' => now()->subMinute(),
        ]);

        $this->artisan('users:delete-expired')->assertSuccessful();

        $this->assertDatabaseMissing('users', ['id' => $expired->id]);
        $this->assertDatabaseHas('users', ['id' => $future->id]);
        $this->assertDatabaseHas('users', ['id' => $active->id]);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_view_company_verification_queue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $companyUser = User::factory()->create(['role' => 'perusahaan', 'name' => 'PT Inklusi Maju']);
        CompanyProfile::factory()->create([
            'user_id' => $companyUser->id,
            'company_name' => 'PT Inklusi Maju',
            'is_approved' => false,
        ]);

        $response = $this->actingAs($admin)->get('/admin/companies/verification?status=pending');

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/companies/verification')
            ->where('counts.pending', 1)
            ->where('filters.status', 'pending')
            ->has('companies.data', 1)
            ->where('companies.data.0.company_name', 'PT Inklusi Maju')
        );
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
