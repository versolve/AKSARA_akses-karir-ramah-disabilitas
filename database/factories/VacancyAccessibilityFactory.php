<?php

namespace Database\Factories;

use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Database\Eloquent\Factories\Factory;

class VacancyAccessibilityFactory extends Factory
{
    protected $model = VacancyAccessibility::class;

    public function definition(): array
    {
        return [
            'vacancy_id' => Vacancy::factory(),
            'accommodation_type' => fake()->randomElement(['ramp_access', 'screen_reader_software', 'remote_option', 'accessible_restroom']),
            'description' => fake()->sentence(),
        ];
    }
}
