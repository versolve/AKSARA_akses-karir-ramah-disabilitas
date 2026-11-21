<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undangan Wawancara Kerja - Profabel</title>
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
        .interview-badge {
            display: inline-block;
            background-color: #DBEAFE;
            color: #1D4ED8;
            border: 1px solid #93C5FD;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
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
        .detail-box {
            background-color: #EFF6FF;
            border-left: 4px solid #2563EB;
            padding: 14px 16px;
            border-radius: 6px;
            margin: 18px 0;
            font-size: 13px;
            color: #1E40AF;
            line-height: 1.6;
        }
        .accessibility-box {
            background-color: #F0FDF4;
            border-left: 4px solid #16A34A;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 18px 0;
            font-size: 13px;
            color: #166534;
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
            <div>
                <span class="interview-badge">⭐ Undangan Wawancara Kerja</span>
            </div>
            <h2>Selamat, Anda Lolos ke Tahap Wawancara! 🎯</h2>
            <p>Halo, <strong>{{ $user->name }}</strong>!</p>
            <p>Kabar gembira! Tim rekruter perusahaan telah meninjau berkas lamaran Anda dan sangat tertarik untuk mengundang Anda ke sesi wawancara kerja:</p>

            <div class="job-card">
                <div class="job-title">{{ $vacancyTitle }}</div>
                <div class="company-name">🏢 {{ $companyName }}</div>

                @if(!empty($interviewNotes))
                    <div class="detail-box">
                        <strong>📌 Rincian / Instruksi dari Rekruter:</strong><br>
                        {!! nl2br(e($interviewNotes)) !!}
                    </div>
                @else
                    <div class="detail-box">
                        <strong>📌 Instruksi Wawancara:</strong><br>
                        Jadwal, tautan pertemuan online (Google Meet/Zoom), atau alamat kantor dapat dilihat langsung melalui pesan di dashboard lamaran Anda.
                    </div>
                @endif
            </div>

            <div class="accessibility-box">
                <strong>♿ Komitmen Aksesibilitas Profabel:</strong><br>
                Jika Anda memerlukan akomodasi khusus (seperti penerjemah bahasa isyarat, materi ramah screen reader, atau akses ruangan khusus), jangan ragu untuk menyampaikan melalui fitur pesan ke rekruter sebelum jadwal dimulai.
            </div>

            <p>Silakan klik tombol di bawah untuk melihat rincian lamaran atau membalas pesan pihak rekruter:</p>

            <div style="text-align: center;">
                <a href="{{ $actionUrl }}" class="btn-action">Lihat Rincian & Konfirmasi Kehadiran</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Email resmi ini dikirimkan secara otomatis oleh sistem <strong>Profabel</strong>.</p>
            <p style="margin: 0;">&copy; {{ date('Y') }} Profabel. Hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
