<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Message;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Retrieve combined company notifications (database notifications + live recruitment events).
     *
     * @return array<int, array<string, mixed>>
     */
    public static function collectCompanyNotifications(User $user): array
    {
        $readIds = Cache::get("company_read_notifs_{$user->id}", []);
        $deletedIds = Cache::get("company_deleted_notifs_{$user->id}", []);

        $notifications = [];

        // 1. Database Notifications (Standard Laravel Notifications)
        try {
            foreach ($user->notifications()->latest()->take(30)->get() as $dbNotif) {
                $id = (string) $dbNotif->id;
                if (in_array($id, $deletedIds, true)) {
                    continue;
                }

                $data = is_array($dbNotif->data) ? $dbNotif->data : json_decode($dbNotif->data ?? '[]', true);
                $notifications[] = [
                    'id' => $id,
                    'title' => $data['title'] ?? 'Pemberitahuan Rekrutmen',
                    'message' => $data['message'] ?? ($data['notes'] ?? 'Ada pembaruan status lamaran atau akun.'),
                    'category' => $data['category'] ?? 'application',
                    'link' => $data['link'] ?? '/company/applications',
                    'created_at' => $dbNotif->created_at->toIso8601String(),
                    'time_ago' => $dbNotif->created_at->diffForHumans(),
                    'is_read' => $dbNotif->read_at !== null || in_array($id, $readIds, true),
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if DB not ready
        }

        $company = $user->companyProfile;

        if ($company) {
            // 2. Incoming Candidate Applications (Live Events)
            try {
                $applications = Application::whereHas('vacancy', function ($q) use ($company) {
                    $q->where('company_profile_id', $company->id);
                })
                    ->with(['jobSeekerProfile.user', 'vacancy'])
                    ->latest('applied_at')
                    ->take(15)
                    ->get();

                foreach ($applications as $app) {
                    $id = "app-event-{$app->id}";
                    if (in_array($id, $deletedIds, true)) {
                        continue;
                    }

                    // Avoid duplicate if DB notification already has this application_id
                    $alreadyInDb = false;
                    foreach ($notifications as $existing) {
                        if (str_contains($existing['id'], (string) $app->id) || ($existing['link'] ?? '') === "/company/applications?application_id={$app->id}") {
                            $alreadyInDb = true;
                            break;
                        }
                    }
                    if ($alreadyInDb) {
                        continue;
                    }

                    $seekerName = $app->jobSeekerProfile?->user?->name ?? 'Pelamar';
                    $jobTitle = $app->vacancy?->title ?? 'Lowongan Kerja';
                    $time = $app->applied_at ? Carbon::parse($app->applied_at) : ($app->created_at ?? now());

                    $statusLabel = match ($app->status) {
                        'submitted' => 'Menunggu Peninjauan',
                        'reviewed' => 'Sedang Ditinjau',
                        'interview' => 'Tahap Wawancara',
                        'hired' => 'Diterima Bekerja',
                        'rejected' => 'Tidak Lolos',
                        default => ucfirst($app->status),
                    };

                    $notifications[] = [
                        'id' => $id,
                        'title' => "Lamaran Masuk: {$seekerName}",
                        'message' => "Kandidat {$seekerName} melamar untuk posisi {$jobTitle} ({$statusLabel}).",
                        'category' => 'application',
                        'link' => '/company/applications',
                        'created_at' => $time->toIso8601String(),
                        'time_ago' => $time->diffForHumans(),
                        'is_read' => in_array($id, $readIds, true),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore query failure
            }

            // 3. New Messages from Candidates
            try {
                $candidateMessages = Message::whereHas('application.vacancy', function ($q) use ($company) {
                    $q->where('company_profile_id', $company->id);
                })
                    ->where('sender_id', '!=', $user->id)
                    ->with(['sender', 'application.vacancy'])
                    ->latest()
                    ->take(8)
                    ->get();

                foreach ($candidateMessages as $msg) {
                    $id = "msg-event-{$msg->id}";
                    if (in_array($id, $deletedIds, true)) {
                        continue;
                    }

                    $senderName = $msg->sender?->name ?? 'Kandidat';
                    $snippet = !empty(trim($msg->message ?? '')) ? Str::limit($msg->message, 75) : 'Kandidat mengirim lampiran atau berkas.';
                    $time = $msg->created_at ?? now();

                    $notifications[] = [
                        'id' => $id,
                        'title' => "Pesan Baru dari {$senderName}",
                        'message' => "\"{$snippet}\"",
                        'category' => 'message',
                        'link' => "/messages?application_id={$msg->application_id}",
                        'created_at' => $time->toIso8601String(),
                        'time_ago' => $time->diffForHumans(),
                        'is_read' => $msg->is_read || in_array($id, $readIds, true),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore message error
            }

            // 4. Company Verification Status Notification
            try {
                $verifyId = "company-verification-{$company->id}";
                if (!in_array($verifyId, $deletedIds, true)) {
                    $isApproved = (bool) $company->is_approved;
                    $notifications[] = [
                        'id' => $verifyId,
                        'title' => $isApproved ? 'Profil Perusahaan Terverifikasi' : 'Status Verifikasi Profil',
                        'message' => $isApproved
                            ? "Profil resmi {$company->company_name} telah diverifikasi dan aktif di platform Profabel."
                            : "Profil {$company->company_name} sedang dalam proses verifikasi dokumen oleh Administrator.",
                        'category' => 'verification',
                        'link' => '/company/profile',
                        'created_at' => ($company->updated_at ?? now())->toIso8601String(),
                        'time_ago' => ($company->updated_at ?? now())->diffForHumans(),
                        'is_read' => in_array($verifyId, $readIds, true),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore
            }

            // 5. Vacancies Nearing Deadline
            try {
                $closingSoonVacancies = Vacancy::where('company_profile_id', $company->id)
                    ->where('status', 'active')
                    ->whereNotNull('deadline')
                    ->whereBetween('deadline', [now()->startOfDay(), now()->addDays(5)->endOfDay()])
                    ->take(5)
                    ->get();

                foreach ($closingSoonVacancies as $vac) {
                    $id = "vac-deadline-{$vac->id}";
                    if (in_array($id, $deletedIds, true)) {
                        continue;
                    }

                    $deadlineStr = Carbon::parse($vac->deadline)->format('d M Y');
                    $notifications[] = [
                        'id' => $id,
                        'title' => "Batas Waktu Lowongan Segera Berakhir",
                        'message' => "Lowongan \"{$vac->title}\" akan ditutup pada {$deadlineStr}. Tinjau kandidat yang telah mendaftar.",
                        'category' => 'vacancy',
                        'link' => '/company/vacancies',
                        'created_at' => now()->subHours(3)->toIso8601String(),
                        'time_ago' => '3 jam yang lalu',
                        'is_read' => in_array($id, $readIds, true),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore
            }

            // 6. Reports Available
            try {
                $reports = $company->reports()->latest()->take(3)->get();
                foreach ($reports as $rep) {
                    $id = "report-ready-{$rep->id}";
                    if (in_array($id, $deletedIds, true)) {
                        continue;
                    }

                    $repTitle = $rep->name ?: ($rep->type === 'comprehensive' ? 'Laporan Rekrutmen Komprehensif' : 'Laporan Ringkasan Rekrutmen');
                    $periodStr = $rep->period_label ?: 'Bulan Ini';

                    $notifications[] = [
                        'id' => $id,
                        'title' => "Laporan Rekrutmen Tersedia",
                        'message' => "Laporan \"{$repTitle}\" ({$periodStr}) telah dibuat dan siap diunduh.",
                        'category' => 'system',
                        'link' => '/company/reports',
                        'created_at' => ($rep->created_at ?? now())->toIso8601String(),
                        'time_ago' => ($rep->created_at ?? now())->diffForHumans(),
                        'is_read' => in_array($id, $readIds, true),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore
            }
        } else {
            // For company users without a profile yet
            $profileSetupId = "setup-company-profile-{$user->id}";
            if (!in_array($profileSetupId, $deletedIds, true)) {
                $notifications[] = [
                    'id' => $profileSetupId,
                    'title' => 'Lengkapi Profil Perusahaan',
                    'message' => 'Lengkapi data identitas dan legalitas perusahaan Anda agar dapat mulai mempublikasikan lowongan pekerjaan inklusif.',
                    'category' => 'verification',
                    'link' => '/company/profile',
                    'created_at' => ($user->created_at ?? now())->toIso8601String(),
                    'time_ago' => ($user->created_at ?? now())->diffForHumans(),
                    'is_read' => in_array($profileSetupId, $readIds, true),
                ];
            }
        }

        // Sort descending by created_at
        usort($notifications, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return $notifications;
    }

    /**
     * Display company notification page with filter and counts.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $allNotifications = self::collectCompanyNotifications($user);

        // Calculate counts
        $counts = [
            'all' => count($allNotifications),
            'unread' => count(array_filter($allNotifications, fn ($n) => !$n['is_read'])),
            'application' => count(array_filter($allNotifications, fn ($n) => $n['category'] === 'application')),
            'message' => count(array_filter($allNotifications, fn ($n) => $n['category'] === 'message')),
            'verification' => count(array_filter($allNotifications, fn ($n) => $n['category'] === 'verification')),
            'vacancy' => count(array_filter($allNotifications, fn ($n) => $n['category'] === 'vacancy')),
            'system' => count(array_filter($allNotifications, fn ($n) => $n['category'] === 'system')),
        ];

        $filter = $request->input('filter', 'all');
        $search = $request->input('search');

        $filtered = array_values(array_filter($allNotifications, function ($notif) use ($filter, $search) {
            // Filter condition
            if ($filter === 'unread' && $notif['is_read']) {
                return false;
            }
            if (!in_array($filter, ['all', 'unread']) && $notif['category'] !== $filter) {
                return false;
            }

            // Search query condition
            if ($search) {
                $term = strtolower(trim($search));
                $matchesTitle = str_contains(strtolower($notif['title']), $term);
                $matchesMsg = str_contains(strtolower($notif['message']), $term);
                return $matchesTitle || $matchesMsg;
            }

            return true;
        }));

        return Inertia::render('company/notifications/index', [
            'notifications' => $filtered,
            'counts' => $counts,
            'activeFilter' => $filter,
            'search' => $search ?? '',
            'unreadCount' => $counts['unread'],
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // 1. Check if it's a DatabaseNotification UUID
        try {
            $dbNotif = $user->notifications()->where('id', $id)->first();
            if ($dbNotif) {
                $dbNotif->markAsRead();
            }
        } catch (\Throwable $e) {
            // Ignore
        }

        // 2. Add to virtual read cache
        $readIds = Cache::get("company_read_notifs_{$user->id}", []);
        if (!in_array($id, $readIds, true)) {
            $readIds[] = $id;
            Cache::put("company_read_notifs_{$user->id}", $readIds, now()->addDays(90));
        }

        return back()->with('status', 'Notifikasi telah ditandai dibaca.');
    }

    /**
     * Mark all company notifications as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Mark all database notifications as read
        try {
            $user->unreadNotifications->markAsRead();
        } catch (\Throwable $e) {
            // Ignore
        }

        // Collect all IDs and cache as read
        $all = self::collectCompanyNotifications($user);
        $allIds = array_column($all, 'id');

        Cache::put("company_read_notifs_{$user->id}", $allIds, now()->addDays(90));

        return back()->with('status', 'Semua notifikasi berhasil ditandai dibaca.');
    }

    /**
     * Remove or hide a notification.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // Check if database notification
        try {
            $user->notifications()->where('id', $id)->delete();
        } catch (\Throwable $e) {
            // Ignore
        }

        // Add to deleted cache
        $deletedIds = Cache::get("company_deleted_notifs_{$user->id}", []);
        if (!in_array($id, $deletedIds, true)) {
            $deletedIds[] = $id;
            Cache::put("company_deleted_notifs_{$user->id}", $deletedIds, now()->addDays(90));
        }

        return back()->with('status', 'Notifikasi berhasil dihapus.');
    }
}
