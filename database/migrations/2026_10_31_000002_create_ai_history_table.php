<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_seeker_profile_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['cv_analysis', 'job_match']);
            $table->json('payload');
            $table->string('metadata_source')->nullable();
            $table->timestamp('analyzed_at')->useCurrent();
            $table->timestamps();

            $table->index(['job_seeker_profile_id', 'type', 'analyzed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_history');
    }
};
