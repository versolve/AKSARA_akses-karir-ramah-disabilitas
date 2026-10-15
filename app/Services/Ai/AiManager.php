<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use Illuminate\Support\Manager;

class AiManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return $this->config->get('ai.default', 'gemini');
    }

    protected function createGeminiDriver(): AiProviderInterface
    {
        $config = $this->config->get('ai.providers.gemini', []);

        return new GeminiAiProvider(
            apiKey: (string) ($config['api_key'] ?? ''),
            model: (string) ($config['model'] ?? 'gemini-1.5-flash'),
            baseUrl: (string) ($config['base_url'] ?? 'https://generativelanguage.googleapis.com/v1beta'),
            timeout: (int) ($config['timeout'] ?? 15)
        );
    }

    protected function createMockDriver(): AiProviderInterface
    {
        return new MockAiProvider();
    }
}
