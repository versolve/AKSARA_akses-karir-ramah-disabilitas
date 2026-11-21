<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peringatan Keamanan Akun - Profabel</title>
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
            background: linear-gradient(135deg, #102B4B 0%, #1E3A8A 100%);
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
        .alert-banner {
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }
        .alert-banner.info {
            background-color: #EFF6FF;
            border: 1px solid #BFDBFE;
            color: #1E40AF;
        }
        .alert-banner.success {
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            color: #065F46;
        }
        .alert-banner.warning {
            background-color: #FEF2F2;
            border: 1px solid #FECACA;
            color: #991B1B;
        }
        .badge {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 6px;
        }
        .badge.info {
            background-color: #2563EB;
            color: #FFFFFF;
        }
        .badge.success {
            background-color: #10B981;
            color: #FFFFFF;
        }
        .badge.warning {
            background-color: #DC2626;
            color: #FFFFFF;
        }
        .info-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 16px 20px;
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
            word-break: break-all;
        }
        .warning-box {
            background-color: #FFF7ED;
            border: 1px solid #FED7AA;
            border-radius: 12px;
            padding: 14px 16px;
            margin-top: 20px;
            font-size: 13px;
            line-height: 1.5;
            color: #9A3412;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 20px 0;
        }
        .btn {
            display: inline-block;
            background-color: #102B4B;
            color: #FFFFFF !important;
            font-weight: 600;
            font-size: 14px;
            padding: 13px 28px;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(16, 43, 75, 0.2);
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
            <div class="logo-sub">Notifikasi Keamanan Akun Resmi</div>
        </div>

        <div class="content">
            <h2>Halo, {{ $user->name ?? 'Pengguna' }}</h2>

            @if ($action === 'password_updated' || $action === 'password_reset')
                <div class="alert-banner info">
                    <span class="badge info">PEMBARUAN KATA SANDI</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Kata Sandi Akun Anda Berhasil Diperbarui</div>
                    <div style="font-size: 13px; margin-top: 4px; opacity: 0.9;">
                        Kata sandi untuk akun <strong>{{ $user->email ?? 'Anda' }}</strong> baru saja berhasil diubah.
                    </div>
                </div>
            @elseif ($action === 'two_factor_enabled')
                <div class="alert-banner success">
                    <span class="badge success">2FA AKTIF</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Verifikasi 2 Langkah (2FA) Berhasil Diaktifkan</div>
                    <div style="font-size: 13px; margin-top: 4px; opacity: 0.9;">
                        Akun Anda kini mendapatkan lapisan keamanan ganda saat proses login.
                    </div>
                </div>
            @elseif ($action === 'two_factor_disabled')
                <div class="alert-banner warning">
                    <span class="badge warning">PERINGATAN KEAMANAN</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Verifikasi 2 Langkah (2FA) Telah Dinonaktifkan</div>
                    <div style="font-size: 13px; margin-top: 4px; opacity: 0.9;">
                        Lapisan perlindungan ganda pada akun <strong>{{ $user->email ?? 'Anda' }}</strong> telah dinonaktifkan.
                    </div>
                </div>
            @else
                <div class="alert-banner info">
                    <span class="badge info">AKTIVITAS KEAMANAN</span>
                    <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Pembaruan Pengaturan Keamanan Akun</div>
                </div>
            @endif

            <p>
                Berikut adalah detail dari aktivitas keamanan yang tercatat pada sistem kami:
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Aktivitas</span>
                    <span class="info-value">
                        @if ($action === 'password_updated')
                            Perubahan Kata Sandi
                        @elseif ($action === 'password_reset')
                            Reset Kata Sandi (Lupa Sandi)
                        @elseif ($action === 'two_factor_enabled')
                            Pengaktifan Verifikasi 2 Langkah
                        @elseif ($action === 'two_factor_disabled')
                            Penonaktifan Verifikasi 2 Langkah
                        @else
                            Setelan Akun Diperbarui
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Waktu</span>
                    <span class="info-value">{{ ($timestamp ?? now())->translatedFormat('d F Y, H:i:s') }} WIB</span>
                </div>
                @if (!empty($metadata['ip_address']))
                <div class="info-row">
                    <span class="info-label">Alamat IP</span>
                    <span class="info-value">{{ $metadata['ip_address'] }}</span>
                </div>
                @endif
                @if (!empty($metadata['user_agent']))
                <div class="info-row">
                    <span class="info-label">Browser / Perangkat</span>
                    <span class="info-value" style="font-size: 12px; max-width: 260px;">{{ \Illuminate\Support\Str::limit($metadata['user_agent'], 60) }}</span>
                </div>
                @endif
            </div>

            <p style="font-size: 13px;">
                Jika <strong>Anda yang melakukan tindakan ini</strong>, Anda dapat mengabaikan email ini dengan aman.
            </p>

            <div class="warning-box">
                <strong>Apakah ini bukan Anda?</strong><br>
                Jika Anda tidak mengenali aktivitas ini atau merasa ada pihak lain yang mengakses akun Anda, segera ubah kata sandi Anda dan periksa status keamanan akun melalui tautan di bawah ini.
            </div>

            <div class="btn-container">
                <a href="{{ $actionUrl }}" class="btn">Buka Pengaturan Keamanan Akun</a>
            </div>

            <p style="font-size: 13px; color: #64748B; margin-top: 24px;">
                Tim Keamanan Profabel berkomitmen menjaga kerahasiaan dan privasi data Anda. Jika butuh bantuan darurat, hubungi <a href="mailto:profabel.admin@gmail.com" style="color: #1769E0;">profabel.admin@gmail.com</a>.
            </p>
        </div>

        <div class="footer">
            <p class="footer-text">
                &copy; {{ date('Y') }} Profabel Security &bull; Layanan Otentikasi & Keamanan Pengguna.<br>
                Email keamanan ini dikirim secara otomatis dan tidak menerima balasan langsung.
            </p>
        </div>
    </div>
</body>
</html>
