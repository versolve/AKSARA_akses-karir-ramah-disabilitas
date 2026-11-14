<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('location')->nullable()->after('address');
            $table->text('workplace_accessibility')->nullable()->after('description');
            $table->string('company_size')->nullable()->after('workplace_accessibility');
            $table->string('founded_year')->nullable()->after('company_size');
            $table->string('company_type')->nullable()->after('founded_year');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'location',
                'workplace_accessibility',
                'company_size',
                'founded_year',
                'company_type',
            ]);
        });
    }
};
