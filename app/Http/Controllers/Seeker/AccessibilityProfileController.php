<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccessibilityProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $acc = $user->accessibilityProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('app/accessibility-profile', [
            'accessibility' => [
                'disability_types' => $acc->disability_types ?? [],
                'accommodations_needed' => $acc->accommodations_needed ?? [],
                'notes' => $acc->notes ?? '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'disability_types' => ['nullable', 'array'],
            'disability_types.*' => ['string'],
            'accommodations_needed' => ['nullable', 'array'],
            'accommodations_needed.*' => ['string'],
            'notes' => ['nullable', 'string'],
        ]);

        $request->user()->accessibilityProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil aksesibilitas berhasil disimpan.');
    }
}
