<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'vacancy_id' => Vacancy::factory(),
            'job_seeker_profile_id' => JobSeekerProfile::factory(),
            'cover_letter' => fake()->paragraph(),
            'cv_path' => 'cvs/sample-cv.pdf',
            'status' => 'submitted',
            'status_notes' => null,
            'applied_at' => now(),
        ];
    }
}
