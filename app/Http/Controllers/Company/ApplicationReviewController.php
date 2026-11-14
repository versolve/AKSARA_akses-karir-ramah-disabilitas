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

class ApplicationReviewController extends Controller
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

        // Filter parameters
        $tab = $request->query('tab', 'all'); // 'all', 'need_review', 'in_process', 'decided'
        $search = $request->query('search', '');
        $vacancyFilter = $request->query('vacancy', 'all');
        $statusFilter = $request->query('status', 'all');
        $disabilityFilter = $request->query('disability', 'all');
        $stageFilter = $request->query('stage', 'all');
        $decisionFilter = $request->query('decision', 'all');
        $dateFilter = $request->query('date_range', 'all');

        // Base query for this company's applications
        $baseCompanyQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        // 1. Realtime Metric Counts (4 Header Cards)
        $totalAll = (clone $baseCompanyQuery)->count();
        $totalNeedReview = (clone $baseCompanyQuery)->where('status', 'submitted')->count();
        $totalInProcess = (clone $baseCompanyQuery)->whereIn('status', ['reviewed', 'interview'])->count();
        $totalDecided = (clone $baseCompanyQuery)->whereIn('status', ['hired', 'rejected'])->count();

        // 2. Company Vacancies for Dropdown
        $vacancies = Vacancy::where('company_profile_id', $company->id)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        // 3. Filtered Query
        $query = (clone $baseCompanyQuery)->with([
            'jobSeekerProfile.user.accessibilityProfile',
            'vacancy',
        ]);

        // Filter by Tab
        if ($tab === 'need_review') {
            $query->where('status', 'submitted');
        } elseif ($tab === 'in_process') {
            $query->whereIn('status', ['reviewed', 'interview']);
        } elseif ($tab === 'decided') {
            $query->whereIn('status', ['hired', 'rejected']);
        }

        // Search by candidate name, vacancy title, or education
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('jobSeekerProfile.user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('vacancy', function ($vq) use ($search) {
                    $vq->where('title', 'like', "%{$search}%");
                })
                ->orWhereHas('jobSeekerProfile', function ($jq) use ($search) {
                    $jq->where('education', 'like', "%{$search}%")
                       ->orWhere('skills', 'like', "%{$search}%");
                });
            });
        }

        // Filter by Vacancy
        if ($vacancyFilter !== 'all' && is_numeric($vacancyFilter)) {
            $query->where('vacancy_id', (int) $vacancyFilter);
        }

        // Filter by Status (in Tab 'all')
        if ($tab === 'all' && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Filter by Decision (in Tab 'decided')
        if ($tab === 'decided' && $decisionFilter !== 'all') {
            $query->where('status', $decisionFilter);
        }

        // Filter by Disability
        if ($disabilityFilter !== 'all') {
            $query->whereHas('jobSeekerProfile.user.accessibilityProfile', function ($aq) use ($disabilityFilter) {
                $aq->whereJsonContains('disability_types', $disabilityFilter)
                   ->orWhere('disability_types', 'like', "%{$disabilityFilter}%");
            });
        }

        // Filter by Stage (in Tab 'in_process')
        if ($tab === 'in_process' && $stageFilter !== 'all') {
            if ($stageFilter === 'admin') {
                $query->where('status', 'reviewed')->where(function ($sq) {
                    $sq->whereNull('status_notes')->orWhere('status_notes', 'not like', '%asesmen%');
                });
            } elseif ($stageFilter === 'assessment') {
                $query->where('status', 'reviewed')->where('status_notes', 'like', '%asesmen%');
            } elseif ($stageFilter === 'interview') {
                $query->where('status', 'interview');
            } elseif ($stageFilter === 'offering') {
                $query->where('status_notes', 'like', '%penawaran%');
            }
        }

        // Filter by Date Range
        if ($dateFilter === '7_days') {
            $query->where('applied_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === '30_days') {
            $query->where('applied_at', '>=', now()->subDays(30));
        } elseif ($dateFilter === 'this_month') {
            $query->whereMonth('applied_at', now()->month)
                  ->whereYear('applied_at', now()->year);
        }

        $paginated = $query->latest('applied_at')->paginate(10)->withQueryString();

        // 4. Map Applications into Rich UI structure
        $mappedApplications = [];
        $bgColors = [
            'bg-blue-100 text-[#1769E0]',
            'bg-purple-100 text-purple-600',
            'bg-emerald-100 text-emerald-600',
            'bg-amber-100 text-amber-700',
            'bg-rose-100 text-rose-600',
        ];

        foreach ($paginated->items() as $app) {
            $user = $app->jobSeekerProfile?->user;
            $profile = $app->jobSeekerProfile;
            $acc = $user?->accessibilityProfile;

            $name = $user?->name ?? 'Kandidat';
            $words = explode(' ', trim($name));
            $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
            $color = $bgColors[abs(crc32($name)) % count($bgColors)];

            // Relative avatar path that works on all hosts
            $avatarUrl = null;
            if ($user?->avatar) {
                $avatarUrl = str_starts_with($user->avatar, 'http')
                    ? $user->avatar
                    : (str_starts_with($user->avatar, '/') ? $user->avatar : '/' . $user->avatar);
            }

            // Real Education
            $educationStr = $profile?->education ?? 'Pendidikan belum diisi';
            if (!empty($profile?->educations) && is_array($profile->educations) && count($profile->educations) > 0) {
                $deg = $profile->educations[0]['degree'] ?? $profile->educations[0]['major'] ?? '';
                $inst = $profile->educations[0]['institution'] ?? $profile->educations[0]['school'] ?? '';
                $educationStr = trim("{$deg} {$inst}") ?: $educationStr;
            }

            // Disability labels
            $disabilityList = is_array($acc?->disability_types) ? $acc->disability_types : [];
            $disabilityLabels = array_map(function ($d) {
                return match (strtolower($d)) {
                    'netra' => 'Disabilitas Netra',
                    'rungu' => 'Disabilitas Rungu',
                    'fisik' => 'Disabilitas Fisik',
                    'intelektual' => 'Disabilitas Intelektual',
                    'mental' => 'Neurodivergent',
                    default => ucfirst($d),
                };
            }, $disabilityList);
            $disabilityType = count($disabilityLabels) > 0 ? implode(', ', $disabilityLabels) : 'Non-Disabilitas';

            // Accommodations
            $rawAccommodations = is_array($acc?->accommodations_needed) ? $acc->accommodations_needed : [];
            $accommodations = array_map(function ($a) {
                return match (strtolower($a)) {
                    'ramp_access', 'ramp' => 'Akses Ram Kursi Roda',
                    'elevator', 'lift' => 'Akses Lift',
                    'accessible_restroom' => 'Toilet Ramah Disabilitas',
                    'screen_reader_software', 'screen_reader' => 'Software Pembaca Layar (Screen Reader)',
                    'sign_language_interpreter' => 'Juru Bahasa Isyarat',
                    'written_communication' => 'Instruksi / Komunikasi Tertulis',
                    'flexible_hours' => 'Jam Kerja Fleksibel',
                    'remote_option', 'remote_work' => 'Opsi Bekerja Remote',
                    'ergonomic_workspace' => 'Ruang Kerja Ergonomis',
                    'quiet_space' => 'Ruang Tenang Bebas Distraksi',
                    default => ucfirst(str_replace('_', ' ', $a)),
                };
            }, $rawAccommodations);

            // Stage, status labels, progress step
            $statusKey = $app->status;
            $notesLower = strtolower($app->status_notes ?? '');

            if ($statusKey === 'submitted') {
                $statusLabel = 'Perlu Ditinjau';
                $stageLabel = 'Menunggu review HR';
                $statusColor = 'bg-amber-50 text-amber-600 border border-amber-200/60';
                $stageStep = 1;
                $stageBadge = 'Menunggu Review';
            } elseif ($statusKey === 'reviewed') {
                $statusLabel = 'Dalam Proses';
                if (str_contains($notesLower, 'asesmen') || str_contains($notesLower, 'tes')) {
                    $stageLabel = 'Tes Kemampuan';
                    $stageBadge = 'Tes Kemampuan';
                    $stageStep = 2;
                } else {
                    $stageLabel = 'Seleksi Administrasi';
                    $stageBadge = 'Seleksi Administrasi';
                    $stageStep = 1;
                }
                $statusColor = 'bg-blue-50 text-[#1769E0] border border-blue-200/60';
            } elseif ($statusKey === 'interview') {
                $statusLabel = 'Dalam Proses';
                if (str_contains($notesLower, 'penawaran') || str_contains($notesLower, 'offering')) {
                    $stageLabel = 'Penawaran Kerja';
                    $stageBadge = 'Penawaran Kerja';
                    $stageStep = 4;
                } else {
                    $stageLabel = 'Wawancara';
                    $stageBadge = 'Wawancara';
                    $stageStep = 3;
                }
                $statusColor = 'bg-blue-50 text-[#1769E0] border border-blue-200/60';
            } elseif ($statusKey === 'hired') {
                $statusLabel = 'Diterima';
                $stageLabel = 'Lolos seluruh tahapan';
                $stageBadge = 'Diterima';
                $statusColor = 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
                $stageStep = 4;
            } elseif ($statusKey === 'rejected') {
                $statusLabel = 'Ditolak';
                $stageLabel = 'Tidak lolos seleksi';
                $stageBadge = 'Ditolak';
                $statusColor = 'bg-rose-50 text-rose-600 border border-rose-200/60';
                $stageStep = 1;
            } else {
                $statusLabel = 'Dalam Proses';
                $stageLabel = 'Dalam Proses';
                $stageBadge = 'Dalam Proses';
                $statusColor = 'bg-slate-50 text-slate-600 border border-slate-200';
                $stageStep = 1;
            }

            // Real CV URL
            $cvPath = $app->cv_path ?: ($profile?->cv_path ?? null);
            if ($cvPath && !\Illuminate\Support\Facades\Storage::disk('public')->exists($cvPath) && $profile?->cv_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($profile->cv_path)) {
                $cvPath = $profile->cv_path;
            }
            $cvUrl = $cvPath ? asset('storage/' . $cvPath) : null;

            // Generate selection history timeline
            $appliedDateStr = $app->applied_at ? $app->applied_at->format('d M Y') : $app->created_at->format('d M Y');
            $updatedDateStr = $app->updated_at ? $app->updated_at->format('d M Y') : $appliedDateStr;

            $timeline = [
                [
                    'title' => 'Lamaran Dikirim',
                    'date' => $appliedDateStr,
                    'completed' => true,
                    'status' => 'done',
                ],
                [
                    'title' => 'Seleksi Administrasi',
                    'date' => in_array($statusKey, ['reviewed', 'interview', 'hired', 'rejected']) ? $updatedDateStr : '-',
                    'completed' => in_array($statusKey, ['reviewed', 'interview', 'hired']),
                    'status' => in_array($statusKey, ['reviewed', 'interview', 'hired']) ? 'done' : ($statusKey === 'rejected' ? 'failed' : 'pending'),
                ],
                [
                    'title' => 'Tes Kemampuan',
                    'date' => (in_array($statusKey, ['interview', 'hired']) || str_contains($notesLower, 'asesmen')) ? $updatedDateStr : '-',
                    'completed' => in_array($statusKey, ['interview', 'hired']),
                    'status' => in_array($statusKey, ['interview', 'hired']) ? 'done' : 'pending',
                ],
                [
                    'title' => 'Wawancara',
                    'date' => in_array($statusKey, ['interview', 'hired']) ? $updatedDateStr : '-',
                    'completed' => $statusKey === 'hired' || $statusKey === 'interview',
                    'status' => in_array($statusKey, ['interview', 'hired']) ? 'done' : 'pending',
                ],
                [
                    'title' => 'Keputusan Akhir',
                    'date' => in_array($statusKey, ['hired', 'rejected']) ? $updatedDateStr : '-',
                    'completed' => in_array($statusKey, ['hired', 'rejected']),
                    'status' => $statusKey === 'hired' ? 'done' : ($statusKey === 'rejected' ? 'failed' : 'pending'),
                    'badge' => $statusKey === 'hired' ? 'Diterima' : ($statusKey === 'rejected' ? 'Ditolak' : null),
                ],
            ];

            $mappedApplications[] = [
                'id' => $app->id,
                'status' => $statusKey,
                'status_label' => $statusLabel,
                'status_color' => $statusColor,
                'stage_label' => $stageLabel,
                'stage_badge' => $stageBadge,
                'stage_step' => $stageStep,
                'stage_progress_text' => "{$stageStep} dari 4 tahap",
                'status_notes' => $app->status_notes ?: ($statusKey === 'hired' ? 'Lolos seluruh tahapan seleksi.' : ($statusKey === 'rejected' ? 'Tidak memenuhi kualifikasi teknis.' : 'Sedang dalam peninjauan.')),
                'cover_letter' => $app->cover_letter,
                'applied_at' => $appliedDateStr,
                'applied_time_ago' => $app->applied_at ? $app->applied_at->diffForHumans() : $app->created_at->diffForHumans(),
                'updated_at' => $updatedDateStr,
                'decision_date' => in_array($statusKey, ['hired', 'rejected']) ? $updatedDateStr : null,
                'cv_url' => $cvUrl,
                'timeline' => $timeline,
                'candidate' => [
                    'id' => $user?->id ?? 0,
                    'profile_id' => $profile?->id ?? 0,
                    'name' => $name,
                    'avatar' => $avatarUrl,
                    'initials' => $initials,
                    'color' => $color,
                    'education' => $educationStr,
                    'email' => $user?->email ?? '-',
                    'phone' => $profile?->phone ?: '-',
                    'domicile' => $profile?->domicile ?: 'Indonesia',
                    'disability_type' => $disabilityType,
                    'disability_list' => $disabilityList,
                    'accommodations' => $accommodations,
                    'bio' => $profile?->bio ?: 'Talenta inklusif profesional.',
                    'skills' => is_array($profile?->skills) ? $profile->skills : [],
                ],
                'vacancy' => [
                    'id' => $app->vacancy_id,
                    'title' => $app->vacancy?->title ?? 'Lowongan Kerja',
                ],
            ];
        }

        return Inertia::render('company/applications/index', [
            'applications' => [
                'data' => $mappedApplications,
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
                'links' => $paginated->linkCollection()->toArray(),
            ],
            'stats' => [
                'all' => $totalAll,
                'need_review' => $totalNeedReview,
                'in_process' => $totalInProcess,
                'decided' => $totalDecided,
            ],
            'vacancies' => $vacancies,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'vacancy' => $vacancyFilter,
                'status' => $statusFilter,
                'disability' => $disabilityFilter,
                'stage' => $stageFilter,
                'decision' => $decisionFilter,
                'date_range' => $dateFilter,
            ],
        ]);
    }

    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($application->vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,reviewed,interview,rejected,hired,withdrawn'],
            'status_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => $validated['status'],
            'status_notes' => $validated['status_notes'] ?? $application->status_notes,
            'updated_at' => now(),
        ]);

        // Notify job seeker if user account exists
        $applicantUser = $application->jobSeekerProfile?->user;
        if ($applicantUser) {
            try {
                $applicantUser->notify(
                    new \App\Notifications\ApplicationStatusChanged(
                        $application,
                        $validated['status'],
                        $validated['status_notes'] ?? null
                    )
                );
            } catch (\Throwable $e) {
                // Continue if notification fails
            }
        }

        return back()->with('status', 'Status lamaran berhasil diperbarui.');
    }

    public function sendNotification(Request $request, Application $application): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($application->vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $applicantUser = $application->jobSeekerProfile?->user;
        if ($applicantUser) {
            try {
                $applicantUser->notify(
                    new \App\Notifications\ApplicationStatusChanged(
                        $application,
                        $application->status,
                        $validated['message']
                    )
                );
            } catch (\Throwable $e) {
                // Continue
            }
        }

        return back()->with('status', 'Notifikasi berhasil dikirimkan kepada kandidat.');
    }
}
