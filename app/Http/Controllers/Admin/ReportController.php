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

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. User Statistics
        $totalUsers = User::count();
        $totalSeekers = User::where('role', 'pelamar')->count();
        $totalCompanies = CompanyProfile::count();
        $verifiedCompanies = CompanyProfile::where('is_approved', true)->count();
        $unverifiedCompanies = CompanyProfile::where('is_approved', false)->count();

        // 2. Vacancy Statistics
        $totalVacancies = Vacancy::count();
        $activeVacancies = Vacancy::where('status', 'active')->count();
        $closedVacancies = Vacancy::where('status', 'closed')->count();
        $draftVacancies = Vacancy::where('status', 'draft')->count();

        $workModelBreakdown = [
            'remote' => Vacancy::where('work_model', 'remote')->count(),
            'onsite' => Vacancy::where('work_model', 'onsite')->count(),
            'hybrid' => Vacancy::where('work_model', 'hybrid')->count(),
        ];

        // 3. Application Statistics
        $totalApplications = Application::count();
        $statusBreakdown = [
            'submitted' => Application::where('status', 'submitted')->count(),
            'reviewed' => Application::where('status', 'reviewed')->count(),
            'interview' => Application::where('status', 'interview')->count(),
            'hired' => Application::where('status', 'hired')->count(),
            'rejected' => Application::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'userStats' => [
                'total_users' => $totalUsers,
                'total_seekers' => $totalSeekers,
                'total_companies' => $totalCompanies,
                'verified_companies' => $verifiedCompanies,
                'unverified_companies' => $unverifiedCompanies,
            ],
            'vacancyStats' => [
                'total_vacancies' => $totalVacancies,
                'active_vacancies' => $activeVacancies,
                'closed_vacancies' => $closedVacancies,
                'draft_vacancies' => $draftVacancies,
                'work_models' => $workModelBreakdown,
            ],
            'applicationStats' => [
                'total_applications' => $totalApplications,
                'status_breakdown' => $statusBreakdown,
                'hired_rate' => $totalApplications > 0
                    ? round(($statusBreakdown['hired'] / $totalApplications) * 100, 1)
                    : 0,
            ],
        ]);
    }
}
