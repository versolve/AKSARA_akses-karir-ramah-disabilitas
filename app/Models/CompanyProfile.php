<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'industry',
        'address',
        'location',
        'website',
        'logo_path',
        'description',
        'workplace_accessibility',
        'company_size',
        'founded_year',
        'company_type',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    protected $appends = [
        'logo_url',
    ];

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            return str_starts_with($this->logo_path, 'http')
                ? $this->logo_path
                : \Illuminate\Support\Facades\Storage::url($this->logo_path);
        }

        if ($this->relationLoaded('user') && $this->user?->avatar) {
            return str_starts_with($this->user->avatar, 'http')
                ? $this->user->avatar
                : \Illuminate\Support\Facades\Storage::url($this->user->avatar);
        }

        return null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancies(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Vacancy::class);
    }

    public function reports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CompanyReport::class);
    }
}
