<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_profile_id',
        'name',
        'type',
        'period_label',
        'start_date',
        'end_date',
        'format',
        'status',
        'file_path',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function companyProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class);
    }
}
