<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default AI Provider
    |--------------------------------------------------------------------------
    |
    | Seluruh fitur AI (Asisten Karir AI, Pencocokan Lowongan, Analisis Skill Gap,
    | dan Review CV ATS) sekarang dikelola secara terpusat melalui panel Admin
    | (/admin/ai-management) dengan driver 'configured'.
    | Konfigurasi ini tersimpan di database (ai_api_configs) dan termonitor
    | secara real-time pada tabel ai_api_logs (RPM, TPM, latensi, dan error).
    |
    */
    'default' => 'configured',

    'providers' => [
        'configured' => [
            'name' => 'Admin Configured Central AI Provider',
        ],

        'gemini' => [
            'name' => 'Google Gemini (Managed by Admin)',
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'timeout' => 20,
        ],

        'openai' => [
            'name' => 'OpenAI / Custom LLM (Managed by Admin)',
            'base_url' => 'https://api.openai.com/v1',
            'timeout' => 20,
        ],

        'mock' => [
            'name' => 'Deterministic Mock Provider (Offline Fallback)',
        ],
    ],
];
