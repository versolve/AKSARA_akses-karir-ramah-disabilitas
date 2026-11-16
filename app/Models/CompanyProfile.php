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
            if (str_starts_with($this->logo_path, 'http')) {
                return $this->logo_path;
            }
            return asset('storage/' . ltrim($this->logo_path, '/'));
        }

        $user = $this->relationLoaded('user') ? $this->user : ($this->user_id ? $this->user()->first() : null);
        if ($user && $user->avatar) {
            if (str_starts_with($user->avatar, 'http')) {
                return $user->avatar;
            }
            return asset('storage/' . ltrim($user->avatar, '/'));
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
