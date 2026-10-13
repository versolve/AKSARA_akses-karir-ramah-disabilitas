<?php

namespace Database\Factories;

use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeekerAccessibilityProfileFactory extends Factory
{
    protected $model = SeekerAccessibilityProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'disability_types' => ['fisik'],
            'accommodations_needed' => ['ramp', 'remote_work'],
            'notes' => fake()->sentence(),
        ];
    }
}
