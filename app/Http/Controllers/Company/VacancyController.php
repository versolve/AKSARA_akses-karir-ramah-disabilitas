<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VacancyController extends Controller
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

    private function determineCategory(Vacancy $vacancy): array
    {
        // If explicitly stored in skills_required['category']
        $skillsData = (array) ($vacancy->skills_required ?? []);
        if (!empty($skillsData['category'])) {
            $catName = $skillsData['category'];
            $map = [
                'UI/UX & Desain' => ['color' => '#1769E0', 'bgColor' => '#EBF3FE', 'icon' => 'monitor'],
                'Teknologi Informasi' => ['color' => '#10B981', 'bgColor' => '#E8F8F0', 'icon' => 'code'],
                'Administrasi' => ['color' => '#8B5CF6', 'bgColor' => '#F3EFFE', 'icon' => 'user'],
                'Pemasaran' => ['color' => '#F59E0B', 'bgColor' => '#FEF7EC', 'icon' => 'megaphone'],
                'Lainnya' => ['color' => '#64748B', 'bgColor' => '#F1F5F9', 'icon' => 'more'],
            ];
            $style = $map[$catName] ?? $map['Lainnya'];
            return [
                'name' => $catName,
                'color' => $style['color'],
                'bgColor' => $style['bgColor'],
                'icon' => $style['icon'],
            ];
        }

        // Automatic keyword matching
        $text = strtolower($vacancy->title . ' ' . json_encode($skillsData));
        $categoriesMap = [
            'UI/UX & Desain' => [
                'color' => '#1769E0',
                'bgColor' => '#EBF3FE',
                'icon' => 'monitor',
                'keywords' => ['ui', 'ux', 'desain', 'design', 'designer', 'graphic', 'figma', 'visual', 'produk'],
            ],
            'Teknologi Informasi' => [
                'color' => '#10B981',
                'bgColor' => '#E8F8F0',
                'icon' => 'code',
                'keywords' => ['developer', 'software', 'frontend', 'backend', 'programmer', 'qa', 'tester', 'it', 'web', 'data', 'engineer', 'devops', 'full stack'],
            ],
            'Administrasi' => [
                'color' => '#8B5CF6',
                'bgColor' => '#F3EFFE',
                'icon' => 'user',
                'keywords' => ['admin', 'administrasi', 'data entry', 'finance', 'keuangan', 'berkas', 'arsip', 'customer service', 'support', 'live chat', 'receptionist', 'human resource', 'hr'],
            ],
            'Pemasaran' => [
                'color' => '#F59E0B',
                'bgColor' => '#FEF7EC',
                'icon' => 'megaphone',
                'keywords' => ['pemasaran', 'marketing', 'sales', 'social media', 'seo', 'konten', 'content', 'copywriter', 'brand'],
            ],
        ];

        foreach ($categoriesMap as $name => $conf) {
            foreach ($conf['keywords'] as $kw) {
                if (str_contains($text, $kw)) {
                    return [
                        'name' => $name,
                        'color' => $conf['color'],
                        'bgColor' => $conf['bgColor'],
                        'icon' => $conf['icon'],
                    ];
                }
            }
        }

        return [
            'name' => 'Lainnya',
            'color' => '#64748B',
            'bgColor' => '#F1F5F9',
            'icon' => 'more',
        ];
    }

    public function index(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);

        // 1. Calculate KPI Metrics for this company
        $totalVacancies = $company->vacancies()->count();
        $activeVacancies = $company->vacancies()->where('status', 'active')->count();
        $closedVacancies = $company->vacancies()->where('status', 'closed')->count();
        $draftVacancies = $company->vacancies()->where('status', 'draft')->count();

        // Calculate growth compared to previous month
        $startThisMonth = now()->startOfMonth();
        $startLastMonth = now()->subMonth()->startOfMonth();
        $endLastMonth = now()->subMonth()->endOfMonth();

        $calcGrowth = function ($queryModel) use ($startThisMonth, $startLastMonth, $endLastMonth) {
            $cur = (clone $queryModel)->where('created_at', '>=', $startThisMonth)->count();
            $prev = (clone $queryModel)->whereBetween('created_at', [$startLastMonth, $endLastMonth])->count();
            $diff = $cur - $prev;
            $sign = $diff >= 0 ? '+' : '';
            return "{$sign}{$diff} dari bulan lalu";
        };

        $vacQuery = $company->vacancies();
        $stats = [
            'total_vacancies' => $totalVacancies,
            'total_growth' => $calcGrowth(clone $vacQuery),
            'active_vacancies' => $activeVacancies,
            'active_growth' => $calcGrowth((clone $vacQuery)->where('status', 'active')),
            'closed_vacancies' => $closedVacancies,
            'closed_growth' => $calcGrowth((clone $vacQuery)->where('status', 'closed')),
            'draft_vacancies' => $draftVacancies,
            'draft_growth' => $calcGrowth((clone $vacQuery)->where('status', 'draft')),
        ];

        // 2. Query Vacancies with Search and Filter
        $search = $request->query('search', '');
        $status = $request->query('status', 'all');
        $category = $request->query('category', 'all');
        $location = $request->query('location', 'all');

        $query = $company->vacancies()->withCount('applications')->with('accessibilities');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($location && $location !== 'all') {
            $query->where('location', $location);
        }

        $vacanciesCollection = $query->latest()->get();

        // Filter by category if requested
        if ($category && $category !== 'all') {
            $vacanciesCollection = $vacanciesCollection->filter(function ($v) use ($category) {
                $cat = $this->determineCategory($v);
                return $cat['name'] === $category;
            });
        }

        // Annotate each vacancy with category information and formatted date
        $annotatedVacancies = $vacanciesCollection->map(function ($v) {
            $cat = $this->determineCategory($v);
            $v->category = $cat['name'];
            $v->category_color = $cat['color'];
            $v->category_bg = $cat['bgColor'];
            $v->category_icon = $cat['icon'];
            $v->formatted_created_at = Carbon::parse($v->created_at)->translatedFormat('d M Y');
            return $v;
        });

        // Manual pagination to preserve category-filtered collections
        $perPage = 10;
        $page = (int) $request->query('page', 1);
        $totalItems = $annotatedVacancies->count();
        $slicedItems = $annotatedVacancies->slice(($page - 1) * $perPage, $perPage)->values();

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $slicedItems,
            $totalItems,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Distinct locations for filter dropdown
        $availableLocations = $company->vacancies()
            ->whereNotNull('location')
            ->distinct()
            ->pluck('location')
            ->values();

        return Inertia::render('company/vacancies/index', [
            'vacancies' => $paginated,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
                'location' => $location,
            ],
            'locations' => $availableLocations,
        ]);
    }

    public function create(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);

        return Inertia::render('company/vacancies/create', [
            'company' => $company,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'job_type' => ['required', 'in:full-time,part-time,contract,internship,freelance'],
            'work_model' => ['required', 'in:onsite,remote,hybrid'],
            'location' => ['required', 'string', 'max:255'],
            'experience_level' => ['required', 'in:junior,mid,senior,lead'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'is_salary_public' => ['nullable', 'boolean'],
            'quota' => ['nullable', 'numeric', 'min:1'],
            'deadline' => ['nullable', 'date'],
            'description' => ['required', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'responsibilities.*' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['nullable', 'string'],
            'accessibility_enabled' => ['nullable', 'boolean'],
            'accessibilities' => ['nullable', 'array'],
            'accessibilities.*.accommodation_type' => ['required', 'string'],
            'accessibilities.*.description' => ['nullable', 'string'],
            'accessibility_notes' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,active,closed'],
            'publish_type' => ['nullable', 'string'],
            'show_accessibility' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        // Clean arrays
        $cleanResponsibilities = array_values(array_filter((array) ($validated['responsibilities'] ?? []), fn ($r) => trim($r) !== ''));
        $cleanRequirements = array_values(array_filter((array) ($validated['requirements'] ?? []), fn ($r) => trim($r) !== ''));

        // Store metadata in skills_required JSON
        $skillsRequiredPayload = [
            'category' => $validated['category'] ?? 'Lainnya',
            'responsibilities' => $cleanResponsibilities,
            'quota' => $validated['quota'] ?? 1,
            'accessibility_enabled' => $validated['accessibility_enabled'] ?? true,
            'accessibility_notes' => $validated['accessibility_notes'] ?? null,
            'show_accessibility' => $validated['show_accessibility'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'publish_type' => $validated['publish_type'] ?? 'immediate',
        ];

        DB::transaction(function () use ($company, $validated, $cleanRequirements, $skillsRequiredPayload) {
            $vacancy = $company->vacancies()->create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'job_type' => $validated['job_type'],
                'work_model' => $validated['work_model'],
                'location' => $validated['location'],
                'salary_min' => $validated['salary_min'] ?? null,
                'salary_max' => $validated['salary_max'] ?? null,
                'is_salary_public' => $validated['is_salary_public'] ?? true,
                'experience_level' => $validated['experience_level'],
                'requirements' => $cleanRequirements,
                'skills_required' => $skillsRequiredPayload,
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            if (!empty($validated['accessibilities'])) {
                foreach ($validated['accessibilities'] as $acc) {
                    $vacancy->accessibilities()->create([
                        'accommodation_type' => $acc['accommodation_type'],
                        'description' => $acc['description'] ?? null,
                    ]);
                }
            }
        });

        $msg = $validated['status'] === 'draft' ? 'Lowongan berhasil disimpan sebagai draft.' : 'Lowongan berhasil dipublikasikan.';
        return redirect()->route('company.vacancies.index')->with('status', $msg);
    }

    public function edit(Request $request, Vacancy $vacancy): Response
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        return Inertia::render('company/vacancies/edit', [
            'vacancy' => $vacancy->load('accessibilities'),
            'company' => $company,
        ]);
    }

    public function update(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'job_type' => ['required', 'in:full-time,part-time,contract,internship,freelance'],
            'work_model' => ['required', 'in:onsite,remote,hybrid'],
            'location' => ['required', 'string', 'max:255'],
            'experience_level' => ['required', 'in:junior,mid,senior,lead'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'is_salary_public' => ['nullable', 'boolean'],
            'quota' => ['nullable', 'numeric', 'min:1'],
            'deadline' => ['nullable', 'date'],
            'description' => ['required', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'responsibilities.*' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['nullable', 'string'],
            'accessibility_enabled' => ['nullable', 'boolean'],
            'accessibilities' => ['nullable', 'array'],
            'accessibilities.*.accommodation_type' => ['required', 'string'],
            'accessibilities.*.description' => ['nullable', 'string'],
            'accessibility_notes' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,active,closed'],
            'publish_type' => ['nullable', 'string'],
            'show_accessibility' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $cleanResponsibilities = array_values(array_filter((array) ($validated['responsibilities'] ?? []), fn ($r) => trim($r) !== ''));
        $cleanRequirements = array_values(array_filter((array) ($validated['requirements'] ?? []), fn ($r) => trim($r) !== ''));

        $skillsRequiredPayload = [
            'category' => $validated['category'] ?? 'Lainnya',
            'responsibilities' => $cleanResponsibilities,
            'quota' => $validated['quota'] ?? 1,
            'accessibility_enabled' => $validated['accessibility_enabled'] ?? true,
            'accessibility_notes' => $validated['accessibility_notes'] ?? null,
            'show_accessibility' => $validated['show_accessibility'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'publish_type' => $validated['publish_type'] ?? 'immediate',
        ];

        DB::transaction(function () use ($vacancy, $validated, $cleanRequirements, $skillsRequiredPayload) {
            $vacancy->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'job_type' => $validated['job_type'],
                'work_model' => $validated['work_model'],
                'location' => $validated['location'],
                'salary_min' => $validated['salary_min'] ?? null,
                'salary_max' => $validated['salary_max'] ?? null,
                'is_salary_public' => $validated['is_salary_public'] ?? true,
                'experience_level' => $validated['experience_level'],
                'requirements' => $cleanRequirements,
                'skills_required' => $skillsRequiredPayload,
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            if (isset($validated['accessibilities'])) {
                $vacancy->accessibilities()->delete();
                foreach ($validated['accessibilities'] as $acc) {
                    $vacancy->accessibilities()->create([
                        'accommodation_type' => $acc['accommodation_type'],
                        'description' => $acc['description'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('company.vacancies.index')->with('status', 'Lowongan berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'in:draft,active,closed'],
        ]);

        $vacancy->update(['status' => $validated['status']]);

        return redirect()->route('company.vacancies.index')->with('status', "Status lowongan berhasil diubah menjadi {$validated['status']}.");
    }

    public function destroy(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        $vacancy->delete();
        return redirect()->route('company.vacancies.index')->with('status', 'Lowongan berhasil dihapus.');
    }
}
