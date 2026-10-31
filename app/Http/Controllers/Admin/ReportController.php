<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);
        $tab = $this->tab($request);

        return Inertia::render('admin/reports/index', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'tab' => $tab,
            ],
            'summary' => $this->summary($from, $to),
            'users' => $this->userReport($from, $to),
            'companies' => $this->companyReport($from, $to),
            'vacancies' => $this->vacancyReport($from, $to),
            'placements' => $this->placementReport($from, $to),
            'accessibility' => $this->accessibilityReport($from, $to),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->dateRange($request);
        $summary = $this->summary($from, $to);

        return response()->streamDownload(function () use ($summary): void {
            $handle = fopen('php://output', 'wb');
            fputcsv($handle, ['metric', 'value']);
            foreach ([
                'total_users' => $summary['total_users'],
                'total_seekers' => $summary['total_seekers'],
                'total_companies' => $summary['total_companies'],
                'total_vacancies' => $summary['total_vacancies'],
                'total_applications' => $summary['total_applications'],
                'hired_applications' => $summary['application_statuses']['hired'] ?? 0,
            ] as $metric => $value) {
                fputcsv($handle, [$metric, $value]);
            }
            fclose($handle);
        }, 'aksara-business-intelligence.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function reportingIndex(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);
        $tab = $this->operationalTab($request);

        return Inertia::render('admin/reports/operational', [
            'filters' => [
                'tab' => $tab,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'status' => $request->string('status')->toString(),
                'completeness' => $request->string('completeness')->toString(),
                'domicile' => $request->string('domicile')->toString(),
                'industry' => $request->string('industry')->toString(),
                'location' => $request->string('location')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'options' => [
                'domiciles' => JobSeekerProfile::query()->whereNotNull('domicile')->distinct()->pluck('domicile')->values(),
                'industries' => CompanyProfile::query()->whereNotNull('industry')->distinct()->pluck('industry')->values(),
                'locations' => Vacancy::query()->whereNotNull('location')->distinct()->pluck('location')->values(),
            ],
            'users' => $tab === 'users' ? $this->operationalUsers($request, $from, $to) : null,
            'companies' => $tab === 'companies' ? $this->operationalCompanies($request, $from, $to) : null,
            'vacancies' => $tab === 'vacancies' ? $this->operationalVacancies($request, $from, $to) : null,
            'applications' => $tab === 'applications' ? $this->operationalApplications($request, $from, $to) : null,
        ]);
    }

    public function reportingExport(Request $request): StreamedResponse
    {
        [$from, $to] = $this->dateRange($request);
        $tab = $this->operationalTab($request);

        return response()->streamDownload(function () use ($request, $from, $to, $tab): void {
            $handle = fopen('php://output', 'wb');
            if ($tab === 'users') {
                fputcsv($handle, ['No', 'Nama Pengguna', 'Email', 'Domisili', 'Tanggal Daftar', 'Status Akun', 'Kelengkapan Profil', 'Jumlah Lamaran']);
                $query = $this->userOperationalQuery($request, $from, $to);
                $index = 1;
                foreach ($query->lazy(200) as $user) {
                    $complete = ($user->jobSeekerProfile?->profile_completed_percentage ?? 0) >= 80;
                    fputcsv($handle, [
                        $index++,
                        $user->name,
                        $user->email,
                        $user->jobSeekerProfile?->domicile ?? '-',
                        $user->created_at?->format('Y-m-d') ?? '-',
                        $user->is_disabled ? 'Nonaktif' : 'Aktif',
                        $complete ? 'Lengkap' : 'Perlu Dilengkapi',
                        $user->jobSeekerProfile?->applications_count ?? 0,
                    ]);
                }
            } elseif ($tab === 'companies') {
                fputcsv($handle, ['No', 'Nama Perusahaan', 'Industri', 'Lokasi', 'Tanggal Daftar', 'Status Akun', 'Status Verifikasi', 'Jumlah Lowongan']);
                $query = $this->companyOperationalQuery($request, $from, $to);
                $index = 1;
                foreach ($query->lazy(200) as $company) {
                    fputcsv($handle, [
                        $index++,
                        $company->company_name,
                        $company->industry ?? '-',
                        $company->address,
                        $company->created_at?->format('Y-m-d') ?? '-',
                        $company->user?->is_disabled ? 'Nonaktif' : 'Aktif',
                        $company->is_approved ? 'Terverifikasi' : 'Menunggu Verifikasi',
                        $company->vacancies_count ?? 0,
                    ]);
                }
            } elseif ($tab === 'vacancies') {
                fputcsv($handle, ['No', 'Judul Lowongan', 'Perusahaan', 'Industri', 'Lokasi', 'Jenis Pekerjaan', 'Tanggal Dibuat', 'Status', 'Jumlah Lamaran']);
                $query = $this->vacancyOperationalQuery($request, $from, $to);
                $index = 1;
                foreach ($query->lazy(200) as $vacancy) {
                    fputcsv($handle, [
                        $index++,
                        $vacancy->title,
                        $vacancy->companyProfile?->company_name ?? '-',
                        $vacancy->companyProfile?->industry ?? '-',
                        $vacancy->location,
                        $vacancy->job_type,
                        $vacancy->created_at?->format('Y-m-d') ?? '-',
                        $vacancy->status,
                        $vacancy->applications_count ?? 0,
                    ]);
                }
            } else {
                fputcsv($handle, ['No', 'Nama Pelamar', 'Judul Lowongan', 'Perusahaan', 'Tanggal Lamaran', 'Status Lamaran']);
                $query = $this->applicationOperationalQuery($request, $from, $to);
                $index = 1;
                foreach ($query->lazy(200) as $app) {
                    fputcsv($handle, [
                        $index++,
                        $app->jobSeekerProfile?->user?->name ?? '-',
                        $app->vacancy?->title ?? '-',
                        $app->vacancy?->companyProfile?->company_name ?? '-',
                        $app->applied_at?->format('Y-m-d') ?? '-',
                        $app->status,
                    ]);
                }
            }
            fclose($handle);
        }, "laporan-{$tab}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function operationalTab(Request $request): string
    {
        return in_array($request->string('tab')->toString(), ['users', 'companies', 'vacancies', 'applications'], true)
            ? $request->string('tab')->toString()
            : 'users';
    }

    private function userOperationalQuery(Request $request, CarbonInterface $from, CarbonInterface $to): Builder
    {
        return User::query()
            ->where('role', 'pelamar')
            ->whereBetween('created_at', [$from, $to])
            ->with(['jobSeekerProfile'])
            ->withCount(['jobSeekerProfile as applications_count' => fn ($q) => $q->join('applications', 'applications.job_seeker_profile_id', '=', 'job_seeker_profiles.id')])
            ->when($request->filled('status'), fn ($q) => $request->string('status')->toString() === 'active' ? $q->where('is_disabled', false) : $q->where('is_disabled', true))
            ->when($request->filled('completeness'), function ($q) use ($request) {
                if ($request->string('completeness')->toString() === 'complete') {
                    $q->whereHas('jobSeekerProfile', fn ($sub) => $sub->where('profile_completed_percentage', '>=', 80));
                } else {
                    $q->whereHas('jobSeekerProfile', fn ($sub) => $sub->where('profile_completed_percentage', '<', 80));
                }
            })
            ->when($request->filled('domicile'), fn ($q) => $q->whereHas('jobSeekerProfile', fn ($sub) => $sub->where('domicile', $request->string('domicile')->toString())))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(fn ($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            })
            ->latest('id');
    }

    private function operationalUsers(Request $request, CarbonInterface $from, CarbonInterface $to): array
    {
        $base = User::query()->where('role', 'pelamar')->whereBetween('created_at', [$from, $to]);
        $paginated = $this->userOperationalQuery($request, $from, $to)->paginate(10)->withQueryString();

        return [
            'total' => (clone $base)->count(),
            'active' => (clone $base)->where('is_disabled', false)->count(),
            'complete' => (clone $base)->whereHas('jobSeekerProfile', fn ($q) => $q->where('profile_completed_percentage', '>=', 80))->count(),
            'needs_review' => (clone $base)->whereHas('jobSeekerProfile', fn ($q) => $q->where('profile_completed_percentage', '<', 80))->count(),
            'data' => $paginated->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'domicile' => $user->jobSeekerProfile?->domicile ?? '-',
                'created_at' => $user->created_at?->format('d M Y') ?? '-',
                'is_disabled' => $user->is_disabled,
                'is_complete' => ($user->jobSeekerProfile?->profile_completed_percentage ?? 0) >= 80,
                'applications_count' => $user->jobSeekerProfile?->applications()->count() ?? 0,
            ])->items(),
            'links' => $paginated->linkCollection()->toArray(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    private function companyOperationalQuery(Request $request, CarbonInterface $from, CarbonInterface $to): Builder
    {
        return CompanyProfile::query()
            ->whereBetween('created_at', [$from, $to])
            ->with(['user'])
            ->withCount('vacancies')
            ->when($request->filled('status'), fn ($q) => $request->string('status')->toString() === 'verified' ? $q->where('is_approved', true) : $q->where('is_approved', false))
            ->when($request->filled('industry'), fn ($q) => $q->where('industry', $request->string('industry')->toString()))
            ->when($request->filled('location'), fn ($q) => $q->where('address', 'like', "%{$request->string('location')}%"))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where('company_name', 'like', "%{$search}%");
            })
            ->latest('id');
    }

    private function operationalCompanies(Request $request, CarbonInterface $from, CarbonInterface $to): array
    {
        $base = CompanyProfile::query()->whereBetween('created_at', [$from, $to]);
        $paginated = $this->companyOperationalQuery($request, $from, $to)->paginate(10)->withQueryString();

        return [
            'total' => (clone $base)->count(),
            'verified' => (clone $base)->where('is_approved', true)->count(),
            'pending' => (clone $base)->where('is_approved', false)->count(),
            'rejected' => 0,
            'data' => $paginated->through(fn (CompanyProfile $company) => [
                'id' => $company->id,
                'company_name' => $company->company_name,
                'industry' => $company->industry ?? '-',
                'location' => $company->address,
                'created_at' => $company->created_at?->format('d M Y') ?? '-',
                'is_active' => !($company->user?->is_disabled ?? false),
                'is_approved' => $company->is_approved,
                'vacancies_count' => $company->vacancies_count ?? 0,
            ])->items(),
            'links' => $paginated->linkCollection()->toArray(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    private function vacancyOperationalQuery(Request $request, CarbonInterface $from, CarbonInterface $to): Builder
    {
        return Vacancy::query()
            ->whereBetween('created_at', [$from, $to])
            ->with(['companyProfile'])
            ->withCount('applications')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('industry'), fn ($q) => $q->whereHas('companyProfile', fn ($sub) => $sub->where('industry', $request->string('industry')->toString())))
            ->when($request->filled('location'), fn ($q) => $q->where('location', 'like', "%{$request->string('location')}%"))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(fn ($sub) => $sub->where('title', 'like', "%{$search}%")->orWhereHas('companyProfile', fn ($c) => $c->where('company_name', 'like', "%{$search}%")));
            })
            ->latest('id');
    }

    private function operationalVacancies(Request $request, CarbonInterface $from, CarbonInterface $to): array
    {
        $base = Vacancy::query()->whereBetween('created_at', [$from, $to]);
        $paginated = $this->vacancyOperationalQuery($request, $from, $to)->paginate(10)->withQueryString();

        return [
            'total' => (clone $base)->count(),
            'active' => (clone $base)->where('status', 'active')->count(),
            'pending' => (clone $base)->where('status', 'draft')->count(),
            'closed' => (clone $base)->where('status', 'closed')->count(),
            'rejected' => 0,
            'data' => $paginated->through(fn (Vacancy $vacancy) => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'company_name' => $vacancy->companyProfile?->company_name ?? '-',
                'industry' => $vacancy->companyProfile?->industry ?? '-',
                'location' => $vacancy->location,
                'job_type' => $vacancy->job_type,
                'created_at' => $vacancy->created_at?->format('d M Y') ?? '-',
                'deadline' => $vacancy->deadline?->format('d M Y') ?? '-',
                'status' => $vacancy->status,
                'applications_count' => $vacancy->applications_count ?? 0,
            ])->items(),
            'links' => $paginated->linkCollection()->toArray(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    private function applicationOperationalQuery(Request $request, CarbonInterface $from, CarbonInterface $to): Builder
    {
        return Application::query()
            ->whereBetween('applied_at', [$from, $to])
            ->with(['jobSeekerProfile.user', 'vacancy.companyProfile'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($sub) use ($search) {
                    $sub->whereHas('jobSeekerProfile.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('vacancy', fn ($v) => $v->where('title', 'like', "%{$search}%"))
                        ->orWhereHas('vacancy.companyProfile', fn ($c) => $c->where('company_name', 'like', "%{$search}%"));
                });
            })
            ->latest('id');
    }

    private function operationalApplications(Request $request, CarbonInterface $from, CarbonInterface $to): array
    {
        $base = Application::query()->whereBetween('applied_at', [$from, $to]);
        $paginated = $this->applicationOperationalQuery($request, $from, $to)->paginate(10)->withQueryString();

        return [
            'total' => (clone $base)->count(),
            'in_progress' => (clone $base)->whereIn('status', ['submitted', 'reviewed'])->count(),
            'interview' => (clone $base)->where('status', 'interview')->count(),
            'hired' => (clone $base)->where('status', 'hired')->count(),
            'rejected' => (clone $base)->where('status', 'rejected')->count(),
            'data' => $paginated->through(fn (Application $app) => [
                'id' => $app->id,
                'seeker_name' => $app->jobSeekerProfile?->user?->name ?? 'Pelamar',
                'vacancy_title' => $app->vacancy?->title ?? 'Lowongan',
                'company_name' => $app->vacancy?->companyProfile?->company_name ?? 'Perusahaan',
                'applied_at' => $app->applied_at?->format('d M Y') ?? '-',
                'status' => $app->status,
            ])->items(),
            'links' => $paginated->linkCollection()->toArray(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    private function dateRange(Request $request): array
    {
        $from = $request->date('from')?->startOfDay() ?? now()->startOfYear();
        $to = $request->date('to')?->endOfDay() ?? now()->endOfYear();

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        return [$from, $to];
    }

    private function tab(Request $request): string
    {
        return in_array($request->string('tab')->toString(), ['summary', 'users', 'companies', 'vacancies', 'placements', 'accessibility'], true)
            ? $request->string('tab')->toString()
            : 'summary';
    }

    private function summary(CarbonInterface $from, CarbonInterface $to): array
    {
        $userQuery = User::whereBetween('created_at', [$from, $to]);
        $vacancyQuery = Vacancy::whereBetween('created_at', [$from, $to]);
        $applicationQuery = Application::whereBetween('applied_at', [$from, $to]);

        return [
            'total_users' => (clone $userQuery)->count(),
            'total_seekers' => (clone $userQuery)->where('role', 'pelamar')->count(),
            'total_companies' => (clone $userQuery)->where('role', 'perusahaan')->count(),
            'total_vacancies' => (clone $vacancyQuery)->count(),
            'active_vacancies' => (clone $vacancyQuery)->where('status', 'active')->count(),
            'pending_vacancies' => (clone $vacancyQuery)->where('status', 'draft')->count(),
            'closed_vacancies' => (clone $vacancyQuery)->where('status', 'closed')->count(),
            'total_applications' => (clone $applicationQuery)->count(),
            'application_statuses' => (clone $applicationQuery)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status')->all(),
            'verified_companies' => CompanyProfile::whereBetween('created_at', [$from, $to])->where('is_approved', true)->count(),
            'monthly_users' => $this->monthlyUsers($from, $to),
            'work_models' => (clone $vacancyQuery)->selectRaw('work_model, count(*) as total')->groupBy('work_model')->pluck('total', 'work_model')->all(),
        ];
    }

    private function userReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $seekers = User::where('role', 'pelamar')->whereBetween('created_at', [$from, $to])->count();
        $companies = User::where('role', 'perusahaan')->whereBetween('created_at', [$from, $to])->count();
        $domiciles = JobSeekerProfile::query()->whereHas('user', fn ($query) => $query->whereBetween('created_at', [$from, $to]))
            ->whereNotNull('domicile')->selectRaw('domicile as label, count(*) as value')->groupBy('domicile')->orderByDesc('value')->limit(10)->get();

        return [
            'total' => $seekers + $companies,
            'seekers' => $seekers,
            'companies' => $companies,
            'domiciles' => $domiciles,
        ];
    }

    private function companyReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $query = CompanyProfile::whereBetween('created_at', [$from, $to]);
        $industries = (clone $query)->whereNotNull('industry')->selectRaw('industry as label, count(*) as value')->groupBy('industry')->orderByDesc('value')->limit(5)->get();

        return [
            'total' => (clone $query)->count(),
            'verified' => (clone $query)->where('is_approved', true)->count(),
            'pending' => (clone $query)->where('is_approved', false)->count(),
            'top_industries' => $industries,
        ];
    }

    private function vacancyReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $query = Vacancy::whereBetween('created_at', [$from, $to]);

        return [
            'total' => (clone $query)->count(),
            'active' => (clone $query)->where('status', 'active')->count(),
            'draft' => (clone $query)->where('status', 'draft')->count(),
            'closed' => (clone $query)->where('status', 'closed')->count(),
            'work_models' => (clone $query)->selectRaw('work_model as label, count(*) as value')->groupBy('work_model')->orderByDesc('value')->get(),
            'locations' => (clone $query)->selectRaw('location as label, count(*) as value')->groupBy('location')->orderByDesc('value')->limit(10)->get(),
        ];
    }

    private function placementReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $query = Application::whereBetween('applied_at', [$from, $to]);

        return [
            'total_applications' => (clone $query)->count(),
            'hired' => (clone $query)->where('status', 'hired')->count(),
            'rate' => (clone $query)->count() > 0 ? round(((clone $query)->where('status', 'hired')->count() / $query->count()) * 100, 1) : 0,
            'statuses' => (clone $query)->selectRaw('status as label, count(*) as value')->groupBy('status')->orderByDesc('value')->get(),
        ];
    }

    private function accessibilityReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $seekers = JobSeekerProfile::whereHas('user', fn ($query) => $query->whereBetween('created_at', [$from, $to]))->with('user.accessibilityProfile')->get();
        $types = $seekers->flatMap(fn (JobSeekerProfile $profile) => $profile->user?->accessibilityProfile?->disability_types ?? [])->countBy()->sortDesc()->take(8);
        $accommodations = Vacancy::whereBetween('created_at', [$from, $to])->with('accessibilities')->get()->flatMap(fn (Vacancy $vacancy) => $vacancy->accessibilities->pluck('accommodation_type'))->countBy()->sortDesc()->take(8);

        return [
            'seekers_with_profile' => $seekers->filter(fn (JobSeekerProfile $profile) => $profile->user?->accessibilityProfile)->count(),
            'disability_types' => $types->map(fn ($value, $key) => ['label' => $key, 'value' => $value])->values(),
            'accommodations' => $accommodations->map(fn ($value, $key) => ['label' => $key, 'value' => $value])->values(),
        ];
    }

    private function monthlyUsers(CarbonInterface $from, CarbonInterface $to): array
    {
        $months = collect();
        $cursor = $from->copy()->startOfMonth();
        while ($cursor->lte($to)) {
            $monthFrom = $cursor->copy()->startOfMonth()->max($from);
            $monthTo = $cursor->copy()->endOfMonth()->min($to);
            $months->push([
                'label' => $cursor->format('M'),
                'seekers' => User::where('role', 'pelamar')->whereBetween('created_at', [$monthFrom, $monthTo])->count(),
                'companies' => User::where('role', 'perusahaan')->whereBetween('created_at', [$monthFrom, $monthTo])->count(),
            ]);
            $cursor = $cursor->addMonth();
        }

        return $months->all();
    }
}
