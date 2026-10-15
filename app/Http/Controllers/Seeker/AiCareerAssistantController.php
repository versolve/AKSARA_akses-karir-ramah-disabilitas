<?php

namespace App\Http\Controllers\Seeker;

use App\Contracts\AiProviderInterface;
use App\Http\Controllers\Controller;
use App\Models\AiJobMatch;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiCareerAssistantController extends Controller
{
    public function __construct(private AiProviderInterface $aiProvider) {}

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

    public function index(Request $request): Response
    {
        $seeker = $this->getSeekerProfile($request);

        // Fetch user's saved matches or recommended active vacancies
        $matches = AiJobMatch::where('job_seeker_profile_id', $seeker->id)
            ->with(['vacancy.companyProfile', 'vacancy.accessibilities'])
            ->orderByDesc('match_percentage')
            ->get();

        $activeVacancies = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('app/ai-assistant/index', [
            'seeker' => $seeker->load('user.accessibilityProfile'),
            'savedMatches' => $matches,
            'activeVacancies' => $activeVacancies,
        ]);
    }

    public function matchVacancy(Request $request, Vacancy $vacancy): JsonResponse
    {
        $seeker = $this->getSeekerProfile($request);

        // Check if existing match is cached
        $match = AiJobMatch::where('vacancy_id', $vacancy->id)
            ->where('job_seeker_profile_id', $seeker->id)
            ->first();

        if ($match) {
            return response()->json($match);
        }

        // Run AI matching
        $result = $this->aiProvider->matchJob($seeker, $vacancy);

        $savedMatch = AiJobMatch::create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'match_percentage' => $result['match_percentage'],
            'competency_score' => $result['competency_score'],
            'accessibility_score' => $result['accessibility_score'],
            'matching_points' => $result['matching_points'],
            'gaps' => $result['gaps'],
            'summary' => $result['summary'],
        ]);

        return response()->json($savedMatch);
    }

    public function skillGap(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'my_skills' => ['required', 'array'],
            'my_skills.*' => ['string'],
            'target_skills' => ['required', 'array'],
            'target_skills.*' => ['string'],
        ]);

        $result = $this->aiProvider->analyzeSkillGap(
            $validated['my_skills'],
            $validated['target_skills']
        );

        return response()->json($result);
    }

    public function cvReview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cv_text' => ['required', 'string', 'min:10'],
            'target_skills' => ['nullable', 'array'],
            'target_skills.*' => ['string'],
        ]);

        $result = $this->aiProvider->reviewCvAts(
            $validated['cv_text'],
            $validated['target_skills'] ?? []
        );

        return response()->json($result);
    }
}
