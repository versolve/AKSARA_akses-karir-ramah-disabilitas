<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->json('skills')->nullable()->after('portfolio_url');
            $table->json('work_experiences')->nullable()->after('skills');
            $table->json('educations')->nullable()->after('work_experiences');
            $table->json('projects')->nullable()->after('educations');
            $table->json('certifications')->nullable()->after('projects');
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->dropColumn(['skills', 'work_experiences', 'educations', 'projects', 'certifications']);
        });
    }
};
