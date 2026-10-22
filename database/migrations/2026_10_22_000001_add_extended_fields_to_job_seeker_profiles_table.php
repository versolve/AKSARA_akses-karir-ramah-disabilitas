<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('phone');
            $table->string('domicile')->nullable()->after('birth_date');
            $table->string('gender', 50)->nullable()->after('domicile');
            $table->string('linkedin_url')->nullable()->after('cv_path');
            $table->string('portfolio_url')->nullable()->after('linkedin_url');
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'domicile',
                'gender',
                'linkedin_url',
                'portfolio_url',
            ]);
        });
    }
};
