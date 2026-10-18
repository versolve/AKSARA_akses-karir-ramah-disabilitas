<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProfileAvatarController extends Controller
{
    /**
     * Upload, resize, and convert user profile picture to standard 300x300 WebP format.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // Max 10MB upload allowed
        ]);

        $file = $request->file('avatar');
        $user = $request->user();

        try {
            $rawContent = file_get_contents($file->getRealPath());
            $srcImage = imagecreatefromstring($rawContent);

            if ($srcImage === false) {
                return back()->withErrors(['avatar' => 'Format gambar tidak dapat diproses.']);
            }

            $origWidth = imagesx($srcImage);
            $origHeight = imagesy($srcImage);

            // Calculate center square crop
            $cropSize = min($origWidth, $origHeight);
            $srcX = (int) floor(($origWidth - $cropSize) / 2);
            $srcY = (int) floor(($origHeight - $cropSize) / 2);

            // Target standard avatar dimensions (300x300)
            $targetSize = 300;
            $dstImage = imagecreatetruecolor($targetSize, $targetSize);

            // Preserve alpha channel if any
            imagealphablending($dstImage, false);
            imagesavealpha($dstImage, true);

            // High quality resample & crop
            imagecopyresampled(
                $dstImage,
                $srcImage,
                0,
                0,
                $srcX,
                $srcY,
                $targetSize,
                $targetSize,
                $cropSize,
                $cropSize
            );

            // Generate unique filename
            $filename = 'avatar_' . $user->id . '_' . time() . '.webp';
            $relativeDir = 'avatars';
            $relativePath = $relativeDir . '/' . $filename;

            // Make sure avatars directory exists on public disk
            Storage::disk('public')->makeDirectory($relativeDir);
            $fullDestinationPath = Storage::disk('public')->path($relativePath);

            // Save as compressed WebP (quality 85 for crisp yet lightweight avatar ~20-40KB)
            if (function_exists('imagewebp')) {
                imagewebp($dstImage, $fullDestinationPath, 85);
            } else {
                $filename = str_replace('.webp', '.jpg', $filename);
                $relativePath = $relativeDir . '/' . $filename;
                $fullDestinationPath = Storage::disk('public')->path($relativePath);
                imagejpeg($dstImage, $fullDestinationPath, 85);
            }

            imagedestroy($dstImage);
            imagedestroy($srcImage);

            // Delete old avatar file if present
            if ($user->avatar) {
                $oldRelPath = str_replace('/storage/', '', $user->avatar);
                if (Storage::disk('public')->exists($oldRelPath)) {
                    Storage::disk('public')->delete($oldRelPath);
                }
            }

            // Save public URL in database
            $publicUrl = '/storage/' . $relativePath;
            $user->update(['avatar' => $publicUrl]);

            return back()->with('status', 'Foto profil berhasil diperbarui.');
        } catch (Throwable $e) {
            return back()->withErrors(['avatar' => 'Gagal memproses gambar: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete user profile picture.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            $oldRelPath = str_replace('/storage/', '', $user->avatar);
            if (Storage::disk('public')->exists($oldRelPath)) {
                Storage::disk('public')->delete($oldRelPath);
            }

            $user->update(['avatar' => null]);
        }

        return back()->with('status', 'Foto profil berhasil dihapus.');
    }
}
