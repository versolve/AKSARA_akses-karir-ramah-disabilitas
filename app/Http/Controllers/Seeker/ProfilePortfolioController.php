<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProfilePortfolioController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'work_experiences' => ['nullable', 'array'],
            'work_experiences.*.company' => ['required', 'string', 'max:255'],
            'work_experiences.*.position' => ['required', 'string', 'max:255'],
            'work_experiences.*.start_date' => ['nullable', 'date'],
            'work_experiences.*.end_date' => ['nullable', 'date'],
            'work_experiences.*.location' => ['nullable', 'string', 'max:255'],
            'work_experiences.*.description' => ['nullable', 'string'],
            'educations' => ['nullable', 'array'],
            'educations.*.institution' => ['required', 'string', 'max:255'],
            'educations.*.degree' => ['required', 'string', 'max:255'],
            'educations.*.start_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'educations.*.end_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
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
            'certifications.*.year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'certifications.*.credential_url' => ['nullable', 'url', 'max:255'],
        ]);

        $request->user()->jobSeekerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Portofolio berhasil disimpan.');
    }
}
