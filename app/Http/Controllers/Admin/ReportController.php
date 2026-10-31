<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Carbon\CarbonInterface;
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
