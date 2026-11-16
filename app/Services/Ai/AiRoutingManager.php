<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class AiRoutingManager
{
    // Mode Pilihan Rotasi & Routing AI
    public const MODE_MANUAL = 'manual';                         // Mode 1: Hanya 1 model tetap (no failover)
    public const MODE_SINGLE_API_ROTATION = 'single_api_rotation'; // Mode 2: Multi-model dalam 1 API Key
    public const MODE_ALL_API_ROTATION = 'all_api_rotation';       // Mode 3: Rotasi lintas semua API Key & Provider
    public const MODE_SMART_FAILOVER = 'smart_failover';           // Mode 4 (Saran): Adaptive Failover cerdas
    public const MODE_QUOTA_SAVER = 'quota_saver';                 // Mode 5 (Saran): Utamakan kuota RPM tertinggi

    // Strategi Rotasi
    public const STRATEGY_FAILOVER = 'failover';       // Pindah hanya saat rate-limit 429 atau kuota habis
    public const STRATEGY_ROUND_ROBIN = 'round_robin'; // Bergantian seimbang per request (load-balanced)

    /**
     * Path file JSON konfigurasi routing sistem.
     */
    protected static function getSettingsPath(): string
    {
        return storage_path('app/ai_routing_settings.json');
    }

    /**
     * Konfigurasi default sistem.
     */
    public static function getDefaultSettings(): array
    {
        return [
            'mode' => self::MODE_SINGLE_API_ROTATION,
            'strategy' => self::STRATEGY_FAILOVER,
            'allow_mock_fallback' => true,
            'manual_config_id' => null,
            'manual_model' => null,
            'updated_at' => null,
        ];
    }

    /**
     * Ambil pengaturan routing saat ini (dengan layer caching instan).
     */
    public static function getSettings(): array
    {
        return Cache::remember('ai_routing_settings', 60, function () {
            $path = self::getSettingsPath();
            $defaults = self::getDefaultSettings();

            if (! File::exists($path)) {
                return $defaults;
            }

            try {
                $content = File::get($path);
                $decoded = json_decode($content, true);
                if (! is_array($decoded)) {
                    return $defaults;
                }
                return array_merge($defaults, $decoded);
            } catch (\Throwable) {
                return $defaults;
            }
        });
    }

    /**
     * Simpan pengaturan routing baru.
     */
    public static function updateSettings(array $newSettings): array
    {
        $current = self::getSettings();
        $merged = array_merge($current, $newSettings);
        $merged['updated_at'] = now()->toIso8601String();

        $path = self::getSettingsPath();
        $dir = dirname($path);
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        File::put($path, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        Cache::forget('ai_routing_settings');

        return $merged;
    }

    /**
     * Mendapatkan daftar mode beserta deskripsi lengkap & rekomendasi.
     */
    public static function getAvailableModes(): array
    {
        return [
            [
                'id' => self::MODE_MANUAL,
                'name' => '1. Mode Manual (Single Model)',
                'short_title' => 'Manual (1 Model)',
                'badge' => 'Fixed Single',
                'description' => 'Hanya menggunakan 1 model AI spesifik yang dipilih admin. Tidak ada rotasi atau perpindahan otomatis ke model lain.',
                'best_for' => 'Pengujian akurasi, konsistensi hasil prompt, atau benchmarking 1 model tertentu.',
                'pros' => 'Hasil sangat konsisten dan terprediksi.',
                'cons' => 'Jika model terkena limit 15 RPM atau kuota habis, tidak ada failover otomatis ke model lain.',
            ],
            [
                'id' => self::MODE_SINGLE_API_ROTATION,
                'name' => '2. Mode Rotasi 1 API (Multi-Model 1 Key)',
                'short_title' => 'Rotasi 1 API',
                'badge' => 'Default Rekomendasi 1 Akun',
                'description' => 'Memaksimalkan seluruh model gratis yang dinaungi oleh 1 API Key (Gemini 2.0 Flash, Flash Lite, 1.5 Flash, 1.5 Flash 8B).',
                'best_for' => 'Admin yang memiliki 1 API Key Google AI Studio dan ingin kuota kumulatif hingga 6.000 RPD gratis.',
                'pros' => 'Tidak perlu banyak API key, kuota per hari berlipat ganda, auto-failover jika 1 model habis.',
                'cons' => 'Kapasitas dibatasi oleh batas akun tunggal tersebut.',
            ],
            [
                'id' => self::MODE_ALL_API_ROTATION,
                'name' => '3. Mode Rotasi Semua API (Multi-Account Pool)',
                'short_title' => 'Rotasi Semua API',
                'badge' => 'Enterprise High-Availability',
                'description' => 'Menggabungkan SEMUA API Key / Provider aktif ke dalam satu load balancer pool (misal: Gemini Akun 1, Gemini Akun 2, OpenAI).',
                'best_for' => 'Traffic produksi skala menengah/tinggi yang membutuhkan ketahanan tanpa henti (High Availability).',
                'pros' => 'Toleransi kegagalan maksimal; jika Akun 1 limit, otomatis pindah ke Akun 2 lalu OpenAI.',
                'cons' => 'Memerlukan manajemen lebih dari 1 API Key yang aktif.',
            ],
            [
                'id' => self::MODE_SMART_FAILOVER,
                'name' => '4. Smart Adaptive Failover (Saran Utama)',
                'short_title' => 'Smart Adaptive',
                'badge' => 'Saran Terbaik',
                'description' => 'Mengutamakan model terbaik terlebih dahulu. Rotasi HANYA dieksekusi jika terjadi HTTP 429, limit kuota, atau server timeout.',
                'best_for' => 'Kombinasi kualitas output tertinggi dengan keandalan 99.9% uptime tanpa rotasi acak.',
                'pros' => 'Kualitas jawaban selalu terbaik selama kuota masih ada, tetap aman saat traffic melonjak.',
                'cons' => 'Model sekunder hanya dipakai sebagai tameng saat kondisi darurat.',
            ],
            [
                'id' => self::MODE_QUOTA_SAVER,
                'name' => '5. Mode Hemat Kuota & Kecepatan (High-Throughput)',
                'short_title' => 'Hemat Kuota / Cepat',
                'badge' => 'Saran Traffic Tinggi',
                'description' => 'Memprioritaskan model dengan kuota RPM tertinggi (Flash Lite 30 RPM) untuk meminimalkan antrean.',
                'best_for' => 'Masa seleksi massal ketika ribuan pelamar menganalisis CV dan lowongan secara serentak.',
                'pros' => 'Sangat tahan terhadap rate limit per menit (RPM), latensi super cepat (< 1 detik).',
                'cons' => 'Model penalaran kompleks kelas pro ditaruh di urutan terakhir.',
            ],
        ];
    }
}
