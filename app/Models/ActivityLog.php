<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'actor_name',
        'actor_email',
        'actor_role',
        'action',
        'module',
        'module_label',
        'description',
        'subject_type',
        'subject_id',
        'subject_label',
        'properties',
        'severity',
        'ip_address',
        'user_agent',
        'browser',
        'method',
        'url',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope untuk pencarian global kata kunci
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $clean = trim($term);

        return $query->where(function (Builder $q) use ($clean) {
            $q->where('description', 'like', "%{$clean}%")
                ->orWhere('actor_name', 'like', "%{$clean}%")
                ->orWhere('actor_email', 'like', "%{$clean}%")
                ->orWhere('subject_label', 'like', "%{$clean}%")
                ->orWhere('ip_address', 'like', "%{$clean}%")
                ->orWhere('action', 'like', "%{$clean}%")
                ->orWhere('module', 'like', "%{$clean}%");
        });
    }

    /**
     * Scope filter berdasarkan modul
     */
    public function scopeModule(Builder $query, ?string $module): Builder
    {
        if (empty($module) || $module === 'all') {
            return $query;
        }

        return $query->where('module', $module);
    }

    /**
     * Scope filter berdasarkan aksi
     */
    public function scopeActionFilter(Builder $query, ?string $action): Builder
    {
        if (empty($action) || $action === 'all') {
            return $query;
        }

        return $query->where('action', $action);
    }

    /**
     * Scope filter berdasarkan tingkat severity
     */
    public function scopeSeverity(Builder $query, ?string $severity): Builder
    {
        if (empty($severity) || $severity === 'all') {
            return $query;
        }

        return $query->where('severity', $severity);
    }

    /**
     * Scope filter rentang waktu
     */
    public function scopeDatePreset(Builder $query, ?string $preset, ?string $from = null, ?string $to = null): Builder
    {
        if (empty($preset) || $preset === 'all') {
            return $query;
        }

        return match ($preset) {
            'today' => $query->where('created_at', '>=', Carbon::today()),
            'yesterday' => $query->whereBetween('created_at', [Carbon::yesterday()->startOfDay(), Carbon::yesterday()->endOfDay()]),
            '7d' => $query->where('created_at', '>=', Carbon::now()->subDays(7)),
            '30d' => $query->where('created_at', '>=', Carbon::now()->subDays(30)),
            'this_month' => $query->where('created_at', '>=', Carbon::now()->startOfMonth()),
            'custom' => $from && $to
                ? $query->whereBetween('created_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()])
                : $query,
            default => $query,
        };
    }
}
