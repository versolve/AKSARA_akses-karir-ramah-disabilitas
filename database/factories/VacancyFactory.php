<?php

namespace Database\Factories;

use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VacancyFactory extends Factory
{
    protected $model = Vacancy::class;

    public function definition(): array
    {
        $title = fake()->jobTitle();
        return [
            'company_profile_id' => CompanyProfile::factory(),
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(5),
            'description' => fake()->paragraphs(3, true),
            'job_type' => 'full-time',
            'work_model' => fake()->randomElement(['onsite', 'remote', 'hybrid']),
            'location' => fake()->city(),
            'salary_min' => 5000000,
            'salary_max' => 10000000,
            'is_salary_public' => true,
            'experience_level' => 'junior',
            'requirements' => ['Pendidikan minimal D3', 'Memiliki motivasi kerja tinggi'],
            'skills_required' => ['Komunikasi', 'Komputer Dasar'],
            'status' => 'active',
            'deadline' => now()->addDays(30),
        ];
    }
}
