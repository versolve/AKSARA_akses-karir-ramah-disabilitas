<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\Audit\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $module = $request->input('module', 'all');
        $action = $request->input('action', 'all');
        $severity = $request->input('severity', 'all');
        $datePreset = $request->input('date_preset', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = ActivityLog::with('user:id,name,email,avatar,role')
            ->search($search)
            ->module($module)
            ->actionFilter($action)
            ->severity($severity)
            ->datePreset($datePreset, $startDate, $endDate)
            ->latest('id');

        $logs = $query->paginate(20)->withQueryString()->through(function (ActivityLog $log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'actor_name' => $log->actor_name,
                'actor_email' => $log->actor_email,
                'actor_role' => $log->actor_role,
                'action' => $log->action,
                'module' => $log->module,
                'module_label' => $log->module_label ?: ActivityLogger::resolveModuleLabel($log->module),
                'description' => $log->description,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'subject_label' => $log->subject_label,
                'properties' => $log->properties,
                'has_diff' => !empty($log->properties['diff'] ?? null),
                'diff_count' => count($log->properties['diff'] ?? []),
                'severity' => $log->severity,
                'ip_address' => $log->ip_address,
                'browser' => $log->browser,
                'user_agent' => $log->user_agent,
                'method' => $log->method,
                'url' => $log->url,
                'created_at' => $log->created_at?->toIso8601String(),
                'created_at_human' => $log->created_at?->diffForHumans(),
                'created_at_formatted' => $log->created_at?->translatedFormat('d M Y, H:i:s'),
            ];
        });

        // Metrik Analitik Realtime
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $totalCount = ActivityLog::count();
        $todayCount = ActivityLog::where('created_at', '>=', $today)->count();
        $yesterdayCount = ActivityLog::whereBetween('created_at', [$yesterday->startOfDay(), $yesterday->endOfDay()])->count();
        $growthPercent = $yesterdayCount > 0
            ? round((($todayCount - $yesterdayCount) / $yesterdayCount) * 100, 1)
            : 0;

        $dangerCount = ActivityLog::where('severity', 'danger')->count();
        $warningCount = ActivityLog::where('severity', 'warning')->count();
        $activeActorsToday = ActivityLog::where('created_at', '>=', $today)->distinct('actor_name')->count('actor_name');

        $moduleStats = ActivityLog::selectRaw('module, COUNT(*) as count')
            ->groupBy('module')
            ->pluck('count', 'module')
            ->toArray();

        $actionStats = ActivityLog::selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->pluck('count', 'action')
            ->toArray();

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'module' => $module,
                'action' => $action,
                'severity' => $severity,
                'date_preset' => $datePreset,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'metrics' => [
                'total_count' => $totalCount,
                'today_count' => $todayCount,
                'yesterday_count' => $yesterdayCount,
                'growth_percent' => $growthPercent,
                'danger_count' => $dangerCount,
                'warning_count' => $warningCount,
                'active_actors_today' => $activeActorsToday,
                'module_stats' => $moduleStats,
                'action_stats' => $actionStats,
            ],
            'modules_list' => [
                ['id' => 'all', 'label' => 'Semua Modul'],
                ['id' => 'users', 'label' => 'Kelola Pengguna'],
                ['id' => 'companies', 'label' => 'Verifikasi Perusahaan'],
                ['id' => 'vacancies', 'label' => 'Kelola Lowongan'],
                ['id' => 'applications', 'label' => 'Lamaran Kerja'],
                ['id' => 'ai_engine', 'label' => 'AI Management'],
                ['id' => 'settings', 'label' => 'Pengaturan Sistem'],
                ['id' => 'messages', 'label' => 'Pesan & Pengumuman'],
                ['id' => 'auth', 'label' => 'Autentikasi & Keamanan'],
            ],
            'actions_list' => [
                ['id' => 'all', 'label' => 'Semua Aksi'],
                ['id' => 'create', 'label' => 'Create / Tambah Data'],
                ['id' => 'update', 'label' => 'Update / Perbarui Data'],
                ['id' => 'delete', 'label' => 'Delete / Hapus Data'],
                ['id' => 'approve', 'label' => 'Approve / Verifikasi'],
                ['id' => 'reject', 'label' => 'Reject / Penolakan'],
                ['id' => 'login', 'label' => 'Login Masuk'],
                ['id' => 'logout', 'label' => 'Logout Keluar'],
                ['id' => 'reveal_key', 'label' => 'Akses Kunci API'],
                ['id' => 'system_config', 'label' => 'Ubah Konfigurasi Sistem'],
            ],
        ]);
    }

    public function show(ActivityLog $activityLog): JsonResponse
    {
        return response()->json([
            'success' => true,
            'log' => [
                'id' => $activityLog->id,
                'actor_name' => $activityLog->actor_name,
                'actor_email' => $activityLog->actor_email,
                'actor_role' => $activityLog->actor_role,
                'action' => $activityLog->action,
                'module' => $activityLog->module,
                'module_label' => $activityLog->module_label ?: ActivityLogger::resolveModuleLabel($activityLog->module),
                'description' => $activityLog->description,
                'subject_type' => $activityLog->subject_type,
                'subject_id' => $activityLog->subject_id,
                'subject_label' => $activityLog->subject_label,
                'properties' => $activityLog->properties,
                'severity' => $activityLog->severity,
                'ip_address' => $activityLog->ip_address,
                'browser' => $activityLog->browser,
                'user_agent' => $activityLog->user_agent,
                'method' => $activityLog->method,
                'url' => $activityLog->url,
                'created_at' => $activityLog->created_at?->toIso8601String(),
                'created_at_human' => $activityLog->created_at?->diffForHumans(),
                'created_at_formatted' => $activityLog->created_at?->translatedFormat('d F Y, H:i:s WIB'),
            ],
        ]);
    }

    /**
     * Ekspor Log Aktivitas ke file CSV untuk kepatuhan & audit reporting.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $search = $request->input('search');
        $module = $request->input('module', 'all');
        $action = $request->input('action', 'all');
        $severity = $request->input('severity', 'all');
        $datePreset = $request->input('date_preset', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = ActivityLog::search($search)
            ->module($module)
            ->actionFilter($action)
            ->severity($severity)
            ->datePreset($datePreset, $startDate, $endDate)
            ->latest('id');

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="audit_logs_' . date('Y-m-d_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        ActivityLogger::info('export', 'system', 'Admin mengunduh ekspor CSV Log Aktivitas Sistem');

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            // Menulis UTF-8 BOM agar Excel menampilkan aksen & teks rapi
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID',
                'Waktu (WIB)',
                'Aktor',
                'Email Aktor',
                'Peran (Role)',
                'Aksi',
                'Modul',
                'Deskripsi',
                'Target Objek',
                'Tingkat Severity',
                'IP Address',
                'Browser & OS',
                'HTTP Method',
                'URL',
            ]);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->created_at?->format('Y-m-d H:i:s'),
                        $log->actor_name,
                        $log->actor_email,
                        $log->actor_role,
                        $log->action,
                        $log->module_label ?: $log->module,
                        $log->description,
                        $log->subject_label,
                        strtoupper($log->severity),
                        $log->ip_address,
                        $log->browser,
                        $log->method,
                        $log->url,
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Bersihkan / Prune log yang lebih lama dari X hari dengan verifikasi password admin.
     */
    public function prune(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'days' => ['required', 'integer', 'in:7,30,60,90,180,365'],
            'admin_password' => ['required', 'string'],
        ]);

        if (!Hash::check($validated['admin_password'], $request->user()->password)) {
            return back()->with('error', 'Verifikasi gagal: Password admin yang dimasukkan salah.');
        }

        $cutoff = Carbon::now()->subDays($validated['days']);
        $deletedCount = ActivityLog::where('created_at', '<', $cutoff)->delete();

        ActivityLogger::danger(
            action: 'prune',
            module: 'system',
            description: "Admin membersihkan {$deletedCount} log aktivitas yang lebih lama dari {$validated['days']} hari.",
            extra: [
                'deleted_count' => $deletedCount,
                'days_threshold' => $validated['days'],
                'cutoff_date' => $cutoff->toIso8601String(),
            ]
        );

        return back()->with('success', "Berhasil membersihkan {$deletedCount} data log aktivitas yang lebih lama dari {$validated['days']} hari.");
    }
}
