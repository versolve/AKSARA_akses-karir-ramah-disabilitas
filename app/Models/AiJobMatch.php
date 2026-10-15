<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiJobMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'vacancy_id',
        'job_seeker_profile_id',
        'match_percentage',
        'competency_score',
        'accessibility_score',
        'matching_points',
        'gaps',
        'summary',
    ];

    protected $casts = [
        'match_percentage' => 'integer',
        'competency_score' => 'integer',
        'accessibility_score' => 'integer',
        'matching_points' => 'array',
        'gaps' => 'array',
    ];

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function jobSeekerProfile(): BelongsTo
    {
        return $this->belongsTo(JobSeekerProfile::class);
    }
}
