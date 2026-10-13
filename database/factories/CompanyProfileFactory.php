<?php

namespace Database\Factories;

use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyProfileFactory extends Factory
{
    protected $model = CompanyProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'industry' => 'Technology',
            'address' => fake()->address(),
            'website' => 'https://' . fake()->domainName(),
            'logo_path' => null,
            'description' => fake()->paragraph(),
            'is_approved' => true,
        ];
    }
}
