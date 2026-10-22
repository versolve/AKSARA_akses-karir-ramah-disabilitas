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
        $accessibility = $user->accessibilityProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('app/profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'profile' => [
                'phone' => $profile->phone ?? '',
                'birth_date' => $profile->birth_date?->format('Y-m-d') ?? '',
                'domicile' => $profile->domicile ?? '',
                'gender' => $profile->gender ?? '',
                'bio' => $profile->bio ?? '',
                'education' => $profile->education ?? '',
                'experience' => $profile->experience ?? '',
                'current_job_title' => $profile->current_job_title ?? '',
                'linkedin_url' => $profile->linkedin_url ?? '',
                'portfolio_url' => $profile->portfolio_url ?? '',
                'cv_path' => $profile->cv_path,
                'cv_url' => $profile->cv_path ? '/storage/' . $profile->cv_path : null,
                'cv_name' => $profile->cv_path ? basename($profile->cv_path) : null,
                'cv_updated_at' => $profile->updated_at?->toIso8601String(),
            ],
            'accessibility' => [
                'disability_types' => $accessibility->disability_types ?? [],
                'accommodations_needed' => $accessibility->accommodations_needed ?? [],
                'notes' => $accessibility->notes ?? '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'domicile' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string'],
            'education' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string'],
            'current_job_title' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
        ]);

        $request->user()->jobSeekerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil berhasil disimpan.');
    }
}
