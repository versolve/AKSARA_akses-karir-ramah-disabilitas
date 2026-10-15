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
        $pendingCompanies = CompanyProfile::where('is_approved', false)->count();

        $activeVacancies = Vacancy::where('status', 'active')->count();
        $totalVacancies = Vacancy::count();

        $totalApplications = Application::count();
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
                'pending_companies' => $pendingCompanies,
                'active_vacancies' => $activeVacancies,
                'total_vacancies' => $totalVacancies,
                'total_applications' => $totalApplications,
            ],
            'recentApplications' => $recentApplications,
            'recentVacancies' => $recentVacancies,
        ]);
    }
}
