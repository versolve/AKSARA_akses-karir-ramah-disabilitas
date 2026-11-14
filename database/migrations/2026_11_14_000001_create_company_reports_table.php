<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_profile_id')->constrained('company_profiles')->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // 'rekap_lowongan', 'rekap_lamaran', 'hasil_seleksi', 'aktivitas_rekrutmen'
            $table->string('period_label');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('format'); // 'pdf', 'excel'
            $table->string('status')->default('selesai');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_reports');
    }
};
