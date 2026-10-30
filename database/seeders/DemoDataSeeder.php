<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\Message;
use App\Models\SeekerAccessibilityProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\VacancyAccessibility;
use App\Notifications\ApplicationStatusChanged;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        // 1. Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@aksara.id'],
            [
                'name' => 'Administrator Profabel',
                'password' => $password,
                'role' => 'admin',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // 2. Company Accounts
        $hr1 = User::firstOrCreate(
            ['email' => 'hr@inklusiftech.id'],
            [
                'name' => 'HR Inklusif Teknologi',
                'password' => $password,
                'role' => 'perusahaan',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $company1 = CompanyProfile::firstOrCreate(
            ['user_id' => $hr1->id],
            [
                'company_name' => 'PT Inklusif Teknologi Nusantara',
                'industry' => 'Teknologi Informasi & Perangkat Lunak',
                'address' => 'Gedung Cyber 2 Lantai 15, Jl. H.R. Rasuna Said, Kuningan, Jakarta Selatan',
                'website' => 'https://inklusiftech.id',
                'description' => 'Perusahaan konsultan perangkat lunak dengan budaya kerja ramah disabilitas dan infrastruktur aksesibel.',
                'is_approved' => true,
            ]
        );

        $hr2 = User::firstOrCreate(
            ['email' => 'hr@karyasama.id'],
            [
                'name' => 'HR Karya Bersama',
                'password' => $password,
                'role' => 'perusahaan',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $company2 = CompanyProfile::firstOrCreate(
            ['user_id' => $hr2->id],
            [
                'company_name' => 'PT Karya Bersama Inklusif',
                'industry' => 'Layanan Pelanggan & Alih Daya',
                'address' => 'Jl. Gatot Subroto No. 88, Bandung, Jawa Barat',
                'website' => 'https://karyasama.id',
                'description' => 'Penyedia layanan contact center dan administrasi berbasis digital yang mengutamakan keberagaman karyawan.',
                'is_approved' => true,
            ]
        );

        // 3. Job Seeker Accounts (3 diverse disabilities)
        // Seeker A: Netra
        $seekerUser1 = User::firstOrCreate(
            ['email' => 'budi.netra@aksara.id'],
            [
                'name' => 'Budi Santoso',
                'password' => $password,
                'role' => 'pelamar',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $seekerProfile1 = JobSeekerProfile::firstOrCreate(
            ['user_id' => $seekerUser1->id],
            [
                'phone' => '081234567890',
                'current_job_title' => 'Frontend Developer & Accessibility Advocate',
                'education' => 'S1 Teknik Informatika, Universitas Indonesia',
                'experience' => '3 tahun mengembangkan web ramah aksesibilitas dengan React dan screen reader.',
                'bio' => 'Saya penyandang disabilitas netra (low vision) yang mahir dalam pemrograman web frontend dan optimasi ARIA.',
                'profile_completed_percentage' => 100,
            ]
        );

        SeekerAccessibilityProfile::firstOrCreate(
            ['user_id' => $seekerUser1->id],
            [
                'disability_types' => ['netra'],
                'accommodations_needed' => ['screen_reader_software', 'remote_option', 'flexible_hours'],
                'notes' => 'Membutuhkan dukungan pembaca layar NVDA/JAWS dan dokumen kerja dalam format digital yang accessible.',
            ]
        );

        // Seeker B: Fisik / Kursi Roda
        $seekerUser2 = User::firstOrCreate(
            ['email' => 'siti.fisik@aksara.id'],
            [
                'name' => 'Siti Rahmawati',
                'password' => $password,
                'role' => 'pelamar',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $seekerProfile2 = JobSeekerProfile::firstOrCreate(
            ['user_id' => $seekerUser2->id],
            [
                'phone' => '082345678901',
                'current_job_title' => 'Data Entry & Administrative Officer',
                'education' => 'D3 Manajemen Informatika, Politeknik Negeri Bandung',
                'experience' => '2 tahun mengelola input database dan verifikasi berkas administrasi.',
                'bio' => 'Pengguna kursi roda dengan ketelitian tinggi dalam pengolahan data spreadsheet dan sistem ERP.',
                'profile_completed_percentage' => 95,
            ]
        );

        SeekerAccessibilityProfile::firstOrCreate(
            ['user_id' => $seekerUser2->id],
            [
                'disability_types' => ['fisik'],
                'accommodations_needed' => ['ramp_access', 'elevator', 'accessible_restroom', 'ergonomic_workspace'],
                'notes' => 'Menggunakan kursi roda aktif, memerlukan akses jalan tanpa tangga dan toilet dengan handrail.',
            ]
        );

        // Seeker C: Rungu / Tuli
        $seekerUser3 = User::firstOrCreate(
            ['email' => 'andi.rungu@aksara.id'],
            [
                'name' => 'Andi Wijaya',
                'password' => $password,
                'role' => 'pelamar',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        $seekerProfile3 = JobSeekerProfile::firstOrCreate(
            ['user_id' => $seekerUser3->id],
            [
                'phone' => '083456789012',
                'current_job_title' => 'Digital Customer Care & QA Specialist',
                'education' => 'S1 Sistem Informasi, Universitas Gadjah Mada',
                'experience' => '2 tahun menangani chat customer care dan pengujian fungsional aplikasi.',
                'bio' => 'Teman Tuli yang fasih bahasa isyarat BISINDO dan komunikasi tertulis digital.',
                'profile_completed_percentage' => 100,
            ]
        );

        SeekerAccessibilityProfile::firstOrCreate(
            ['user_id' => $seekerUser3->id],
            [
                'disability_types' => ['rungu'],
                'accommodations_needed' => ['written_communication', 'sign_language_interpreter'],
                'notes' => 'Komunikasi kerja efektif melalui chat, email, dan teks tertulis; membutuhkan Juru Bahasa Isyarat untuk meeting besar.',
            ]
        );

        // 4. Five Accessible Vacancies
        // Vacancy 1: Frontend Engineer (Inklusif Teknologi - Remote)
        $vac1 = Vacancy::firstOrCreate(
            ['slug' => 'frontend-engineer-inklusif-tech'],
            [
                'company_profile_id' => $company1->id,
                'title' => 'Frontend Engineer (Ramah Netra & Rungu)',
                'description' => "Kami mencari pengembang frontend yang peduli pada aksesibilitas web.\n\nTanggung Jawab:\n- Mengembangkan antarmuka web modern dengan React dan TypeScript\n- Memastikan kepatuhan WCAG 2.1 AA/AAA pada setiap komponen\n- Berkolaborasi dengan tim desain secara jarak jauh\n\nFasilitas Kerja:\n- Kerja 100% remote dari mana saja\n- Lisensi software pembaca layar (NVDA/JAWS) disediakan\n- Komunikasi tim terstruktur melalui Slack dan dokumen tertulis",
                'job_type' => 'full-time',
                'work_model' => 'remote',
                'location' => 'Jakarta Selatan / Seluruh Indonesia (Remote)',
                'salary_min' => 9000000,
                'salary_max' => 14000000,
                'is_salary_public' => true,
                'experience_level' => 'mid',
                'requirements' => ['Pengalaman React minimal 1 tahun', 'Memahami dasar semantik HTML & ARIA', 'Mampu bekerja mandiri'],
                'skills_required' => ['React', 'TypeScript', 'Tailwind CSS', 'Web Accessibility (a11y)'],
                'status' => 'active',
                'deadline' => now()->addDays(30),
            ]
        );

        $this->syncAccessibilities($vac1, [
            ['accommodation_type' => 'remote_option', 'description' => 'Kerja jarak jauh penuh dari rumah.'],
            ['accommodation_type' => 'screen_reader_software', 'description' => 'Dukungan software dan panduan screen reader disediakan.'],
            ['accommodation_type' => 'written_communication', 'description' => 'Seluruh koordinasi harian dilakukan via teks tertulis.'],
        ]);

        // Vacancy 2: Data Entry Specialist (Karya Bersama Inklusif - Onsite Bandung)
        $vac2 = Vacancy::firstOrCreate(
            ['slug' => 'data-entry-specialist-karyasama'],
            [
                'company_profile_id' => $company2->id,
                'title' => 'Data Entry & Verifikator Berkas (Ramah Fisik & Rungu)',
                'description' => "Bertanggung jawab atas akurasi input data pada sistem digital klien kami.\n\nGedung kantor kami telah diaudit dan bersertifikasi ramah disabilitas dengan ram kursi roda, lift otomatis, dan toilet khusus.",
                'job_type' => 'full-time',
                'work_model' => 'onsite',
                'location' => 'Bandung, Jawa Barat',
                'salary_min' => 4500000,
                'salary_max' => 6000000,
                'is_salary_public' => true,
                'experience_level' => 'junior',
                'requirements' => ['Pendidikan minimal SMA/SMK atau D3', 'Teliti dan terbiasa dengan Microsoft Excel / Google Sheets'],
                'skills_required' => ['Microsoft Excel', 'Data Entry', 'Ketelitian'],
                'status' => 'active',
                'deadline' => now()->addDays(20),
            ]
        );

        $this->syncAccessibilities($vac2, [
            ['accommodation_type' => 'ramp_access', 'description' => 'Ram landai di pintu masuk utama dan jalur gedung.'],
            ['accommodation_type' => 'elevator', 'description' => 'Lift prioritas dengan tombol audio dan braille.'],
            ['accommodation_type' => 'accessible_restroom', 'description' => 'Toilet khusus disabilitas di setiap lantai kerja.'],
            ['accommodation_type' => 'written_communication', 'description' => 'Instruksi SOP kerja tersedia dalam format teks visual.'],
        ]);

        // Vacancy 3: Customer Support Live Chat (Karya Bersama Inklusif - Remote)
        $vac3 = Vacancy::firstOrCreate(
            ['slug' => 'customer-support-live-chat'],
            [
                'company_profile_id' => $company2->id,
                'title' => 'Customer Support Live Chat (Ramah Rungu & Wicara)',
                'description' => "Melayani pertanyaan dan bantuan pelanggan melalui saluran pesan instan (Live Chat & WhatsApp Business).\n\nPosisi ini 100% berbasis teks tanpa panggilan telepon, sangat cocok untuk penyandang disabilitas rungu dan wicara.",
                'job_type' => 'full-time',
                'work_model' => 'remote',
                'location' => 'Bandung / Remote',
                'salary_min' => 4800000,
                'salary_max' => 6500000,
                'is_salary_public' => true,
                'experience_level' => 'junior',
                'requirements' => ['Kemampuan mengetik cepat dan tepat', 'Komunikasi tertulis yang sopan dan ramah'],
                'skills_required' => ['Customer Service', 'Live Chat', 'Komunikasi Tertulis'],
                'status' => 'active',
                'deadline' => now()->addDays(25),
            ]
        );

        $this->syncAccessibilities($vac3, [
            ['accommodation_type' => 'remote_option', 'description' => 'Kerja dari rumah dengan laptop yang disubsidi perusahaan.'],
            ['accommodation_type' => 'written_communication', 'description' => 'Tidak ada panggilan suara/telepon dalam pekerjaan.'],
        ]);

        // Vacancy 4: Quality Assurance Tester (Inklusif Teknologi - Hybrid)
        $vac4 = Vacancy::firstOrCreate(
            ['slug' => 'qa-software-tester-inklusif-tech'],
            [
                'company_profile_id' => $company1->id,
                'title' => 'QA Manual Tester (Hybrid Jakarta)',
                'description' => "Menguji fungsi dan alur aplikasi sebelum dirilis ke pengguna umum.\n\nKantor kami di Jakarta Selatan dilengkapi akses ram, lift, dan ruang sensorik tenang.",
                'job_type' => 'contract',
                'work_model' => 'hybrid',
                'location' => 'Jakarta Selatan',
                'salary_min' => 6500000,
                'salary_max' => 9000000,
                'is_salary_public' => true,
                'experience_level' => 'junior',
                'requirements' => ['Familiar dengan aplikasi web & mobile', 'Kritis dan teliti mencari bug'],
                'skills_required' => ['Software Testing', 'Bug Reporting', 'Dokumentasi'],
                'status' => 'active',
                'deadline' => now()->addDays(15),
            ]
        );

        $this->syncAccessibilities($vac4, [
            ['accommodation_type' => 'ramp_access', 'description' => 'Akses kursi roda di seluruh lantai kantor.'],
            ['accommodation_type' => 'elevator', 'description' => 'Lift beroperasi 24 jam dengan akses ramah kursi roda.'],
            ['accommodation_type' => 'quiet_space', 'description' => 'Ruang tenang untuk fokus bekerja tanpa gangguan audio.'],
        ]);

        // Vacancy 5: Staf Administrasi & Pengarsipan Digital (Karya Bersama - Onsite)
        $vac5 = Vacancy::firstOrCreate(
            ['slug' => 'staf-administrasi-pengarsipan'],
            [
                'company_profile_id' => $company2->id,
                'title' => 'Staf Administrasi & Pengarsipan Digital',
                'description' => "Membantu pengarsipan dokumen digital dan pencatatan inventaris kantor.",
                'job_type' => 'full-time',
                'work_model' => 'onsite',
                'location' => 'Bandung',
                'salary_min' => 4200000,
                'salary_max' => 5200000,
                'is_salary_public' => false,
                'experience_level' => 'junior',
                'requirements' => ['Terbuka untuk lulusan baru', 'Mampu mengoperasikan komputer'],
                'skills_required' => ['Administrasi', 'Pengarsipan', 'Google Drive'],
                'status' => 'active',
                'deadline' => now()->addDays(40),
            ]
        );

        $this->syncAccessibilities($vac5, [
            ['accommodation_type' => 'ramp_access', 'description' => 'Fasilitas ram di setiap akses masuk.'],
            ['accommodation_type' => 'accessible_restroom', 'description' => 'Toilet ramah disabilitas.'],
            ['accommodation_type' => 'flexible_hours', 'description' => 'Toleransi jam kerja fleksibel untuk mobilitas.'],
        ]);

        // 5. Sample Applications & Conversations
        // Application 1: Budi (Netra) applied to Vacancy 1 -> status: interview
        $app1 = Application::firstOrCreate(
            [
                'vacancy_id' => $vac1->id,
                'job_seeker_profile_id' => $seekerProfile1->id,
            ],
            [
                'cover_letter' => 'Saya tertarik melamar sebagai Frontend Engineer. Saya memiliki pengalaman 3 tahun dalam a11y.',
                'cv_path' => 'cvs/sample-cv.pdf',
                'status' => 'interview',
                'status_notes' => 'Wawancara teknis via Google Meet dijadwalkan hari Selasa, 20 Oktober pukul 14:00 WIB.',
                'applied_at' => now()->subDays(5),
            ]
        );

        // Messages for Application 1
        Message::firstOrCreate(
            [
                'application_id' => $app1->id,
                'body' => 'Halo tim HR Inklusif Tech, terima kasih atas undangannya. Apakah nanti sesi wawancara dilakukan via Google Meet?',
            ],
            [
                'sender_id' => $seekerUser1->id,
                'is_read' => true,
                'created_at' => now()->subDays(2),
            ]
        );

        Message::firstOrCreate(
            [
                'application_id' => $app1->id,
                'body' => 'Halo Mas Budi, betul sekali. Link Google Meet sudah kami kirimkan dan seluruh presentasi telah dioptimalkan untuk screen reader.',
            ],
            [
                'sender_id' => $hr1->id,
                'is_read' => true,
                'created_at' => now()->subDay(),
            ]
        );

        // Notify Budi
        $seekerUser1->notify(new ApplicationStatusChanged($app1, 'interview', 'Jadwal wawancara via Google Meet hari Selasa.'));

        // Application 2: Siti (Fisik) applied to Vacancy 2 -> status: reviewed
        $app2 = Application::firstOrCreate(
            [
                'vacancy_id' => $vac2->id,
                'job_seeker_profile_id' => $seekerProfile2->id,
            ],
            [
                'cover_letter' => 'Saya mengajukan diri untuk posisi Data Entry di Bandung. Fasilitas ram kursi roda di kantor sangat mendukung mobilitas saya.',
                'cv_path' => 'cvs/sample-cv.pdf',
                'status' => 'reviewed',
                'status_notes' => 'Berkas dan kualifikasi sedang ditinjau oleh Kepala Bagian Administrasi.',
                'applied_at' => now()->subDays(3),
            ]
        );

        $seekerUser2->notify(new ApplicationStatusChanged($app2, 'reviewed', 'Berkas Anda sedang ditinjau oleh tim kami.'));

        // Application 3: Andi (Rungu) applied to Vacancy 3 -> status: hired
        $app3 = Application::firstOrCreate(
            [
                'vacancy_id' => $vac3->id,
                'job_seeker_profile_id' => $seekerProfile3->id,
            ],
            [
                'cover_letter' => 'Saya teman Tuli dengan kecepatan mengetik 85 WPM. Senang bisa melamar di posisi chat support ini.',
                'cv_path' => 'cvs/sample-cv.pdf',
                'status' => 'hired',
                'status_notes' => 'Selamat bergabung di PT Karya Bersama Inklusif! Surat penawaran kerja (Offering Letter) telah dikirim.',
                'applied_at' => now()->subDays(10),
            ]
        );

        Message::firstOrCreate(
            [
                'application_id' => $app3->id,
                'body' => 'Selamat Mas Andi, hasil tes praktik chat support Anda sangat memuaskan. Kami nantikan kerja samanya!',
            ],
            [
                'sender_id' => $hr2->id,
                'is_read' => true,
                'created_at' => now()->subDays(3),
            ]
        );

        Message::firstOrCreate(
            [
                'application_id' => $app3->id,
                'body' => 'Terima kasih banyak atas kesempatannya! Saya sudah membaca dan menyetujui offering letter.',
            ],
            [
                'sender_id' => $seekerUser3->id,
                'is_read' => true,
                'created_at' => now()->subDays(2),
            ]
        );
    }

    private function syncAccessibilities(Vacancy $vacancy, array $items): void
    {
        $vacancy->accessibilities()->delete();
        foreach ($items as $item) {
            $vacancy->accessibilities()->create($item);
        }
    }
}
