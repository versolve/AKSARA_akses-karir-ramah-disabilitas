<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessIntelligenceController extends Controller
{
    private function getCompanyProfile(Request $request): CompanyProfile
    {
        $company = $request->user()->companyProfile;
        if (!$company) {
            $company = CompanyProfile::create([
                'user_id' => $request->user()->id,
                'company_name' => $request->user()->name,
                'address' => 'Belum diisi',
            ]);
        }
        return $company;
    }

    private function calculateGrowth(int $current, int $prev): string
    {
        if ($prev === 0) {
            return $current > 0 ? '+100%' : '+0%';
        }
        $diff = round((($current - $prev) / $prev) * 100);
        return ($diff >= 0 ? '+' : '') . $diff . '%';
    }

    public function index(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);

        // Parameters
        $activeTab = $request->query('tab', 'overview'); // 'overview', 'sources', 'vacancies', 'time', 'funnel'
        $period = $request->query('period', 'all'); // default to 'all' so all real applications are visible
        $startDateParam = $request->query('start_date');
        $endDateParam = $request->query('end_date');

        // Resolve Date Range
        $now = Carbon::now();
        $isCalendar = false;
        $carbonStart = null;
        $carbonEnd = null;
        $prevStart = null;
        $prevEnd = null;

        if ($startDateParam && $endDateParam) {
            try {
                $carbonStart = Carbon::parse($startDateParam)->startOfDay();
                $carbonEnd = Carbon::parse($endDateParam)->endOfDay();
                $diffDays = max(1, (int) $carbonStart->diffInDays($carbonEnd));
                $prevStart = $carbonStart->copy()->subDays($diffDays)->startOfDay();
                $prevEnd = $carbonStart->copy()->subSecond();
                $isCalendar = true;
                $period = 'custom';
                $dateRangeLabel = $carbonStart->translatedFormat('d M Y') . ' – ' . $carbonEnd->translatedFormat('d M Y');
            } catch (\Exception $e) {
                $carbonStart = Carbon::create(2020, 1, 1)->startOfDay();
                $carbonEnd = $now->copy()->endOfDay();
                $dateRangeLabel = 'Semua Periode';
            }
        } elseif ($period === '7_days' || $period === 'last_7_days') {
            $period = '7_days';
            $carbonStart = $now->copy()->subDays(6)->startOfDay();
            $carbonEnd = $now->copy()->endOfDay();
            $prevStart = $carbonStart->copy()->subDays(7)->startOfDay();
            $prevEnd = $carbonStart->copy()->subSecond();
            $dateRangeLabel = $carbonStart->translatedFormat('d M Y') . ' – ' . $carbonEnd->translatedFormat('d M Y');
        } elseif ($period === '30_days' || $period === 'last_30_days') {
            $period = '30_days';
            $carbonStart = $now->copy()->subDays(29)->startOfDay();
            $carbonEnd = $now->copy()->endOfDay();
            $prevStart = $carbonStart->copy()->subDays(30)->startOfDay();
            $prevEnd = $carbonStart->copy()->subSecond();
            $dateRangeLabel = $carbonStart->translatedFormat('d M Y') . ' – ' . $carbonEnd->translatedFormat('d M Y');
        } elseif ($period === 'this_month') {
            $carbonStart = $now->copy()->startOfMonth();
            $carbonEnd = $now->copy()->endOfMonth();
            $prevStart = $now->copy()->subMonth()->startOfMonth();
            $prevEnd = $now->copy()->subMonth()->endOfMonth();
            $dateRangeLabel = $carbonStart->translatedFormat('d M Y') . ' – ' . $carbonEnd->translatedFormat('d M Y');
        } elseif ($period === 'this_year') {
            $carbonStart = $now->copy()->startOfYear();
            $carbonEnd = $now->copy()->endOfDay();
            $prevStart = $now->copy()->subYear()->startOfYear();
            $prevEnd = $now->copy()->subYear()->endOfYear();
            $dateRangeLabel = $carbonStart->translatedFormat('d M Y') . ' – ' . $carbonEnd->translatedFormat('d M Y');
        } else {
            // 'all'
            $period = 'all';
            $carbonStart = Carbon::create(2024, 1, 1)->startOfDay();
            $carbonEnd = $now->copy()->endOfDay();
            $dateRangeLabel = 'Semua Periode';
        }

        // Base Queries for this company
        $companyVacanciesQuery = Vacancy::where('company_profile_id', $company->id);
        $companyApplicationsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        // Filtered applications query for current period
        $filteredAppsQuery = clone $companyApplicationsQuery;
        if ($period !== 'all' && $carbonStart && $carbonEnd) {
            $filteredAppsQuery->where(function ($q) use ($carbonStart, $carbonEnd) {
                $q->whereBetween('applied_at', [$carbonStart, $carbonEnd])
                    ->orWhere(function ($sub) use ($carbonStart, $carbonEnd) {
                        $sub->whereNull('applied_at')->whereBetween('created_at', [$carbonStart, $carbonEnd]);
                    });
            });
        }

        // Previous period query for growth comparisons
        $prevAppsQuery = clone $companyApplicationsQuery;
        if ($period !== 'all' && $prevStart && $prevEnd) {
            $prevAppsQuery->where(function ($q) use ($prevStart, $prevEnd) {
                $q->whereBetween('applied_at', [$prevStart, $prevEnd])
                    ->orWhere(function ($sub) use ($prevStart, $prevEnd) {
                        $sub->whereNull('applied_at')->whereBetween('created_at', [$prevStart, $prevEnd]);
                    });
            });
        }

        // Realtime Counts from Database
        $totalApps = (clone $filteredAppsQuery)->count();
        $submittedCount = (clone $filteredAppsQuery)->where('status', 'submitted')->count();
        $inProcessCount = (clone $filteredAppsQuery)->whereIn('status', ['reviewed', 'interview'])->count();
        $hiredCount = (clone $filteredAppsQuery)->whereIn('status', ['hired', 'accepted'])->count();
        $rejectedCount = (clone $filteredAppsQuery)->whereIn('status', ['rejected', 'withdrawn'])->count();

        // Previous counts
        $prevTotalApps = $period === 'all' ? 0 : (clone $prevAppsQuery)->count();
        $prevSubmitted = $period === 'all' ? 0 : (clone $prevAppsQuery)->where('status', 'submitted')->count();
        $prevInProcess = $period === 'all' ? 0 : (clone $prevAppsQuery)->whereIn('status', ['reviewed', 'interview'])->count();
        $prevHired = $period === 'all' ? 0 : (clone $prevAppsQuery)->whereIn('status', ['hired', 'accepted'])->count();
        $prevRejected = $period === 'all' ? 0 : (clone $prevAppsQuery)->whereIn('status', ['rejected', 'withdrawn'])->count();

        // Growth strings
        $totalAppsGrowth = $this->calculateGrowth($totalApps, $prevTotalApps);
        $submittedGrowth = $this->calculateGrowth($submittedCount, $prevSubmitted);
        $inProcessGrowth = $this->calculateGrowth($inProcessCount, $prevInProcess);
        $hiredGrowth = $this->calculateGrowth($hiredCount, $prevHired);
        $rejectedGrowth = $this->calculateGrowth($rejectedCount, $prevRejected);

        // Acceptance rate
        $acceptanceRate = $totalApps > 0 ? round(($hiredCount / $totalApps) * 100, 1) : 0;
        $prevAcceptanceRate = $prevTotalApps > 0 ? round(($prevHired / $prevTotalApps) * 100, 1) : 0;
        $diffRate = round($acceptanceRate - $prevAcceptanceRate, 1);
        $acceptanceRateGrowth = ($diffRate >= 0 ? '+' : '') . str_replace('.', ',', (string) $diffRate) . '%';

        // Vacancies list & details for this company
        $rawVacancies = (clone $companyVacanciesQuery)
            ->with(['applications' => function ($q) use ($carbonStart, $carbonEnd, $period) {
                if ($period !== 'all' && $carbonStart && $carbonEnd) {
                    $q->where(function ($sub) use ($carbonStart, $carbonEnd) {
                        $sub->whereBetween('applied_at', [$carbonStart, $carbonEnd])
                            ->orWhere(function ($s2) use ($carbonStart, $carbonEnd) {
                                $s2->whereNull('applied_at')->whereBetween('created_at', [$carbonStart, $carbonEnd]);
                            });
                    });
                }
            }])
            ->get();

        $totalVacancies = $rawVacancies->count();
        $avgApplicationsPerVacancy = $totalVacancies > 0 ? round($totalApps / $totalVacancies, 1) : 0;

        $vacanciesList = [];
        foreach ($rawVacancies as $vac) {
            $vApps = $vac->applications;
            $vTotal = $vApps->count();
            $vProcess = $vApps->whereIn('status', ['reviewed', 'interview'])->count();
            $vHired = $vApps->whereIn('status', ['hired', 'accepted'])->count();
            $vRate = $vTotal > 0 ? round(($vHired / $vTotal) * 100, 1) : 0;

            // Average days for this vacancy
            $vDurations = [];
            foreach ($vApps as $va) {
                $st = $va->applied_at ?? $va->created_at;
                $en = $va->updated_at ?? $now;
                if ($st && $en) {
                    $vDurations[] = max(1, (int) $st->diffInDays($en));
                }
            }
            $vAvgDays = count($vDurations) > 0 ? (int) round(array_sum($vDurations) / count($vDurations)) : 0;

            $vacanciesList[] = [
                'id' => $vac->id,
                'title' => $vac->title,
                'total' => $vTotal,
                'in_process' => $vProcess,
                'hired' => $vHired,
                'acceptance_rate' => $vRate,
                'avg_days' => $vAvgDays,
                'day_change' => '+0 hari',
                'day_change_type' => 'down',
            ];
        }

        // Sort vacancies by total applications descending
        usort($vacanciesList, fn($a, $b) => $b['total'] <=> $a['total']);

        // Applications per vacancy (bar chart data)
        $applicationsPerVacancy = array_map(function ($v) {
            return [
                'title' => $v['title'],
                'count' => $v['total'],
                'percentage' => $v['total'], // handled dynamically on frontend
            ];
        }, $vacanciesList);

        // Fastest & Longest Vacancies
        $vacsWithApps = array_filter($vacanciesList, fn($v) => $v['total'] > 0);
        $fastestDays = 0;
        $fastestVacancy = '-';
        $longestDays = 0;
        $longestVacancy = '-';

        if (!empty($vacsWithApps)) {
            $sortedByDays = $vacsWithApps;
            usort($sortedByDays, fn($a, $b) => $a['avg_days'] <=> $b['avg_days']);
            $fastest = reset($sortedByDays);
            $fastestDays = $fastest['avg_days'];
            $fastestVacancy = $fastest['title'];

            $longest = end($sortedByDays);
            $longestDays = $longest['avg_days'];
            $longestVacancy = $longest['title'];
        }

        // Overall recruitment duration
        $allDurations = [];
        $allFilteredApps = (clone $filteredAppsQuery)->get();
        foreach ($allFilteredApps as $app) {
            $st = $app->applied_at ?? $app->created_at;
            $en = $app->updated_at ?? $now;
            if ($st && $en) {
                $allDurations[] = max(1, (int) $st->diffInDays($en));
            }
        }
        $avgHireDays = count($allDurations) > 0 ? (int) round(array_sum($allDurations) / count($allDurations)) : 0;

        // Sources Data Realtime
        $sourcesData = [
            [
                'name' => 'Profabel',
                'count' => $totalApps,
                'percentage' => $totalApps > 0 ? 100.0 : 0.0,
                'in_process' => $inProcessCount,
                'hired' => $hiredCount,
                'acceptance_rate' => $acceptanceRate,
                'color' => '#1769E0',
                'bg' => 'bg-[#1769E0]',
                'icon' => 'globe',
            ],
            [
                'name' => 'Website Perusahaan',
                'count' => 0,
                'percentage' => 0.0,
                'in_process' => 0,
                'hired' => 0,
                'acceptance_rate' => 0.0,
                'color' => '#8B5CF6',
                'bg' => 'bg-[#8B5CF6]',
                'icon' => 'building-2',
            ],
            [
                'name' => 'Media Sosial',
                'count' => 0,
                'percentage' => 0.0,
                'in_process' => 0,
                'hired' => 0,
                'acceptance_rate' => 0.0,
                'color' => '#10B981',
                'bg' => 'bg-[#10B981]',
                'icon' => 'share-2',
            ],
            [
                'name' => 'Lainnya',
                'count' => 0,
                'percentage' => 0.0,
                'in_process' => 0,
                'hired' => 0,
                'acceptance_rate' => 0.0,
                'color' => '#FBBF24',
                'bg' => 'bg-[#FBBF24]',
                'icon' => 'more-horizontal',
            ],
        ];

        // Status Distribution
        $statusDistribution = [
            [
                'label' => 'Perlu Ditinjau',
                'count' => $submittedCount,
                'percentage' => $totalApps > 0 ? round(($submittedCount / $totalApps) * 100, 1) : 0,
                'color' => '#1769E0',
            ],
            [
                'label' => 'Proses Seleksi',
                'count' => $inProcessCount,
                'percentage' => $totalApps > 0 ? round(($inProcessCount / $totalApps) * 100, 1) : 0,
                'color' => '#8B5CF6',
            ],
            [
                'label' => 'Diterima',
                'count' => $hiredCount,
                'percentage' => $totalApps > 0 ? round(($hiredCount / $totalApps) * 100, 1) : 0,
                'color' => '#10B981',
            ],
            [
                'label' => 'Ditolak',
                'count' => $rejectedCount,
                'percentage' => $totalApps > 0 ? round(($rejectedCount / $totalApps) * 100, 1) : 0,
                'color' => '#EF4444',
            ],
        ];

        // Time Breakdown by Stage
        $timeStages = [
            ['stage' => 'Seleksi Administrasi', 'days' => max(0, (int) round($avgHireDays * 0.25)), 'color' => '#1769E0'],
            ['stage' => 'Tes Kemampuan', 'days' => max(0, (int) round($avgHireDays * 0.35)), 'color' => '#3B82F6'],
            ['stage' => 'Wawancara', 'days' => max(0, (int) round($avgHireDays * 0.20)), 'color' => '#60A5FA'],
            ['stage' => 'Penawaran Kerja', 'days' => max(0, (int) round($avgHireDays * 0.20)), 'color' => '#93C5FD'],
        ];

        // Funnel Stages
        $funnelInProcess = $inProcessCount + $hiredCount;
        $funnelStages = [
            [
                'stage' => 'Lamaran Masuk',
                'candidates' => $totalApps,
                'percentage' => '100%',
                'conversion' => $totalApps > 0 ? str_replace('.', ',', (string) round(($funnelInProcess / $totalApps) * 100, 1)) . '%' : '0%',
                'color' => '#1769E0',
            ],
            [
                'stage' => 'Dalam Seleksi',
                'candidates' => $funnelInProcess,
                'percentage' => $totalApps > 0 ? str_replace('.', ',', (string) round(($funnelInProcess / $totalApps) * 100, 1)) . '%' : '0%',
                'conversion' => $funnelInProcess > 0 ? str_replace('.', ',', (string) round(($hiredCount / $funnelInProcess) * 100, 1)) . '%' : '0%',
                'color' => '#8B5CF6',
            ],
            [
                'stage' => 'Diterima',
                'candidates' => $hiredCount,
                'percentage' => $totalApps > 0 ? str_replace('.', ',', (string) round(($hiredCount / $totalApps) * 100, 1)) . '%' : '0%',
                'conversion' => '-',
                'color' => '#10B981',
            ],
        ];

        // Date Points for Trend Charts
        // We will generate 8 chronological points across the selected date range
        $trendStart = $carbonStart->copy();
        $trendEnd = $carbonEnd->copy();
        if ($period === 'all') {
            // If period is 'all', anchor from earliest application date or 30 days ago to now
            $earliestApp = $allFilteredApps->min('applied_at') ?? $allFilteredApps->min('created_at');
            $trendStart = $earliestApp ? Carbon::parse($earliestApp)->subDays(3)->startOfDay() : $now->copy()->subDays(30)->startOfDay();
            $trendEnd = $now->copy()->endOfDay();
        }

        $trendPoints = [];
        $diffDays = max(7, (int) $trendStart->diffInDays($trendEnd));
        $numPoints = 8;
        $stepDays = $diffDays / ($numPoints - 1);

        $topVac1Id = $vacanciesList[0]['id'] ?? null;
        $topVac2Id = $vacanciesList[1]['id'] ?? null;
        $topVac3Id = $vacanciesList[2]['id'] ?? null;

        for ($i = 0; $i < $numPoints; $i++) {
            $pointDate = $trendStart->copy()->addDays((int) round($i * $stepDays));
            
            // Interval window for this point
            $intervalStart = ($i === 0) 
                ? $trendStart->copy()->startOfDay() 
                : $trendStart->copy()->addDays((int) round(($i - 0.5) * $stepDays))->startOfDay();
            $intervalEnd = ($i === $numPoints - 1)
                ? $trendEnd->copy()->endOfDay()
                : $trendStart->copy()->addDays((int) round(($i + 0.5) * $stepDays))->endOfDay();

            $pointApps = $allFilteredApps->filter(function ($app) use ($intervalStart, $intervalEnd) {
                $dt = $app->applied_at ?? $app->created_at;
                return $dt && $dt->between($intervalStart, $intervalEnd);
            });

            $pointTotal = $pointApps->count();
            $pointInProcess = $pointApps->whereIn('status', ['reviewed', 'interview'])->count();
            $pointHired = $pointApps->whereIn('status', ['hired', 'accepted'])->count();

            $trendPoints[] = [
                'date' => $pointDate->format('Y-m-d'),
                'label' => $pointDate->translatedFormat('j M'),
                'full_label' => $pointDate->translatedFormat('j M Y'),
                'applications' => $pointTotal,
                'in_process' => $pointInProcess,
                'hired' => $pointHired,
                'profabel' => $pointTotal,
                'website' => 0,
                'social' => 0,
                'other' => 0,
                'vac_1' => $topVac1Id ? $pointApps->where('vacancy_id', $topVac1Id)->count() : 0,
                'vac_2' => $topVac2Id ? $pointApps->where('vacancy_id', $topVac2Id)->count() : 0,
                'vac_3' => $topVac3Id ? $pointApps->where('vacancy_id', $topVac3Id)->count() : 0,
                'avg_days' => $avgHireDays,
            ];
        }

        return Inertia::render('company/bi/index', [
            'activeTab' => $activeTab,
            'filters' => [
                'period' => $period,
                'start_date' => $carbonStart->format('Y-m-d'),
                'end_date' => $carbonEnd->format('Y-m-d'),
                'label' => $dateRangeLabel,
                'is_calendar' => $isCalendar,
            ],
            'kpi' => [
                'total_applications' => $totalApps,
                'total_applications_growth' => $totalAppsGrowth,
                'need_review' => $submittedCount,
                'need_review_growth' => $submittedGrowth,
                'in_process' => $inProcessCount,
                'in_process_growth' => $inProcessGrowth,
                'hired' => $hiredCount,
                'hired_growth' => $hiredGrowth,
                'rejected' => $rejectedCount,
                'rejected_growth' => $rejectedGrowth,
                'active_sources' => $totalApps > 0 ? 1 : 0,
                'active_sources_growth' => '+0',
                'top_source' => $totalApps > 0 ? 'Profabel' : '-',
                'top_source_rate' => $totalApps > 0 ? str_replace('.', ',', (string) $acceptanceRate) . '%' : '0%',
                'top_source_contribution' => $totalApps > 0 ? '100%' : '0%',
                'total_vacancies' => $totalVacancies,
                'total_vacancies_growth' => '+0%',
                'avg_applications_per_vacancy' => $avgApplicationsPerVacancy,
                'avg_applications_growth' => '+0%',
                'acceptance_rate' => str_replace('.', ',', (string) $acceptanceRate) . '%',
                'acceptance_rate_growth' => $acceptanceRateGrowth,
                'avg_hire_days' => $avgHireDays,
                'avg_hire_days_change' => '+0 hari',
                'avg_hire_days_prev' => $avgHireDays,
                'fastest_days' => $fastestDays,
                'fastest_vacancy' => $fastestVacancy,
                'longest_days' => $longestDays,
                'longest_vacancy' => $longestVacancy,
                'hire_time_change_pct' => '+0%',
            ],
            'trendPoints' => $trendPoints,
            'statusDistribution' => $statusDistribution,
            'applicationsPerVacancy' => $applicationsPerVacancy,
            'sourcesData' => $sourcesData,
            'vacanciesList' => $vacanciesList,
            'timeStages' => $timeStages,
            'funnelStages' => $funnelStages,
        ]);
    }
}
