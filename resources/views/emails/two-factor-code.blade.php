<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi 2 Langkah Profabel</title>
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
            background: #F0FDF4;
            border: 2px dashed #86EFAC;
            border-radius: 14px;
            padding: 22px 16px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #166534;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 34px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #102B4B;
            font-family: "Courier New", Courier, monospace;
            padding-left: 10px;
        }
        .security-alert {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400E;
            line-height: 1.5;
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
        .footer a {
            color: #1769E0;
            text-decoration: none;
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
            <h2>Verifikasi 2 Langkah (2FA) 🔐</h2>
            <p>Halo, <strong>{{ $user->name }}</strong>!</p>
            <p>Kami menerima permintaan masuk (login) ke akun Profabel Anda. Demi menjaga keamanan akun, silakan gunakan kode verifikasi 6 digit berikut untuk melanjutkan:</p>

            <div class="otp-box">
                <div class="otp-label">Kode Verifikasi 2 Langkah</div>
                <div class="otp-code">{{ $code }}</div>
            </div>

            <div class="security-alert">
                <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan Profabel.
            </div>

            <p style="font-size: 13px; color: #64748B; margin-top: 20px;">
                Jika Anda tidak merasa melakukan permintaan masuk ke akun Profabel, segera amankan akun Anda dengan mengganti kata sandi.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Email ini dikirimkan secara otomatis oleh sistem resmi <strong>Profabel</strong>.</p>
            <p style="margin: 0;">&copy; {{ date('Y') }} Profabel. Hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
