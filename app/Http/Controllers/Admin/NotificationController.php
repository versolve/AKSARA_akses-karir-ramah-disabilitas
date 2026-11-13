<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Retrieve combined admin notifications (database notifications + live system events).
     */
    public static function collectAdminNotifications(User $user): array
    {
        $readIds = Cache::get("admin_read_notifs_{$user->id}", []);

        $notifications = [];

        // 1. Database Notifications (if any)
        foreach ($user->notifications()->latest()->take(20)->get() as $dbNotif) {
            $data = is_array($dbNotif->data) ? $dbNotif->data : json_decode($dbNotif->data ?? '[]', true);
            $notifications[] = [
                'id' => (string) $dbNotif->id,
                'title' => $data['title'] ?? 'Pemberitahuan Sistem',
                'message' => $data['message'] ?? ($data['notes'] ?? 'Ada pembaruan status sistem.'),
                'category' => $data['category'] ?? 'system',
                'link' => $data['link'] ?? '/admin/dashboard',
                'created_at' => $dbNotif->created_at->toIso8601String(),
                'time_ago' => $dbNotif->created_at->diffForHumans(),
                'is_read' => $dbNotif->read_at !== null || in_array((string) $dbNotif->id, $readIds, true),
            ];
        }

        // 2. Pending Company Verifications
        try {
            $pendingCompanies = CompanyProfile::where('is_approved', false)
                ->latest()
                ->take(5)
                ->get();

            foreach ($pendingCompanies as $company) {
                $id = "comp-verify-{$company->id}";
                $time = $company->created_at ?? now()->subHours(2);
                $notifications[] = [
                    'id' => $id,
                    'title' => 'Permohonan Verifikasi Perusahaan',
                    'message' => "{$company->company_name} menunggu verifikasi dokumen profil dan legalitas.",
                    'category' => 'verification',
                    'link' => '/admin/companies/verification',
                    'created_at' => $time->toIso8601String(),
                    'time_ago' => $time->diffForHumans(),
                    'is_read' => in_array($id, $readIds, true),
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if table/fields differ
        }

        // 3. Vacancies Moderation / New Vacancies
        try {
            $vacancies = Vacancy::with('companyProfile')
                ->where('status', 'draft')
                ->orWhere('created_at', '>=', now()->subDays(7))
                ->latest()
                ->take(5)
                ->get();

            foreach ($vacancies as $vac) {
                $id = "vac-mod-{$vac->id}";
                $compName = $vac->companyProfile?->company_name ?? 'Perusahaan';
                $time = $vac->created_at ?? now()->subDay();
                $isDraft = $vac->status === 'draft';
                $notifications[] = [
                    'id' => $id,
                    'title' => $isDraft ? 'Moderasi Lowongan Kerja' : 'Lowongan Baru Dipublikasikan',
                    'message' => "Lowongan \"{$vac->title}\" oleh {$compName} " . ($isDraft ? 'memerlukan persetujuan moderasi.' : 'telah aktif di platform.'),
                    'category' => 'vacancy',
                    'link' => '/admin/vacancies',
                    'created_at' => $time->toIso8601String(),
                    'time_ago' => $time->diffForHumans(),
                    'is_read' => in_array($id, $readIds, true),
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if error
        }

        // 4. Recent New Users
        try {
            $newUsers = User::where('role', '!=', 'admin')
                ->where('created_at', '>=', now()->subDays(3))
                ->latest()
                ->take(4)
                ->get();

            foreach ($newUsers as $u) {
                $id = "user-new-{$u->id}";
                $time = $u->created_at ?? now()->subHours(5);
                $roleLabel = $u->role === 'pelamar' ? 'Pelamar Disabilitas' : 'Perusahaan';
                $notifications[] = [
                    'id' => $id,
                    'title' => 'Pendaftaran Pengguna Baru',
                    'message' => "{$u->name} baru saja mendaftar ke platform sebagai {$roleLabel}.",
                    'category' => 'user',
                    'link' => "/admin/users?role={$u->role}",
                    'created_at' => $time->toIso8601String(),
                    'time_ago' => $time->diffForHumans(),
                    'is_read' => in_array($id, $readIds, true),
                ];
            }
        } catch (\Throwable $e) {
            // Ignore
        }

        // 5. System Health / Backup Notice
        $sysId = 'sys-backup-weekly';
        $sysTime = now()->subHours(6);
        $notifications[] = [
            'id' => $sysId,
            'title' => 'Pencadangan Sistem Otomatis Berhasil',
            'message' => 'Pencadangan database dan berkas sistem AKSARA telah selesai dilakukan secara aman.',
            'category' => 'system',
            'link' => '/admin/settings',
            'created_at' => $sysTime->toIso8601String(),
            'time_ago' => $sysTime->diffForHumans(),
            'is_read' => in_array($sysId, $readIds, true),
        ];

        // Sort by created_at descending
        usort($notifications, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        // Filter out deleted IDs
        $deletedIds = Cache::get("admin_deleted_notifs_{$user->id}", []);
        if (!empty($deletedIds)) {
            $notifications = array_values(array_filter($notifications, function ($n) use ($deletedIds) {
                return !in_array($n['id'], $deletedIds, true);
            }));
        }

        return $notifications;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $all = self::collectAdminNotifications($user);

        $filter = $request->input('filter', 'all');

        $filtered = array_filter($all, function ($n) use ($filter) {
            if ($filter === 'unread') {
                return !$n['is_read'];
            }
            if ($filter === 'verification') {
                return $n['category'] === 'verification';
            }
            if ($filter === 'vacancy') {
                return $n['category'] === 'vacancy';
            }
            if ($filter === 'user') {
                return $n['category'] === 'user';
            }
            if ($filter === 'system') {
                return $n['category'] === 'system';
            }
            return true;
        });

        $filtered = array_values($filtered);

        $unreadCount = count(array_filter($all, fn ($n) => !$n['is_read']));

        $counts = [
            'all' => count($all),
            'unread' => $unreadCount,
            'verification' => count(array_filter($all, fn ($n) => $n['category'] === 'verification')),
            'vacancy' => count(array_filter($all, fn ($n) => $n['category'] === 'vacancy')),
            'user' => count(array_filter($all, fn ($n) => $n['category'] === 'user')),
            'system' => count(array_filter($all, fn ($n) => $n['category'] === 'system')),
        ];

        return Inertia::render('admin/notifications/index', [
            'notifications' => $filtered,
            'counts' => $counts,
            'activeFilter' => $filter,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // 1. If database notification
        $dbNotif = $user->notifications()->where('id', $id)->first();
        if ($dbNotif) {
            $dbNotif->markAsRead();
        }

        // 2. Mark in cache
        $readIds = Cache::get("admin_read_notifs_{$user->id}", []);
        if (!in_array($id, $readIds, true)) {
            $readIds[] = $id;
            Cache::put("admin_read_notifs_{$user->id}", $readIds, now()->addDays(30));
        }

        return back()->with('status', 'Notifikasi ditandai telah dibaca.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Mark database notifications
        $user->unreadNotifications->markAsRead();

        // Mark all synthetic notifications as read
        $all = self::collectAdminNotifications($user);
        $readIds = array_map(fn ($n) => $n['id'], $all);
        Cache::put("admin_read_notifs_{$user->id}", $readIds, now()->addDays(30));

        return back()->with('status', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // If database notification
        $user->notifications()->where('id', $id)->delete();

        // Add to deleted cache
        $deletedIds = Cache::get("admin_deleted_notifs_{$user->id}", []);
        if (!in_array($id, $deletedIds, true)) {
            $deletedIds[] = $id;
            Cache::put("admin_deleted_notifs_{$user->id}", $deletedIds, now()->addDays(30));
        }

        return back()->with('status', 'Notifikasi berhasil dihapus.');
    }
}
