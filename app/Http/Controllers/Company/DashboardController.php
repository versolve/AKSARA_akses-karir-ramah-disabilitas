<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $company = $user->companyProfile;

        if (!$company) {
            $company = CompanyProfile::create([
                'user_id' => $user->id,
                'company_name' => $user->name,
                'address' => 'Belum diisi',
            ]);
        }

        $vacanciesCount = $company->vacancies()->count();
        $activeVacanciesCount = $company->vacancies()->where('status', 'active')->count();

        $applicationsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        $totalApplicants = (clone $applicationsQuery)->count();
        $inReviewCount = (clone $applicationsQuery)->whereIn('status', ['submitted', 'reviewed'])->count();
        $interviewCount = (clone $applicationsQuery)->where('status', 'interview')->count();
        $hiredCount = (clone $applicationsQuery)->where('status', 'hired')->count();

        $recentApplications = (clone $applicationsQuery)
            ->with(['jobSeekerProfile.user', 'vacancy:id,title'])
            ->latest('applied_at')
            ->limit(5)
            ->get();

        return Inertia::render('company/dashboard', [
            'company' => $company,
            'stats' => [
                'total_vacancies' => $vacanciesCount,
                'active_vacancies' => $activeVacanciesCount,
                'total_applicants' => $totalApplicants,
                'in_review' => $inReviewCount,
                'interview' => $interviewCount,
                'hired' => $hiredCount,
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}
