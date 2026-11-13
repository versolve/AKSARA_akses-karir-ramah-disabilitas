<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $period = $request->query('period', 'all');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // Check if calendar custom range is used
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

        // If not custom calendar, resolve preset period
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

        // Helper to apply the active centralized time filter
        $applyFilter = function ($query, string $column = 'created_at') use ($carbonStart, $carbonEnd) {
            if ($carbonStart && $carbonEnd) {
                $query->whereBetween($column, [$carbonStart, $carbonEnd]);
            }
            return $query;
        };

        // 1. Top KPI Metrics
        $totalUsers = User::query()->tap($applyFilter)->count();
        $totalSeekers = User::where('role', 'pelamar')->tap($applyFilter)->count();
        $totalCompanies = CompanyProfile::query()->tap($applyFilter)->count();
        $verifiedCompanies = CompanyProfile::where('is_approved', true)->tap($applyFilter)->count();
        $pendingCompanies = CompanyProfile::where('is_approved', false)->tap($applyFilter)->count();

        $activeVacancies = Vacancy::where('status', 'active')->tap($applyFilter)->count();
        $closedVacancies = Vacancy::where('status', 'closed')->tap($applyFilter)->count();
        $pendingVacancies = Vacancy::where('status', 'draft')->tap($applyFilter)->count();
        $totalVacancies = Vacancy::query()->tap($applyFilter)->count();

        $totalApplications = Application::query()->tap(fn ($q) => $applyFilter($q, 'applied_at'))->count();
        $processedApplications = Application::whereIn('status', ['submitted', 'reviewed', 'interview'])
            ->tap(fn ($q) => $applyFilter($q, 'applied_at'))
            ->count();
        $acceptedApplications = Application::whereIn('status', ['accepted', 'hired'])
            ->tap(fn ($q) => $applyFilter($q, 'applied_at'))
            ->count();

        $verifiedSeekers = User::where('role', 'pelamar')->where('is_verified', true)->tap($applyFilter)->count();
        $unverifiedSeekers = User::where('role', 'pelamar')->where('is_verified', false)->tap($applyFilter)->count();

        // Application status counts
        $applicationStatuses = Application::query()
            ->tap(fn ($q) => $applyFilter($q, 'applied_at'))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Growth rate compared to previous period
        $calculateGrowth = function ($modelClass, string $column = 'created_at') use ($carbonStart, $carbonEnd, $period) {
            if ($carbonStart && $carbonEnd) {
                $diffDays = max(1, (int) $carbonStart->diffInDays($carbonEnd) + 1);
                $prevStart = $carbonStart->copy()->subDays($diffDays);
                $prevEnd = $carbonStart->copy()->subSecond();

                $current = $modelClass::whereBetween($column, [$carbonStart, $carbonEnd])->count();
                $previous = $modelClass::whereBetween($column, [$prevStart, $prevEnd])->count();
            } else {
                $current = $modelClass::where($column, '>=', now()->startOfMonth())->count();
                $previous = $modelClass::whereBetween($column, [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])->count();
            }

            if ($previous === 0) {
                return $current > 0 ? '+100%' : '0%';
            }
            $pct = round((($current - $previous) / $previous) * 100);
            return ($pct >= 0 ? '+' : '') . $pct . '%';
        };

        $userGrowthRate = $calculateGrowth(User::class);
        $vacancyGrowthRate = $calculateGrowth(Vacancy::class);
        $applicationGrowthRate = $calculateGrowth(Application::class, 'applied_at');
        $companyGrowthRate = $calculateGrowth(CompanyProfile::class);

        // 2. Growth Trend Data adapting flexibly to active time filter
        $growthPoints = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        if ($period === 'last_7_days') {
            // 7 daily points
            for ($i = 6; $i >= 0; $i--) {
                $dayDate = now()->subDays($i);
                $dayEnd = $dayDate->copy()->endOfDay();
                $seekersCount = User::where('role', 'pelamar')->where('created_at', '<=', $dayEnd)->count();
                $companiesCount = User::where('role', 'perusahaan')->where('created_at', '<=', $dayEnd)->count();

                $growthPoints[] = [
                    'month' => $dayDate->format('d M'),
                    'seekers' => $seekersCount,
                    'companies' => $companiesCount,
                ];
            }
        } elseif ($period === 'last_30_days') {
            // 6 intervals (every 5 days) over the 30 days
            for ($step = 5; $step >= 0; $step--) {
                $dayDate = now()->subDays($step * 5);
                $dayEnd = $dayDate->copy()->endOfDay();
                $seekersCount = User::where('role', 'pelamar')->where('created_at', '<=', $dayEnd)->count();
                $companiesCount = User::where('role', 'perusahaan')->where('created_at', '<=', $dayEnd)->count();

                $growthPoints[] = [
                    'month' => $dayDate->format('d M'),
                    'seekers' => $seekersCount,
                    'companies' => $companiesCount,
                ];
            }
        } elseif ($period === 'this_month') {
            // Weekly points for the current month
            $startOfMonth = now()->startOfMonth();
            $daysInMonth = now()->daysInMonth;
            $weeks = [
                ['label' => 'Mgg 1', 'day' => 7],
                ['label' => 'Mgg 2', 'day' => 14],
                ['label' => 'Mgg 3', 'day' => 21],
                ['label' => 'Mgg 4', 'day' => min(28, $daysInMonth)],
                ['label' => 'Mgg 5', 'day' => $daysInMonth],
            ];

            foreach ($weeks as $w) {
                $pointDate = $startOfMonth->copy()->day($w['day'])->endOfDay();
                $seekersCount = User::where('role', 'pelamar')->where('created_at', '<=', $pointDate)->count();
                $companiesCount = User::where('role', 'perusahaan')->where('created_at', '<=', $pointDate)->count();

                $growthPoints[] = [
                    'month' => $w['label'],
                    'seekers' => $seekersCount,
                    'companies' => $companiesCount,
                ];
            }
        } elseif ($isCalendarCustom) {
            $diffDays = $carbonStart->diffInDays($carbonEnd);
            if ($diffDays <= 14) {
                // Daily points
                for ($d = 0; $d <= $diffDays; $d++) {
                    $dayDate = $carbonStart->copy()->addDays($d);
                    $dayEnd = $dayDate->copy()->endOfDay();
                    $growthPoints[] = [
                        'month' => $dayDate->format('d M'),
                        'seekers' => User::where('role', 'pelamar')->where('created_at', '<=', $dayEnd)->count(),
                        'companies' => User::where('role', 'perusahaan')->where('created_at', '<=', $dayEnd)->count(),
                    ];
                }
            } else {
                // 6-8 evenly spaced intervals
                $intervals = min(8, max(5, (int) round($diffDays / 7)));
                $stepDays = max(1, (int) round($diffDays / ($intervals - 1)));
                for ($i = 0; $i < $intervals; $i++) {
                    $ptDate = $carbonStart->copy()->addDays(min($diffDays, $i * $stepDays))->endOfDay();
                    $growthPoints[] = [
                        'month' => $ptDate->format('d M'),
                        'seekers' => User::where('role', 'pelamar')->where('created_at', '<=', $ptDate)->count(),
                        'companies' => User::where('role', 'perusahaan')->where('created_at', '<=', $ptDate)->count(),
                    ];
                }
            }
        } else {
            // Default (all or this_year): 12 months cumulative
            $yearToUse = now()->year;
            $yearStart = Carbon::create($yearToUse, 1, 1)->startOfDay();
            $baseSeekers = User::where('role', 'pelamar')->where('created_at', '<', $yearStart)->count();
            $baseCompanies = User::where('role', 'perusahaan')->where('created_at', '<', $yearStart)->count();

            $seekersByMonth = User::where('role', 'pelamar')
                ->whereYear('created_at', $yearToUse)
                ->selectRaw('MONTH(created_at) as m, count(*) as c')
                ->groupBy('m')
                ->pluck('c', 'm')
                ->toArray();

            $companiesByMonth = User::where('role', 'perusahaan')
                ->whereYear('created_at', $yearToUse)
                ->selectRaw('MONTH(created_at) as m, count(*) as c')
                ->groupBy('m')
                ->pluck('c', 'm')
                ->toArray();

            $cumSeekers = $baseSeekers;
            $cumCompanies = $baseCompanies;

            for ($m = 1; $m <= 12; $m++) {
                $cumSeekers += ($seekersByMonth[$m] ?? 0);
                $cumCompanies += ($companiesByMonth[$m] ?? 0);
                $growthPoints[] = [
                    'month' => $monthNames[$m - 1],
                    'seekers' => $cumSeekers,
                    'companies' => $cumCompanies,
                ];
            }
        }

        // 3. Vacancy categories breakdown (respects centralized time filter)
        $filteredVacancies = Vacancy::select('id', 'title', 'skills_required', 'status', 'created_at')
            ->tap($applyFilter)
            ->get();

        $categories = [
            'UI/UX & Desain' => [
                'name' => 'UI/UX & Desain',
                'count' => 0,
                'color' => 'bg-[#2F80ED]',
                'icon' => 'palette',
                'keywords' => ['ui', 'ux', 'desain', 'design', 'designer', 'graphic', 'figma', 'visual', 'produk'],
            ],
            'Teknologi Informasi' => [
                'name' => 'Teknologi Informasi',
                'count' => 0,
                'color' => 'bg-[#00C0D4]',
                'icon' => 'monitor',
                'keywords' => ['developer', 'software', 'frontend', 'backend', 'programmer', 'qa', 'tester', 'it', 'web', 'data', 'engineer', 'devops', 'full stack'],
            ],
            'Pemasaran' => [
                'name' => 'Pemasaran',
                'count' => 0,
                'color' => 'bg-[#F2C94C]',
                'icon' => 'compass',
                'keywords' => ['pemasaran', 'marketing', 'sales', 'social media', 'seo', 'konten', 'content', 'copywriter', 'brand'],
            ],
            'Administrasi' => [
                'name' => 'Administrasi',
                'count' => 0,
                'color' => 'bg-[#9B51E0]',
                'icon' => 'user-round',
                'keywords' => ['admin', 'administrasi', 'data entry', 'finance', 'keuangan', 'berkas', 'arsip', 'customer service', 'support', 'live chat', 'receptionist'],
            ],
            'Lainnya' => [
                'name' => 'Lainnya',
                'count' => 0,
                'color' => 'bg-[#7086FD]',
                'icon' => 'layout-grid',
                'keywords' => [],
            ],
        ];

        foreach ($filteredVacancies as $vac) {
            $text = strtolower($vac->title . ' ' . implode(' ', (array) ($vac->skills_required ?? [])));
            $matched = false;

            foreach ($categories as $catKey => &$catVal) {
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
                $categories['Lainnya']['count']++;
            }
        }

        $categoryBreakdown = array_values(array_map(function ($c) {
            unset($c['keywords']);
            return $c;
        }, $categories));

        // 4. Vacancy statuses breakdown (respects centralized time filter)
        $totalFilteredVacancies = $filteredVacancies->count();
        $activeCount = $filteredVacancies->where('status', 'active')->count();
        $pendingCount = $filteredVacancies->where('status', 'draft')->count();
        $closedCount = $filteredVacancies->where('status', 'closed')->count();
        $rejectedCount = 0;

        $calcPct = fn ($c) => $totalFilteredVacancies > 0 ? round(($c / $totalFilteredVacancies) * 100) : 0;

        $vacancyStatuses = [
            'total' => $totalFilteredVacancies,
            'items' => [
                ['label' => 'Aktif', 'count' => $activeCount, 'percentage' => $calcPct($activeCount), 'color' => '#10B981'],
                ['label' => 'Menunggu Review', 'count' => $pendingCount, 'percentage' => $calcPct($pendingCount), 'color' => '#FBBF24'],
                ['label' => 'Ditolak', 'count' => $rejectedCount, 'percentage' => $calcPct($rejectedCount), 'color' => '#F87171'],
                ['label' => 'Ditutup', 'count' => $closedCount, 'percentage' => $calcPct($closedCount), 'color' => '#94A3B8'],
            ],
        ];

        // 5. Realtime Activity Feed from database
        $activities = collect();

        CompanyProfile::with('user')->latest()->limit(5)->get()->each(function ($comp) use ($activities) {
            if ($comp->created_at) {
                $activities->push([
                    'id' => 'comp_' . $comp->id,
                    'title' => $comp->company_name . ' mendaftar sebagai perusahaan',
                    'timestamp' => $comp->created_at->timestamp,
                    'time' => $comp->created_at->diffForHumans(),
                    'icon' => 'building',
                    'bg' => 'bg-purple-50 text-purple-600',
                ]);
            }
        });

        Vacancy::latest()->limit(5)->get()->each(function ($vac) use ($activities) {
            if ($vac->created_at) {
                $activities->push([
                    'id' => 'vac_' . $vac->id,
                    'title' => 'Lowongan ' . $vac->title . ' dipublikasikan',
                    'timestamp' => $vac->created_at->timestamp,
                    'time' => $vac->created_at->diffForHumans(),
                    'icon' => 'briefcase',
                    'bg' => 'bg-emerald-50 text-emerald-600',
                ]);
            }
        });

        Application::with(['jobSeekerProfile.user', 'vacancy'])->latest('applied_at')->limit(5)->get()->each(function ($app) use ($activities) {
            $date = $app->applied_at ?? $app->created_at;
            if ($date) {
                $seekerName = $app->jobSeekerProfile?->user?->name ?? 'Pelamar';
                $vacTitle = $app->vacancy?->title ?? 'posisi pekerjaan';
                $activities->push([
                    'id' => 'app_' . $app->id,
                    'title' => $seekerName . ' melamar posisi ' . $vacTitle,
                    'timestamp' => $date->timestamp,
                    'time' => $date->diffForHumans(),
                    'icon' => 'file-text',
                    'bg' => 'bg-blue-50 text-blue-600',
                ]);
            }
        });

        CompanyProfile::where('is_approved', true)->latest('updated_at')->limit(5)->get()->each(function ($comp) use ($activities) {
            if ($comp->updated_at) {
                $activities->push([
                    'id' => 'verify_' . $comp->id,
                    'title' => $comp->company_name . ' berhasil diverifikasi',
                    'timestamp' => $comp->updated_at->timestamp,
                    'time' => $comp->updated_at->diffForHumans(),
                    'icon' => 'shield-check',
                    'bg' => 'bg-teal-50 text-teal-600',
                ]);
            }
        });

        User::where('role', 'pelamar')->latest()->limit(5)->get()->each(function ($usr) use ($activities) {
            if ($usr->created_at) {
                $activities->push([
                    'id' => 'user_' . $usr->id,
                    'title' => $usr->name . ' mendaftar sebagai pelamar',
                    'timestamp' => $usr->created_at->timestamp,
                    'time' => $usr->created_at->diffForHumans(),
                    'icon' => 'user-round',
                    'bg' => 'bg-blue-50 text-blue-600',
                ]);
            }
        });

        $recentActivities = $activities->sortByDesc('timestamp')->unique('id')->take(5)->values()->map(function ($item) {
            unset($item['timestamp']);
            return $item;
        })->toArray();

        // 6. Recent lists for secondary tables/tests
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
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_calendar' => $isCalendarCustom,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'total_seekers' => $totalSeekers,
                'total_companies' => $totalCompanies,
                'verified_companies' => $verifiedCompanies,
                'pending_companies' => $pendingCompanies,
                'active_vacancies' => $activeVacancies,
                'closed_vacancies' => $closedVacancies,
                'pending_vacancies' => $pendingVacancies,
                'total_vacancies' => $totalVacancies,
                'total_applications' => $totalApplications,
                'processed_applications' => $processedApplications,
                'accepted_applications' => $acceptedApplications,
                'verified_seekers' => $verifiedSeekers,
                'unverified_seekers' => $unverifiedSeekers,
                'application_statuses' => $applicationStatuses,
                'growth_rates' => [
                    'users' => $userGrowthRate,
                    'vacancies' => $vacancyGrowthRate,
                    'applications' => $applicationGrowthRate,
                    'companies' => $companyGrowthRate,
                ],
            ],
            'recentApplications' => $recentApplications,
            'recentVacancies' => $recentVacancies,
            'growthPoints' => $growthPoints,
            'categoryBreakdown' => $categoryBreakdown,
            'vacancyStatuses' => $vacancyStatuses,
            'recentActivities' => $recentActivities,
        ]);
    }
}
