<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_profile_id')->constrained('company_profiles')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description');
            $table->enum('job_type', ['full-time', 'part-time', 'contract', 'internship', 'freelance'])->default('full-time');
            $table->enum('work_model', ['onsite', 'remote', 'hybrid'])->default('onsite');
            $table->string('location');
            $table->unsignedBigInteger('salary_min')->nullable();
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->boolean('is_salary_public')->default(true);
            $table->enum('experience_level', ['junior', 'mid', 'senior', 'lead'])->default('junior');
            $table->json('requirements')->nullable();
            $table->json('skills_required')->nullable();
            $table->enum('status', ['draft', 'active', 'closed'])->default('active');
            $table->date('deadline')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['work_model', 'job_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancies');
    }
};
