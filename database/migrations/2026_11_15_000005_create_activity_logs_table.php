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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name')->default('Sistem Otomatis');
            $table->string('actor_email')->nullable();
            $table->string('actor_role')->default('system'); // admin, perusahaan, pelamar, system, guest
            $table->string('action'); // create, update, delete, approve, reject, login, logout, reveal_key, switch_model, status_change, etc.
            $table->string('module'); // users, companies, vacancies, applications, ai_engine, settings, messages, auth
            $table->string('module_label')->nullable(); // Readable: Kelola Pengguna, AI Management, dll
            $table->text('description'); // Ringkasan aktivitas manusiawi
            $table->string('subject_type')->nullable(); // Model class: App\Models\Vacancy, etc.
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label')->nullable(); // e.g. "Lowongan: Frontend Developer (PT Inklusi)"
            $table->json('properties')->nullable(); // old, new, diff, extra attributes
            $table->string('severity')->default('info'); // info, warning, danger
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('browser')->nullable(); // e.g. "Chrome 122 on Windows 11"
            $table->string('method', 10)->default('POST'); // GET, POST, PUT, DELETE
            $table->string('url')->nullable();
            $table->timestamps();

            // Index untuk kecepatan query filter & analytic dashboard
            $table->index(['created_at']);
            $table->index(['module']);
            $table->index(['action']);
            $table->index(['severity']);
            $table->index(['user_id']);
            $table->index(['subject_type', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
