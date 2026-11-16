<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'title',
        'subtitle',
        'type',
        'image_path',
        'image_url',
        'image_position',
        'image_scale',
        'link_url',
        'link_target',
        'cta_text',
        'search_placeholder',
        'bg_gradient',
        'text_color',
        'target_role',
        'order',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'image_scale' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected $appends = [
        'display_image_url',
    ];

    /**
     * Resolusi URL gambar/GIF (baik dari upload storage lokal maupun URL eksternal).
     */
    public function getDisplayImageUrlAttribute(): ?string
    {
        if ($this->image_path) {
            // Mendukung storage symlink
            return asset('storage/' . $this->image_path);
        }

        if ($this->image_url) {
            return $this->image_url;
        }

        return null;
    }

    /**
     * Scope hanya banner yang sedang aktif dan masih dalam rentang jadwal.
     */
    public function scopeActive(Builder $query): Builder
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            });
    }

    /**
     * Scope berdasarkan target audiens / role.
     */
    public function scopeForRole(Builder $query, string $role = 'pelamar'): Builder
    {
        return $query->where(function ($q) use ($role) {
            $q->where('target_role', $role)
                ->orWhere('target_role', 'all');
        });
    }

    /**
     * Scope urutan tampilan banner.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Format judul dengan mengganti placeholder {name} menjadi nama pengguna.
     */
    public function getFormattedTitle(string $userName = ''): string
    {
        if (empty($userName)) {
            return str_replace(['{name}', '{nama}'], 'Sobat Profabel', $this->title);
        }

        return str_replace(['{name}', '{nama}'], $userName, $this->title);
    }
}
