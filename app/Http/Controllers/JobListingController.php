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

        $savedVacancyIds = $request->user()
            ? $request->user()->savedVacancies()->pluck('vacancy_id')->toArray()
            : [];

        if ($search = trim($request->input('search', ''))) {
            $terms = array_filter(explode(' ', $search));

            $query->where(function ($q) use ($search, $terms) {
                // Exact full search match across vacancy and company
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('companyProfile', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%")
                         ->orWhere('industry', 'like', "%{$search}%");
                  });

                // Also match individual terms if multi-word search (e.g. "pt karya")
                if (count($terms) > 1) {
                    $q->orWhere(function ($subQ) use ($terms) {
                        foreach ($terms as $term) {
                            $subQ->where(function ($termQ) use ($term) {
                                $termQ->where('title', 'like', "%{$term}%")
                                      ->orWhere('description', 'like', "%{$term}%")
                                      ->orWhere('location', 'like', "%{$term}%")
                                      ->orWhereHas('companyProfile', function ($cq) use ($term) {
                                          $cq->where('company_name', 'like', "%{$term}%")
                                             ->orWhere('industry', 'like', "%{$term}%");
                                      });
                            });
                        }
                    });
                }
            });
        }

        if ($location = $request->input('location')) {
            $query->where('location', 'like', "%{$location}%");
        }

        if ($industry = $request->input('industry')) {
            $query->whereHas('companyProfile', function ($q) use ($industry) {
                $q->where('industry', 'like', "%{$industry}%");
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

        if ($request->boolean('only_favorites') && $request->user()) {
            $query->whereIn('id', $savedVacancyIds);
        }

        $vacancies = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('jobs/index', [
            'vacancies' => $vacancies,
            'filters' => $request->only(['search', 'work_model', 'job_type', 'accessibility', 'location', 'industry', 'only_favorites']),
            'savedVacancyIds' => $savedVacancyIds,
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $vacancy = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->where('slug', $slug)
            ->firstOrFail();

        $alreadyApplied = false;
        $isSaved = false;

        if ($request->user()) {
            $isSaved = $request->user()->savedVacancies()->where('vacancy_id', $vacancy->id)->exists();

            if ($request->user()->isPelamar()) {
                $seeker = $request->user()->jobSeekerProfile;
                if ($seeker) {
                    $alreadyApplied = $vacancy->applications()
                        ->where('job_seeker_profile_id', $seeker->id)
                        ->exists();
                }
            }
        }

        return Inertia::render('jobs/show', [
            'vacancy' => $vacancy,
            'alreadyApplied' => $alreadyApplied,
            'isSaved' => $isSaved,
        ]);
    }
}
