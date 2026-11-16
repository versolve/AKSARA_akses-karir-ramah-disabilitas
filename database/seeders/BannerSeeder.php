<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Banner Interaktif (Sapaan Personal + Search Bar Lowongan)
        Banner::firstOrCreate(
            ['title' => 'Halo, {name}!'],
            [
                'subtitle' => 'Terus semangat dalam mencari peluang karier terbaik bersama Profabel. Setiap langkahmu berarti.',
                'type' => 'interactive',
                'search_placeholder' => 'Cari lowongan pekerjaan, posisi atau perusahaan',
                'bg_gradient' => 'blue',
                'text_color' => 'dark',
                'target_role' => 'pelamar',
                'order' => 1,
                'is_active' => true,
            ]
        );

        // 2. Banner Info / Promo AI Assistant
        Banner::firstOrCreate(
            ['title' => 'Optimalkan Peluang Karier dengan AI ATS Scanner'],
            [
                'subtitle' => 'Gunakan fitur AI Career Assistant untuk mencocokkan CV Anda dengan kriteria lowongan inklusif dalam hitungan detik.',
                'type' => 'info',
                'cta_text' => 'Coba AI Scanner Sekarang',
                'link_url' => '/app/ai-assistant',
                'link_target' => '_self',
                'bg_gradient' => 'indigo',
                'text_color' => 'dark',
                'target_role' => 'pelamar',
                'order' => 2,
                'is_active' => true,
            ]
        );

        // 3. Banner Visual Grafis / Foto Karier Inklusif
        Banner::firstOrCreate(
            ['title' => 'Bursa Kerja Inklusif: Sambut Kesempatan Emasmu'],
            [
                'subtitle' => 'Jelajahi puluhan perusahaan mitra yang menyediakan akomodasi aksesibilitas lengkap dan lingkungan kerja ramah disabilitas.',
                'type' => 'image',
                'image_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
                'link_url' => '/jobs',
                'link_target' => '_self',
                'cta_text' => 'Jelajahi Lowongan',
                'bg_gradient' => 'blue',
                'text_color' => 'dark',
                'target_role' => 'pelamar',
                'order' => 3,
                'is_active' => true,
            ]
        );
    }
}
