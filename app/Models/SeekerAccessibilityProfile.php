<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeekerAccessibilityProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'disability_types',
        'accommodations_needed',
        'notes',
    ];

    protected $casts = [
        'disability_types' => 'array',
        'accommodations_needed' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
