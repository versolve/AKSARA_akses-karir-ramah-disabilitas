<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiHistory extends Model
{
    use HasFactory;

    protected $table = 'ai_history';

    protected $fillable = [
        'job_seeker_profile_id',
        'type',
        'payload',
        'metadata_source',
        'analyzed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'analyzed_at' => 'datetime',
    ];

    public function jobSeekerProfile(): BelongsTo
    {
        return $this->belongsTo(JobSeekerProfile::class);
    }
}
