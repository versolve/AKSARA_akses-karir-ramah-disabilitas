<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isApproved ? 'Perusahaan Terverifikasi' : 'Status Verifikasi Perusahaan' }} - Profabel</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #F1F5F9;
            margin: 0;
            padding: 24px;
            color: #1E293B;
            -webkit-text-size-adjust: 100%;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 12px rgba(16, 43, 75, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #102B4B 0%, #1769E0 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .logo-text {
            color: #FFFFFF;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .logo-sub {
            color: #93C5FD;
            font-size: 13px;
            font-weight: 500;
            margin-top: 4px;
        }
        .content {
            padding: 32px 28px;
        }
        h2 {
            font-size: 20px;
            font-weight: 700;
            color: #102B4B;
            margin-top: 0;
            margin-bottom: 12px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 16px 0;
        }
        .status-banner {
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }
        .status-banner.approved {
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            color: #065F46;
        }
        .status-banner.revoked {
            background-color: #FFFBEB;
            border: 1px solid #FDE68A;
            color: #92400E;
        }
        .badge {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 6px;
        }
        .badge.approved {
            background-color: #10B981;
            color: #FFFFFF;
        }
        .badge.revoked {
            background-color: #F59E0B;
            color: #FFFFFF;
        }
        .info-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 18px 20px;
            margin-bottom: 24px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #EDF2F7;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            color: #64748B;
            font-weight: 500;
        }
        .info-value {
            color: #0F172A;
            font-weight: 600;
            text-align: right;
        }
        .features-list {
            margin: 16px 0;
            padding-left: 0;
            list-style: none;
        }
        .features-list li {
            position: relative;
            padding-left: 24px;
            margin-bottom: 10px;
            font-size: 13px;
            line-height: 1.5;
            color: #334155;
        }
        .features-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 20px 0;
        }
        .btn {
            display: inline-block;
            background-color: #1769E0;
            color: #FFFFFF !important;
            font-weight: 600;
            font-size: 14px;
            padding: 13px 28px;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(23, 105, 224, 0.2);
        }
        .footer {
            background-color: #F8FAFC;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
        }
        .footer-text {
            font-size: 12px;
            color: #64748B;
            line-height: 1.5;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo-text">Profabel</h1>
            <div class="logo-sub">Platform Rekrutmen Talenta Disabilitas Inklusif</div>
        </div>

        <div class="content">
            <h2>Halo, {{ $user->name ?? 'Mitra Perusahaan' }}</h2>

            @if ($isApproved)
                <div class="status-banner approved">
                    <span class="badge approved">VERIFIKASI DISETUJUI</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Selamat! Akun Perusahaan Anda Telah Resmi Terverifikasi</div>
                    <div style="font-size: 13px; margin-top: 4px; opacity: 0.9;">
                        Tim verifikator Profabel telah memeriksa dokumen legalitas dan menyetujui profil perusahaan Anda.
                    </div>
                </div>

                <p>
                    Kini <strong>{{ $company->company_name }}</strong> memiliki akses penuh ke seluruh fitur perekrutan inklusif di ekosistem Profabel.
                </p>

                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Nama Perusahaan</span>
                        <span class="info-value">{{ $company->company_name }}</span>
                    </div>
                    @if ($company->industry)
                    <div class="info-row">
                        <span class="info-label">Bidang Industri</span>
                        <span class="info-value">{{ $company->industry }}</span>
                    </div>
                    @endif
                    <div class="info-row">
                        <span class="info-label">Status Akun</span>
                        <span class="info-value" style="color: #059669;">Mitra Terverifikasi Resmi</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal Verifikasi</span>
                        <span class="info-value">{{ now()->translatedFormat('d F Y, H:i') }} WIB</span>
                    </div>
                </div>

                <p style="font-weight: 600; margin-bottom: 8px;">Keuntungan Akun Terverifikasi:</p>
                <ul class="features-list">
                    <li><strong>Lencana Mitra Terverifikasi:</strong> Profil perusahaan mendapatkan tanda centang verifikasi resmi untuk meningkatkan kepercayaan para pencari kerja disabilitas.</li>
                    <li><strong>Publikasi Lowongan Penuh:</strong> Lowongan yang Anda buat langsung dipublikasikan ke papan pencarian publik dan mendapatkan prioritas tampil.</li>
                    <li><strong>Akses Manajemen Rekrutmen:</strong> Review berkas pelamar, jadwalkan wawancara inklusif, dan berkomunikasi langsung melalui chat room terintegrasi.</li>
                </ul>

                <div class="btn-container">
                    <a href="{{ $actionUrl }}" class="btn">Mulai Buat Lowongan Kerja</a>
                </div>
            @else
                <div class="status-banner revoked">
                    <span class="badge revoked">STATUS DITANGGUHKAN</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Pemberitahuan Status Verifikasi Perusahaan</div>
                    <div style="font-size: 13px; margin-top: 4px; opacity: 0.9;">
                        Status verifikasi akun perusahaan Anda saat ini ditangguhkan oleh tim verifikator Profabel.
                    </div>
                </div>

                <p>
                    Kami memberitahukan bahwa profil perusahaan <strong>{{ $company->company_name }}</strong> memerlukan penyesuaian atau kelengkapan data tambahan agar dapat memperoleh status terverifikasi.
                </p>

                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Nama Perusahaan</span>
                        <span class="info-value">{{ $company->company_name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status Terkini</span>
                        <span class="info-value" style="color: #D97706;">Menunggu Kelengkapan</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal Pembaruan</span>
                        <span class="info-value">{{ now()->translatedFormat('d F Y, H:i') }} WIB</span>
                    </div>
                </div>

                <p>
                    Silakan masuk ke dashboard dan tinjau kelengkapan profil perusahaan Anda (seperti alamat lengkap, website resmi, atau kontak penanggung jawab). Jika Anda merasa ada kekeliruan atau membutuhkan bantuan verifikasi, jangan ragu untuk membalas email ini.
                </p>

                <div class="btn-container">
                    <a href="{{ $actionUrl }}" class="btn">Tinjau Profil Perusahaan</a>
                </div>
            @endif

            <p style="font-size: 13px; color: #64748B; margin-top: 24px;">
                Jika Anda memiliki pertanyaan lebih lanjut, tim dukungan Profabel siap membantu melalui <a href="mailto:profabel.admin@gmail.com" style="color: #1769E0;">profabel.admin@gmail.com</a>.
            </p>
        </div>

        <div class="footer">
            <p class="footer-text">
                &copy; {{ date('Y') }} Profabel &bull; Platform Karir Inklusif & Ramah Disabilitas.<br>
                Pemberitahuan ini dikirim secara otomatis ke email akun terdaftar Anda.
            </p>
        </div>
    </div>
</body>
</html>
