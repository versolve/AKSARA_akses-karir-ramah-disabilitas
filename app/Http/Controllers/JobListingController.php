<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobListingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Vacancy::active()->with(['companyProfile', 'accessibilities']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($workModel = $request->input('work_model')) {
            $query->where('work_model', $workModel);
        }

        if ($jobType = $request->input('job_type')) {
            $query->where('job_type', $jobType);
        }

        if ($accType = $request->input('accessibility')) {
            $query->whereHas('accessibilities', function ($q) use ($accType) {
                $q->where('accommodation_type', $accType);
            });
        }

        $vacancies = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('jobs/index', [
            'vacancies' => $vacancies,
            'filters' => $request->only(['search', 'work_model', 'job_type', 'accessibility']),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $vacancy = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->where('slug', $slug)
            ->firstOrFail();

        $alreadyApplied = false;
        if ($request->user() && $request->user()->isPelamar()) {
            $seeker = $request->user()->jobSeekerProfile;
            if ($seeker) {
                $alreadyApplied = $vacancy->applications()
                    ->where('job_seeker_profile_id', $seeker->id)
                    ->exists();
            }
        }

        return Inertia::render('jobs/show', [
            'vacancy' => $vacancy,
            'alreadyApplied' => $alreadyApplied,
        ]);
    }
}
