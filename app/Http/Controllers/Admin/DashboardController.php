<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $totalSeekers = User::where('role', 'pelamar')->count();
        $totalCompanies = CompanyProfile::count();
        $verifiedCompanies = CompanyProfile::where('is_approved', true)->count();
        $pendingCompanies = $totalCompanies - $verifiedCompanies;

        $activeVacancies = Vacancy::where('status', 'active')->count();
        $closedVacancies = Vacancy::where('status', 'closed')->count();
        $pendingVacancies = Vacancy::where('status', 'draft')->count();
        $totalVacancies = Vacancy::count();

        $totalApplications = Application::count();
        $applicationStatuses = Application::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $recentApplications = Application::with([
            'jobSeekerProfile.user',
            'vacancy' => fn ($q) => $q->withTrashed(),
            'vacancy.companyProfile',
        ])
            ->latest('applied_at')
            ->limit(6)
            ->get();

        $recentVacancies = Vacancy::with('companyProfile')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_seekers' => $totalSeekers,
                'total_companies' => $totalCompanies,
                'verified_companies' => $verifiedCompanies,
                'pending_companies' => $pendingCompanies,
                'active_vacancies' => $activeVacancies,
                'closed_vacancies' => $closedVacancies,
                'pending_vacancies' => $pendingVacancies,
                'total_vacancies' => $totalVacancies,
                'total_applications' => $totalApplications,
                'application_statuses' => $applicationStatuses,
            ],
            'recentApplications' => $recentApplications,
            'recentVacancies' => $recentVacancies,
        ]);
    }
}
