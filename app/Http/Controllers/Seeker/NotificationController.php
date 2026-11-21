<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(15);

        return Inertia::render('app/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return back()->with('status', 'Notifikasi telah ditandai dibaca.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('status', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $request->user()->notifications()->where('id', $id)->delete();

        return back()->with('status', 'Notifikasi berhasil dihapus.');
    }

    /**
     * Collect recent notifications for the seeker to display in the mini dropdown.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function collectSeekerNotifications(\App\Models\User $user): array
    {
        try {
            $notifications = [];
            foreach ($user->notifications()->latest()->take(10)->get() as $dbNotif) {
                $data = is_array($dbNotif->data) ? $dbNotif->data : json_decode($dbNotif->data ?? '[]', true);
                $status = $data['status'] ?? null;
                $title = $data['title'] ?? match ($status) {
                    'interview' => 'Undangan Wawancara',
                    'hired' => 'Lamaran Diterima',
                    'rejected' => 'Lamaran Ditolak',
                    'reviewed' => 'Lamaran Sedang Ditinjau',
                    default => $data['vacancy_title'] ?? 'Pembaruan Lamaran',
                };

                $notifications[] = [
                    'id' => (string) $dbNotif->id,
                    'title' => $title,
                    'company_name' => $data['company_name'] ?? 'Profabel',
                    'message' => $data['message'] ?? $data['notes'] ?? ($data['vacancy_title'] ? "Untuk posisi {$data['vacancy_title']}..." : 'Ada pembaruan status lamaran Anda.'),
                    'status' => $status,
                    'link' => $data['link'] ?? "/app/notifications?id={$dbNotif->id}",
                    'created_at' => $dbNotif->created_at->toIso8601String(),
                    'time_ago' => $dbNotif->created_at->diffForHumans(),
                    'is_read' => $dbNotif->read_at !== null,
                ];
            }

            return $notifications;
        } catch (\Throwable $e) {
            return [];
        }
    }
}
