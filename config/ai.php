<?php

return [
    'default' => env('AI_PROVIDER', 'gemini'),

    'providers' => [
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY', ''),
            'model' => env('GEMINI_MODEL', 'gemini-flash-lite-latest'),
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'timeout' => 15,
        ],

        'mock' => [
            'name' => 'Deterministic Mock Provider',
        ],
    ],
];
