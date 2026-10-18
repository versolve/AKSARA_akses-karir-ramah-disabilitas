# AKSARA (Akses Karier Ramah Disabilitas)

Platform portal pencarian kerja inklusif yang menghubungkan penyandang disabilitas dengan perusahaan yang menyediakan fasilitas dan akomodasi aksesibilitas tempat kerja.

Dibuat untuk tugas mata kuliah **Pemrograman Web Enterprise (PWE)** dan mendukung capaian **SDG 8** (*Decent Work & Economic Growth*) serta **SDG 10** (*Reduced Inequalities*).

---

## 🌟 Fitur Utama

### 1. Fitur Aksesibilitas Web (WCAG 2.1 Compliant)
- **Floating Accessibility Toolbar**: Widget aksesibilitas di sudut kanan bawah setiap halaman.
- **Text-to-Speech (TTS) Bahasa Indonesia**: Membacakan judul, rincian lowongan, dan isi halaman secara otomatis menggunakan browser native Web Speech API.
- **Skala Ukuran Teks**: Pengaturan font dinamis dari `80%`, `90%`, `100%`, `110%`, hingga `125%` berbasis variabel CSS `--font-scale` tanpa merusak tata letak.
- **Mode Kontras Tinggi (High Contrast)**: Skema warna hitam-kuning/putih memenuhi standar rasio kontras WCAG AAA.
- **Keyboard Friendly**: Dilengkapi link *"Lewati ke konten utama"*, indikator fokus tegas (`focus-visible`), dan touch target minimal `44x44px`.

### 2. Multi-Role Authentication & Access Control
- **Pelamar Disabilitas**: Pendaftaran dengan kelengkapan biodata dan profil kebutuhan akomodasi khusus (Netra, Fisik, Rungu, Wicara, Intelektual).
- **Perusahaan / HR**: Publikasi lowongan beserta checklist fasilitas aksesibilitas tempat kerja yang disediakan, review berkas pelamar, dan pengubahan status seleksi.
- **Administrator**: Panel moderasi dan pengawasan platform.

### 3. Alur Rekrutmen & Pelacakan Lamaran (Core Recruitment Flow)
- **Katalog Lowongan Interaktif**: Pencarian berbasis kata kunci, lokasi, model kerja (Remote/Onsite/Hybrid), dan filter fasilitas aksesibilitas spesifik.
- **Workplace Accessibility Facilities**: Setiap lowongan menampilkan rincian fasilitas (ram kursi roda, lift prioritas, toilet khusus, screen reader, komunikasi tertulis, dll).
- **Pengiriman Lamaran**: Upload berkas CV (PDF/Word maksimal 5MB) dan surat pengantar dengan validasi pencegahan lamaran ganda.
- **Application Tracking Stepper**: Visualisasi tahapan seleksi (*Terkirim* ➔ *Ditinjau* ➔ *Wawancara* ➔ *Diterima / Ditolak*) dengan catatan langsung dari HR.

### 4. Komunikasi & Notifikasi
- **Pesan Dua Arah (In-App Messaging)**: Percakapan internal terisolasi antara Pelamar dan HR untuk koordinasi jadwal wawancara atau berkas tambahan.
- **Notifikasi Status**: Pemberitahuan otomatis di akun pelamar setiap kali HR memperbarui status lamaran kerja.

### 5. Pengelolaan Profil & Kompresi Foto Otomatis
- **Standarisasi Dimensi**: Foto profil yang diunggah pengguna (JPG, PNG, WebP) otomatis dipotong persegi tengah (*center crop*) dan di-resize ke ukuran standar 300×300 piksel.
- **Konversi WebP Ringan**: Gambar dikonversi ke format WebP berkualitas tinggi dengan kompresi teroptimasi (~20–40 KB) sehingga tidak membebani server dan cepat dimuat di koneksi internet lambat.
- **Pembersihan Otomatis**: Foto lama otomatis dihapus dari penyimpanan saat foto baru diunggah.

---

## 🔑 Kredensial Akun Demo

Aplikasi telah dilengkapi seeder data realistis yang siap diuji:

| Peran (Role) | Email | Kata Sandi | Keterangan / Profil |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@aksara.id` | `password123` | Pengelola & verifikator platform |
| **Perusahaan (HR)** | `hr@inklusiftech.id` | `password123` | PT Inklusif Teknologi Nusantara (IT & Software) |
| **Perusahaan (HR)** | `hr@karyasama.id` | `password123` | PT Karya Bersama Inklusif (Contact Center & Admin) |
| **Pelamar (Netra)** | `budi.netra@aksara.id` | `password123` | Budi Santoso - Frontend Developer (Screen Reader) |
| **Pelamar (Fisik)** | `siti.fisik@aksara.id` | `password123` | Siti Rahmawati - Data Entry (Kursi Roda / Ram) |
| **Pelamar (Rungu)** | `andi.rungu@aksara.id` | `password123` | Andi Wijaya - Live Chat QA (Komunikasi Tertulis) |

---

## 💻 Tech Stack

- **Backend**: Laravel 11/12 (PHP 8.3+)
- **Database**: MySQL (via Laragon / phpMyAdmin)
- **Frontend**: Inertia.js React 19 (TypeScript)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Bundler**: Vite

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Persyaratan Sistem
- PHP >= 8.3
- Composer >= 2.0
- Node.js >= 20.x & npm
- Laragon (atau MySQL server aktif di port 3306)

### 2. Langkah Setup Proyek
```bash
# 1. Masuk ke direktori proyek
cd C:/!project/project_WE/AKSARA

# 2. Install dependensi PHP
composer install

# 3. Install dependensi frontend
npm install

# 4. Pastikan file .env mengarah ke MySQL Laragon:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=aksara
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migrasi database
php artisan migrate --force

# 6. Buat symlink storage untuk berkas CV
php artisan storage:link

# 7. Isi database dengan data demo realistis
php artisan db:seed --class=DemoDataSeeder

# 8. Compile aset frontend
npm run build
```

### 3. Menjalankan Server Lokal
Cukup jalankan satu perintah:
```bash
composer run dev
```
Atau jalankan terpisah di dua jendela terminal:
```bash
# Terminal 1 (Backend Laravel)
php artisan serve

# Terminal 2 (Vite Frontend Compiler)
npm run dev
```

Akses web browser di: **`http://localhost:8000`**

---

## 🧪 Pengujian Otomatis (Automated Tests)

Seluruh alur bisnis telah diverifikasi menggunakan pengujian unit dan fitur (TDD):
```bash
# Menjalankan seluruh test suite
./vendor/bin/phpunit tests/Feature/ tests/Unit/
```

**Hasil Pengujian:**
- Total **187 Tests**
- Total **624 Assertions**
- **100% Passed (0 Failures, 0 Errors)**

---

## 🗺️ Roadmap Pengembangan

- [x] **Fase 1**: Pondasi, Database Multi-Role, & Toolbar Aksesibilitas.
- [x] **Fase 2**: Alur Rekrutmen (CRUD Lowongan, Filter Aksesibilitas, Upload CV, Application Tracking).
- [x] **Fase 2 Plus**: Sistem Pesan Internal, Notifikasi Status Lamaran, Role Dashboards, & Demo Data Seeder.
- [x] **Fase 3**: Integrasi AI Engine (Google Gemini Live - Job Matching, Skill Gap Analysis, CV ATS Assistant).
- [x] **Fase 4**: Panel Moderasi Administrator & Laporan Statistik.
- [x] **Fase 5**: Final Visual Polish (Gaya Minimalis Bersih, Desain Landing Page Baru, Identitas Logo Aksara, Aksesibilitas Keyboard Ring).
