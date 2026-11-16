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
        Schema::table('ai_api_configs', function (Blueprint $table) {
            $table->unsignedInteger('tpm_limit')->default(0)->after('rate_limit_rpm');
            $table->json('enabled_models')->nullable()->after('model');
            $table->json('model_limits')->nullable()->after('enabled_models');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_api_configs', function (Blueprint $table) {
            $table->dropColumn(['tpm_limit', 'enabled_models', 'model_limits']);
        });
    }
};
