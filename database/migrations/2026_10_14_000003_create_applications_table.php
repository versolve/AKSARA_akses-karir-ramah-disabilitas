<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('vacancies')->onDelete('cascade');
            $table->foreignId('job_seeker_profile_id')->constrained('job_seeker_profiles')->onDelete('cascade');
            $table->text('cover_letter')->nullable();
            $table->string('cv_path');
            $table->enum('status', ['submitted', 'reviewed', 'interview', 'rejected', 'hired', 'withdrawn'])->default('submitted');
            $table->text('status_notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();

            $table->unique(['vacancy_id', 'job_seeker_profile_id'], 'app_vacancy_seeker_unique');
            $table->index(['job_seeker_profile_id', 'status']);
            $table->index(['vacancy_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
