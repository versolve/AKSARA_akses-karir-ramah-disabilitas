# Spesifikasi Desain Aplikasi AKSARA (Akses Karier Ramah Disabilitas)

- **Tanggal**: 2026-10-13
- **Status**: Disetujui
- **Tech Stack**: Laravel 11/12, Inertia.js, React 19 (TypeScript), Tailwind CSS v4, MySQL (Laragon).

---

## 1. Ringkasan Sistem
AKSARA adalah platform pencarian kerja inklusif yang menghubungkan penyandang disabilitas dengan perusahaan ramah disabilitas. Sistem menyediakan pencocokan berbasis kompetensi dan kebutuhan aksesibilitas tempat kerja, dilengkapi fitur aksesibilitas web (TTS, zoom teks, keyboard-friendly) dan AI Career Assistant.

### Aktor Sistem:
1. **Pelamar (Job Seeker)**: Pencari kerja penyandang disabilitas.
2. **Perusahaan / HR**: Penyedia lowongan yang membuka akses kerja ramah disabilitas.
3. **Admin**: Pengelola platform, verifikator perusahaan, dan moderator lowongan.

---

## 2. Arsitektur Data & Model Multi-Role

### 2.1 Skema Tabel Inti
- `users`:
  - `id` (bigint, PK)
  - `name` (string)
  - `email` (string, unique)
  - `password` (string)
  - `role` (enum: `pelamar`, `perusahaan`, `admin`)
  - `is_verified` (boolean, default false)
  - `timestamps`

- `job_seeker_profiles`:
  - `id` (bigint, PK)
  - `user_id` (bigint, FK users)
  - `phone` (string, nullable)
  - `bio` (text, nullable)
  - `education` (string, nullable)
  - `experience` (text, nullable)
  - `current_job_title` (string, nullable)
  - `cv_path` (string, nullable)
  - `profile_completed_percentage` (tinyint, default 0)
  - `timestamps`

- `seeker_accessibility_profiles`:
  - `id` (bigint, PK)
  - `user_id` (bigint, FK users)
  - `disability_types` (json: fisik, netra, rungu, wicara, intelektual, dsb.)
  - `accommodations_needed` (json: screen reader, ramp, komunikasi tertulis, remote work, dsb.)
  - `notes` (text, nullable)
  - `timestamps`

- `company_profiles`:
  - `id` (bigint, PK)
  - `user_id` (bigint, FK users)
  - `company_name` (string)
  - `industry` (string)
  - `address` (text)
  - `website` (string, nullable)
  - `logo_path` (string, nullable)
  - `description` (text, nullable)
  - `is_approved` (boolean, default false - oleh Admin)
  - `timestamps`

- `user_preferences`:
  - `id` (bigint, PK)
  - `user_id` (bigint, FK users, nullable untuk guest)
  - `text_scale` (enum: `80`, `90`, `100`, `110`, `125`, default `100`)
  - `tts_enabled` (boolean, default false)
  - `high_contrast` (boolean, default false)
  - `reduce_motion` (boolean, default false)
  - `timestamps`

---

## 3. Fitur Aksesibilitas Web

### 3.1 Text-to-Speech (TTS)
- Menggunakan browser native **Web Speech API** (`window.speechSynthesis`).
- Mengutamakan suara Bahasa Indonesia (`id-ID`).
- Tombol baca suara di setiap artikel/kartu lowongan utama.
- Dukungan highlight kalimat/kata aktif selama pembacaan teks berlangsung.

### 3.2 Pengaturan Teks & Kontras
- Skala font dikontrol melalui variabel CSS global `--font-scale` pada elemen `:root`.
- Semua styling tipografi menggunakan unit `rem` agar terskala presisi.
- Mode kontras tinggi (High Contrast) mengaktifkan rasio kontras warna WCAG AAA.

### 3.3 Navigasi Keyboard & Screen Reader
- Link `Skip to main content` di awal setiap halaman.
- Indikator focus ring terlihat jelas (`outline` / `ring` tegas saat status `:focus-visible`).
- Elemen interaktif memakai atribut ARIA relevan (`aria-label`, `aria-expanded`, `aria-live="polite"` untuk notifikasi status lamaran).

---

## 4. Alur Bisnis Rekrutmen (Core Flow)

### 4.1 Lowongan & Aksesibilitas Tempat Kerja
- `vacancies`:
  - `id` (bigint, PK)
  - `company_profile_id` (bigint, FK company_profiles)
  - `title` (string)
  - `slug` (string, unique)
  - `description` (longtext)
  - `job_type` (enum: `full-time`, `part-time`, `contract`, `internship`, `freelance`)
  - `work_model` (enum: `onsite`, `remote`, `hybrid`)
  - `location` (string)
  - `salary_min`, `salary_max`, `is_salary_public`
  - `experience_level` (enum: `junior`, `mid`, `senior`, `lead`)
  - `requirements` (json)
  - `skills_required` (json)
  - `status` (enum: `draft`, `active`, `closed`)
  - `deadline` (date, nullable)
  - `timestamps`, `softDeletes`

- `vacancy_accessibilities`:
  - `id` (bigint, PK)
  - `vacancy_id` (bigint, FK vacancies)
  - `accommodation_type` (string/enum: ramp akses, lift, toilet difabel, screen reader, komunikasi tertulis, jam fleksibel, full remote, dsb.)
  - `description` (text, nullable)

### 4.2 Pencarian & Filter
- Filter kombinasi: kata kunci, lokasi, tipe pekerjaan, model kerja (remote/onsite), dan **checklist fasilitas aksesibilitas**.
- Pengurutan berdasarkan lowongan terbaru atau kecocokan profil.

### 4.3 Lamaran & Pelacakan (Application Tracking)
- `applications`:
  - `id` (bigint, PK)
  - `vacancy_id` (bigint, FK vacancies)
  - `job_seeker_profile_id` (bigint, FK job_seeker_profiles)
  - `cover_letter` (text, nullable)
  - `cv_path` (string)
  - `status` (enum: `submitted`, `reviewed`, `interview`, `rejected`, `hired`, `withdrawn`)
  - `applied_at` (timestamp)
  - Unique index: `[vacancy_id, job_seeker_profile_id]`
- Visual stepper progres lamaran pada dashboard pelamar.

---

## 5. Arsitektur AI Engine (Pluggable Provider)

### 5.1 Desain Kontrak & Driver
- `App\Contracts\AiProviderInterface`:
  - `matchJob(JobSeekerProfile $seeker, Vacancy $vacancy): array`
  - `analyzeSkillGap(array $seekerSkills, array $vacancySkills): array`
  - `reviewCvAts(string $cvText, array $targetJobSkills = []): array`
- Driver default: `GeminiAiProvider` (Google AI Studio REST API).
- Driver fallback: `MockAiProvider` (jika token habis, offline, atau kuota limit tercapai).

### 5.2 Fitur AI
1. **AI Job Matching**: Menghitung persentase kecocokan kompetensi dan kebutuhan aksesibilitas, menyimpan skor pada tabel `ai_job_matches`.
2. **AI Skill Gap Analysis**: Menganalisis perbedaan keterampilan pelamar dengan lowongan serta memberi saran pelatihan.
3. **AI CV & ATS Assistant**: Menganalisis teks CV pelamar, memeriksa keterbacaan mesin ATS, dan memberi saran perbaikan.

---

## 6. Komunikasi & Moderasi Admin
- `messages`: Pengiriman pesan internal antar pelamar dan HR terkait lamaran tertentu.
- `notifications`: Notifikasi in-app untuk perubahan status lamaran dan aktivitas penting.
- Dashboard Admin:
  - Verifikasi profil perusahaan sebelum mempublikasikan lowongan.
  - Moderasi konten lowongan.
  - Ringkasan statistik jumlah pengguna, lowongan aktif, dan status rekrutmen.

---

## 7. Rencana Tahapan Eksekusi (Roadmap)

### Fase 1: Fondasi, Database Multi-Role, & Toolbar Aksesibilitas
1. Konfigurasi MySQL Laragon di `.env`.
2. Migration tabel pengguna, profil multi-role, preferensi aksesibilitas.
3. Form registrasi terpisah (Pelamar / Perusahaan) dan Login dengan role guard middleware.
4. Pembuatan Toolbar Aksesibilitas global di frontend (font scaling, Web Speech TTS, high contrast).

### Fase 2: Lowongan, Filter Aksesibilitas, & Tracking Lamaran
1. CRUD Lowongan di panel Perusahaan beserta pilihan akomodasi aksesibilitas tempat kerja.
2. Halaman pencarian lowongan untuk Pelamar dengan filter aksesibilitas.
3. Alur pengiriman lamaran (upload CV & cover letter).
4. Halaman "Lamaran Saya" dengan vertical tracking stepper.

### Fase 3: Integrasi AI Engine (Google Gemini)
1. Implementasi `AiProviderInterface` & `GeminiAiProvider`.
2. Integrasi AI Job Matching & caching hasil rekomendasi.
3. Fitur AI Skill Gap Analysis dan AI CV ATS Assistant.

### Fase 4: Sistem Pesan, Notifikasi, & Admin Moderasi
1. Fitur pesan antar Pelamar dan Perusahaan.
2. Notifikasi in-app.
3. Panel Admin (verifikasi perusahaan, moderasi lowongan, statistik laporan).
