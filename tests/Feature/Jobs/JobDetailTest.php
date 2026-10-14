<?php

namespace Tests\Feature\Jobs;

use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_active_job_detail_page(): void
    {
        $company = CompanyProfile::factory()->create(['company_name' => 'PT Aksara Inklusif']);
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'title' => 'Customer Care Disabilitas',
            'slug' => 'customer-care-disabilitas',
        ]);

        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vacancy->id,
            'accommodation_type' => 'ramp_access',
            'description' => 'Gedung kantor memiliki ram lantai 1',
        ]);

        $response = $this->get('/jobs/customer-care-disabilitas');
        $response->assertOk();
        $response->assertSee('Customer Care Disabilitas');
        $response->assertSee('PT Aksara Inklusif');
        $response->assertSee('Gedung kantor memiliki ram lantai 1');
    }

    public function test_cannot_view_draft_or_closed_job_detail(): void
    {
        $vacancy = Vacancy::factory()->create([
            'status' => 'draft',
            'slug' => 'closed-draft-job',
        ]);

        $response = $this->get('/jobs/closed-draft-job');
        $response->assertStatus(404);
    }
}
