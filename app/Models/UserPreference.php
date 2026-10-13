<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'text_scale',
        'tts_enabled',
        'high_contrast',
        'reduce_motion',
    ];

    protected $casts = [
        'text_scale' => 'integer',
        'tts_enabled' => 'boolean',
        'high_contrast' => 'boolean',
        'reduce_motion' => 'boolean',
    ];

    public function user(): ?BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
