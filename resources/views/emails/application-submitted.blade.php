<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Lamaran Terkirim - Profabel</title>
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
        .success-banner {
            background-color: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .job-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .job-title {
            font-size: 17px;
            font-weight: 800;
            color: #102B4B;
            margin-bottom: 4px;
        }
        .company-name {
            font-size: 13px;
            color: #64748B;
            margin-bottom: 14px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-top: 1px dashed #E2E8F0;
            font-size: 13px;
        }
        .info-label {
            color: #64748B;
        }
        .info-value {
            font-weight: 600;
            color: #102B4B;
        }
        .badge-submitted {
            display: inline-block;
            background-color: #DBEAFE;
            color: #1D4ED8;
            border: 1px solid #93C5FD;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .tips-box {
            background-color: #FFFBEB;
            border-left: 4px solid #F59E0B;
            padding: 14px 16px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400E;
            line-height: 1.5;
        }
        .btn-action {
            display: inline-block;
            background-color: #1769E0;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            margin: 20px 0 10px 0;
            text-align: center;
        }
        .footer {
            background-color: #F8FAFC;
            padding: 24px 28px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
            font-size: 12px;
            color: #94A3B8;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo-text">Profabel</h1>
            <div class="logo-sub">Platform Karir & Rekrutmen Inklusif Ramah Disabilitas</div>
        </div>

        <div class="content">
            <h2>Lamaran Anda Berhasil Terkirim! 🎉</h2>
            <p>Halo, <strong>{{ $user->name }}</strong>!</p>
            <p>Terima kasih telah mempercayakan langkah karir Anda bersama <strong>Profabel</strong>. Berkas lamaran Anda telah berhasil kami kirimkan ke tim rekruter perusahaan:</p>

            <div class="job-card">
                <div class="job-title">{{ $vacancyTitle }}</div>
                <div class="company-name">🏢 {{ $companyName }}</div>

                <div class="info-row">
                    <span class="info-label">Tanggal Pengiriman</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($appliedAt)->translatedFormat('d F Y, H:i') }} WIB</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status Awal</span>
                    <span class="badge-submitted">Terkirim</span>
                </div>
            </div>

            <div class="tips-box">
                <strong>💡 Apa tahapan berikutnya?</strong><br>
                Tim rekruter perusahaan akan meninjau berkas CV dan informasi profil Anda. Jika profil Anda sesuai dengan kualifikasi, perusahaan akan menghubungi Anda untuk tahapan wawancara atau asesmen. Pastikan email dan kontak Anda tetap aktif.
            </div>

            <p>Anda dapat memantau perkembangan status lamaran ini secara langsung melalui dashboard akun Profabel Anda:</p>

            <div style="text-align: center;">
                <a href="{{ $actionUrl }}" class="btn-action">Pantau Status Lamaran Saya</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Email tanda terima resmi ini dikirimkan otomatis oleh sistem <strong>Profabel</strong>.</p>
            <p style="margin: 0;">&copy; {{ date('Y') }} Profabel. Hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
