<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function aiHistories(): HasMany
    {
        return $this->hasMany(AiHistory::class);
    }

    /**
     * Calculate and return real-time profile completeness status.
     *
     * @return array{percentage: int, items: array<int, array{id: string, label: string, is_completed: bool, link: string}>}
     */
    public function calculateCompleteness(): array
    {
        $hasPersonalData = !empty($this->phone) && (!empty($this->bio) || !empty($this->current_job_title) || !empty($this->domicile));

        $user = $this->user;
        $acc = $user?->accessibilityProfile;
        $hasAccessibility = !empty($acc?->disability_types) && is_array($acc->disability_types) && count($acc->disability_types) > 0;

        // Pendidikan: Wajib memiliki data terstruktur di educations (karena antarmuka hanya menampilkan educations)
        $hasEducation = !empty($this->educations) && is_array($this->educations) && count($this->educations) > 0;

        // Pengalaman Kerja: Wajib memiliki data terstruktur di work_experiences (karena antarmuka hanya menampilkan work_experiences)
        $hasExperience = !empty($this->work_experiences) && is_array($this->work_experiences) && count($this->work_experiences) > 0;

        // Resume & Portofolio: Wajib mengunggah CV atau memiliki portofolio / proyek
        $hasResumeOrSkills = !empty($this->cv_path)
            || !empty($this->portfolio_url)
            || (!empty($this->projects) && is_array($this->projects) && count($this->projects) > 0);

        $items = [
            [
                'id' => 'personal_data',
                'label' => 'Data Diri',
                'is_completed' => (bool) $hasPersonalData,
                'link' => '/app/profile/edit',
            ],
            [
                'id' => 'accessibility',
                'label' => 'Kebutuhan Aksesibilitas',
                'is_completed' => (bool) $hasAccessibility,
                'link' => '/app/accessibility-profile',
            ],
            [
                'id' => 'education',
                'label' => 'Pendidikan',
                'is_completed' => (bool) $hasEducation,
                'link' => '/app/profile/edit',
            ],
            [
                'id' => 'experience',
                'label' => 'Pengalaman Kerja',
                'is_completed' => (bool) $hasExperience,
                'link' => '/app/profile/edit',
            ],
            [
                'id' => 'resume_skills',
                'label' => 'Resume & Portofolio',
                'is_completed' => (bool) $hasResumeOrSkills,
                'link' => '/app/profile/edit',
            ],
        ];

        $completedCount = collect($items)->where('is_completed', true)->count();
        $percentage = intval(round(($completedCount / count($items)) * 100));

        if ($this->profile_completed_percentage !== $percentage) {
            $this->profile_completed_percentage = $percentage;
            $this->saveQuietly();
        }

        return [
            'percentage' => $percentage,
            'items' => $items,
        ];
    }
}
