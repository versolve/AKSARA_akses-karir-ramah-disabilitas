<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiApiConfig;
use App\Models\AiApiLog;
use App\Services\Ai\AiModelCatalog;
use App\Services\Ai\AiRoutingManager;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AiManagementController extends Controller
{
    public function index(): Response
    {
        $configs = AiApiConfig::orderByDesc('is_primary')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(function (AiApiConfig $cfg) {
                return [
                    'id' => $cfg->id,
                    'name' => $cfg->name,
                    'provider' => $cfg->provider,
                    'model' => $cfg->model,
                    'enabled_models' => $cfg->effective_models,
                    'model_limits' => $cfg->model_limits,
                    'base_url' => $cfg->base_url,
                    'timeout' => $cfg->timeout,
                    'max_tokens' => $cfg->max_tokens,
                    'temperature' => (float) $cfg->temperature,
                    'is_active' => $cfg->is_active,
                    'is_primary' => $cfg->is_primary,
                    'rate_limit_rpm' => $cfg->rate_limit_rpm,
                    'tpm_limit' => $cfg->tpm_limit ?? 0,
                    'daily_request_limit' => $cfg->daily_request_limit,
                    'monthly_request_limit' => $cfg->monthly_request_limit,
                    'total_requests' => $cfg->total_requests,
                    'total_tokens' => $cfg->total_tokens,
                    'success_requests' => $cfg->success_requests,
                    'failed_requests' => $cfg->failed_requests,
                    'last_used_at' => $cfg->last_used_at?->toIso8601String(),
                    'last_health_status' => $cfg->last_health_status,
                    'last_health_check_at' => $cfg->last_health_check_at?->toIso8601String(),
                    'last_error_message' => $cfg->last_error_message,
                    'notes' => $cfg->notes,
                    'masked_api_key' => $cfg->masked_api_key,
                    'has_api_key' => !empty($cfg->api_key),
                    'today_requests' => $cfg->getTodayRequestsCount(),
                    'this_month_requests' => $cfg->getThisMonthRequestsCount(),
                    'is_daily_limit_exceeded' => $cfg->isDailyLimitExceeded(),
                    'is_monthly_limit_exceeded' => $cfg->isMonthlyLimitExceeded(),
                ];
            });

        $totalRequests = (int) AiApiConfig::sum('total_requests');
        $successRequests = (int) AiApiConfig::sum('success_requests');
        $failedRequests = (int) AiApiConfig::sum('failed_requests');
        $totalTokens = (int) AiApiConfig::sum('total_tokens');

        $todayRequests = AiApiLog::where('created_at', '>=', Carbon::today())->count();
        $thisMonthRequests = AiApiLog::where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        // Realtime Model Usage Calculations (RPM, TPM, RPD)
        $oneMinuteAgo = Carbon::now()->subMinute();
        $today = Carbon::today();

        // 1-minute window for active RPM and TPM
        $recentMinuteData = AiApiLog::where('created_at', '>=', $oneMinuteAgo)
            ->selectRaw('model, COUNT(*) as current_rpm, COALESCE(SUM(total_tokens), 0) as current_tpm')
            ->groupBy('model')
            ->get()
            ->keyBy('model');

        // Today's window for RPD and cumulative daily tokens
        $todayData = AiApiLog::where('created_at', '>=', $today)
            ->selectRaw('model, COUNT(*) as today_rpd, COALESCE(SUM(total_tokens), 0) as today_tokens')
            ->groupBy('model')
            ->get()
            ->keyBy('model');

        $allKnownModels = collect(AiModelCatalog::getKnownModels())->pluck('id')->merge(
            AiApiLog::select('model')->distinct()->pluck('model')
        )->unique();

        $modelRealtimeUsage = [];
        foreach ($allKnownModels as $mName) {
            $minRow = $recentMinuteData->get($mName);
            $todayRow = $todayData->get($mName);

            $modelRealtimeUsage[$mName] = [
                'current_rpm' => (int) ($minRow?->current_rpm ?? 0),
                'current_tpm' => (int) ($minRow?->current_tpm ?? 0),
                'today_rpd' => (int) ($todayRow?->today_rpd ?? 0),
                'today_tokens' => (int) ($todayRow?->today_tokens ?? 0),
            ];
        }

        $successRate = $totalRequests > 0
            ? round(($successRequests / $totalRequests) * 100, 1)
            : 100.0;

        $primaryConfig = $configs->firstWhere('is_primary', true);

        $recentLogs = AiApiLog::with(['user:id,name,email', 'config:id,name'])
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(function (AiApiLog $log) {
                return [
                    'id' => $log->id,
                    'config_name' => $log->config?->name ?? 'System Fallback',
                    'user_name' => $log->user?->name ?? 'Pengguna / Tamu',
                    'user_email' => $log->user?->email,
                    'action_type' => $log->action_type,
                    'provider' => $log->provider,
                    'model' => $log->model,
                    'prompt_tokens' => $log->prompt_tokens,
                    'completion_tokens' => $log->completion_tokens,
                    'total_tokens' => $log->total_tokens,
                    'response_time_ms' => $log->response_time_ms,
                    'status' => $log->status,
                    'error_message' => $log->error_message,
                    'created_at' => $log->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('admin/ai/index', [
            'configs' => $configs,
            'summary' => [
                'total_configs' => $configs->count(),
                'active_configs' => $configs->where('is_active', true)->count(),
                'primary_config' => $primaryConfig,
                'total_requests' => $totalRequests,
                'today_requests' => $todayRequests,
                'this_month_requests' => $thisMonthRequests,
                'success_requests' => $successRequests,
                'failed_requests' => $failedRequests,
                'success_rate' => $successRate,
                'total_tokens' => $totalTokens,
            ],
            'recentLogs' => $recentLogs,
            'catalog_models' => AiModelCatalog::getKnownModels(),
            'model_realtime_usage' => $modelRealtimeUsage,
            'routing_settings' => AiRoutingManager::getSettings(),
            'available_modes' => AiRoutingManager::getAvailableModes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'in:gemini,openai,anthropic,custom,mock'],
            'api_key' => ['nullable', 'string', 'max:2000'],
            'model' => ['required', 'string', 'max:100'],
            'enabled_models' => ['nullable', 'array'],
            'enabled_models.*' => ['string', 'max:100'],
            'base_url' => ['nullable', 'string', 'max:255'],
            'timeout' => ['nullable', 'integer', 'min:3', 'max:120'],
            'max_tokens' => ['nullable', 'integer', 'min:100', 'max:32000'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'rate_limit_rpm' => ['nullable', 'integer', 'min:0'],
            'tpm_limit' => ['nullable', 'integer', 'min:0'],
            'daily_request_limit' => ['nullable', 'integer', 'min:0'],
            'monthly_request_limit' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_primary' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! empty($validated['is_primary'])) {
            AiApiConfig::where('is_primary', true)->update(['is_primary' => false]);
            $validated['is_active'] = true;
        }

        // If this is the first config being added, make it primary
        if (AiApiConfig::count() === 0) {
            $validated['is_primary'] = true;
            $validated['is_active'] = true;
        }

        $enabledModels = $validated['enabled_models'] ?? [];
        if (!in_array($validated['model'], $enabledModels, true)) {
            array_unshift($enabledModels, $validated['model']);
        }
        $enabledModels = array_values(array_unique(array_filter($enabledModels)));

        $config = AiApiConfig::create([
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'api_key' => $validated['api_key'] ?? null,
            'model' => $validated['model'],
            'enabled_models' => $enabledModels,
            'base_url' => ($validated['base_url'] ?? null) ?: null,
            'timeout' => $validated['timeout'] ?? 20,
            'max_tokens' => $validated['max_tokens'] ?? 1500,
            'temperature' => $validated['temperature'] ?? 0.20,
            'rate_limit_rpm' => $validated['rate_limit_rpm'] ?? 60,
            'tpm_limit' => $validated['tpm_limit'] ?? 0,
            'daily_request_limit' => $validated['daily_request_limit'] ?? 1000,
            'monthly_request_limit' => $validated['monthly_request_limit'] ?? 30000,
            'is_active' => $validated['is_active'] ?? true,
            'is_primary' => $validated['is_primary'] ?? false,
            'notes' => $validated['notes'] ?? null,
            'last_health_status' => 'unknown',
        ]);

        return back()->with('success', 'Konfigurasi AI Provider "' . $config->name . '" berhasil ditambahkan.');
    }

    public function update(Request $request, AiApiConfig $config): RedirectResponse
    {
        $validated = $request->validate([
            'admin_password' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'in:gemini,openai,anthropic,custom,mock'],
            'api_key' => ['nullable', 'string', 'max:2000'],
            'model' => ['required', 'string', 'max:100'],
            'enabled_models' => ['nullable', 'array'],
            'enabled_models.*' => ['string', 'max:100'],
            'base_url' => ['nullable', 'string', 'max:255'],
            'timeout' => ['nullable', 'integer', 'min:3', 'max:120'],
            'max_tokens' => ['nullable', 'integer', 'min:100', 'max:32000'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'rate_limit_rpm' => ['nullable', 'integer', 'min:0'],
            'tpm_limit' => ['nullable', 'integer', 'min:0'],
            'daily_request_limit' => ['nullable', 'integer', 'min:0'],
            'monthly_request_limit' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_primary' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! Hash::check($request->admin_password, $request->user()->password)) {
            return back()->with('error', 'Password admin yang Anda masukkan salah. Perubahan konfigurasi ditolak.');
        }

        if (! empty($validated['is_primary']) && ! $config->is_primary) {
            AiApiConfig::where('id', '!=', $config->id)->where('is_primary', true)->update(['is_primary' => false]);
            $validated['is_active'] = true;
        }

        $enabledModels = $validated['enabled_models'] ?? $config->enabled_models ?? [];
        if (!in_array($validated['model'], $enabledModels, true)) {
            array_unshift($enabledModels, $validated['model']);
        }
        $enabledModels = array_values(array_unique(array_filter($enabledModels)));

        $updateData = [
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'model' => $validated['model'],
            'enabled_models' => $enabledModels,
            'base_url' => array_key_exists('base_url', $validated) ? ($validated['base_url'] ?: null) : $config->base_url,
            'timeout' => $validated['timeout'] ?? $config->timeout,
            'max_tokens' => $validated['max_tokens'] ?? $config->max_tokens,
            'temperature' => $validated['temperature'] ?? $config->temperature,
            'rate_limit_rpm' => $validated['rate_limit_rpm'] ?? $config->rate_limit_rpm,
            'tpm_limit' => $validated['tpm_limit'] ?? ($config->tpm_limit ?? 0),
            'daily_request_limit' => $validated['daily_request_limit'] ?? $config->daily_request_limit,
            'monthly_request_limit' => $validated['monthly_request_limit'] ?? $config->monthly_request_limit,
            'is_active' => $validated['is_active'] ?? $config->is_active,
            'is_primary' => $validated['is_primary'] ?? $config->is_primary,
            'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $config->notes,
        ];

        // Only update API key if explicitly provided
        if (array_key_exists('api_key', $validated) && $validated['api_key'] !== null && trim($validated['api_key']) !== '') {
            $updateData['api_key'] = $validated['api_key'];
        }

        $config->update($updateData);

        return back()->with('success', 'Konfigurasi AI Provider "' . $config->name . '" berhasil diperbarui.');
    }

    public function destroy(Request $request, AiApiConfig $config): RedirectResponse
    {
        $request->validate([
            'admin_password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->admin_password, $request->user()->password)) {
            return back()->with('error', 'Password admin yang Anda masukkan salah. Penghapusan konfigurasi ditolak.');
        }

        $name = $config->name;
        $wasPrimary = $config->is_primary;

        $config->delete();

        // If primary was deleted, promote another active config if exists
        if ($wasPrimary) {
            $nextConfig = AiApiConfig::where('is_active', true)->first();
            if ($nextConfig) {
                $nextConfig->update(['is_primary' => true]);
            }
        }

        return back()->with('success', 'Konfigurasi AI Provider "' . $name . '" telah dihapus.');
    }

    public function toggleActive(AiApiConfig $config): RedirectResponse
    {
        $newStatus = ! $config->is_active;

        if (! $newStatus && $config->is_primary) {
            // Cannot deactivate primary without another primary
            $nextConfig = AiApiConfig::where('id', '!=', $config->id)->where('is_active', true)->first();
            if ($nextConfig) {
                $nextConfig->update(['is_primary' => true]);
                $config->update(['is_active' => false, 'is_primary' => false]);
            } else {
                return back()->with('error', 'Tidak dapat menonaktifkan provider utama karena tidak ada provider aktif lainnya.');
            }
        } else {
            $config->update(['is_active' => $newStatus]);
        }

        $statusText = $newStatus ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', 'Provider "' . $config->name . '" berhasil ' . $statusText . '.');
    }

    public function setPrimary(AiApiConfig $config): RedirectResponse
    {
        AiApiConfig::where('is_primary', true)->update(['is_primary' => false]);

        $config->update([
            'is_primary' => true,
            'is_active' => true,
        ]);

        return back()->with('success', 'Provider "' . $config->name . '" sekarang dijadikan sebagai Provider Utama (Primary).');
    }

    public function resetStats(AiApiConfig $config): RedirectResponse
    {
        $config->update([
            'total_requests' => 0,
            'total_tokens' => 0,
            'success_requests' => 0,
            'failed_requests' => 0,
            'last_error_message' => null,
        ]);

        return back()->with('success', 'Statistik penggunaan untuk provider "' . $config->name . '" telah direset ke 0.');
    }

    public function clearLogs(): RedirectResponse
    {
        AiApiLog::truncate();
        return back()->with('success', 'Semua riwayat log panggilan AI berhasil dibersihkan.');
    }

    public function testConnection(Request $request, ?AiApiConfig $config = null): JsonResponse
    {
        $provider = $request->input('provider', $config?->provider ?? 'gemini');
        $apiKey = $request->input('api_key') ?: ($config?->api_key ?? '');
        $model = $request->input('model', $config?->model ?? 'gemini-1.5-flash');
        $baseUrl = $request->input('base_url', $config?->base_url);
        $timeout = (int) $request->input('timeout', $config?->timeout ?? 15);

        $startTime = microtime(true);

        try {
            if ($provider === 'mock') {
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
                if ($config) {
                    $config->update([
                        'last_health_status' => 'healthy',
                        'last_health_check_at' => now(),
                        'last_error_message' => null,
                    ]);
                }
                return response()->json([
                    'success' => true,
                    'latency_ms' => max($latencyMs, 10),
                    'message' => 'Koneksi Mock Provider lokal aktif dan berfungsi normal.',
                ]);
            }

            if (empty($apiKey)) {
                throw new \InvalidArgumentException('API Key belum diisi.');
            }

            if ($provider === 'gemini') {
                $url = ($baseUrl ?: 'https://generativelanguage.googleapis.com/v1beta') . "/models/{$model}:generateContent?key={$apiKey}";
                $response = Http::timeout($timeout)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, [
                        'contents' => [
                            ['parts' => [['text' => 'Ping test. Jawab singkat: OK']]],
                        ],
                        'generationConfig' => [
                            'maxOutputTokens' => 10,
                        ],
                    ]);

                if ($response->failed()) {
                    throw new \RuntimeException('Gemini API Error (' . $response->status() . '): ' . $response->body());
                }
            } elseif ($provider === 'openai' || $provider === 'custom') {
                $endpoint = rtrim($baseUrl ?: 'https://api.openai.com/v1', '/') . '/chat/completions';
                $response = Http::timeout($timeout)
                    ->withToken($apiKey)
                    ->post($endpoint, [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'user', 'content' => 'Ping test. Reply: OK'],
                        ],
                        'max_tokens' => 10,
                    ]);

                if ($response->failed()) {
                    throw new \RuntimeException('OpenAI/Custom API Error (' . $response->status() . '): ' . $response->body());
                }
            } else {
                throw new \InvalidArgumentException("Provider '{$provider}' belum didukung untuk direct ping.");
            }

            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            if ($config) {
                $config->update([
                    'last_health_status' => 'healthy',
                    'last_health_check_at' => now(),
                    'last_error_message' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'latency_ms' => $latencyMs,
                'message' => "Koneksi berhasil! Provider merespons dalam {$latencyMs} ms.",
            ]);
        } catch (Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            if ($config) {
                $config->update([
                    'last_health_status' => 'error',
                    'last_health_check_at' => now(),
                    'last_error_message' => $e->getMessage(),
                ]);
            }

            return response()->json([
                'success' => false,
                'latency_ms' => $latencyMs,
                'message' => 'Uji koneksi gagal: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function revealKey(Request $request, AiApiConfig $config): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password admin yang Anda masukkan salah. Akses ditolak.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'api_key' => $config->api_key,
        ]);
    }

    public function fetchModels(Request $request): JsonResponse
    {
        $provider = $request->input('provider', 'gemini');
        $apiKey = $request->input('api_key');
        $configId = $request->input('config_id');
        $baseUrl = $request->input('base_url') ?: 'https://generativelanguage.googleapis.com/v1beta';

        if ($configId && empty($apiKey)) {
            $existing = AiApiConfig::find($configId);
            if ($existing) {
                $apiKey = $existing->api_key;
                if (empty($provider)) {
                    $provider = $existing->provider;
                }
            }
        }

        if ($provider === 'gemini' && !empty($apiKey)) {
            try {
                $liveModels = AiModelCatalog::fetchLiveGeminiModels($apiKey, $baseUrl, 10);
                return response()->json([
                    'success' => true,
                    'is_live' => true,
                    'models' => $liveModels,
                    'message' => 'Berhasil mendeteksi ' . count($liveModels) . ' model aktif langsung dari API Key Google AI Studio!',
                ]);
            } catch (Throwable $e) {
                $catalog = collect(AiModelCatalog::getKnownModels())
                    ->where('provider', 'gemini')
                    ->values()
                    ->all();

                return response()->json([
                    'success' => false,
                    'is_live' => false,
                    'models' => $catalog,
                    'message' => 'Live deteksi API Key gagal (' . $e->getMessage() . '). Menampilkan daftar katalog resmi Google AI Studio.',
                ], 200);
            }
        }

        $catalog = collect(AiModelCatalog::getKnownModels())
            ->when($provider, fn ($col) => $col->where('provider', $provider))
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'is_live' => false,
            'models' => $catalog,
            'message' => 'Menampilkan daftar model resmi untuk ' . strtoupper($provider),
        ]);
    }

    public function switchModel(Request $request, AiApiConfig $config): RedirectResponse
    {
        $validated = $request->validate([
            'model' => ['required', 'string', 'max:100'],
        ]);

        $model = $validated['model'];
        $enabled = $config->effective_models;
        if (!in_array($model, $enabled, true)) {
            $enabled[] = $model;
        }

        $config->update([
            'model' => $model,
            'enabled_models' => array_values(array_unique($enabled)),
        ]);

        return back()->with('success', "Model aktif untuk \"{$config->name}\" berhasil diganti menjadi \"{$model}\".");
    }

    public function updateRoutingSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'string', 'in:manual,single_api_rotation,all_api_rotation,smart_failover,quota_saver'],
            'strategy' => ['required', 'string', 'in:failover,round_robin'],
            'allow_mock_fallback' => ['required', 'boolean'],
            'manual_config_id' => ['nullable', 'integer', 'exists:ai_api_configs,id'],
            'manual_model' => ['nullable', 'string', 'max:255'],
        ]);

        AiRoutingManager::updateSettings($validated);

        return back()->with('success', 'Pengaturan Mode Rotasi & Routing AI Engine berhasil diperbarui!');
    }
}
