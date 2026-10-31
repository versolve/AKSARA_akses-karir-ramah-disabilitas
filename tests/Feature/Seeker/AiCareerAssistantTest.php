<?php

namespace Tests\Feature\Seeker;

use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AiCareerAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_access_ai_assistant_page(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/app/ai-assistant');
        $response->assertOk();
    }

    public function test_cv_analysis_is_saved_to_history_with_full_result(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', [
            'cv_text' => 'Nama Budi. Pengalaman frontend developer dengan React dan CSS.',
            'target_skills' => ['React'],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('ai_history', [
            'type' => 'cv_analysis',
            'job_seeker_profile_id' => $user->jobSeekerProfile->id,
        ]);
        $this->assertSame($response->json('ats_score'), $this->latestHistoryPayload($user, 'cv_analysis')['ats_score']);
    }

    public function test_uploaded_cv_history_keeps_original_filename_without_storing_the_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $file = UploadedFile::fake()->createWithContent('cv-snapshot.pdf', <<<'PDF'
%PDF-1.4
BT (Nama Budi Pengalaman frontend developer dengan React dan CSS.) Tj ET
%%EOF
PDF);

        $this->actingAs($user)->post('/app/ai/cv-review', [
            'source' => 'upload',
            'cv' => $file,
        ], ['Accept' => 'application/json'])->assertOk();

        $history = $user->jobSeekerProfile->aiHistories()->latest('id')->firstOrFail();
        $this->assertSame('cv-snapshot.pdf', $history->metadata_source);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_job_match_is_saved_to_history_with_skill_gap_result(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id, 'skills' => ['React']]);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'skills_required' => ['React', 'TypeScript'],
        ]);

        $response = $this->actingAs($user)->post('/app/ai/match/'.$vacancy->id);

        $response->assertOk();
        $this->assertDatabaseHas('ai_history', [
            'type' => 'job_match',
            'job_seeker_profile_id' => $user->jobSeekerProfile->id,
        ]);
        $this->assertSame(['TypeScript'], $this->latestHistoryPayload($user, 'job_match')['skill_gap']['missing_skills']);
    }

    public function test_pelamar_can_list_and_delete_only_their_ai_history(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user)->postJson('/app/ai/cv-review', ['cv_text' => 'Nama Budi. Pengalaman frontend developer dengan React.']);

        $list = $this->actingAs($user)->getJson('/app/ai/history');
        $list->assertOk()->assertJsonStructure(['data' => [['id', 'type', 'payload', 'analyzed_at']]]);

        $historyId = $list->json('data.0.id');
        $this->actingAs($user)->deleteJson('/app/ai/history/'.$historyId)->assertNoContent();
        $this->assertDatabaseMissing('ai_history', ['id' => $historyId]);
    }

    public function test_pelamar_cannot_delete_another_pelamar_ai_history(): void
    {
        $owner = User::factory()->create(['role' => 'pelamar']);
        $ownerProfile = JobSeekerProfile::factory()->create(['user_id' => $owner->id]);
        $otherUser = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $otherUser->id]);
        $history = $ownerProfile->aiHistories()->create([
            'type' => 'cv_analysis',
            'payload' => ['ats_score' => 80],
        ]);

        $this->actingAs($otherUser)
            ->deleteJson('/app/ai/history/'.$history->id)
            ->assertForbidden();
        $this->assertDatabaseHas('ai_history', ['id' => $history->id]);
    }

    public function test_new_analysis_is_rejected_when_history_type_is_full(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $profile = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        foreach (range(1, 20) as $number) {
            $profile->aiHistories()->create([
                'type' => 'cv_analysis',
                'payload' => ['ats_score' => $number],
            ]);
        }

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', [
            'cv_text' => 'Nama Budi. Pengalaman frontend developer dengan React.',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['history']);
    }

    private function latestHistoryPayload(User $user, string $type): array
    {
        return $user->jobSeekerProfile->aiHistories()->where('type', $type)->latest('id')->firstOrFail()->payload;
    }

    public function test_pelamar_can_request_ai_match_for_a_vacancy(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'current_job_title' => 'Frontend Developer',
        ]);
        SeekerAccessibilityProfile::factory()->create([
            'user_id' => $user->id,
            'disability_types' => ['netra'],
            'accommodations_needed' => ['screen_reader_software'],
        ]);

        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'skills_required' => ['React', 'JavaScript'],
        ]);
        VacancyAccessibility::factory()->create([
            'vacancy_id' => $vacancy->id,
            'accommodation_type' => 'screen_reader_software',
        ]);

        $response = $this->actingAs($user)->post('/app/ai/match/'.$vacancy->id);

        $response->assertOk();
        $response->assertJsonStructure([
            'match_percentage',
            'competency_score',
            'accessibility_score',
            'matching_points',
            'gaps',
            'summary',
        ]);

        $this->assertDatabaseHas('ai_job_matches', [
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
        ]);
    }

    public function test_job_match_includes_skill_gap_analysis_for_selected_vacancy(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create([
            'user_id' => $user->id,
            'skills' => ['React', 'CSS'],
        ]);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create([
            'company_profile_id' => $company->id,
            'status' => 'active',
            'skills_required' => ['React', 'TypeScript'],
        ]);

        $response = $this->actingAs($user)->post('/app/ai/match/'.$vacancy->id);

        $response->assertOk()->assertJsonStructure([
            'skill_gap' => [
                'match_score',
                'matched_skills',
                'missing_skills',
                'learning_recommendations',
            ],
        ]);
        $response->assertJsonPath('skill_gap.matched_skills', ['React']);
        $response->assertJsonPath('skill_gap.missing_skills', ['TypeScript']);
    }

    public function test_pelamar_can_run_skill_gap_analysis(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/skill-gap', [
            'my_skills' => ['HTML', 'CSS', 'JavaScript'],
            'target_skills' => ['JavaScript', 'React', 'TypeScript'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'match_score',
            'matched_skills',
            'missing_skills',
            'learning_recommendations',
        ]);
    }

    public function test_pelamar_can_scan_cv_for_ats_readability(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', [
            'cv_text' => "Nama: Budi\nPengalaman: 2 tahun web development dengan React dan CSS.",
            'target_skills' => ['React'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'ats_score',
            'formatting_grade',
            'summary',
            'category_scores' => [
                'ats_compatibility',
                'structure_format',
                'content_relevance',
                'keyword_usage',
                'experience_achievement',
                'project_portfolio',
            ],
            'strengths',
            'improvements',
            'strengths_detailed',
            'improvements_detailed',
            'suggested_keywords',
            'action_recommendations',
            'accessibility_tips',
        ]);
    }

    public function test_pelamar_can_scan_profile_cv_without_changing_profile_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'pelamar']);
        $path = 'cvs/profile/profile.txt';
        Storage::disk('public')->put($path, "Nama Budi\nPengalaman frontend developer dengan React dan CSS.");
        $profile = JobSeekerProfile::factory()->create(['user_id' => $user->id, 'cv_path' => $path]);

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', [
            'source' => 'profile',
            'target_skills' => ['React'],
        ]);

        $response->assertOk()->assertJsonStructure(['ats_score', 'formatting_grade']);
        $this->assertSame($path, $profile->fresh()->cv_path);
        $this->assertTrue(Storage::disk('public')->exists($path));
    }

    public function test_profile_source_requires_existing_profile_cv(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/app/ai/cv-review', ['source' => 'profile']);

        $response->assertStatus(422)->assertJsonValidationErrors(['source']);
    }

    public function test_pelamar_can_scan_temporary_uploaded_cv_without_replacing_profile_cv(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'pelamar']);
        $profilePath = 'cvs/profile/existing.txt';
        Storage::disk('public')->put($profilePath, 'Existing profile CV');
        $profile = JobSeekerProfile::factory()->create(['user_id' => $user->id, 'cv_path' => $profilePath]);
        $file = UploadedFile::fake()->createWithContent('new-cv.pdf', <<<'PDF'
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 75>>stream
BT /F1 12 Tf 72 720 Td (Nama Budi Pengalaman developer dengan React dan CSS.) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
trailer<</Root 1 0 R/Size 6>>
startxref
0
%%EOF
PDF);

        $response = $this->actingAs($user)->post('/app/ai/cv-review', [
            'source' => 'upload',
            'cv' => $file,
            'target_skills' => ['React'],
        ], ['Accept' => 'application/json']);

        $response->assertOk()->assertJsonStructure(['ats_score', 'formatting_grade']);
        $this->assertSame($profilePath, $profile->fresh()->cv_path);
        $this->assertTrue(Storage::disk('public')->exists($profilePath));
    }

    public function test_uploaded_cv_must_use_supported_file_type(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $file = UploadedFile::fake()->create('cv.exe', 10, 'application/octet-stream');

        $response = $this->actingAs($user)->post('/app/ai/cv-review', [
            'source' => 'upload',
            'cv' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422)->assertJsonValidationErrors(['cv']);
    }
}
