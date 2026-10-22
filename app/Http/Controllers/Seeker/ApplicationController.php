<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    private function getSeekerProfile(Request $request): JobSeekerProfile
    {
        $seeker = $request->user()->jobSeekerProfile;
        if (!$seeker) {
            $seeker = JobSeekerProfile::create([
                'user_id' => $request->user()->id,
            ]);
        }
        return $seeker;
    }

    public function apply(Request $request, Vacancy $vacancy): RedirectResponse
    {
        if ($vacancy->status !== 'active') {
            abort(400, 'Lowongan ini sudah tidak menerima lamaran.');
        }

        $seeker = $this->getSeekerProfile($request);

        $existing = Application::where('vacancy_id', $vacancy->id)
            ->where('job_seeker_profile_id', $seeker->id)
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'vacancy' => 'Anda sudah pernah melamar lowongan ini.',
            ]);
        }

        $validated = $request->validate([
            'cover_letter' => ['nullable', 'string'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $cvPath = $request->file('cv')->store('cvs', 'public');

        Application::create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'cv_path' => $cvPath,
            'status' => 'submitted',
            'applied_at' => now(),
        ]);

        return back()->with('status', 'Lamaran Anda berhasil dikirim.');
    }

    public function index(Request $request): Response
    {
        $seeker = $this->getSeekerProfile($request);

        $baseQuery = $seeker->applications();

        $totalCount = (clone $baseQuery)->count();
        $inProgressCount = (clone $baseQuery)->whereIn('status', ['submitted', 'reviewed', 'interview'])->count();
        $hiredCount = (clone $baseQuery)->where('status', 'hired')->count();
        $rejectedCount = (clone $baseQuery)->where('status', 'rejected')->count();

        $query = $seeker->applications()
            ->with(['vacancy.companyProfile', 'vacancy.accessibilities']);

        if ($search = $request->input('search')) {
            $query->whereHas('vacancy', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('companyProfile', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sort = $request->input('sort', 'newest');
        if ($sort === 'oldest') {
            $query->oldest('applied_at');
        } else {
            $query->latest('applied_at');
        }

        $applications = $query->paginate(10)->withQueryString();

        return Inertia::render('app/applications/index', [
            'applications' => $applications,
            'stats' => [
                'total' => $totalCount,
                'in_progress' => $inProgressCount,
                'hired' => $hiredCount,
                'rejected' => $rejectedCount,
            ],
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'sort' => $request->input('sort', 'newest'),
            ],
        ]);
    }

    public function show(Request $request, Application $application): Response
    {
        $seeker = $this->getSeekerProfile($request);
        abort_unless($application->job_seeker_profile_id === $seeker->id, 403, 'Akses ditolak.');

        $application->load(['vacancy.companyProfile', 'vacancy.accessibilities']);

        return Inertia::render('app/applications/show', [
            'application' => $application,
        ]);
    }
}
