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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_disabled')->default(false)->after('is_verified');
            $table->timestamp('disabled_at')->nullable()->after('is_disabled');
            $table->timestamp('scheduled_deletion_at')->nullable()->index()->after('disabled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['scheduled_deletion_at']);
            $table->dropColumn([
                'is_disabled',
                'disabled_at',
                'scheduled_deletion_at',
            ]);
        });
    }
};
