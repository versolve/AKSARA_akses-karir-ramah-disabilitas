<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_seeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('phone', 20)->nullable();
            $table->text('bio')->nullable();
            $table->string('education', 255)->nullable();
            $table->text('experience')->nullable();
            $table->string('current_job_title', 255)->nullable();
            $table->string('cv_path')->nullable();
            $table->unsignedTinyInteger('profile_completed_percentage')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_seeker_profiles');
    }
};
