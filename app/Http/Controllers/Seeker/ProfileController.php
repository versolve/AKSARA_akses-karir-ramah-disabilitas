<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->jobSeekerProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('app/profile', [
            'profile' => [
                'phone' => $profile->phone ?? '',
                'bio' => $profile->bio ?? '',
                'education' => $profile->education ?? '',
                'experience' => $profile->experience ?? '',
                'current_job_title' => $profile->current_job_title ?? '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string'],
            'education' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string'],
            'current_job_title' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->jobSeekerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil berhasil disimpan.');
    }
}
