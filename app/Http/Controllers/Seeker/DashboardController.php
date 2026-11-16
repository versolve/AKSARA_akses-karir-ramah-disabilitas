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

        $completeness = $seeker->calculateCompleteness();
        $savedVacancyIds = $user->savedVacancies()->pluck('vacancy_id')->toArray();
        $totalFavorites = count($savedVacancyIds);

        $banners = \App\Models\Banner::active()
            ->forRole('pelamar')
            ->ordered()
            ->get()
            ->map(function ($banner) use ($user) {
                return [
                    'id' => $banner->id,
                    'title' => $banner->getFormattedTitle($user->name),
                    'subtitle' => $banner->subtitle,
                    'type' => $banner->type,
                    'image_url' => $banner->display_image_url,
                    'image_position' => $banner->image_position ?: '50% 50%',
                    'image_scale' => $banner->image_scale ?: 100,
                    'link_url' => $banner->link_url,
                    'link_target' => $banner->link_target ?: '_self',
                    'cta_text' => $banner->cta_text,
                    'search_placeholder' => $banner->search_placeholder ?: 'Cari lowongan pekerjaan, posisi atau perusahaan',
                    'bg_gradient' => $banner->bg_gradient ?: 'blue',
                    'text_color' => $banner->text_color ?: 'dark',
                    'order' => $banner->order,
                ];
            });

        return Inertia::render('app/dashboard', [
            'seeker' => $seeker,
            'profileCompleteness' => $completeness,
            'banners' => $banners,
            'stats' => [
                'total_applied' => $totalApplied,
                'in_review' => $inReview,
                'interview' => $interview,
                'hired' => $hired,
                'total_favorites' => $totalFavorites,
            ],
            'recentApplications' => $applications->take(4)->values(),
            'recommendedJobs' => $recommendedJobs,
            'savedVacancyIds' => $savedVacancyIds,
            'unreadNotificationsCount' => $user->unreadNotifications()->count(),
        ]);
    }
}
