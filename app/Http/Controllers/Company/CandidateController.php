<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CandidateController extends Controller
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

    public function index(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);

        // Filter queries
        $search = $request->query('search', '');
        $vacancyFilter = $request->query('vacancy', 'all');
        $statusFilter = $request->query('status', 'all');
        $disabilityFilter = $request->query('disability', 'all');

        // Query active company vacancies for dropdown
        $vacancies = Vacancy::where('company_profile_id', $company->id)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        // Base Query for all applications of this company
        $baseAppsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        // 1. Calculate 100% REALTIME Metrics for this company
        $totalCandidatesCount = (clone $baseAppsQuery)->count();
        $cvReceivedCount = (clone $baseAppsQuery)->where(function ($q) {
            $q->whereNotNull('cv_path')->where('cv_path', '!=', '');
        })->count();
        $inProcessCount = (clone $baseAppsQuery)->whereIn('status', ['reviewed', 'interview'])->count();
        $passedCount = (clone $baseAppsQuery)->whereIn('status', ['hired', 'accepted'])->count();
        $adminReviewCount = (clone $baseAppsQuery)->where('status', 'submitted')->count();
        $rejectedCount = (clone $baseAppsQuery)->whereIn('status', ['rejected', 'withdrawn'])->count();

        // Calculate real month-over-month growth
        $startThisMonth = now()->startOfMonth();
        $startLastMonth = now()->subMonth()->startOfMonth();
        $endLastMonth = now()->subMonth()->endOfMonth();

        $calcGrowth = function ($queryModel) use ($startThisMonth, $startLastMonth, $endLastMonth) {
            $cur = (clone $queryModel)->where('created_at', '>=', $startThisMonth)->count();
            $prev = (clone $queryModel)->whereBetween('created_at', [$startLastMonth, $endLastMonth])->count();
            if ($prev === 0) {
                return $cur > 0 ? '+100%' : '+0%';
            }
            $diff = $cur - $prev;
            $percent = round(($diff / $prev) * 100);
            $sign = $percent >= 0 ? '+' : '';
            return "{$sign}{$percent}%";
        };

        // Distribution percentages (realtime relative to totalCandidatesCount)
        $calcPct = fn($count) => $totalCandidatesCount > 0 ? round(($count / $totalCandidatesCount) * 100) : 0;

        $stats = [
            'total_candidates' => $totalCandidatesCount,
            'total_growth' => $calcGrowth(clone $baseAppsQuery),
            'cv_received' => $cvReceivedCount,
            'cv_growth' => $calcGrowth((clone $baseAppsQuery)->whereNotNull('cv_path')),
            'in_process' => $inProcessCount,
            'in_process_growth' => $calcGrowth((clone $baseAppsQuery)->whereIn('status', ['reviewed', 'interview'])),
            'passed' => $passedCount,
            'passed_growth' => $calcGrowth((clone $baseAppsQuery)->whereIn('status', ['hired', 'accepted'])),
            'distribution' => [
                'in_process' => $inProcessCount,
                'in_process_pct' => $calcPct($inProcessCount),
                'passed' => $passedCount,
                'passed_pct' => $calcPct($passedCount),
                'admin_review' => $adminReviewCount,
                'admin_review_pct' => $calcPct($adminReviewCount),
                'rejected' => $rejectedCount,
                'rejected_pct' => $calcPct($rejectedCount),
            ],
        ];

        // 2. Query filtered applications list
        $query = (clone $baseAppsQuery)->with([
            'jobSeekerProfile.user',
            'jobSeekerProfile.user.accessibilityProfile',
            'vacancy',
        ]);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('jobSeekerProfile.user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('vacancy', function ($vq) use ($search) {
                    $vq->where('title', 'like', "%{$search}%");
                });
            });
        }

        if ($vacancyFilter !== 'all') {
            $query->where('vacancy_id', (int) $vacancyFilter);
        }

        if ($statusFilter !== 'all') {
            if ($statusFilter === 'dalam_proses') {
                $query->whereIn('status', ['reviewed', 'interview']);
            } elseif ($statusFilter === 'lulus_seleksi') {
                $query->whereIn('status', ['hired', 'accepted']);
            } elseif ($statusFilter === 'seleksi_admin') {
                $query->where('status', 'submitted');
            } elseif ($statusFilter === 'ditolak') {
                $query->whereIn('status', ['rejected', 'withdrawn']);
            } else {
                $query->where('status', $statusFilter);
            }
        }

        if ($disabilityFilter !== 'all') {
            $query->whereHas('jobSeekerProfile.user.accessibilityProfile', function ($aq) use ($disabilityFilter) {
                $aq->where('disability_types', 'like', "%{$disabilityFilter}%");
            });
        }

        $paginatedApplications = $query->latest('applied_at')->paginate(10)->withQueryString();

        // 3. Format Candidate Rows with 100% REAL profile & avatar from backend
        $displayCandidates = [];
        foreach ($paginatedApplications->items() as $app) {
            $user = $app->jobSeekerProfile?->user;
            $profile = $app->jobSeekerProfile;
            $acc = $user?->accessibilityProfile;

            // Real Avatar from database
            $avatarUrl = null;
            if ($user?->avatar) {
                $avatarUrl = str_starts_with($user->avatar, 'http')
                    ? $user->avatar
                    : (str_starts_with($user->avatar, '/') ? $user->avatar : '/' . $user->avatar);
            }

            // Initials fallback
            $name = $user?->name ?? 'Kandidat';
            $words = explode(' ', trim($name));
            $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));

            // Real Education
            $educationStr = 'Pendidikan belum diisi';
            if (!empty($profile?->educations) && is_array($profile->educations) && count($profile->educations) > 0) {
                $firstEdu = $profile->educations[0];
                $degree = $firstEdu['degree'] ?? $firstEdu['major'] ?? '';
                $institution = $firstEdu['institution'] ?? $firstEdu['school'] ?? '';
                $educationStr = trim("{$degree} {$institution}") ?: ($profile->education ?? 'Pendidikan belum diisi');
            } elseif (!empty($profile?->education)) {
                $educationStr = $profile->education;
            }

            // Real Skills
            $skills = is_array($profile?->skills) ? $profile->skills : [];
            $firstTwoSkills = array_slice($skills, 0, 2);
            $moreSkillsCount = max(0, count($skills) - 2);

            // Real Accessibility Profile
            $disabilityList = is_array($acc?->disability_types) ? $acc->disability_types : [];
            $disabilityLabels = array_map(function ($d) {
                return match (strtolower($d)) {
                    'netra' => 'Disabilitas Netra',
                    'rungu' => 'Disabilitas Rungu / Wicara',
                    'fisik' => 'Disabilitas Fisik',
                    'intelektual' => 'Disabilitas Intelektual',
                    'mental' => 'Disabilitas Mental / Neurodivergent',
                    default => ucfirst($d),
                };
            }, $disabilityList);
            $disabilityType = count($disabilityLabels) > 0 ? implode(', ', $disabilityLabels) : 'Non-Disabilitas';

            // Real Status Styling
            $statusKey = match ($app->status) {
                'submitted' => 'seleksi_admin',
                'reviewed', 'interview' => 'dalam_proses',
                'hired', 'accepted' => 'lulus_seleksi',
                'rejected', 'withdrawn' => 'ditolak',
                default => 'dalam_proses',
            };

            $statusColor = match ($statusKey) {
                'lulus_seleksi' => 'bg-emerald-50 text-emerald-600 border border-emerald-200',
                'dalam_proses' => 'bg-blue-50 text-blue-600 border border-blue-200',
                'seleksi_admin' => 'bg-amber-50 text-amber-700 border border-amber-200',
                'ditolak' => 'bg-rose-50 text-rose-600 border border-rose-200',
                default => 'bg-slate-50 text-slate-600 border border-slate-200',
            };

            $statusLabel = match ($statusKey) {
                'lulus_seleksi' => 'Lulus Seleksi',
                'dalam_proses' => 'Dalam Proses',
                'seleksi_admin' => 'Seleksi Administrasi',
                'ditolak' => 'Ditolak',
                default => 'Dalam Proses',
            };

            // Avatar Color based on name hash
            $bgColors = [
                'bg-blue-100 text-[#1769E0]',
                'bg-purple-100 text-purple-600',
                'bg-emerald-100 text-emerald-600',
                'bg-amber-100 text-amber-700',
                'bg-rose-100 text-rose-600',
            ];
            $color = $bgColors[abs(crc32($name)) % count($bgColors)];

            $cvPath = $app->cv_path ?: ($profile?->cv_path ?? null);
            if ($cvPath && !\Illuminate\Support\Facades\Storage::disk('public')->exists($cvPath) && $profile?->cv_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($profile->cv_path)) {
                $cvPath = $profile->cv_path;
            }
            $cvUrl = $cvPath ? asset('storage/' . $cvPath) : null;

            $displayCandidates[] = [
                'id' => $app->id,
                'name' => $name,
                'email' => $user?->email ?? '-',
                'phone' => $profile?->phone ?: '-',
                'domicile' => $profile?->domicile ?: '-',
                'bio' => $profile?->bio ?: '',
                'avatar' => $avatarUrl,
                'initials' => $initials,
                'color' => $color,
                'education' => $educationStr,
                'applied_position' => $app->vacancy?->title ?? 'Posisi Umum',
                'skills' => $firstTwoSkills,
                'all_skills' => is_array($skills) ? $skills : [],
                'skills_more_count' => $moreSkillsCount,
                'disability_type' => $disabilityType,
                'status' => $statusKey,
                'status_label' => $statusLabel,
                'status_color' => $statusColor,
                'cv_url' => $cvUrl,
                'applied_at' => $app->applied_at ? $app->applied_at->format('d M Y') : $app->created_at->format('d M Y'),
                'notes' => $app->status_notes ?? '',
            ];
        }

        // 4. Realtime Recent Activities (from real applications of this company)
        $recentRaw = Application::whereHas('vacancy', fn($q) => $q->where('company_profile_id', $company->id))
            ->with(['jobSeekerProfile.user', 'vacancy'])
            ->latest('updated_at')
            ->take(5)
            ->get();

        $recentActivities = [];
        foreach ($recentRaw as $act) {
            $uName = $act->jobSeekerProfile?->user?->name ?? 'Kandidat';
            $vTitle = $act->vacancy?->title ?? 'Lowongan';

            $text = match ($act->status) {
                'submitted' => "{$uName} melamar posisi {$vTitle}",
                'reviewed' => "CV {$uName} telah ditinjau",
                'interview' => "{$uName} diundang wawancara untuk {$vTitle}",
                'hired', 'accepted' => "{$uName} lolos seleksi {$vTitle}",
                'rejected' => "Lamaran {$uName} ditolak",
                default => "{$uName} melamar posisi {$vTitle}",
            };

            $recentActivities[] = [
                'id' => $act->id,
                'text' => $text,
                'time' => $act->updated_at ? $act->updated_at->diffForHumans() : 'Baru saja',
                'type' => $act->status,
            ];
        }

        return Inertia::render('company/candidates/index', [
            'candidates' => $displayCandidates,
            'stats' => $stats,
            'vacancies' => $vacancies,
            'recentActivities' => $recentActivities,
            'filters' => [
                'search' => $search,
                'vacancy' => $vacancyFilter,
                'status' => $statusFilter,
                'disability' => $disabilityFilter,
            ],
            'pagination' => [
                'current_page' => $paginatedApplications->currentPage(),
                'last_page' => $paginatedApplications->lastPage(),
                'total' => $paginatedApplications->total(),
                'from' => $paginatedApplications->firstItem() ?? 0,
                'to' => $paginatedApplications->lastItem() ?? 0,
                'links' => $paginatedApplications->linkCollection()->toArray(),
            ],
        ]);
    }

    public function show(Request $request, $id): Response
    {
        $company = $this->getCompanyProfile($request);

        // Find real application
        $application = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        })
        ->with([
            'jobSeekerProfile.user',
            'jobSeekerProfile.user.accessibilityProfile',
            'vacancy',
        ])
        ->findOrFail($id);

        // Find previous and next IDs for navigation
        $allIds = Application::whereHas('vacancy', fn($q) => $q->where('company_profile_id', $company->id))
            ->orderBy('id')
            ->pluck('id')
            ->toArray();

        $currentIndex = array_search((int) $id, $allIds);
        $prevId = $currentIndex !== false && $currentIndex > 0 ? $allIds[$currentIndex - 1] : null;
        $nextId = $currentIndex !== false && $currentIndex < count($allIds) - 1 ? $allIds[$currentIndex + 1] : null;

        $user = $application->jobSeekerProfile?->user;
        $profile = $application->jobSeekerProfile;
        $acc = $user?->accessibilityProfile;

        // Real Avatar URL from backend
        $avatarUrl = null;
        if ($user?->avatar) {
            $avatarUrl = str_starts_with($user->avatar, 'http')
                ? $user->avatar
                : (str_starts_with($user->avatar, '/') ? $user->avatar : '/' . $user->avatar);
        }

        // Initials fallback
        $name = $user?->name ?? 'Kandidat';
        $words = explode(' ', trim($name));
        $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));

        // Education Title
        $educationTitle = $profile?->education ?? 'Pendidikan belum diisi';
        if (!empty($profile?->educations) && is_array($profile->educations) && count($profile->educations) > 0) {
            $deg = $profile->educations[0]['degree'] ?? $profile->educations[0]['major'] ?? '';
            $inst = $profile->educations[0]['institution'] ?? $profile->educations[0]['school'] ?? '';
            $educationTitle = trim("{$deg} {$inst}") ?: $educationTitle;
        }

        // Real CV URL & filename
        $cvPath = $application->cv_path ?: ($profile?->cv_path ?? null);
        if ($cvPath && !\Illuminate\Support\Facades\Storage::disk('public')->exists($cvPath) && $profile?->cv_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($profile->cv_path)) {
            $cvPath = $profile->cv_path;
        }
        $cvFilename = $cvPath ? basename($cvPath) : 'Dokumen_CV.pdf';
        $cvUrl = $cvPath ? asset('storage/' . $cvPath) : null;

        // Parse Real Educations
        $realEducations = [];
        if (!empty($profile?->educations) && is_array($profile->educations) && count($profile->educations) > 0) {
            foreach ($profile->educations as $edu) {
                $realEducations[] = [
                    'degree' => $edu['degree'] ?? $edu['major'] ?? 'Pendidikan',
                    'institution' => $edu['institution'] ?? $edu['school'] ?? '-',
                    'period' => $edu['period'] ?? ($edu['year'] ?? '-'),
                    'status' => $edu['status'] ?? 'Lulus',
                    'gpa' => $edu['gpa'] ?? ($edu['ipk'] ?? null),
                ];
            }
        } elseif (!empty($profile?->education)) {
            // Split string if comma separated e.g. "S1 Teknik Informatika, Universitas Indonesia"
            $parts = explode(',', $profile->education);
            $realEducations[] = [
                'degree' => trim($parts[0]),
                'institution' => isset($parts[1]) ? trim($parts[1]) : '-',
                'period' => 'Terkini',
                'status' => 'Lulus',
                'gpa' => null,
            ];
        }

        // Parse Real Certifications
        $realCertifications = [];
        if (!empty($profile?->certifications) && is_array($profile->certifications)) {
            foreach ($profile->certifications as $cert) {
                $realCertifications[] = [
                    'title' => $cert['name'] ?? $cert['title'] ?? 'Sertifikasi',
                    'issuer' => $cert['issuer'] ?? '-',
                    'date' => isset($cert['year']) ? (string)$cert['year'] : ($cert['date'] ?? '-'),
                ];
            }
        }

        // Parse Real Work Experiences
        $realExperiences = [];
        if (!empty($profile?->work_experiences) && is_array($profile->work_experiences)) {
            foreach ($profile->work_experiences as $exp) {
                $points = [];
                if (isset($exp['description'])) {
                    $points = array_filter(explode("\n", (string) $exp['description']));
                } elseif (isset($exp['points']) && is_array($exp['points'])) {
                    $points = $exp['points'];
                }
                $realExperiences[] = [
                    'title' => $exp['title'] ?? $exp['position'] ?? 'Pengalaman Kerja',
                    'company' => $exp['company'] ?? '-',
                    'period' => $exp['period'] ?? ($exp['duration'] ?? '-'),
                    'points' => count($points) > 0 ? array_values($points) : ['Melaksanakan tugas pekerjaan sesuai SOP.'],
                ];
            }
        }

        // Parse Real Accessibility Accommodations map
        $accMap = [
            'screen_reader_software' => 'Dukungan software pembaca layar (NVDA / JAWS / VoiceOver)',
            'screen_reader' => 'Kompatibel dengan pembaca layar (Screen Reader)',
            'remote_option' => 'Opsi sistem kerja remote / bekerja dari rumah',
            'remote_work' => 'Kerja remote fleksibel',
            'flexible_hours' => 'Fleksibilitas jam kerja dan istirahat berkala',
            'written_communication' => 'Komunikasi tertulis diutamakan (chat / email)',
            'komunikasi_tertulis' => 'Komunikasi tertulis diutamakan',
            'sign_language_interpreter' => 'Penerjemah Bahasa Isyarat saat pertemuan penting',
            'quiet_space' => 'Lingkungan kerja tenang dan minim kebisingan',
            'ramp_access' => 'Akses ram / lift untuk kursi roda',
            'accessible_restroom' => 'Toilet khusus aksesibel',
            'ergonomic_workspace' => 'Meja kerja adjustable / ergonomis',
        ];

        $rawAccs = is_array($acc?->accommodations_needed) ? $acc->accommodations_needed : [];
        $humanAccommodations = [];
        foreach ($rawAccs as $rawItem) {
            $humanAccommodations[] = $accMap[$rawItem] ?? ucfirst(str_replace('_', ' ', $rawItem));
        }

        // Disability types labels
        $disabilityList = is_array($acc?->disability_types) ? $acc->disability_types : [];
        $disabilityLabels = array_map(function ($d) {
            return match (strtolower($d)) {
                'netra' => 'Tunanetra (Low Vision / Buta)',
                'rungu' => 'Tunarungu (Hearing Impairment)',
                'fisik' => 'Disabilitas Fisik (Pengguna Kursi Roda)',
                'intelektual' => 'Disabilitas Intelektual',
                'mental' => 'Neurodivergent (Autisme / ADHD)',
                default => ucfirst($d),
            };
        }, $disabilityList);

        $candidateData = [
            'id' => $application->id,
            'name' => $name,
            'avatar' => $avatarUrl,
            'initials' => $initials,
            'email' => $user?->email ?? '-',
            'phone' => $profile?->phone ?: '-',
            'birth_date' => $profile?->birth_date ? $profile->birth_date->format('d M Y') : 'Belum diisi',
            'age' => $profile?->birth_date ? $profile->birth_date->age : null,
            'gender' => $profile?->gender ?: 'Tidak disebutkan',
            'domicile' => $profile?->domicile ?: 'Belum diisi',
            'education_title' => $educationTitle,
            'bio' => $profile?->bio ?: 'Kandidat belum menambahkan deskripsi ringkasan profil.',
            'current_job_title' => $profile?->current_job_title ?: ($profile?->experience ?: 'Kandidat Talenta Inklusif'),
            'general_experience' => $profile?->experience ?: '',
            'linkedin_url' => $profile?->linkedin_url,
            'portfolio_url' => $profile?->portfolio_url,
            'profile_percentage' => $profile?->profile_completed_percentage ?? 100,
            'applied_position' => $application->vacancy?->title ?? 'Posisi Umum',
            'vacancy_id' => $application->vacancy_id,
            'applied_at' => $application->applied_at ? $application->applied_at->format('d M Y') : $application->created_at->format('d M Y'),
            'applied_time_ago' => $application->applied_at ? $application->applied_at->diffForHumans() : $application->created_at->diffForHumans(),
            'source' => 'Website Profabel',
            'status' => $application->status,
            'status_label' => match($application->status) {
                'submitted' => 'Seleksi Administrasi',
                'reviewed', 'interview' => 'Dalam Proses',
                'hired', 'accepted' => 'Lulus Seleksi',
                'rejected', 'withdrawn' => 'Ditolak',
                default => 'Dalam Proses',
            },
            'hr_notes' => $application->status_notes ?? '',

            // Real Educations
            'educations' => $realEducations,

            // Real Skills
            'skills' => is_array($profile?->skills) ? $profile->skills : [],

            // Real Certifications
            'certifications' => $realCertifications,

            // Real Work Experiences
            'work_experiences' => $realExperiences,

            // Real Accessibility Profile
            'accessibility' => [
                'disability_type' => count($disabilityLabels) > 0 ? implode(', ', $disabilityLabels) : 'Non-Disabilitas / Belum diatur',
                'accommodations' => count($humanAccommodations) > 0 ? $humanAccommodations : ['Tidak memerlukan akomodasi khusus'],
                'work_model_preference' => strtolower($application->vacancy?->work_model ?? 'wfo'),
                'notes' => $acc?->notes ?: 'Kandidat belum menambahkan catatan aksesibilitas khusus.',
            ],

            // Real CV
            'cv' => [
                'filename' => $cvFilename,
                'size' => $cvPath ? 'PDF' : '-',
                'url' => $cvUrl,
            ],
        ];

        return Inertia::render('company/candidates/show', [
            'candidate' => $candidateData,
            'navigation' => [
                'prev_id' => $prevId,
                'next_id' => $nextId,
            ],
        ]);
    }

    public function updateNotes(Request $request, $id): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        $application = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        })->findOrFail($id);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $application->update([
            'status_notes' => $validated['notes'],
        ]);

        return back()->with('status', 'Catatan HR berhasil disimpan.');
    }

    public function updateStatus(Request $request, $id): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        $application = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        })->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,reviewed,interview,rejected,hired,withdrawn'],
        ]);

        $application->update([
            'status' => $validated['status'],
        ]);

        // Notify job seeker
        $applicantUser = $application->jobSeekerProfile?->user;
        if ($applicantUser) {
            $applicantUser->notify(
                new \App\Notifications\ApplicationStatusChanged(
                    $application,
                    $validated['status'],
                    $application->status_notes
                )
            );
        }

        $msg = $validated['status'] === 'rejected'
            ? 'Kandidat telah ditolak.'
            : ($validated['status'] === 'hired' ? 'Kandidat dinyatakan Lulus Seleksi.' : 'Status kandidat berhasil diperbarui.');

        return back()->with('status', $msg);
    }
}
