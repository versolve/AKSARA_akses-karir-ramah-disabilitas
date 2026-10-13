<?php

namespace App\Http\Controllers\Company;

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
        $company = $user->companyProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('company/profile', [
            'company' => [
                'company_name' => $company->company_name ?? '',
                'industry' => $company->industry ?? '',
                'address' => $company->address ?? '',
                'website' => $company->website ?? '',
                'description' => $company->description ?? '',
                'is_approved' => (bool) ($company->is_approved ?? false),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $request->user()->companyProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil perusahaan berhasil disimpan.');
    }
}
