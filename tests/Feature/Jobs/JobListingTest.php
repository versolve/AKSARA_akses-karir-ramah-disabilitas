<?php

namespace Tests\Feature\Jobs;

use App\Models\CompanyProfile;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_and_seekers_can_browse_active_jobs(): void
    {
        $vacancy = Vacancy::factory()->create(['status' => 'active', 'title' => 'Software Tester']);
        Vacancy::factory()->create(['status' => 'draft', 'title' => 'Draft Secret Job']);

        $response = $this->get('/jobs');
        $response->assertOk();
        $response->assertSee('Software Tester');
        $response->assertDontSee('Draft Secret Job');
    }

    public function test_can_filter_jobs_by_keyword(): void
    {
        Vacancy::factory()->create(['status' => 'active', 'title' => 'Data Analyst']);
        Vacancy::factory()->create(['status' => 'active', 'title' => 'Graphic Designer']);

        $response = $this->get('/jobs?search=Analyst');
        $response->assertOk();
        $response->assertSee('Data Analyst');
        $response->assertDontSee('Graphic Designer');
    }

    public function test_can_filter_jobs_by_work_model(): void
    {
        Vacancy::factory()->create(['status' => 'active', 'title' => 'Remote Typist', 'work_model' => 'remote']);
        Vacancy::factory()->create(['status' => 'active', 'title' => 'Onsite Clerk', 'work_model' => 'onsite']);

        $response = $this->get('/jobs?work_model=remote');
        $response->assertOk();
        $response->assertSee('Remote Typist');
        $response->assertDontSee('Onsite Clerk');
    }

    public function test_can_filter_jobs_by_workplace_accessibility(): void
    {
        $vac1 = Vacancy::factory()->create(['status' => 'active', 'title' => 'Screen Reader Friendly Job']);
        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vac1->id,
            'accommodation_type' => 'screen_reader_software',
        ]);

        $vac2 = Vacancy::factory()->create(['status' => 'active', 'title' => 'Other Office Job']);
        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vac2->id,
            'accommodation_type' => 'ramp_access',
        ]);

        $response = $this->get('/jobs?accessibility=screen_reader_software');
        $response->assertOk();
        $response->assertSee('Screen Reader Friendly Job');
        $response->assertDontSee('Other Office Job');
    }
}
