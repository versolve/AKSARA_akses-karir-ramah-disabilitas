<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $seeker = $user->jobSeekerProfile;

        if (!$seeker) {
            $seeker = JobSeekerProfile::create([
                'user_id' => $user->id,
            ]);
        }

        $applications = $seeker->applications()->with(['vacancy.companyProfile'])->latest('applied_at')->get();

        $totalApplied = $applications->count();
        $inReview = $applications->whereIn('status', ['submitted', 'reviewed'])->count();
        $interview = $applications->where('status', 'interview')->count();
        $hired = $applications->where('status', 'hired')->count();

        $recommendedJobs = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('app/dashboard', [
            'seeker' => $seeker,
            'stats' => [
                'total_applied' => $totalApplied,
                'in_review' => $inReview,
                'interview' => $interview,
                'hired' => $hired,
            ],
            'recentApplications' => $applications->take(4)->values(),
            'recommendedJobs' => $recommendedJobs,
            'unreadNotificationsCount' => $user->unreadNotifications()->count(),
        ]);
    }
}
