<?php

namespace Tests\Feature\Seeker;

use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_view_my_applications(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $vacancy = Vacancy::factory()->create(['title' => 'Operator Ramah Rungu']);
        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'interview',
        ]);

        $response = $this->actingAs($user)->get('/app/applications');
        $response->assertOk();
        $response->assertSee('Operator Ramah Rungu');
        $response->assertSee('interview');
    }

    public function test_perusahaan_cannot_access_pelamar_tracking(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);

        $response = $this->actingAs($user)->get('/app/applications');
        $response->assertStatus(403);
    }
}
