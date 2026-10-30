<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        return $this->renderProfile($request, 'app/profile');
    }

    public function edit(Request $request): Response
    {
        return $this->renderProfile($request, 'app/profile-edit');
    }

    private function renderProfile(Request $request, string $page): Response
    {
        $user = $request->user();
        $profile = $user->jobSeekerProfile()->firstOrNew(['user_id' => $user->id]);
        $accessibility = $user->accessibilityProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render($page, [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $this->avatarUrl($user->avatar),
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
                'profile_completed_percentage' => $profile->profile_completed_percentage ?? 80,
                'skills' => $profile->skills ?? [],
                'work_experiences' => $profile->work_experiences ?? [],
                'educations' => $profile->educations ?? [],
                'projects' => $profile->projects ?? [],
                'certifications' => $profile->certifications ?? [],
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
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'work_experiences' => ['nullable', 'array'],
            'work_experiences.*.company' => ['required', 'string', 'max:255'],
            'work_experiences.*.position' => ['required', 'string', 'max:255'],
            'work_experiences.*.start_date' => ['nullable', 'string', 'max:50'],
            'work_experiences.*.end_date' => ['nullable', 'string', 'max:50'],
            'work_experiences.*.location' => ['nullable', 'string', 'max:255'],
            'work_experiences.*.description' => ['nullable', 'string'],
            'educations' => ['nullable', 'array'],
            'educations.*.institution' => ['required', 'string', 'max:255'],
            'educations.*.degree' => ['required', 'string', 'max:255'],
            'educations.*.start_year' => ['nullable'],
            'educations.*.end_year' => ['nullable'],
            'educations.*.location' => ['nullable', 'string', 'max:255'],
            'projects' => ['nullable', 'array'],
            'projects.*.name' => ['required', 'string', 'max:255'],
            'projects.*.description' => ['nullable', 'string'],
            'projects.*.url' => ['nullable', 'url', 'max:255'],
            'projects.*.skills' => ['nullable', 'array'],
            'projects.*.skills.*' => ['string', 'max:100'],
            'certifications' => ['nullable', 'array'],
            'certifications.*.name' => ['required', 'string', 'max:255'],
            'certifications.*.issuer' => ['nullable', 'string', 'max:255'],
            'certifications.*.year' => ['nullable'],
            'certifications.*.credential_url' => ['nullable', 'url', 'max:255'],
        ]);

        if ($request->has('name') && $request->filled('name')) {
            $request->user()->update(['name' => $request->input('name')]);
        }

        $request->user()->jobSeekerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return redirect('/app/profile')->with('status', 'Profil berhasil disimpan.');
    }

    private function avatarUrl(?string $avatar): ?string
    {
        if (! $avatar) {
            return null;
        }

        return str_starts_with($avatar, 'http') || str_starts_with($avatar, '/storage/')
            ? $avatar
            : asset('storage/' . $avatar);
    }
}
