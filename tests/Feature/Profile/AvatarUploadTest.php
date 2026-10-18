<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AvatarUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_and_resize_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);

        // Create fake large image (e.g. 1000x800)
        $file = UploadedFile::fake()->image('my-photo.jpg', 1000, 800);

        $response = $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertRedirect();
        $this->assertNotNull($user->fresh()->avatar);

        // Verify avatar string format
        $avatarPath = str_replace('/storage/', '', $user->fresh()->avatar);
        $this->assertTrue(Storage::disk('public')->exists($avatarPath));

        // Verify the saved file is a valid image and <= 300x300
        $fullPath = Storage::disk('public')->path($avatarPath);
        [$width, $height] = getimagesize($fullPath);
        $this->assertEquals(300, $width);
        $this->assertEquals(300, $height);
    }

    public function test_user_can_delete_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'pelamar',
            'avatar' => '/storage/avatars/sample.webp',
        ]);

        Storage::disk('public')->put('avatars/sample.webp', 'fake content');

        $response = $this->actingAs($user)->delete('/profile/avatar');

        $response->assertRedirect();
        $this->assertNull($user->fresh()->avatar);
        $this->assertFalse(Storage::disk('public')->exists('avatars/sample.webp'));
    }

    public function test_non_image_file_is_rejected(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'pelamar']);
        $file = UploadedFile::fake()->create('document.pdf', 500);

        $response = $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertInvalid('avatar');
    }
}
