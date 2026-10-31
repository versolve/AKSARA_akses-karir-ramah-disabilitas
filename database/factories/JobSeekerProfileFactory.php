<?php

namespace Database\Factories;

use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobSeekerProfileFactory extends Factory
{
    protected $model = JobSeekerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phone' => fake()->phoneNumber(),
            'bio' => fake()->paragraph(),
            'education' => 'S1 Teknik Informatika',
            'experience' => '2 tahun sebagai frontend developer',
            'current_job_title' => 'Frontend Developer',
            'cv_path' => null,
            'domicile' => fake()->city(),
            'profile_completed_percentage' => 0,
        ];
    }
}
