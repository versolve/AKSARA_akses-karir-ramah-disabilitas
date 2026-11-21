<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lowongan Baru Tersedia - Profabel</title>
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
        .banner {
            background-color: #EFF6FF;
            border: 1px solid #BFDBFE;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            color: #1E40AF;
        }
        .badge {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            background-color: #2563EB;
            color: #FFFFFF;
            margin-bottom: 6px;
        }
        .job-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .job-title {
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
            margin: 0 0 6px 0;
        }
        .company-name {
            font-size: 14px;
            font-weight: 600;
            color: #1769E0;
            margin: 0 0 14px 0;
        }
        .meta-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 14px;
        }
        .meta-tag {
            font-size: 12px;
            font-weight: 500;
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            color: #334155;
            padding: 4px 10px;
            border-radius: 6px;
        }
        .desc-snippet {
            font-size: 13px;
            line-height: 1.6;
            color: #64748B;
            padding-top: 12px;
            border-top: 1px solid #E2E8F0;
            margin: 0;
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
            <div class="logo-sub">Rekomendasi Karir Inklusif</div>
        </div>

        <div class="content">
            <h2>Halo, {{ $user->name ?? 'Talenta Hebat' }}</h2>

            <div class="banner">
                <span class="badge">LOWONGAN BARU</span>
                <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">Peluang Karir Inklusif Baru Menanti Anda!</div>
                <div style="font-size: 13px; margin-top: 4px; opacity: 0.95;">
                    Mitra perusahaan kami baru saja mempublikasikan lowongan kerja inklusif yang ramah disabilitas di Profabel.
                </div>
            </div>

            <p>
                Berikut adalah ringkasan informasi posisi yang dibuka:
            </p>

            <div class="job-card">
                <div class="job-title">{{ $vacancy->title }}</div>
                <div class="company-name">{{ $companyName }}</div>

                <div class="meta-list">
                    <span class="meta-tag">{{ ucfirst($vacancy->work_model ?? 'Onsite') }}</span>
                    <span class="meta-tag">{{ $vacancy->location ?? 'Indonesia' }}</span>
                    <span class="meta-tag">{{ ucfirst(str_replace('-', ' ', $vacancy->job_type ?? 'Full Time')) }}</span>
                    @if ($vacancy->is_salary_public && $vacancy->salary_min && $vacancy->salary_max)
                        <span class="meta-tag" style="background-color: #ECFDF5; color: #047857; border-color: #A7F3D0;">Rp {{ number_format($vacancy->salary_min, 0, ',', '.') }} - {{ number_format($vacancy->salary_max, 0, ',', '.') }}</span>
                    @endif
                </div>

                <p class="desc-snippet">
                    {{ \Illuminate\Support\Str::limit(strip_tags($vacancy->description), 160) }}
                </p>
            </div>

            <div class="btn-container">
                <a href="{{ $actionUrl }}" class="btn">Lihat Detail & Lamar Pekerjaan</a>
            </div>

            <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 20px;">
                Anda menerima email ini sebagai bagian dari buletin lowongan pekerjaan Profabel.
            </p>
        </div>

        <div class="footer">
            <p class="footer-text">
                &copy; {{ date('Y') }} Profabel &bull; Platform Karir Inklusif & Ramah Disabilitas.<br>
                Membuka Peluang Kerja Setara untuk Semua Talenta.
            </p>
        </div>
    </div>
</body>
</html>
