<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan Baru Masuk - Profabel</title>
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
        .sender-badge {
            display: inline-block;
            background-color: #EBF3FE;
            color: #1769E0;
            border: 1px solid #BFDBFE;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        .message-box {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-left: 4px solid #1769E0;
            border-radius: 10px;
            padding: 16px 18px;
            margin: 18px 0;
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            font-style: italic;
        }
        .context-row {
            font-size: 12px;
            color: #64748B;
            margin-bottom: 6px;
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
            <div>
                <span class="sender-badge">💬 Pesan Masuk Baru</span>
            </div>
            <h2>Anda Memiliki Pesan Baru 📬</h2>
            <p>Halo, <strong>{{ $recipient->name }}</strong>!</p>
            <p>
                <strong>{{ $sender->name }}</strong> baru saja mengirimkan pesan kepada Anda terkait lowongan: <strong>{{ $vacancyTitle }}</strong>.
            </p>

            <div class="context-row">
                Kutipan isi pesan:
            </div>
            <div class="message-box">
                "{!! nl2br(e(\Illuminate\Support\Str::limit($chatMessage->body, 300))) !!}"
            </div>

            <p>
                Untuk membalas pesan dan melanjutkan percakapan, silakan klik tombol di bawah untuk langsung menuju ruang pesan di Profabel:
            </p>

            <div style="text-align: center;">
                <a href="{{ $actionUrl }}" class="btn-action">Buka Ruang Pesan & Balas</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Email pemberitahuan ini dikirimkan secara otomatis oleh sistem resmi <strong>Profabel</strong>.</p>
            <p style="margin: 0;">&copy; {{ date('Y') }} Profabel. Hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
