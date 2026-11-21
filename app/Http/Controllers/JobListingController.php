<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobListingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Vacancy::active()->with(['companyProfile', 'accessibilities']);

        $user = $request->user();
        $isJobSeeker = $user && $user->role === 'pelamar';
        $profile = $isJobSeeker ? $user->jobSeekerProfile : null;
        $accProfile = $isJobSeeker ? $user->accessibilityProfile : null;

        $savedVacancyIds = $user
            ? $user->savedVacancies()->pluck('vacancy_id')->toArray()
            : [];

        // 1. Extract Profile Data & Preferences for Recommendations
        $profileTitle = trim($profile?->current_job_title ?? '');
        $profileSkills = is_array($profile?->skills) ? array_values(array_filter(array_map('trim', $profile->skills))) : [];
        $profileAccommodations = is_array($accProfile?->accommodations_needed) ? array_values(array_filter(array_map('trim', $accProfile->accommodations_needed))) : [];

        // 2. Generate Smart Quick Keyword Suggestions
        $quickKeywords = [];
        $addedLabels = [];

        if ($profileTitle) {
            $cleanTitle = explode('&', $profileTitle)[0];
            $cleanTitle = trim(explode('/', $cleanTitle)[0]);
            if (strlen($cleanTitle) <= 25 && !in_array(strtolower($cleanTitle), $addedLabels)) {
                $quickKeywords[] = [
                    'label' => $cleanTitle,
                    'is_profile' => true,
                    'type' => 'role',
                ];
                $addedLabels[] = strtolower($cleanTitle);
            }
        }

        foreach ($profileSkills as $skill) {
            if (count($quickKeywords) >= 4) break;
            $sLower = strtolower($skill);
            if (!in_array($sLower, $addedLabels) && strlen($skill) <= 20) {
                $quickKeywords[] = [
                    'label' => $skill,
                    'is_profile' => true,
                    'type' => 'skill',
                ];
                $addedLabels[] = $sLower;
            }
        }

        // Popular trending keywords to complement
        $trendingFallbacks = ['UI/UX Design', 'Administrasi', 'QA Tester', 'Customer Service', 'Frontend'];
        foreach ($trendingFallbacks as $fallback) {
            if (count($quickKeywords) >= 6) break;
            $fLower = strtolower($fallback);
            if (!in_array($fLower, $addedLabels)) {
                $quickKeywords[] = [
                    'label' => $fallback,
                    'is_profile' => false,
                    'type' => 'trending',
                ];
                $addedLabels[] = $fLower;
            }
        }

        // 3. Filter by Recommended Profile
        $isRecommended = $request->boolean('recommended');
        if ($isRecommended && $user) {
            $query->where(function ($q) use ($profileTitle, $profileSkills, $profileAccommodations) {
                $matchedAny = false;

                if (!empty($profileTitle)) {
                    $titleParts = array_filter(preg_split('/[\s,\/&]+/', $profileTitle));
                    foreach ($titleParts as $part) {
                        if (strlen($part) >= 3 && !in_array(strtolower($part), ['dan', 'and', 'with', 'the', 'for'])) {
                            $q->orWhere('title', 'like', "%{$part}%")
                              ->orWhere('description', 'like', "%{$part}%");
                            $matchedAny = true;
                        }
                    }
                }

                if (!empty($profileSkills)) {
                    foreach ($profileSkills as $skill) {
                        if (strlen($skill) >= 2) {
                            $q->orWhere('title', 'like', "%{$skill}%")
                              ->orWhere('description', 'like', "%{$skill}%")
                              ->orWhere('skills_required', 'like', "%{$skill}%")
                              ->orWhere('requirements', 'like', "%{$skill}%");
                            $matchedAny = true;
                        }
                    }
                }

                if (!empty($profileAccommodations)) {
                    $q->orWhereHas('accessibilities', function ($aq) use ($profileAccommodations) {
                        $aq->whereIn('accommodation_type', $profileAccommodations);
                    });
                    $matchedAny = true;
                }

                if (!$matchedAny) {
                    $q->whereRaw('1 = 1');
                }
            });
        }

        // 4. Calculate total recommended count across active vacancies
        $matchedCount = 0;
        if ($user && ($profileTitle || !empty($profileSkills) || !empty($profileAccommodations))) {
            $matchedCount = Vacancy::active()
                ->where(function ($q) use ($profileTitle, $profileSkills, $profileAccommodations) {
                    if (!empty($profileTitle)) {
                        $titleParts = array_filter(preg_split('/[\s,\/&]+/', $profileTitle));
                        foreach ($titleParts as $part) {
                            if (strlen($part) >= 3 && !in_array(strtolower($part), ['dan', 'and', 'with', 'the', 'for'])) {
                                $q->orWhere('title', 'like', "%{$part}%")
                                  ->orWhere('description', 'like', "%{$part}%");
                            }
                        }
                    }
                    if (!empty($profileSkills)) {
                        foreach ($profileSkills as $skill) {
                            if (strlen($skill) >= 2) {
                                $q->orWhere('title', 'like', "%{$skill}%")
                                  ->orWhere('description', 'like', "%{$skill}%")
                                  ->orWhere('skills_required', 'like', "%{$skill}%")
                                  ->orWhere('requirements', 'like', "%{$skill}%");
                            }
                        }
                    }
                    if (!empty($profileAccommodations)) {
                        $q->orWhereHas('accessibilities', function ($aq) use ($profileAccommodations) {
                            $aq->whereIn('accommodation_type', $profileAccommodations);
                        });
                    }
                })
                ->count();
        }

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

        // Auto-activate scheduled vacancies whose publication time has arrived
        Vacancy::where('status', 'draft')
            ->whereNotNull('skills_required')
            ->get()
            ->each(function ($vac) {
                $skills = (array) ($vac->skills_required ?? []);
                if (($skills['publish_type'] ?? '') === 'scheduled' && !empty($skills['scheduled_at'])) {
                    try {
                        if (Carbon::parse($skills['scheduled_at'])->isPast()) {
                            $vac->update(['status' => 'active']);
                        }
                    } catch (\Exception $e) {}
                }
            });

        $vacancies = $query->orderByRaw("CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(skills_required, '$.is_featured')) = 'true' THEN 0 ELSE 1 END")
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // 5. Annotate each vacancy with is_profile_match flag
        $checkProfileMatch = function ($vacancy) use ($profileTitle, $profileSkills, $profileAccommodations) {
            if (!$profileTitle && empty($profileSkills) && empty($profileAccommodations)) {
                return false;
            }

            $titleLower = strtolower($vacancy->title);
            $descLower = strtolower($vacancy->description);

            if ($profileTitle) {
                $titleParts = array_filter(preg_split('/[\s,\/&]+/', strtolower($profileTitle)));
                foreach ($titleParts as $part) {
                    if (strlen($part) >= 3 && !in_array($part, ['dan', 'and', 'with', 'the', 'for'])) {
                        if (str_contains($titleLower, $part) || str_contains($descLower, $part)) {
                            return true;
                        }
                    }
                }
            }

            foreach ($profileSkills as $skill) {
                $s = strtolower($skill);
                if (strlen($s) >= 2 && (str_contains($titleLower, $s) || str_contains($descLower, $s))) {
                    return true;
                }
            }

            if (!empty($profileAccommodations)) {
                foreach ($vacancy->accessibilities as $acc) {
                    if (in_array($acc->accommodation_type, $profileAccommodations)) {
                        return true;
                    }
                }
            }

            return false;
        };

        $vacancies->through(function ($item) use ($checkProfileMatch) {
            $item->is_profile_match = $checkProfileMatch($item);
            $skills = (array) ($item->skills_required ?? []);
            $item->is_featured = (bool) ($skills['is_featured'] ?? false);
            $item->show_accessibility = (bool) ($skills['show_accessibility'] ?? true);
            return $item;
        });

        return Inertia::render('jobs/index', [
            'vacancies' => $vacancies,
            'filters' => array_merge(
                $request->only(['search', 'work_model', 'job_type', 'accessibility', 'location', 'industry', 'only_favorites']),
                ['recommended' => $isRecommended]
            ),
            'savedVacancyIds' => $savedVacancyIds,
            'applicantPreferences' => [
                'is_logged_in' => (bool) $user,
                'is_job_seeker' => $isJobSeeker,
                'candidate_name' => $user?->name,
                'job_title' => $profileTitle,
                'profile_skills' => $profileSkills,
                'quick_keywords' => $quickKeywords,
                'has_accommodations' => count($profileAccommodations) > 0,
                'matched_vacancies_count' => $matchedCount,
            ],
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $user = $request->user();

        $vacancy = Vacancy::with(['companyProfile', 'accessibilities'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Auto-activate if scheduled time has arrived
        if ($vacancy->status === 'draft') {
            $skills = (array) ($vacancy->skills_required ?? []);
            if (($skills['publish_type'] ?? '') === 'scheduled' && !empty($skills['scheduled_at'])) {
                try {
                    if (Carbon::parse($skills['scheduled_at'])->isPast()) {
                        $vacancy->update(['status' => 'active']);
                        $vacancy->status = 'active';
                    }
                } catch (\Exception $e) {}
            }
        }

        $isOwner = false;
        $applicationsCount = 0;
        $pendingApplicationsCount = 0;

        if ($user) {
            if ($user->isAdmin()) {
                $isOwner = true;
            } elseif ($user->isPerusahaan()) {
                $companyProfile = $user->companyProfile;
                if ($companyProfile && $companyProfile->id === $vacancy->company_profile_id) {
                    $isOwner = true;
                }
            }
        }

        if ($vacancy->status !== 'active' && !$isOwner) {
            abort(404);
        }

        if ($isOwner) {
            $applicationsCount = $vacancy->applications()->count();
            $pendingApplicationsCount = $vacancy->applications()->where('status', 'submitted')->count();
        }

        $alreadyApplied = false;
        $isSaved = false;

        if ($user && $user->isPelamar()) {
            $isSaved = $user->savedVacancies()->where('vacancy_id', $vacancy->id)->exists();
            $seeker = $user->jobSeekerProfile;
            if ($seeker) {
                $alreadyApplied = $vacancy->applications()
                    ->where('job_seeker_profile_id', $seeker->id)
                    ->exists();
            }
        }

        $otherVacancies = Vacancy::where('company_profile_id', $vacancy->company_profile_id)
            ->where('id', '!=', $vacancy->id)
            ->when(!$isOwner, fn($q) => $q->active())
            ->latest()
            ->take(3)
            ->get(['id', 'title', 'slug', 'job_type', 'work_model', 'status']);

        return Inertia::render('jobs/show', [
            'vacancy' => $vacancy,
            'alreadyApplied' => $alreadyApplied,
            'isSaved' => $isSaved,
            'isOwner' => $isOwner,
            'applicationsCount' => $applicationsCount,
            'pendingApplicationsCount' => $pendingApplicationsCount,
            'otherVacancies' => $otherVacancies,
        ]);
    }
}
