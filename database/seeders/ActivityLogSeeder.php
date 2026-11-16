<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\AiApiConfig;
use App\Models\User;
use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        if (ActivityLog::count() > 0) {
            return;
        }

        $admin = User::where('role', 'admin')->first() ?: User::first();
        $adminId = $admin?->id;
        $adminName = $admin?->name ?? 'Admin Super';
        $adminEmail = $admin?->email ?? 'admin@profabel.id';

        $now = Carbon::now();

        $logs = [
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'system_config',
                'module' => 'ai_engine',
                'module_label' => 'AI Management',
                'description' => 'Admin memperbarui mode rotasi AI menjadi "Smart Adaptive Failover (Rekomendasi)"',
                'subject_type' => 'AiRoutingSettings',
                'subject_id' => 1,
                'subject_label' => 'Mode Rotasi: Smart Adaptive Failover',
                'properties' => [
                    'diff' => [
                        'mode' => ['old' => 'manual', 'new' => 'smart_failover'],
                        'strategy' => ['old' => 'failover', 'new' => 'round_robin'],
                    ],
                    'extra' => ['source' => 'Admin Dashboard', 'client' => 'Web Browser'],
                ],
                'severity' => 'warning',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/ai-management/routing-settings',
                'created_at' => $now->copy()->subMinutes(8),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'reveal_key',
                'module' => 'ai_engine',
                'module_label' => 'AI Management',
                'description' => 'Admin memverifikasi password dan menyalin API Key "Google Gemini (Production Primary)"',
                'subject_type' => 'AiApiConfig',
                'subject_id' => 1,
                'subject_label' => 'API Key: Google Gemini (Production Primary)',
                'properties' => [
                    'extra' => [
                        'action' => 'copy',
                        'verified_by_password' => true,
                        'key_masked' => 'AQ.Ab8••••••••Atxg',
                    ],
                ],
                'severity' => 'danger',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/ai-management/1/reveal-key',
                'created_at' => $now->copy()->subMinutes(25),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'switch_model',
                'module' => 'ai_engine',
                'module_label' => 'AI Management',
                'description' => 'Admin mengganti model default aktif menjadi "gemini-2.0-flash"',
                'subject_type' => 'AiApiConfig',
                'subject_id' => 1,
                'subject_label' => 'Model Default: gemini-2.0-flash',
                'properties' => [
                    'diff' => [
                        'model' => ['old' => 'gemini-1.5-flash', 'new' => 'gemini-2.0-flash'],
                    ],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/ai-management/1/switch-model',
                'created_at' => $now->copy()->subHours(1)->subMinutes(12),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'approve',
                'module' => 'companies',
                'module_label' => 'Verifikasi Perusahaan',
                'description' => 'Admin menyetujui dokumen legalitas & verifikasi akun PT Inklusi Digital Nusantara',
                'subject_type' => 'CompanyProfile',
                'subject_id' => 2,
                'subject_label' => 'Perusahaan: PT Inklusi Digital Nusantara',
                'properties' => [
                    'diff' => [
                        'is_approved' => ['old' => false, 'new' => true],
                        'is_verified' => ['old' => false, 'new' => true],
                    ],
                    'extra' => ['nib' => '1234567890123', 'verifier' => $adminName],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/companies/verification/2/approve',
                'created_at' => $now->copy()->subHours(2),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'update',
                'module' => 'vacancies',
                'module_label' => 'Kelola Lowongan',
                'description' => 'Admin memoderasi dan memperbarui kuota aksesibilitas lowongan "Frontend Developer Inklusif"',
                'subject_type' => 'Vacancy',
                'subject_id' => 1,
                'subject_label' => 'Lowongan: Frontend Developer Inklusif',
                'properties' => [
                    'diff' => [
                        'status' => ['old' => 'draft', 'new' => 'active'],
                        'screen_reader_friendly' => ['old' => false, 'new' => true],
                    ],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'PUT',
                'url' => 'http://localhost:8000/admin/vacancies/1',
                'created_at' => $now->copy()->subHours(3)->subMinutes(40),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'update',
                'module' => 'settings',
                'module_label' => 'Pengaturan Sistem',
                'description' => 'Admin memperbarui konfigurasi email notifikasi dan preferensi tema aplikasi',
                'subject_type' => 'SystemSettings',
                'subject_id' => 1,
                'subject_label' => 'Pengaturan Platform: Profabel',
                'properties' => [
                    'diff' => [
                        'email_verification' => ['old' => false, 'new' => true],
                        'theme_color' => ['old' => '#0A57C2', 'new' => '#1769E0'],
                    ],
                ],
                'severity' => 'warning',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/settings',
                'created_at' => $now->copy()->subHours(5),
            ],
            [
                'user_id' => null,
                'actor_name' => 'Sistem Otomatis (Cron)',
                'actor_email' => null,
                'actor_role' => 'system',
                'action' => 'health_check',
                'module' => 'ai_engine',
                'module_label' => 'AI Management',
                'description' => 'Pemeriksaan otomatis ping kesehatan berkala AI Provider (Hasil: Sehat, latensi 420ms)',
                'subject_type' => 'AiApiConfig',
                'subject_id' => 1,
                'subject_label' => 'Provider: Google Gemini API',
                'properties' => [
                    'extra' => ['latency_ms' => 420, 'http_status' => 200, 'status' => 'healthy'],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Internal CLI / API',
                'browser' => 'Internal CLI / API',
                'method' => 'POST',
                'url' => 'http://localhost:8000/internal/health-check',
                'created_at' => $now->copy()->subHours(6),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'login',
                'module' => 'auth',
                'module_label' => 'Autentikasi & Keamanan',
                'description' => 'Admin berhasil melakukan autentikasi login ke panel kontrol administrator',
                'subject_type' => 'User',
                'subject_id' => $adminId,
                'subject_label' => "Pengguna: {$adminName}",
                'properties' => [
                    'extra' => ['login_method' => 'password', 'ip' => '127.0.0.1'],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/login',
                'created_at' => $now->copy()->subHours(7),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'create',
                'module' => 'messages',
                'module_label' => 'Pesan & Pengumuman',
                'description' => 'Admin menyiarkan pengumuman massal: "Update Fitur AI Career Assistant Inklusif"',
                'subject_type' => 'Announcement',
                'subject_id' => 1,
                'subject_label' => 'Pengumuman: Update Fitur AI Career Assistant',
                'properties' => [
                    'extra' => ['target_audience' => 'all_users', 'sent_count' => 142],
                ],
                'severity' => 'info',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'POST',
                'url' => 'http://localhost:8000/admin/messages/announcement',
                'created_at' => $now->copy()->subDays(1),
            ],
            [
                'user_id' => $adminId,
                'actor_name' => $adminName,
                'actor_email' => $adminEmail,
                'actor_role' => 'admin',
                'action' => 'delete',
                'module' => 'vacancies',
                'module_label' => 'Kelola Lowongan',
                'description' => 'Admin menghapus permanen lowongan kadaluwarsa "Admin Data Entry Magang #104"',
                'subject_type' => 'Vacancy',
                'subject_id' => 104,
                'subject_label' => 'Lowongan: Admin Data Entry Magang #104',
                'properties' => [
                    'old' => [
                        'title' => 'Admin Data Entry Magang',
                        'company' => 'PT Mitra Sejahtera',
                        'status' => 'closed',
                    ],
                    'extra' => ['reason' => 'Permintaan perusahaan dan batas waktu berakhir'],
                ],
                'severity' => 'danger',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
                'browser' => 'Google Chrome on Windows 11/10',
                'method' => 'DELETE',
                'url' => 'http://localhost:8000/admin/vacancies/104',
                'created_at' => $now->copy()->subDays(2),
            ],
        ];

        foreach ($logs as $log) {
            ActivityLog::create($log);
        }
    }
}
