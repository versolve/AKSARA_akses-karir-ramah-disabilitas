<?php

namespace Database\Seeders;

use App\Models\AiApiConfig;
use Illuminate\Database\Seeder;

class AiApiConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (AiApiConfig::count() > 0) {
            return;
        }

        $geminiKey = config('ai.providers.gemini.api_key') ?: env('GEMINI_API_KEY', '');
        $geminiModel = config('ai.providers.gemini.model') ?: env('GEMINI_MODEL', 'gemini-1.5-flash');

        AiApiConfig::create([
            'name' => 'Google Gemini (Production Primary)',
            'provider' => 'gemini',
            'api_key' => $geminiKey,
            'model' => $geminiModel,
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'timeout' => 20,
            'max_tokens' => 1500,
            'temperature' => 0.20,
            'is_active' => true,
            'is_primary' => true,
            'rate_limit_rpm' => 60,
            'daily_request_limit' => 1500,
            'monthly_request_limit' => 45000,
            'last_health_status' => !empty($geminiKey) ? 'healthy' : 'unknown',
            'notes' => 'Default primary LLM menggunakan Google Gemini API.',
        ]);

        AiApiConfig::create([
            'name' => 'Mock AI Engine (Offline Fallback)',
            'provider' => 'mock',
            'api_key' => null,
            'model' => 'rule-based-mock-v1',
            'base_url' => null,
            'timeout' => 5,
            'max_tokens' => 1000,
            'temperature' => 0.00,
            'is_active' => true,
            'is_primary' => false,
            'rate_limit_rpm' => 300,
            'daily_request_limit' => 10000,
            'monthly_request_limit' => 300000,
            'last_health_status' => 'healthy',
            'notes' => 'Provider fallback lokal untuk memastikan fitur AI tetap merespons jika API eksternal offline atau limit tercapai.',
        ]);
    }
}
