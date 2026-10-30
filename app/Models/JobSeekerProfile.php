<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobSeekerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'birth_date',
        'domicile',
        'gender',
        'bio',
        'education',
        'experience',
        'current_job_title',
        'cv_path',
        'linkedin_url',
        'portfolio_url',
        'skills',
        'work_experiences',
        'educations',
        'projects',
        'certifications',
        'profile_completed_percentage',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'skills' => 'array',
        'work_experiences' => 'array',
        'educations' => 'array',
        'projects' => 'array',
        'certifications' => 'array',
        'profile_completed_percentage' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function aiMatches(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiJobMatch::class);
    }
}
