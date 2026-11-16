<?php

namespace Tests\Feature\Admin;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BannerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_banner_management(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($pelamar)->get('/admin/banners')->assertStatus(403);
    }

    public function test_admin_can_access_banner_management_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Banner::create([
            'title' => 'Halo, {name}!',
            'type' => 'interactive',
            'order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/banners');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/banners/index')
            ->has('banners')
            ->has('stats')
        );
    }

    public function test_admin_can_create_image_banner(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $file = UploadedFile::fake()->image('test-banner.gif');

        $response = $this->actingAs($admin)->post('/admin/banners', [
            'title' => 'Banner Animasi GIF Test',
            'subtitle' => 'Deskripsi banner animasi test',
            'type' => 'image',
            'image' => $file,
            'image_position' => '50% 20%',
            'image_scale' => 125,
            'link_url' => '/jobs',
            'order' => 1,
            'is_active' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'title' => 'Banner Animasi GIF Test',
            'type' => 'image',
            'image_position' => '50% 20%',
            'image_scale' => 125,
        ]);

        $banner = Banner::where('title', 'Banner Animasi GIF Test')->first();
        $this->assertNotNull($banner->image_path);
        Storage::disk('public')->assertExists($banner->image_path);
    }

    public function test_admin_can_toggle_banner_active(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $banner = Banner::create([
            'title' => 'Toggle Test',
            'type' => 'info',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/admin/banners/{$banner->id}/toggle");
        $response->assertRedirect();

        $this->assertFalse($banner->fresh()->is_active);
    }

    public function test_admin_can_delete_banner(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $banner = Banner::create([
            'title' => 'Delete Test',
            'type' => 'interactive',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/banners/{$banner->id}");
        $response->assertRedirect();

        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
    }

    public function test_seeker_receives_active_banners_on_dashboard(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar', 'name' => 'Budi Santoso']);

        Banner::create([
            'title' => 'Halo, {name}!',
            'type' => 'interactive',
            'order' => 1,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'Draft Inactive Banner',
            'type' => 'info',
            'order' => 2,
            'is_active' => false,
        ]);

        $response = $this->actingAs($pelamar)->get('/app/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('app/dashboard')
            ->has('banners', 1)
            ->where('banners.0.title', 'Halo, Budi Santoso!')
        );
    }
}
