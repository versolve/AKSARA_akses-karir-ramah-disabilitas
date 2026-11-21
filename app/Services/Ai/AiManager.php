<?php

namespace App\Services\Ai;

use App\Contracts\AiProviderInterface;
use Illuminate\Support\Manager;

class AiManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return $this->config->get('ai.default', 'configured');
    }

    protected function createConfiguredDriver(): AiProviderInterface
    {
        return new ConfiguredAiProvider();
    }

    protected function createGeminiDriver(): AiProviderInterface
    {
        // Seluruh pemanggilan AI dialihkan ke ConfiguredAiProvider agar terpusat dan termonitoring oleh Admin
        return new ConfiguredAiProvider();
    }

    protected function createOpenAiDriver(): AiProviderInterface
    {
        // Seluruh pemanggilan AI dialihkan ke ConfiguredAiProvider agar terpusat dan termonitoring oleh Admin
        return new ConfiguredAiProvider();
    }

    protected function createMockDriver(): AiProviderInterface
    {
        return new MockAiProvider();
    }
}
