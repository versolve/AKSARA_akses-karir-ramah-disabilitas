<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Throwable;

class AiModelCatalog
{
    /**
     * Official model catalogue reflecting official provider rate limits
     * Category, RPM (Requests Per Minute), TPM (Tokens Per Minute), RPD (Requests Per Day)
     */
    public static function getKnownModels(): array
    {
        return [
            // --- Google Gemini: Text-out models ---
            [
                'id' => 'gemini-2.0-flash',
                'name' => 'Gemini 2.0 Flash',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 15,
                'tpm' => 1000000,
                'rpd' => 1500,
                'is_recommended' => true,
                'description' => 'Standar produksi Google Gemini generasi ke-2 tercepat, cerdas, dan stabil untuk ekstraksi JSON dokumen & pencocokan.',
            ],
            [
                'id' => 'gemini-2.0-flash-lite',
                'name' => 'Gemini 2.0 Flash Lite',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 30,
                'tpm' => 1000000,
                'rpd' => 1500,
                'is_recommended' => true,
                'description' => 'Model teks dengan kuota RPM tertinggi (30 RPM) dan latensi sangat cepat, ideal untuk traffic tinggi.',
            ],
            [
                'id' => 'gemini-1.5-flash',
                'name' => 'Gemini 1.5 Flash',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 15,
                'tpm' => 1000000,
                'rpd' => 1500,
                'is_recommended' => true,
                'description' => 'Model klasik serbaguna dengan jendela konteks 1 juta token, sangat stabil untuk analisis resume panjang.',
            ],
            [
                'id' => 'gemini-1.5-flash-8b',
                'name' => 'Gemini 1.5 Flash 8B',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 15,
                'tpm' => 1000000,
                'rpd' => 1500,
                'is_recommended' => false,
                'description' => 'Varian 8 miliar parameter yang sangat ringan dan hemat sumber daya.',
            ],
            [
                'id' => 'gemini-1.5-pro',
                'name' => 'Gemini 1.5 Pro',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 2,
                'tpm' => 32000,
                'rpd' => 50,
                'is_recommended' => false,
                'description' => 'Model penalaran kompleks kelas berat. Kuota gratis terbatas (2 RPM, 50 RPD).',
            ],
            [
                'id' => 'gemini-3.5-flash-lite',
                'name' => 'Gemini 3.5 Flash Lite',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 15,
                'tpm' => 250000,
                'rpd' => 500,
                'is_recommended' => true,
                'description' => 'Generasi 3.5 Flash Lite berkecepatan tinggi dengan kuota 15 RPM, 250K TPM, dan 500 RPD.',
            ],
            [
                'id' => 'gemini-3.1-flash-lite',
                'name' => 'Gemini 3.1 Flash Lite',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 15,
                'tpm' => 250000,
                'rpd' => 500,
                'is_recommended' => false,
                'description' => 'Model generasi 3.1 Flash Lite untuk inferensi cepat (15 RPM, 250K TPM, 500 RPD).',
            ],
            [
                'id' => 'gemini-2.5-flash',
                'name' => 'Gemini 2.5 Flash',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 5,
                'tpm' => 250000,
                'rpd' => 20,
                'is_recommended' => false,
                'description' => 'Model preview Gemini 2.5 Flash (5 RPM, 250K TPM, 20 RPD).',
            ],
            [
                'id' => 'gemini-2.5-flash-lite',
                'name' => 'Gemini 2.5 Flash Lite',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 10,
                'tpm' => 250000,
                'rpd' => 20,
                'is_recommended' => false,
                'description' => 'Model preview Gemini 2.5 Flash Lite (10 RPM, 250K TPM, 20 RPD).',
            ],
            [
                'id' => 'gemini-3.8-flash',
                'name' => 'Gemini 3.8 Flash',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 5,
                'tpm' => 250000,
                'rpd' => 20,
                'is_recommended' => false,
                'description' => 'Model preview cerdas 3.8 Flash (5 RPM, 250K TPM, 20 RPD).',
            ],
            [
                'id' => 'gemini-3-flash',
                'name' => 'Gemini 3 Flash',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 5,
                'tpm' => 250000,
                'rpd' => 20,
                'is_recommended' => false,
                'description' => 'Model preview Gemini 3 Flash (5 RPM, 250K TPM, 20 RPD).',
            ],
            [
                'id' => 'gemini-4-hydrogen',
                'name' => 'Gemini 4 Hydrogen',
                'provider' => 'gemini',
                'category' => 'Text-out models',
                'rpm' => 5,
                'tpm' => 250000,
                'rpd' => 20,
                'is_recommended' => false,
                'description' => 'Eksperimental generasi mendatang Gemini 4 Hydrogen.',
            ],

            // --- Google Gemini: Live API (Unlimited RPM/RPD, TPM Limited) ---
            [
                'id' => 'gemini-2.5-flash-native-audio-dialog',
                'name' => 'Gemini 2.5 Flash Native Audio Dialog',
                'provider' => 'gemini',
                'category' => 'Live API',
                'rpm' => 0, // 0 denotes Unlimited in UI
                'tpm' => 1000000,
                'rpd' => 0, // Unlimited
                'is_recommended' => false,
                'description' => 'Live API WebSocket dua arah untuk audio langsung (Unlimited RPM & RPD, 1M TPM).',
            ],
            [
                'id' => 'gemini-3-flash-live',
                'name' => 'Gemini 3 Flash Live',
                'provider' => 'gemini',
                'category' => 'Live API',
                'rpm' => 0,
                'tpm' => 65000,
                'rpd' => 0,
                'is_recommended' => false,
                'description' => 'Live API multimodal streaming (Unlimited RPM & RPD, 65K TPM).',
            ],

            // --- OpenAI Models ---
            [
                'id' => 'gpt-4o-mini',
                'name' => 'GPT-4o Mini',
                'provider' => 'openai',
                'category' => 'Text-out models',
                'rpm' => 500,
                'tpm' => 200000,
                'rpd' => 10000,
                'is_recommended' => true,
                'description' => 'Model OpenAI cepat, terjangkau, dan sangat cerdas untuk tugas rekrutmen & JSON.',
            ],
            [
                'id' => 'gpt-4o',
                'name' => 'GPT-4o',
                'provider' => 'openai',
                'category' => 'Text-out models',
                'rpm' => 500,
                'tpm' => 80000,
                'rpd' => 5000,
                'is_recommended' => false,
                'description' => 'Model flagship multimodal paling kapabel dari OpenAI.',
            ],

            // --- Offline Local Mock Engine ---
            [
                'id' => 'rule-based-mock-v1',
                'name' => 'Profabel Heuristic Mock Engine',
                'provider' => 'mock',
                'category' => 'Offline Heuristic Engine',
                'rpm' => 300,
                'tpm' => 1000000,
                'rpd' => 10000,
                'is_recommended' => true,
                'description' => 'Algoritma pencocokan inklusif lokal offline tanpa biaya, tanpa kuota eksternal, dan latensi ~10ms.',
            ],
        ];
    }

    /**
     * Get single model metadata by ID
     */
    public static function getModel(string $id): ?array
    {
        return collect(self::getKnownModels())->firstWhere('id', $id);
    }

    /**
     * Fetch live available models directly from Google Gemini API endpoint
     */
    public static function fetchLiveGeminiModels(string $apiKey, string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta', int $timeout = 10): array
    {
        if (empty($apiKey)) {
            throw new \InvalidArgumentException('API Key belum diisi untuk deteksi live.');
        }

        $endpoint = rtrim($baseUrl, '/') . "/models?key={$apiKey}";
        $response = Http::timeout($timeout)->get($endpoint);

        if ($response->failed()) {
            throw new \RuntimeException('Gagal mengambil daftar model dari Google Gemini (' . $response->status() . '): ' . $response->body());
        }

        $body = $response->json();
        $remoteModels = $body['models'] ?? [];
        $knownMap = collect(self::getKnownModels())->keyBy('id');

        $result = [];

        foreach ($remoteModels as $remote) {
            $rawName = $remote['name'] ?? '';
            $modelId = str_starts_with($rawName, 'models/') ? substr($rawName, 7) : $rawName;

            // Only filter models that support text/content generation
            $methods = $remote['supportedGenerationMethods'] ?? [];
            if (!empty($methods) && !in_array('generateContent', $methods, true)) {
                continue;
            }

            $known = $knownMap->get($modelId);

            if ($known) {
                $item = $known;
                $item['display_name'] = $remote['displayName'] ?? $known['name'];
                $item['input_token_limit'] = $remote['inputTokenLimit'] ?? null;
                $item['output_token_limit'] = $remote['outputTokenLimit'] ?? null;
                $item['is_live_detected'] = true;
                $result[] = $item;
            } else {
                // Unknown new model detected dynamically
                $isLive = str_contains(strtolower($modelId), 'live') || str_contains(strtolower($modelId), 'dialog');
                $result[] = [
                    'id' => $modelId,
                    'name' => $remote['displayName'] ?? $modelId,
                    'provider' => 'gemini',
                    'category' => $isLive ? 'Live API' : 'Text-out models',
                    'rpm' => $isLive ? 0 : 15,
                    'tpm' => $remote['inputTokenLimit'] ?? 250000,
                    'rpd' => $isLive ? 0 : 500,
                    'is_recommended' => false,
                    'description' => $remote['description'] ?? 'Model terdeteksi langsung dari Google AI Studio.',
                    'display_name' => $remote['displayName'] ?? $modelId,
                    'input_token_limit' => $remote['inputTokenLimit'] ?? null,
                    'output_token_limit' => $remote['outputTokenLimit'] ?? null,
                    'is_live_detected' => true,
                ];
            }
        }

        return $result;
    }
}
