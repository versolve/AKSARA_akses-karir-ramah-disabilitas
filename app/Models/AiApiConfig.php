<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiApiConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'api_key',
        'model',
        'enabled_models',
        'model_limits',
        'base_url',
        'timeout',
        'max_tokens',
        'temperature',
        'is_active',
        'is_primary',
        'rate_limit_rpm',
        'tpm_limit',
        'daily_request_limit',
        'monthly_request_limit',
        'total_requests',
        'total_tokens',
        'success_requests',
        'failed_requests',
        'last_used_at',
        'last_health_status',
        'last_health_check_at',
        'last_error_message',
        'notes',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'is_active' => 'boolean',
        'is_primary' => 'boolean',
        'enabled_models' => 'array',
        'model_limits' => 'array',
        'timeout' => 'integer',
        'max_tokens' => 'integer',
        'temperature' => 'float',
        'rate_limit_rpm' => 'integer',
        'tpm_limit' => 'integer',
        'daily_request_limit' => 'integer',
        'monthly_request_limit' => 'integer',
        'total_requests' => 'integer',
        'total_tokens' => 'integer',
        'success_requests' => 'integer',
        'failed_requests' => 'integer',
        'last_used_at' => 'datetime',
        'last_health_check_at' => 'datetime',
    ];

    protected $appends = [
        'masked_api_key',
        'effective_models',
    ];

    public function getEffectiveModelsAttribute(): array
    {
        $list = is_array($this->enabled_models) ? $this->enabled_models : [];
        if (!empty($this->model) && !in_array($this->model, $list, true)) {
            array_unshift($list, $this->model);
        }
        if (empty($list) && !empty($this->model)) {
            $list = [$this->model];
        }
        return array_values(array_unique($list));
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AiApiLog::class, 'ai_api_config_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopePrimary(Builder $query): Builder
    {
        return $query->where('is_primary', true);
    }

    public function getMaskedApiKeyAttribute(): string
    {
        if ($this->provider === 'mock') {
            return 'Mock Provider (No Key Required)';
        }

        $rawKey = $this->api_key;
        if (empty($rawKey)) {
            return 'Belum diatur';
        }

        $length = strlen($rawKey);
        if ($length <= 8) {
            return str_repeat('•', $length);
        }

        return substr($rawKey, 0, 6) . '••••••••' . substr($rawKey, -4);
    }

    public function getTodayRequestsCount(): int
    {
        return $this->logs()
            ->where('created_at', '>=', Carbon::today())
            ->count();
    }

    public function getThisMonthRequestsCount(): int
    {
        return $this->logs()
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->count();
    }

    public function isDailyLimitExceeded(): bool
    {
        if ($this->daily_request_limit <= 0) {
            return false;
        }

        return $this->getTodayRequestsCount() >= $this->daily_request_limit;
    }

    public function isMonthlyLimitExceeded(): bool
    {
        if ($this->monthly_request_limit <= 0) {
            return false;
        }

        return $this->getThisMonthRequestsCount() >= $this->monthly_request_limit;
    }

    public function recordUsage(
        string $actionType,
        bool $success,
        int $tokens = 0,
        int $responseTimeMs = 0,
        ?string $errorMessage = null,
        ?int $userId = null,
        ?string $ipAddress = null,
        ?string $model = null
    ): AiApiLog {
        $this->increment('total_requests');
        if ($tokens > 0) {
            $this->increment('total_tokens', $tokens);
        }

        if ($success) {
            $this->increment('success_requests');
        } else {
            $this->increment('failed_requests');
        }

        $this->forceFill([
            'last_used_at' => Carbon::now(),
            'last_error_message' => $success ? null : $errorMessage,
        ])->save();

        return $this->logs()->create([
            'user_id' => $userId,
            'action_type' => $actionType,
            'provider' => $this->provider,
            'model' => $model ?: ($this->model ?: 'unknown'),
            'prompt_tokens' => (int) ($tokens * 0.4),
            'completion_tokens' => (int) ($tokens * 0.6),
            'total_tokens' => $tokens,
            'response_time_ms' => $responseTimeMs,
            'status' => $success ? 'success' : 'failed',
            'error_message' => $errorMessage,
            'ip_address' => $ipAddress,
        ]);
    }
}
