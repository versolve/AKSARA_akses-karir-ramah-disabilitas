<?php

namespace Tests\Feature\Seeker;

use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\SavedVacancy;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteVacancyTest extends TestCase
{
    use RefreshDatabase;

    private User $seekerUser;
    private Vacancy $vacancy1;
    private Vacancy $vacancy2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seekerUser = User::factory()->create([
            'role' => 'pelamar',
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        JobSeekerProfile::create([
            'user_id' => $this->seekerUser->id,
            'phone' => '081234567890',
            'profile_completed_percentage' => 80,
        ]);

        $hr = User::factory()->create([
            'role' => 'perusahaan',
            'is_verified' => true,
        ]);

        $company = CompanyProfile::create([
            'user_id' => $hr->id,
            'company_name' => 'PT Ramah Inklusif',
            'industry' => 'Teknologi',
            'address' => 'Jl. Jendral Sudirman No. 1, Jakarta Pusat',
            'description' => 'Perusahaan konsultan teknologi inklusif.',
            'is_approved' => true,
        ]);

        $this->vacancy1 = Vacancy::create([
            'company_profile_id' => $company->id,
            'title' => 'Frontend Accessible Engineer',
            'slug' => 'frontend-accessible-engineer',
            'description' => 'Deskripsi pekerjaan...',
            'job_type' => 'full-time',
            'work_model' => 'remote',
            'location' => 'Jakarta',
            'status' => 'active',
        ]);

        $this->vacancy2 = Vacancy::create([
            'company_profile_id' => $company->id,
            'title' => 'QA Manual Tester Inklusif',
            'slug' => 'qa-manual-tester-inklusif',
            'description' => 'Deskripsi QA...',
            'job_type' => 'full-time',
            'work_model' => 'onsite',
            'location' => 'Bandung',
            'status' => 'active',
        ]);
    }

    public function test_guest_cannot_access_favorites_page(): void
    {
        $response = $this->get(route('app.favorites.index'));
        $response->assertRedirect('/login');
    }

    public function test_seeker_can_access_favorites_page(): void
    {
        $response = $this->actingAs($this->seekerUser)->get(route('app.favorites.index'));
        $response->assertStatus(200);
    }

    public function test_seeker_can_toggle_favorite_vacancy(): void
    {
        // 1. Favorite
        $response = $this->actingAs($this->seekerUser)->postJson("/vacancies/{$this->vacancy1->id}/favorite");
        $response->assertStatus(200)
            ->assertJson([
                'is_favorited' => true,
                'vacancy_id' => $this->vacancy1->id,
            ]);

        $this->assertDatabaseHas('saved_vacancies', [
            'user_id' => $this->seekerUser->id,
            'vacancy_id' => $this->vacancy1->id,
        ]);

        // 2. Unfavorite via toggle
        $response2 = $this->actingAs($this->seekerUser)->postJson("/vacancies/{$this->vacancy1->id}/favorite");
        $response2->assertStatus(200)
            ->assertJson([
                'is_favorited' => false,
                'vacancy_id' => $this->vacancy1->id,
            ]);

        $this->assertDatabaseMissing('saved_vacancies', [
            'user_id' => $this->seekerUser->id,
            'vacancy_id' => $this->vacancy1->id,
        ]);
    }

    public function test_seeker_can_delete_favorite_vacancy(): void
    {
        SavedVacancy::create([
            'user_id' => $this->seekerUser->id,
            'vacancy_id' => $this->vacancy1->id,
        ]);

        $response = $this->actingAs($this->seekerUser)->deleteJson("/app/favorites/{$this->vacancy1->id}");
        $response->assertStatus(200)
            ->assertJson([
                'is_favorited' => false,
            ]);

        $this->assertDatabaseMissing('saved_vacancies', [
            'user_id' => $this->seekerUser->id,
            'vacancy_id' => $this->vacancy1->id,
        ]);
    }

    public function test_jobs_index_filters_only_favorites(): void
    {
        SavedVacancy::create([
            'user_id' => $this->seekerUser->id,
            'vacancy_id' => $this->vacancy1->id,
        ]);

        $response = $this->actingAs($this->seekerUser)->get('/jobs?only_favorites=1');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('jobs/index')
            ->has('vacancies.data', 1)
            ->where('vacancies.data.0.id', $this->vacancy1->id)
        );
    }
}
