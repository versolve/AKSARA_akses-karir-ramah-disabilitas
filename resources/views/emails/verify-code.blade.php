<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi Profabel</title>
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
            max-width: 540px;
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
        .otp-box {
            background-color: #F8FAFC;
            border: 2px dashed #CBD5E1;
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            color: #64748B;
            margin-bottom: 8px;
        }
        .otp-code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #1769E0;
            padding-left: 10px;
            display: inline-block;
        }
        .expiry-text {
            font-size: 12px;
            color: #64748B;
            margin-top: 8px;
        }
        .warning-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 12px 14px;
            border-radius: 6px;
            font-size: 12px;
            color: #92400E;
            margin-bottom: 20px;
        }
        .footer {
            border-top: 1px solid #E2E8F0;
            padding: 20px 28px;
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
            background-color: #FAFAFA;
        }
        .footer p {
            margin: 4px 0;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo-text">Profabel</h1>
            <div class="logo-sub">Platform Karier Ramah Disabilitas</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>Verifikasi Alamat Email Anda</h2>
            <p>Halo <strong>{{ $user->name }}</strong>,</p>
            <p>
                Terima kasih telah mendaftar di <strong>Profabel</strong>. Untuk menyelesaikan pendaftaran dan mengaktifkan akun Anda, silakan masukkan 6 digit kode verifikasi berikut ke halaman website:
            </p>

            <div class="otp-box">
                <div class="otp-label">Kode Verifikasi Anda</div>
                <div class="otp-code">{{ $code }}</div>
                <div class="expiry-text">⏱️ Berlaku selama 15 menit</div>
            </div>

            <div class="warning-box">
                <strong>Penting:</strong> Jangan berikan kode ini kepada siapa pun. Tim Profabel tidak akan pernah meminta kode verifikasi Anda.
            </div>

            <p style="font-size: 13px; color: #64748B;">
                Setelah akun Anda aktif, Anda dapat langsung melengkapi profil dan menjelajahi lowongan pekerjaan inklusif yang tersedia.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem <strong>Profabel</strong>.</p>
            <p>Jika Anda tidak merasa mendaftar di Profabel, Anda dapat mengabaikan email ini.</p>
            <p>&copy; {{ date('Y') }} Profabel. Seluruh hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
