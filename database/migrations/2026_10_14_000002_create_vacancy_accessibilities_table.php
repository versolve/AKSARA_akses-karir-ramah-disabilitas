<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vacancy_accessibilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('vacancies')->onDelete('cascade');
            $table->string('accommodation_type');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['vacancy_id', 'accommodation_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancy_accessibilities');
    }
};
