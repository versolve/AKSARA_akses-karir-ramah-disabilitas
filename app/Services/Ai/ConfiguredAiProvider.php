<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use App\Models\AiApiConfig;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class ConfiguredAiProvider implements AiProviderInterface
{
    private MockAiProvider $mockFallback;

    public function __construct()
    {
        $this->mockFallback = new MockAiProvider();
    }

    public function matchJob(JobSeekerProfile $seeker, Vacancy $vacancy): array
    {
        return $this->executeRoutingOperation(
            'job_match',
            fn (AiProviderInterface $driver) => $driver->matchJob($seeker, $vacancy),
            estimatedTokens: 650,
            fallbackFn: fn () => $this->mockFallback->matchJob($seeker, $vacancy)
        );
    }

    public function analyzeSkillGap(array $seekerSkills, array $vacancySkills): array
    {
        return $this->executeRoutingOperation(
            'skill_gap',
            fn (AiProviderInterface $driver) => $driver->analyzeSkillGap($seekerSkills, $vacancySkills),
            estimatedTokens: 420,
            fallbackFn: fn () => $this->mockFallback->analyzeSkillGap($seekerSkills, $vacancySkills)
        );
    }

    public function reviewCvAts(string $cvText, array $targetSkills = []): array
    {
        $estimatedTokens = (int) (strlen($cvText) / 4) + 600;

        return $this->executeRoutingOperation(
            'cv_review',
            fn (AiProviderInterface $driver) => $driver->reviewCvAts($cvText, $targetSkills),
            estimatedTokens: $estimatedTokens,
            fallbackFn: fn () => $this->mockFallback->reviewCvAts($cvText, $targetSkills)
        );
    }

    /**
     * Eksekusi operasi AI berdasarkan Mode Rotasi & Routing yang dipilih Admin:
     * - Mode 1: Manual (Hanya 1 Model Tetap, no rotation)
     * - Mode 2: Rotasi 1 API (Multi-Model per API Key)
     * - Mode 3: Rotasi Semua API (Multi-Account / Multi-Provider Pool)
     * - Mode 4 (Saran): Smart Adaptive Failover (Rekomendasi Terbaik)
     * - Mode 5 (Saran): Quota Saver & Kecepatan Tinggi (High-Throughput)
     */
    private function executeRoutingOperation(
        string $actionType,
        callable $operation,
        int $estimatedTokens,
        callable $fallbackFn
    ): array {
        $routing = AiRoutingManager::getSettings();
        $candidates = $this->resolveCandidates($routing);

        // Jika tidak ada kandidat aktif sama sekali
        if (empty($candidates)) {
            $primary = $this->resolveActiveConfig();
            $this->logUsage($primary, $actionType, false, 0, 15, 'Tidak ada API Key atau model AI aktif yang dikonfigurasi oleh Admin.');
            if ($allowMock) {
                return $fallbackFn();
            }
            throw new \RuntimeException('Tidak ada API Key atau model AI aktif yang dikonfigurasi oleh Admin di panel Admin.');
        }

        $mode = $routing['mode'] ?? AiRoutingManager::MODE_SINGLE_API_ROTATION;
        $allowMock = (bool) ($routing['allow_mock_fallback'] ?? true);
        $lastException = null;

        foreach ($candidates as $index => $candidate) {
            /** @var AiApiConfig $config */
            $config = $candidate['config'];
            $modelCandidate = $candidate['model'];

            // Jika config adalah Mock Offline Engine
            if ($config->provider === 'mock') {
                $this->logUsage($config, $actionType, true, $estimatedTokens, 15, null, $modelCandidate);
                return $fallbackFn();
            }

            $driver = $this->makeDriver($config, $modelCandidate);
            $startTime = microtime(true);

            try {
                $result = $operation($driver);
                $durationMs = (int) round((microtime(true) - $startTime) * 1000);

                // Rekam penggunaan pada model & provider yang sukses
                $this->logUsage($config, $actionType, true, $estimatedTokens, $durationMs, null, $modelCandidate);

                return $result;
            } catch (Throwable $e) {
                $lastException = $e;
                $durationMs = (int) round((microtime(true) - $startTime) * 1000);
                $errMsg = $e->getMessage();

                Log::warning("AI {$actionType} error on model [{$modelCandidate}] (Config: {$config->name}): {$errMsg}");

                // PENTING: Mode Manual secara ketat TIDAK melakukan rotasi ke model lain
                if ($mode === AiRoutingManager::MODE_MANUAL) {
                    break;
                }

                // Cek apakah masih ada kandidat model berikutnya untuk failover
                if (isset($candidates[$index + 1])) {
                    $next = $candidates[$index + 1];
                    Log::info("Failing over dari model [{$modelCandidate}] ({$config->name}) ke [{$next['model']}] ({$next['config']->name}).");
                    continue;
                }

                break;
            }
        }

        $finalErrMsg = $lastException ? $lastException->getMessage() : 'All configured AI candidates failed.';
        $primary = $candidates[0]['config'] ?? $this->resolveActiveConfig();
        $this->logUsage($primary, $actionType, false, 0, 10, $finalErrMsg);

        if ($allowMock) {
            Log::warning("Seluruh model AI eksternal gagal. Menggunakan local mock fallback (Zero-Downtime Guard). Alasan: {$finalErrMsg}");
            return $fallbackFn();
        }

        throw $lastException ?: new \RuntimeException($finalErrMsg);
    }

    /**
     * Membangun daftar pasangan [config, model] kandidat berdasarkan mode & strategi rotasi.
     */
    private function resolveCandidates(array $routing): array
    {
        $mode = $routing['mode'] ?? AiRoutingManager::MODE_SINGLE_API_ROTATION;
        $strategy = $routing['strategy'] ?? AiRoutingManager::STRATEGY_FAILOVER;

        // 1. Mode Manual (Hanya 1 AI Model Spesifik)
        if ($mode === AiRoutingManager::MODE_MANUAL) {
            $config = null;
            if (! empty($routing['manual_config_id'])) {
                $config = AiApiConfig::find($routing['manual_config_id']);
            }
            if (! $config || ! $config->is_active) {
                $config = $this->resolveActiveConfig();
            }
            if (! $config) {
                return [];
            }

            $model = $routing['manual_model'] ?: ($config->model ?: 'gemini-1.5-flash');
            return [['config' => $config, 'model' => $model]];
        }

        // 3. Mode Rotasi Semua API (Multi-Account / Multi-Provider Pool)
        if ($mode === AiRoutingManager::MODE_ALL_API_ROTATION) {
            $activeConfigs = AiApiConfig::active()->orderByDesc('is_primary')->get();
            $candidates = [];

            foreach ($activeConfigs as $cfg) {
                if ($cfg->isDailyLimitExceeded() || $cfg->isMonthlyLimitExceeded()) {
                    continue;
                }
                $models = $cfg->effective_models;
                if (empty($models)) {
                    $models = [$cfg->model ?: 'gemini-1.5-flash'];
                }
                foreach ($models as $m) {
                    $candidates[] = ['config' => $cfg, 'model' => $m];
                }
            }

            if ($strategy === AiRoutingManager::STRATEGY_ROUND_ROBIN && count($candidates) > 1) {
                $offset = (int) (Cache::increment('ai_rr_all_offset') % count($candidates));
                $candidates = array_merge(array_slice($candidates, $offset), array_slice($candidates, 0, $offset));
            }

            return $candidates;
        }

        // 4. Mode Smart Adaptive Failover (Rekomendasi Utama)
        if ($mode === AiRoutingManager::MODE_SMART_FAILOVER) {
            $candidates = [];
            $primary = $this->resolveActiveConfig();
            if ($primary) {
                $models = $primary->effective_models;
                if (empty($models)) {
                    $models = [$primary->model ?: 'gemini-1.5-flash'];
                }
                foreach ($models as $m) {
                    $candidates[] = ['config' => $primary, 'model' => $m];
                }
            }

            $otherConfigs = AiApiConfig::active()
                ->where('id', '!=', $primary?->id ?? 0)
                ->orderByDesc('is_primary')
                ->get();

            foreach ($otherConfigs as $cfg) {
                if ($cfg->isDailyLimitExceeded() || $cfg->isMonthlyLimitExceeded()) {
                    continue;
                }
                $models = $cfg->effective_models;
                if (empty($models)) {
                    $models = [$cfg->model ?: 'gemini-1.5-flash'];
                }
                foreach ($models as $m) {
                    $candidates[] = ['config' => $cfg, 'model' => $m];
                }
            }

            return $candidates;
        }

        // 5. Mode Quota Saver / High-Throughput (Prioritaskan RPM tertinggi)
        if ($mode === AiRoutingManager::MODE_QUOTA_SAVER) {
            $candidates = [];
            $activeConfigs = AiApiConfig::active()->get();

            foreach ($activeConfigs as $cfg) {
                if ($cfg->isDailyLimitExceeded() || $cfg->isMonthlyLimitExceeded()) {
                    continue;
                }
                $models = $cfg->effective_models;
                if (empty($models)) {
                    $models = [$cfg->model ?: 'gemini-1.5-flash'];
                }
                foreach ($models as $m) {
                    $candidates[] = ['config' => $cfg, 'model' => $m];
                }
            }

            usort($candidates, function ($a, $b) {
                $metaA = AiModelCatalog::getModel($a['model']);
                $metaB = AiModelCatalog::getModel($b['model']);
                $rpmA = $metaA['rpm'] ?? 15;
                $rpmB = $metaB['rpm'] ?? 15;
                return $rpmB <=> $rpmA;
            });

            return $candidates;
        }

        // 2. Mode Rotasi 1 API (Default: Multi-Model per API Key)
        $config = $this->resolveActiveConfig();
        if (! $config) {
            return [];
        }

        $models = $config->effective_models;
        if (empty($models)) {
            $models = [$config->model ?: 'gemini-1.5-flash'];
        }

        if ($strategy === AiRoutingManager::STRATEGY_ROUND_ROBIN && count($models) > 1) {
            $offset = (int) (Cache::increment('ai_rr_single_offset') % count($models));
            $models = array_merge(array_slice($models, $offset), array_slice($models, 0, $offset));
        }

        $candidates = [];
        foreach ($models as $m) {
            $candidates[] = ['config' => $config, 'model' => $m];
        }

        return $candidates;
    }

    private function resolveActiveConfig(): ?AiApiConfig
    {
        try {
            $primary = AiApiConfig::active()->primary()->first();

            if ($primary && ! $primary->isDailyLimitExceeded() && ! $primary->isMonthlyLimitExceeded()) {
                return $primary;
            }

            // If primary is over limit or missing, try any active non-overlimit config
            $activeConfigs = AiApiConfig::active()->get();
            foreach ($activeConfigs as $cfg) {
                if (! $cfg->isDailyLimitExceeded() && ! $cfg->isMonthlyLimitExceeded()) {
                    return $cfg;
                }
            }

            return $primary ?? $activeConfigs->first();
        } catch (Throwable $e) {
            Log::warning('Could not resolve AiApiConfig from database: ' . $e->getMessage());
            return null;
        }
    }

    private function makeDriver(AiApiConfig $config, ?string $overrideModel = null): AiProviderInterface
    {
        $activeModel = $overrideModel ?: ($config->model ?: 'gemini-1.5-flash');

        return match ($config->provider) {
            'gemini' => new GeminiAiProvider(
                apiKey: (string) $config->api_key,
                model: $activeModel,
                baseUrl: $config->base_url ?: 'https://generativelanguage.googleapis.com/v1beta',
                timeout: $config->timeout ?: 20,
                temperature: (float) $config->temperature,
                maxTokens: $config->max_tokens ?: 1500,
                throwOnError: true
            ),
            'openai', 'custom' => new OpenAiProvider(
                apiKey: (string) $config->api_key,
                model: $activeModel,
                baseUrl: $config->base_url ?: 'https://api.openai.com/v1',
                timeout: $config->timeout ?: 20,
                temperature: (float) $config->temperature,
                maxTokens: $config->max_tokens ?: 1500,
                throwOnError: true
            ),
            default => $this->mockFallback,
        };
    }

    private function logUsage(
        ?AiApiConfig $config,
        string $actionType,
        bool $success,
        int $tokens,
        int $durationMs,
        ?string $errorMessage = null,
        ?string $usedModel = null
    ): void {
        if (! $config) {
            return;
        }

        try {
            $userId = Auth::id();
            $ip = request()?->ip();
            $config->recordUsage($actionType, $success, $tokens, $durationMs, $errorMessage, $userId, $ip, $usedModel);
        } catch (Throwable $e) {
            Log::warning('Failed recording AI usage log: ' . $e->getMessage());
        }
    }
}
