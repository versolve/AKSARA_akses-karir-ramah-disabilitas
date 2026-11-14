<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Carbon\Carbon;
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

        // 1. Parse centralized period filter (identical to Admin)
        $period = $request->query('period', 'all');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $selectedYear = (int) $request->query('year', now()->year);
        $vacancyId = $request->query('vacancy_id', 'all');

        $isCalendarCustom = false;
        $carbonStart = null;
        $carbonEnd = null;

        if (!empty($startDate) && !empty($endDate)) {
            try {
                $carbonStart = Carbon::parse($startDate)->startOfDay();
                $carbonEnd = Carbon::parse($endDate)->endOfDay();
                $isCalendarCustom = true;
                $period = 'custom';
            } catch (\Exception $e) {
                $isCalendarCustom = false;
                $period = 'all';
            }
        }

        if (!$isCalendarCustom) {
            if ($period === 'last_7_days') {
                $carbonStart = now()->subDays(6)->startOfDay();
                $carbonEnd = now()->endOfDay();
            } elseif ($period === 'last_30_days') {
                $carbonStart = now()->subDays(29)->startOfDay();
                $carbonEnd = now()->endOfDay();
            } elseif ($period === 'this_month') {
                $carbonStart = now()->startOfMonth();
                $carbonEnd = now()->endOfMonth();
            } elseif ($period === 'this_year') {
                $carbonStart = now()->startOfYear();
                $carbonEnd = now()->endOfYear();
            } else {
                $period = 'all';
            }
        }

        // Helper to apply centralized date range filter
        $applyFilter = function ($query, string $column = 'created_at') use ($carbonStart, $carbonEnd) {
            if ($carbonStart && $carbonEnd) {
                $query->whereBetween($column, [$carbonStart, $carbonEnd]);
            }
            return $query;
        };

        // 2. Base Queries for company's vacancies & applications
        $vacanciesQuery = Vacancy::where('company_profile_id', $company->id);
        $applicationsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        // Filter by specific vacancy if requested
        if ($vacancyId && $vacancyId !== 'all') {
            $applicationsQuery->where('vacancy_id', (int) $vacancyId);
        }

        // Top 4 Metrics with period filter (100% real database data)
        $totalVacanciesFiltered = (clone $vacanciesQuery)->tap($applyFilter)->count();
        $activeVacanciesFiltered = (clone $vacanciesQuery)->where('status', 'active')->tap($applyFilter)->count();
        $draftVacanciesFiltered = (clone $vacanciesQuery)->where('status', 'draft')->tap($applyFilter)->count();
        $closedVacanciesFiltered = (clone $vacanciesQuery)->where('status', 'closed')->tap($applyFilter)->count();

        $totalApplicantsFiltered = (clone $applicationsQuery)->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $submittedCountFiltered = (clone $applicationsQuery)->where('status', 'submitted')->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $reviewedCountFiltered = (clone $applicationsQuery)->where('status', 'reviewed')->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $interviewCountFiltered = (clone $applicationsQuery)->where('status', 'interview')->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $hiredCountFiltered = (clone $applicationsQuery)->whereIn('status', ['hired', 'accepted'])->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $rejectedCountFiltered = (clone $applicationsQuery)->where('status', 'rejected')->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();

        // Count verified vs unverified applicants
        $appliedSeekerIds = (clone $applicationsQuery)
            ->tap(fn ($q) => $applyFilter($q, 'applied_at'))
            ->pluck('job_seeker_profile_id')
            ->unique();

        $verifiedCandidatesCount = 0;
        $unverifiedCandidatesCount = 0;
        if ($appliedSeekerIds->isNotEmpty()) {
            $verifiedCandidatesCount = JobSeekerProfile::whereIn('id', $appliedSeekerIds)
                ->whereHas('user', fn ($u) => $u->where('is_verified', true))
                ->count();
            $unverifiedCandidatesCount = count($appliedSeekerIds) - $verifiedCandidatesCount;
        }

        // Real in-process recruitment count (interview + submitted/reviewed)
        $otherInProcessCount = $submittedCountFiltered + $reviewedCountFiltered;
        $totalRecruitmentProcess = $interviewCountFiltered + $otherInProcessCount;

        // Growth rate calculation compared to previous period of same duration
        $calculateGrowth = function ($queryModel, string $column = 'created_at') use ($carbonStart, $carbonEnd) {
            if ($carbonStart && $carbonEnd) {
                $diffDays = max(1, (int) $carbonStart->diffInDays($carbonEnd) + 1);
                $prevStart = $carbonStart->copy()->subDays($diffDays);
                $prevEnd = $carbonStart->copy()->subSecond();

                $current = (clone $queryModel)->whereBetween($column, [$carbonStart, $carbonEnd])->count();
                $previous = (clone $queryModel)->whereBetween($column, [$prevStart, $prevEnd])->count();
            } else {
                $current = (clone $queryModel)->where($column, '>=', now()->startOfMonth())->count();
                $previous = (clone $queryModel)->whereBetween($column, [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])->count();
            }

            if ($previous === 0) {
                return $current > 0 ? '+100%' : '+0%';
            }
            $pct = round((($current - $previous) / $previous) * 100);
            return ($pct >= 0 ? '+' : '') . $pct . '%';
        };

        $activeGrowth = $calculateGrowth(clone $vacanciesQuery);
        $candidatesGrowth = $calculateGrowth(clone $applicationsQuery, 'applied_at');
        $newAppGrowth = $calculateGrowth((clone $applicationsQuery)->whereIn('status', ['submitted', 'reviewed']), 'applied_at');
        $recruitmentGrowth = $calculateGrowth((clone $applicationsQuery)->whereIn('status', ['interview', 'submitted', 'reviewed']), 'applied_at');

        $stats = [
            'active_vacancies' => $activeVacanciesFiltered,
            'active_vacancies_growth' => $activeGrowth,
            'total_vacancies' => $totalVacanciesFiltered,
            'draft_vacancies' => $draftVacanciesFiltered,
            'closed_vacancies' => $closedVacanciesFiltered,

            'total_candidates' => $totalApplicantsFiltered,
            'candidates_growth' => $candidatesGrowth,
            'verified_candidates' => $verifiedCandidatesCount,
            'unverified_candidates' => $unverifiedCandidatesCount,

            'new_applications' => $submittedCountFiltered + $reviewedCountFiltered,
            'new_applications_growth' => $newAppGrowth,
            'need_review' => $submittedCountFiltered,
            'reviewed' => $reviewedCountFiltered,

            'recruitment_process' => $totalRecruitmentProcess,
            'recruitment_growth' => $recruitmentGrowth,
            'interview' => $interviewCountFiltered,
            'other_process' => $otherInProcessCount,
            'hired' => $hiredCountFiltered,
            'rejected' => $rejectedCountFiltered,
        ];

        // 3. Flexible Tren Lamaran Masuk (100% Real Data)
        $trends = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        if ($period === 'last_7_days') {
            for ($i = 6; $i >= 0; $i--) {
                $dayDate = now()->subDays($i);
                $dayStart = $dayDate->copy()->startOfDay();
                $dayEnd = $dayDate->copy()->endOfDay();

                $apps = (clone $applicationsQuery)->whereBetween('applied_at', [$dayStart, $dayEnd])->count();
                $cands = (clone $applicationsQuery)->whereBetween('applied_at', [$dayStart, $dayEnd])->distinct('job_seeker_profile_id')->count('job_seeker_profile_id');

                $trends[] = [
                    'month' => $dayDate->format('d M'),
                    'applications' => $apps,
                    'unique_candidates' => $cands,
                ];
            }
        } elseif ($period === 'last_30_days') {
            for ($step = 5; $step >= 0; $step--) {
                $dayDate = now()->subDays($step * 5);
                $spanStart = $dayDate->copy()->subDays(4)->startOfDay();
                $spanEnd = $dayDate->copy()->endOfDay();

                $apps = (clone $applicationsQuery)->whereBetween('applied_at', [$spanStart, $spanEnd])->count();
                $cands = (clone $applicationsQuery)->whereBetween('applied_at', [$spanStart, $spanEnd])->distinct('job_seeker_profile_id')->count('job_seeker_profile_id');

                $trends[] = [
                    'month' => $dayDate->format('d M'),
                    'applications' => $apps,
                    'unique_candidates' => $cands,
                ];
            }
        } elseif ($period === 'this_month') {
            $startOfMonth = now()->startOfMonth();
            $daysInMonth = now()->daysInMonth;
            $intervals = [
                ['label' => 'Mgg 1', 'start' => 1, 'end' => 7],
                ['label' => 'Mgg 2', 'start' => 8, 'end' => 14],
                ['label' => 'Mgg 3', 'start' => 15, 'end' => 21],
                ['label' => 'Mgg 4', 'start' => 22, 'end' => min(28, $daysInMonth)],
                ['label' => 'Mgg 5', 'start' => 29, 'end' => $daysInMonth],
            ];

            foreach ($intervals as $inter) {
                if ($inter['start'] > $daysInMonth) continue;
                $ptStart = $startOfMonth->copy()->day($inter['start'])->startOfDay();
                $ptEnd = $startOfMonth->copy()->day($inter['end'])->endOfDay();

                $apps = (clone $applicationsQuery)->whereBetween('applied_at', [$ptStart, $ptEnd])->count();
                $cands = (clone $applicationsQuery)->whereBetween('applied_at', [$ptStart, $ptEnd])->distinct('job_seeker_profile_id')->count('job_seeker_profile_id');

                $trends[] = [
                    'month' => $inter['label'],
                    'applications' => $apps,
                    'unique_candidates' => $cands,
                ];
            }
        } elseif ($isCalendarCustom) {
            $diffDays = $carbonStart->diffInDays($carbonEnd);
            if ($diffDays <= 14) {
                for ($d = 0; $d <= $diffDays; $d++) {
                    $dayDate = $carbonStart->copy()->addDays($d);
                    $apps = (clone $applicationsQuery)->whereBetween('applied_at', [$dayDate->copy()->startOfDay(), $dayDate->copy()->endOfDay()])->count();
                    $cands = (clone $applicationsQuery)->whereBetween('applied_at', [$dayDate->copy()->startOfDay(), $dayDate->copy()->endOfDay()])->distinct('job_seeker_profile_id')->count('job_seeker_profile_id');

                    $trends[] = [
                        'month' => $dayDate->format('d M'),
                        'applications' => $apps,
                        'unique_candidates' => $cands,
                    ];
                }
            } else {
                $pointsCount = min(8, max(5, (int) round($diffDays / 7)));
                $stepDays = max(1, (int) round($diffDays / ($pointsCount - 1)));
                for ($i = 0; $i < $pointsCount; $i++) {
                    $ptDate = $carbonStart->copy()->addDays(min($diffDays, $i * $stepDays));
                    $spanStart = $ptDate->copy()->subDays($stepDays)->startOfDay();
                    $spanEnd = $ptDate->copy()->endOfDay();

                    $apps = (clone $applicationsQuery)->whereBetween('applied_at', [$spanStart, $spanEnd])->count();
                    $cands = (clone $applicationsQuery)->whereBetween('applied_at', [$spanStart, $spanEnd])->distinct('job_seeker_profile_id')->count('job_seeker_profile_id');

                    $trends[] = [
                        'month' => $ptDate->format('d M'),
                        'applications' => $apps,
                        'unique_candidates' => $cands,
                    ];
                }
            }
        } else {
            // Default 12 Months (for 'all' or 'this_year')
            $yearToQuery = $period === 'this_year' ? now()->year : $selectedYear;

            $monthlyApps = (clone $applicationsQuery)
                ->whereYear('applied_at', $yearToQuery)
                ->selectRaw('MONTH(applied_at) as m, count(*) as c')
                ->groupBy('m')
                ->pluck('c', 'm')
                ->toArray();

            $monthlyCands = (clone $applicationsQuery)
                ->whereYear('applied_at', $yearToQuery)
                ->selectRaw('MONTH(applied_at) as m, count(DISTINCT job_seeker_profile_id) as c')
                ->groupBy('m')
                ->pluck('c', 'm')
                ->toArray();

            for ($m = 1; $m <= 12; $m++) {
                $trends[] = [
                    'month' => $monthNames[$m - 1],
                    'applications' => $monthlyApps[$m] ?? 0,
                    'unique_candidates' => $monthlyCands[$m] ?? 0,
                ];
            }
        }

        // 4. Distribusi Status Lamaran (100% Real Data)
        $totalStatusLamaran = $submittedCountFiltered + $reviewedCountFiltered + $interviewCountFiltered + $hiredCountFiltered + $rejectedCountFiltered;
        $calcStatusPct = fn ($c) => $totalStatusLamaran > 0 ? (int) round(($c / $totalStatusLamaran) * 100) : 0;

        $statusDistribution = [
            ['name' => 'Baru', 'count' => $submittedCountFiltered, 'percentage' => $calcStatusPct($submittedCountFiltered), 'color' => '#1769E0'],
            ['name' => 'Ditinjau', 'count' => $reviewedCountFiltered, 'percentage' => $calcStatusPct($reviewedCountFiltered), 'color' => '#10B981'],
            ['name' => 'Interview', 'count' => $interviewCountFiltered, 'percentage' => $calcStatusPct($interviewCountFiltered), 'color' => '#F59E0B'],
            ['name' => 'Diterima', 'count' => $hiredCountFiltered, 'percentage' => $calcStatusPct($hiredCountFiltered), 'color' => '#8B5CF6'],
            ['name' => 'Ditolak', 'count' => $rejectedCountFiltered, 'percentage' => $calcStatusPct($rejectedCountFiltered), 'color' => '#EF4444'],
        ];

        // 5. Lowongan Berdasarkan Kategori (100% Real Data)
        $categoriesMap = [
            'UI/UX & Desain' => [
                'name' => 'UI/UX & Desain',
                'count' => 0,
                'color' => '#1769E0',
                'icon' => 'monitor',
                'keywords' => ['ui', 'ux', 'desain', 'design', 'designer', 'graphic', 'figma', 'visual', 'produk'],
            ],
            'Teknologi Informasi' => [
                'name' => 'Teknologi Informasi',
                'count' => 0,
                'color' => '#10B981',
                'icon' => 'code',
                'keywords' => ['developer', 'software', 'frontend', 'backend', 'programmer', 'qa', 'tester', 'it', 'web', 'data', 'engineer', 'devops', 'full stack'],
            ],
            'Administrasi' => [
                'name' => 'Administrasi',
                'count' => 0,
                'color' => '#F59E0B',
                'icon' => 'user',
                'keywords' => ['admin', 'administrasi', 'data entry', 'finance', 'keuangan', 'berkas', 'arsip', 'customer service', 'support', 'live chat', 'receptionist'],
            ],
            'Pemasaran' => [
                'name' => 'Pemasaran',
                'count' => 0,
                'color' => '#8B5CF6',
                'icon' => 'megaphone',
                'keywords' => ['pemasaran', 'marketing', 'sales', 'social media', 'seo', 'konten', 'content', 'copywriter', 'brand'],
            ],
            'Lainnya' => [
                'name' => 'Lainnya',
                'count' => 0,
                'color' => '#94A3B8',
                'icon' => 'more',
                'keywords' => [],
            ],
        ];

        $filteredVacanciesList = (clone $vacanciesQuery)->tap($applyFilter)->get();

        foreach ($filteredVacanciesList as $vac) {
            $skillsArray = is_array($vac->skills_required) ? $vac->skills_required : [];
            $skillsFlat = [];
            foreach ($skillsArray as $sk) {
                if (is_string($sk)) {
                    $skillsFlat[] = $sk;
                } elseif (is_array($sk)) {
                    $skillsFlat[] = implode(' ', array_filter($sk, 'is_string'));
                }
            }
            $text = strtolower($vac->title . ' ' . implode(' ', $skillsFlat));
            $matched = false;

            foreach ($categoriesMap as $catKey => &$catVal) {
                if ($catKey === 'Lainnya') continue;
                foreach ($catVal['keywords'] as $kw) {
                    if (str_contains($text, $kw)) {
                        $catVal['count']++;
                        $matched = true;
                        break 2;
                    }
                }
            }
            if (!$matched) {
                $categoriesMap['Lainnya']['count']++;
            }
        }

        $maxCatCount = max(1, ...array_values(array_column($categoriesMap, 'count')));
        $categoryBreakdown = array_values(array_map(function ($c) use ($maxCatCount) {
            unset($c['keywords']);
            $c['max'] = max(1, (int) ceil($maxCatCount * 1.15));
            return $c;
        }, $categoriesMap));

        // 6. Status Lowongan (100% Real Data)
        $totalVacanciesCount = $activeVacanciesFiltered + $draftVacanciesFiltered + $closedVacanciesFiltered;
        $calcVacPct = fn ($c) => $totalVacanciesCount > 0 ? (int) round(($c / $totalVacanciesCount) * 100) : 0;

        $vacancyStatus = [
            ['label' => 'Aktif', 'count' => $activeVacanciesFiltered, 'percentage' => $calcVacPct($activeVacanciesFiltered), 'color' => '#10B981'],
            ['label' => 'Draft', 'count' => $draftVacanciesFiltered, 'percentage' => $calcVacPct($draftVacanciesFiltered), 'color' => '#F59E0B'],
            ['label' => 'Ditutup', 'count' => $closedVacanciesFiltered, 'percentage' => $calcVacPct($closedVacanciesFiltered), 'color' => '#94A3B8'],
        ];

        // 7. Realtime Recent Activities (100% Real Data, no dummy padding)
        $dbRecentApps = (clone $applicationsQuery)
            ->with(['jobSeekerProfile.user', 'vacancy:id,title'])
            ->tap(fn ($q) => $applyFilter($q, 'applied_at'))
            ->latest('applied_at')
            ->limit(4)
            ->get();

        $recentActivities = [];
        foreach ($dbRecentApps as $app) {
            $seekerName = $app->jobSeekerProfile?->user?->name ?? 'Kandidat';
            $jobTitle = $app->vacancy?->title ?? 'Lowongan';
            $timeAgo = Carbon::parse($app->applied_at)->diffForHumans();

            $iconType = 'file';
            $bgColor = '#F3EFFE';
            $textColor = '#8B5CF6';

            if ($app->status === 'interview') {
                $iconType = 'user';
                $bgColor = '#EBF3FE';
                $textColor = '#1769E0';
                $actTitle = "{$seekerName} diundang interview untuk posisi {$jobTitle}";
            } elseif ($app->status === 'hired' || $app->status === 'accepted') {
                $iconType = 'check';
                $bgColor = '#E8F8F0';
                $textColor = '#10B981';
                $actTitle = "{$seekerName} diterima untuk posisi {$jobTitle}";
            } else {
                $actTitle = "Lamaran baru dari {$seekerName} untuk posisi {$jobTitle}";
            }

            $recentActivities[] = [
                'id' => $app->id,
                'type' => $app->status,
                'title' => $actTitle,
                'time' => $timeAgo,
                'icon' => $iconType,
                'color' => $textColor,
                'bgColor' => $bgColor,
            ];
        }

        // Available vacancies for dropdown filter
        $vacancyOptions = $company->vacancies()->select('id', 'title')->get();

        return Inertia::render('company/dashboard', [
            'company' => $company,
            'stats' => $stats,
            'trends' => $trends,
            'statusDistribution' => $statusDistribution,
            'categoryBreakdown' => $categoryBreakdown,
            'vacancyStatus' => $vacancyStatus,
            'recentActivities' => $recentActivities,
            'vacancyOptions' => $vacancyOptions,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_calendar' => $isCalendarCustom,
                'year' => $selectedYear,
                'vacancy_id' => $vacancyId,
            ],
        ]);
    }
}
