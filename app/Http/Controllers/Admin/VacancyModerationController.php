<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VacancyModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Vacancy::with(['companyProfile', 'accessibilities'])->withCount('applications');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $vacancies = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/vacancies/index', [
            'vacancies' => $vacancies,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function updateStatus(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,closed,draft'],
        ]);

        $vacancy->update($validated);

        return back()->with('status', 'Status lowongan berhasil diperbarui.');
    }

    public function destroy(Vacancy $vacancy): RedirectResponse
    {
        $vacancy->delete();

        return back()->with('status', 'Lowongan berhasil di-takedown dari platform.');
    }
}
