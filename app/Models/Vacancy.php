<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Vacancy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_profile_id',
        'title',
        'slug',
        'description',
        'job_type',
        'work_model',
        'location',
        'salary_min',
        'salary_max',
        'is_salary_public',
        'experience_level',
        'requirements',
        'skills_required',
        'status',
        'deadline',
    ];

    protected $casts = [
        'is_salary_public' => 'boolean',
        'salary_min' => 'integer',
        'salary_max' => 'integer',
        'requirements' => 'array',
        'skills_required' => 'array',
        'deadline' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Vacancy $vacancy) {
            if (empty($vacancy->slug)) {
                $vacancy->slug = Str::slug($vacancy->title) . '-' . Str::random(6);
            }
        });
    }

    public function companyProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class);
    }

    public function accessibilities(): HasMany
    {
        return $this->hasMany(VacancyAccessibility::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
