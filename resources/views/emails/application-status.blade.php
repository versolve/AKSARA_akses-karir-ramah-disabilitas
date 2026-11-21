<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembaruan Status Lamaran - Profabel</title>
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
        .job-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 18px 20px;
            margin: 20px 0;
        }
        .job-title {
            font-size: 16px;
            font-weight: 700;
            color: #102B4B;
            margin-bottom: 4px;
        }
        .company-name {
            font-size: 13px;
            color: #64748B;
            margin-bottom: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-accepted {
            background-color: #DCFCE7;
            color: #15803D;
            border: 1px solid #86EFAC;
        }
        .status-interview {
            background-color: #DBEAFE;
            color: #1D4ED8;
            border: 1px solid #93C5FD;
        }
        .status-reviewed, .status-under_review {
            background-color: #FEF3C7;
            color: #B45309;
            border: 1px solid #FDE68A;
        }
        .status-rejected {
            background-color: #FEE2E2;
            color: #B91C1C;
            border: 1px solid #FCA5A5;
        }
        .status-default {
            background-color: #F1F5F9;
            color: #475569;
            border: 1px solid #CBD5E1;
        }
        .notes-box {
            background-color: #F0FDF4;
            border-left: 4px solid #16A34A;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 16px 0;
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
            <h2>Pembaruan Status Lamaran Pekerjaan 📬</h2>
            <p>Halo, <strong>{{ $user->name }}</strong>!</p>
            <p>Ada kabar terbaru mengenai lamaran pekerjaan yang telah Anda kirimkan melalui platform Profabel:</p>

            <div class="job-card">
                <div class="job-title">{{ $vacancyTitle }}</div>
                <div class="company-name">🏢 {{ $companyName }}</div>
                <div>
                    @php
                        $badgeClass = match($statusKey) {
                            'accepted' => 'status-accepted',
                            'interview' => 'status-interview',
                            'reviewed', 'under_review' => 'status-reviewed',
                            'rejected' => 'status-rejected',
                            default => 'status-default',
                        };
                    @endphp
                    <span class="status-badge {{ $badgeClass }}">Status: {{ $statusText }}</span>
                </div>
            </div>

            @if(!empty($notes))
                <div class="notes-box">
                    <strong>Pesan dari Perusahaan:</strong><br>
                    {{ $notes }}
                </div>
            @endif

            <p style="margin-top: 20px;">
                Untuk melihat rincian proses seleksi, jadwal, atau informasi tahapan berikutnya, silakan masuk ke dashboard akun Anda:
            </p>

            <div style="text-align: center;">
                <a href="{{ $actionUrl }}" class="btn-action">Lihat Status Lamaran Saya</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Email ini dikirimkan secara otomatis oleh sistem resmi <strong>Profabel</strong>.</p>
            <p style="margin: 0;">&copy; {{ date('Y') }} Profabel. Hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
