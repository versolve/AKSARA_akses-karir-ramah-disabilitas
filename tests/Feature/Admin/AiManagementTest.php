<?php

namespace Tests\Feature\Admin;

use App\Models\AiApiConfig;
use App\Models\AiApiLog;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Services\Ai\ConfiguredAiProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AiManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_ai_management(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $perusahaan = User::factory()->create(['role' => 'perusahaan']);

        $this->actingAs($pelamar)->get('/admin/ai-management')->assertStatus(403);
        $this->actingAs($perusahaan)->get('/admin/ai-management')->assertStatus(403);
    }

    public function test_admin_can_access_ai_management_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        AiApiConfig::create([
            'name' => 'Gemini Test',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyTestKey123456789',
            'model' => 'gemini-1.5-flash',
            'is_active' => true,
            'is_primary' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/ai-management');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/ai/index')
            ->has('configs')
            ->has('summary')
            ->has('recentLogs')
        );
    }

    public function test_admin_can_store_new_ai_config(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/ai-management', [
            'name' => 'OpenAI GPT-4o-mini',
            'provider' => 'openai',
            'api_key' => 'sk-proj-1234567890abcdef',
            'model' => 'gpt-4o-mini',
            'base_url' => 'https://api.openai.com/v1',
            'timeout' => 20,
            'max_tokens' => 1500,
            'temperature' => 0.2,
            'rate_limit_rpm' => 60,
            'daily_request_limit' => 1000,
            'monthly_request_limit' => 30000,
            'is_active' => true,
            'is_primary' => false,
            'notes' => 'Backup OpenAI',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('ai_api_configs', [
            'name' => 'OpenAI GPT-4o-mini',
            'provider' => 'openai',
            'model' => 'gpt-4o-mini',
        ]);

        $stored = AiApiConfig::where('name', 'OpenAI GPT-4o-mini')->first();
        $this->assertNotNull($stored);
        $this->assertEquals('sk-proj-1234567890abcdef', $stored->api_key);
        $this->assertStringContainsString('••••••••', $stored->masked_api_key);
    }

    public function test_admin_can_update_ai_config(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'password' => bcrypt('admin123'),
        ]);

        $config = AiApiConfig::create([
            'name' => 'Initial Gemini',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyInitial',
            'model' => 'gemini-1.5-flash',
            'is_active' => true,
            'is_primary' => true,
        ]);

        // Wrong password test
        $failResponse = $this->actingAs($admin)->put("/admin/ai-management/{$config->id}", [
            'admin_password' => 'wrongpass',
            'name' => 'Updated Gemini 2.0 Flash',
            'provider' => 'gemini',
            'model' => 'gemini-2.0-flash',
        ]);
        $failResponse->assertRedirect();
        $this->assertEquals('Initial Gemini', $config->fresh()->name);

        // Correct password test
        $response = $this->actingAs($admin)->put("/admin/ai-management/{$config->id}", [
            'admin_password' => 'admin123',
            'name' => 'Updated Gemini 2.0 Flash',
            'provider' => 'gemini',
            'model' => 'gemini-2.0-flash',
            'timeout' => 25,
            'max_tokens' => 2000,
            'temperature' => 0.3,
            'is_active' => true,
            'is_primary' => true,
        ]);

        $response->assertRedirect();
        $config->refresh();

        $this->assertEquals('Updated Gemini 2.0 Flash', $config->name);
        $this->assertEquals('gemini-2.0-flash', $config->model);
        $this->assertEquals(25, $config->timeout);
        // Original key preserved when not updated
        $this->assertEquals('AIzaSyInitial', $config->api_key);
    }

    public function test_admin_can_set_config_as_primary(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config1 = AiApiConfig::create([
            'name' => 'Config 1',
            'provider' => 'gemini',
            'model' => 'gemini-1.5-flash',
            'is_active' => true,
            'is_primary' => true,
        ]);

        $config2 = AiApiConfig::create([
            'name' => 'Config 2',
            'provider' => 'mock',
            'model' => 'rule-based-mock-v1',
            'is_active' => true,
            'is_primary' => false,
        ]);

        $response = $this->actingAs($admin)->post("/admin/ai-management/{$config2->id}/primary");

        $response->assertRedirect();
        $this->assertFalse($config1->fresh()->is_primary);
        $this->assertTrue($config2->fresh()->is_primary);
    }

    public function test_admin_can_toggle_active_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config = AiApiConfig::create([
            'name' => 'Secondary Mock',
            'provider' => 'mock',
            'model' => 'mock-v1',
            'is_active' => true,
            'is_primary' => false,
        ]);

        $response = $this->actingAs($admin)->post("/admin/ai-management/{$config->id}/toggle-active");

        $response->assertRedirect();
        $this->assertFalse($config->fresh()->is_active);

        $response = $this->actingAs($admin)->post("/admin/ai-management/{$config->id}/toggle-active");
        $this->assertTrue($config->fresh()->is_active);
    }

    public function test_admin_can_test_mock_connection(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config = AiApiConfig::create([
            'name' => 'Mock AI',
            'provider' => 'mock',
            'model' => 'rule-based-mock-v1',
            'is_active' => true,
            'is_primary' => false,
        ]);

        $response = $this->actingAs($admin)->postJson("/admin/ai-management/{$config->id}/test");

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertEquals('healthy', $config->fresh()->last_health_status);
    }

    public function test_admin_can_reset_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config = AiApiConfig::create([
            'name' => 'Gemini with Usage',
            'provider' => 'gemini',
            'model' => 'gemini-1.5-flash',
            'total_requests' => 150,
            'total_tokens' => 25000,
            'success_requests' => 140,
            'failed_requests' => 10,
            'is_active' => true,
            'is_primary' => true,
        ]);

        $response = $this->actingAs($admin)->post("/admin/ai-management/{$config->id}/reset-stats");

        $response->assertRedirect();
        $config->refresh();
        $this->assertEquals(0, $config->total_requests);
        $this->assertEquals(0, $config->total_tokens);
        $this->assertEquals(0, $config->success_requests);
        $this->assertEquals(0, $config->failed_requests);
    }

    public function test_admin_can_delete_ai_config(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'password' => bcrypt('admin-delete-pass'),
        ]);

        $config = AiApiConfig::create([
            'name' => 'To be deleted',
            'provider' => 'mock',
            'model' => 'mock-v1',
            'is_active' => false,
            'is_primary' => false,
        ]);

        // Wrong password fail
        $failResponse = $this->actingAs($admin)->delete("/admin/ai-management/{$config->id}", [
            'admin_password' => 'wrongpass',
        ]);
        $failResponse->assertRedirect();
        $this->assertDatabaseHas('ai_api_configs', ['id' => $config->id]);

        // Correct password success
        $response = $this->actingAs($admin)->delete("/admin/ai-management/{$config->id}", [
            'admin_password' => 'admin-delete-pass',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('ai_api_configs', ['id' => $config->id]);
    }

    public function test_configured_ai_provider_records_usage_in_config_and_logs(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create();

        $config = AiApiConfig::create([
            'name' => 'Primary Mock',
            'provider' => 'mock',
            'model' => 'rule-based-mock-v1',
            'is_active' => true,
            'is_primary' => true,
            'total_requests' => 0,
        ]);

        $provider = new ConfiguredAiProvider();
        $result = $provider->matchJob($seeker, $vacancy);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('match_percentage', $result);

        $config->refresh();
        $this->assertEquals(1, $config->total_requests);
        $this->assertGreaterThan(0, $config->total_tokens);
        $this->assertEquals(1, $config->success_requests);

        $this->assertDatabaseHas('ai_api_logs', [
            'ai_api_config_id' => $config->id,
            'action_type' => 'job_match',
            'status' => 'success',
        ]);
    }

    public function test_admin_cannot_reveal_key_with_wrong_password(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'password' => bcrypt('correct-password'),
        ]);

        $config = AiApiConfig::create([
            'name' => 'Gemini Secret',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyTopSecret123',
            'model' => 'gemini-1.5-flash',
        ]);

        $response = $this->actingAs($admin)->postJson("/admin/ai-management/{$config->id}/reveal-key", [
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_admin_can_reveal_key_with_correct_password(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'password' => bcrypt('admin-super-password'),
        ]);

        $config = AiApiConfig::create([
            'name' => 'Gemini Secret',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyTopSecretKey987654',
            'model' => 'gemini-1.5-flash',
        ]);

        $response = $this->actingAs($admin)->postJson("/admin/ai-management/{$config->id}/reveal-key", [
            'password' => 'admin-super-password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'api_key' => 'AIzaSyTopSecretKey987654',
        ]);
    }

    public function test_admin_can_store_multi_model_config(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/ai-management', [
            'name' => 'Gemini Multi-Model Production',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyMultiKey123',
            'model' => 'gemini-2.0-flash',
            'enabled_models' => ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'],
            'rate_limit_rpm' => 15,
            'tpm_limit' => 1000000,
            'daily_request_limit' => 1500,
            'monthly_request_limit' => 45000,
            'is_active' => true,
            'is_primary' => false,
        ]);

        $response->assertRedirect();
        $stored = AiApiConfig::where('name', 'Gemini Multi-Model Production')->first();
        $this->assertNotNull($stored);
        $this->assertEquals('gemini-2.0-flash', $stored->model);
        $this->assertContains('gemini-1.5-flash', $stored->effective_models);
        $this->assertContains('gemini-1.5-flash-8b', $stored->effective_models);
        $this->assertEquals(1000000, $stored->tpm_limit);
    }

    public function test_admin_can_switch_model_instantly(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config = AiApiConfig::create([
            'name' => 'Gemini Multi Key',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyKey123',
            'model' => 'gemini-1.5-flash',
            'enabled_models' => ['gemini-1.5-flash', 'gemini-2.0-flash'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/admin/ai-management/{$config->id}/switch-model", [
            'model' => 'gemini-2.0-flash',
        ]);

        $response->assertRedirect();
        $config->refresh();
        $this->assertEquals('gemini-2.0-flash', $config->model);
    }

    public function test_admin_can_fetch_catalog_models(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/admin/ai-management/fetch-models', [
            'provider' => 'gemini',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'is_live',
            'models' => [
                '*' => ['id', 'name', 'provider', 'category', 'rpm', 'tpm', 'rpd'],
            ],
        ]);
    }

    public function test_admin_can_update_ai_routing_settings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $config = AiApiConfig::create([
            'name' => 'Gemini Manual Target',
            'provider' => 'gemini',
            'api_key' => 'AIzaSyKeyManual',
            'model' => 'gemini-2.0-flash',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post('/admin/ai-management/routing-settings', [
            'mode' => 'manual',
            'strategy' => 'failover',
            'allow_mock_fallback' => true,
            'manual_config_id' => $config->id,
            'manual_model' => 'gemini-2.0-flash',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = \App\Services\Ai\AiRoutingManager::getSettings();
        $this->assertEquals('manual', $settings['mode']);
        $this->assertEquals('gemini-2.0-flash', $settings['manual_model']);
        $this->assertEquals($config->id, $settings['manual_config_id']);
    }

    public function test_admin_can_switch_routing_to_all_api_and_smart_failover(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/ai-management/routing-settings', [
            'mode' => 'smart_failover',
            'strategy' => 'round_robin',
            'allow_mock_fallback' => true,
        ]);

        $response->assertRedirect();

        $settings = \App\Services\Ai\AiRoutingManager::getSettings();
        $this->assertEquals('smart_failover', $settings['mode']);
        $this->assertEquals('round_robin', $settings['strategy']);
    }
}
