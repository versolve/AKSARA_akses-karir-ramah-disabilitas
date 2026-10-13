<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserPreferenceFactory extends Factory
{
    protected $model = UserPreference::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'text_scale' => fake()->randomElement([80, 90, 100, 110, 125]),
            'tts_enabled' => false,
            'high_contrast' => false,
            'reduce_motion' => false,
        ];
    }
}
