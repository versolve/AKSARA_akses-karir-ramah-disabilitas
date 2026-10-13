<?php

namespace Tests\Feature\Company;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_can_view_their_profile_page(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->get('/company/profile');

        $response->assertOk();
    }

    public function test_company_can_update_their_profile(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->post('/company/profile', [
            'company_name' => 'PT Sukses Jaya',
            'industry' => 'Teknologi',
            'address' => 'Jl. Merdeka No. 1, Jakarta',
            'website' => 'https://suksesjaya.id',
            'description' => 'Perusahaan teknologi yang inklusif',
        ]);

        $response->assertRedirect();
        $company = $user->companyProfile()->first();

        $this->assertNotNull($company);
        $this->assertSame('PT Sukses Jaya', $company->company_name);
        $this->assertSame('Teknologi', $company->industry);
        $this->assertSame('https://suksesjaya.id', $company->website);
    }

    public function test_company_profile_created_if_not_exists(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $this->assertNull($user->companyProfile()->first());

        $this->actingAs($user)->post('/company/profile', [
            'company_name' => 'PT Baru',
            'industry' => 'Manufaktur',
            'address' => 'Jl. Industri No. 2, Surabaya',
            'website' => 'https://ptbaru.id',
            'description' => 'Deskripsi singkat',
        ]);

        $this->assertNotNull($user->companyProfile()->first());
    }

    public function test_pelamar_cannot_access_company_profile(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($user)->get('/company/profile');

        $response->assertStatus(403);
    }

    public function test_company_name_and_address_are_required(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->post('/company/profile', [
            'company_name' => '',
            'address' => '',
            'industry' => null,
            'website' => null,
            'description' => null,
        ]);

        $response->assertInvalid(['company_name', 'address']);
    }

    public function test_website_must_be_a_valid_url(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->post('/company/profile', [
            'company_name' => 'PT Valid',
            'address' => 'Jl. Utama',
            'website' => 'bukan-url',
        ]);

        $response->assertInvalid('website');
    }
}
