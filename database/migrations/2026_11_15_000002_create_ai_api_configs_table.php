<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_api_configs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider')->default('gemini'); // gemini, openai, anthropic, custom, mock
            $table->text('api_key')->nullable();
            $table->string('model')->default('gemini-1.5-flash');
            $table->string('base_url')->nullable();
            $table->unsignedSmallInteger('timeout')->default(20);
            $table->unsignedInteger('max_tokens')->default(1500);
            $table->decimal('temperature', 3, 2)->default(0.20);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('rate_limit_rpm')->default(60);
            $table->unsignedInteger('daily_request_limit')->default(1000);
            $table->unsignedInteger('monthly_request_limit')->default(30000);
            $table->unsignedBigInteger('total_requests')->default(0);
            $table->unsignedBigInteger('total_tokens')->default(0);
            $table->unsignedBigInteger('success_requests')->default(0);
            $table->unsignedBigInteger('failed_requests')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_health_status')->default('unknown'); // unknown, healthy, degraded, error
            $table->timestamp('last_health_check_at')->nullable();
            $table->text('last_error_message')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['provider', 'is_active']);
            $table->index(['is_active', 'is_primary']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_api_configs');
    }
};
