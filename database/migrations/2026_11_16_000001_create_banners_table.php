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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('type')->default('interactive'); // 'interactive', 'image', 'info'
            $table->string('image_path')->nullable();
            $table->string('image_url')->nullable();
            $table->string('link_url')->nullable();
            $table->string('link_target')->default('_self');
            $table->string('cta_text')->nullable();
            $table->string('search_placeholder')->nullable();
            $table->string('bg_gradient')->nullable()->default('blue'); // 'blue', 'indigo', 'emerald', 'dark', 'purple', 'sunset'
            $table->string('text_color')->default('dark'); // 'dark', 'light'
            $table->string('target_role')->default('pelamar'); // 'pelamar', 'all', 'perusahaan'
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
