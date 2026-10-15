<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_job_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('vacancies')->onDelete('cascade');
            $table->foreignId('job_seeker_profile_id')->constrained('job_seeker_profiles')->onDelete('cascade');
            $table->unsignedTinyInteger('match_percentage');
            $table->unsignedTinyInteger('competency_score');
            $table->unsignedTinyInteger('accessibility_score');
            $table->json('matching_points')->nullable();
            $table->json('gaps')->nullable();
            $table->text('summary')->nullable();
            $table->timestamps();

            $table->unique(['vacancy_id', 'job_seeker_profile_id'], 'ai_match_unique');
            $table->index(['job_seeker_profile_id', 'match_percentage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_job_matches');
    }
};
