<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $report->name }} - {{ $company->company_name }}</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        body {
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            padding: 36px 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1769E0;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .header-left h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #102B4B;
        }
        .header-left p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #64748b;
        }
        .header-right {
            text-align: right;
            font-size: 12px;
            color: #64748b;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-blue { background: #eff6ff; color: #1769E0; }
        .badge-purple { background: #faf5ff; color: #8b5cf6; }
        .badge-green { background: #ecfdf5; color: #10b981; }
        .badge-amber { background: #fffbeb; color: #f59e0b; }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 12px;
        }
        .meta-item strong {
            display: block;
            color: #475569;
            margin-bottom: 4px;
        }
        .meta-item span {
            font-weight: 700;
            color: #0f172a;
            font-size: 13px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 12px;
        }
        th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 10px 12px;
            font-weight: 700;
            border-bottom: 1px solid #cbd5e1;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
        }
        tr:nth-child(even) {
            background-color: #fafafa;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
        }
        .print-btn-bar {
            max-width: 900px;
            margin: 0 auto 16px auto;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .btn {
            background: #1769E0;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-outline {
            background: white;
            color: #475569;
            border: 1px solid #cbd5e1;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            .print-btn-bar {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="print-btn-bar">
        <a href="javascript:history.back()" class="btn btn-outline">← Kembali</a>
        <button onclick="window.print()" class="btn">🖨️ Cetak / Simpan PDF</button>
    </div>

    <div class="container">
        <div class="header">
            <div class="header-left">
                <h1>{{ $company->company_name }}</h1>
                <p>Dokumen Laporan Rekrutmen Resmi &mdash; Profabel Indonesia</p>
            </div>
            <div class="header-right">
                <span class="badge badge-blue">DOKUMEN RESMI</span>
                <p style="margin-top: 6px;">ID: #REP-{{ str_pad($report->id, 5, '0', STR_PAD_LEFT) }}</p>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <strong>Nama Laporan</strong>
                <span>{{ $report->name }}</span>
            </div>
            <div class="meta-item">
                <strong>Jenis Laporan</strong>
                <span>{{ ucwords(str_replace('_', ' ', $report->type)) }}</span>
            </div>
            <div class="meta-item">
                <strong>Periode</strong>
                <span>{{ $report->period_label }}</span>
            </div>
            <div class="meta-item">
                <strong>Tanggal Terbit</strong>
                <span>{{ $report->created_at->translatedFormat('d M Y, H:i') }}</span>
            </div>
        </div>

        @if($report->type === 'rekap_lowongan')
            <h3 style="margin-bottom: 8px; color: #102B4B;">Daftar Rekap Lowongan</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th>Judul Lowongan</th>
                        <th>Tipe</th>
                        <th>Model</th>
                        <th>Lokasi</th>
                        <th>Status</th>
                        <th style="text-align: center;">Pelamar</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($vacancies as $idx => $vac)
                        <tr>
                            <td>{{ $idx + 1 }}</td>
                            <td><strong>{{ $vac->title }}</strong></td>
                            <td>{{ $vac->job_type ?? 'Full-time' }}</td>
                            <td>{{ $vac->work_model ?? 'On-site' }}</td>
                            <td>{{ $vac->location ?? 'Jakarta' }}</td>
                            <td><span class="badge badge-green">{{ strtoupper($vac->status ?? 'ACTIVE') }}</span></td>
                            <td style="text-align: center;">{{ $vac->applications_count ?? 0 }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" style="text-align: center; color: #94a3b8;">Belum ada lowongan terdaftar.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @elseif($report->type === 'rekap_lamaran')
            <h3 style="margin-bottom: 8px; color: #102B4B;">Daftar Pelamar Masuk</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th>Nama Pelamar</th>
                        <th>Posisi Dilamar</th>
                        <th>Tanggal Melamar</th>
                        <th>Status</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($applications as $idx => $app)
                        <tr>
                            <td>{{ $idx + 1 }}</td>
                            <td><strong>{{ $app->jobSeekerProfile?->user?->name ?? 'Kandidat' }}</strong></td>
                            <td>{{ $app->vacancy?->title ?? '-' }}</td>
                            <td>{{ $app->applied_at ? $app->applied_at->translatedFormat('d M Y, H:i') : $app->created_at->translatedFormat('d M Y, H:i') }}</td>
                            <td><span class="badge badge-blue">{{ strtoupper($app->status) }}</span></td>
                            <td>{{ $app->status_notes ?? '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align: center; color: #94a3b8;">Tidak ada pelamar pada periode ini.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @elseif($report->type === 'hasil_seleksi')
            <h3 style="margin-bottom: 8px; color: #102B4B;">Hasil Keputusan Seleksi Kandidat</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th>Nama Kandidat</th>
                        <th>Posisi Lowongan</th>
                        <th>Keputusan Akhir</th>
                        <th>Tanggal Keputusan</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @php $selectionApps = $applications->whereIn('status', ['hired', 'rejected']); @endphp
                    @forelse($selectionApps as $idx => $app)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td><strong>{{ $app->jobSeekerProfile?->user?->name ?? 'Kandidat' }}</strong></td>
                            <td>{{ $app->vacancy?->title ?? '-' }}</td>
                            <td>
                                @if($app->status === 'hired')
                                    <span class="badge badge-green">✓ DITERIMA</span>
                                @else
                                    <span class="badge" style="background: #fee2e2; color: #ef4444;">✕ DITOLAK</span>
                                @endif
                            </td>
                            <td>{{ $app->updated_at ? $app->updated_at->translatedFormat('d M Y') : '-' }}</td>
                            <td>{{ $app->status_notes ?? '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align: center; color: #94a3b8;">Belum ada keputusan seleksi akhir pada periode ini.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @else
            <h3 style="margin-bottom: 8px; color: #102B4B;">Ringkasan Aktivitas Rekrutmen</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th>Nama Pelamar</th>
                        <th>Posisi</th>
                        <th>Status Aktivitas</th>
                        <th>Terakhir Diperbarui</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($applications as $idx => $app)
                        <tr>
                            <td>{{ $idx + 1 }}</td>
                            <td><strong>{{ $app->jobSeekerProfile?->user?->name ?? 'Kandidat' }}</strong></td>
                            <td>{{ $app->vacancy?->title ?? '-' }}</td>
                            <td><span class="badge badge-purple">{{ strtoupper($app->status) }}</span></td>
                            <td>{{ $app->updated_at ? $app->updated_at->translatedFormat('d M Y, H:i') : '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" style="text-align: center; color: #94a3b8;">Tidak ada aktivitas pada periode ini.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        @endif

        <div class="footer">
            <span>Diterbitkan secara otomatis oleh Profabel Platform &bull; {{ date('Y') }}</span>
            <span>Halaman 1 dari 1</span>
        </div>
    </div>
</body>
</html>
