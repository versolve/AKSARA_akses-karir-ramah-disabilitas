<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileCvController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $profile = $request->user()->jobSeekerProfile()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        if ($profile->cv_path && Storage::disk('public')->exists($profile->cv_path)) {
            Storage::disk('public')->delete($profile->cv_path);
        }

        $profile->update([
            'cv_path' => $request->file('cv')->store('cvs/profile', 'public'),
        ]);

        return back()->with('status', 'CV berhasil diperbarui.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $profile = $request->user()->jobSeekerProfile;

        if ($profile?->cv_path && Storage::disk('public')->exists($profile->cv_path)) {
            Storage::disk('public')->delete($profile->cv_path);
        }

        $profile?->update(['cv_path' => null]);

        return back()->with('status', 'CV berhasil dihapus.');
    }
}
