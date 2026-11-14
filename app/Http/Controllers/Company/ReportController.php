<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\CompanyReport;
use App\Models\Vacancy;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function getCompanyProfile(Request $request): CompanyProfile
    {
        $company = $request->user()->companyProfile;
        if (!$company) {
            $company = CompanyProfile::create([
                'user_id' => $request->user()->id,
                'company_name' => $request->user()->name,
                'address' => 'Belum diisi',
            ]);
        }
        return $company;
    }

    public function index(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);
        $search = $request->query('search', '');

        $reportsQuery = CompanyReport::where('company_profile_id', $company->id);

        if (!empty($search)) {
            $reportsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('period_label', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $reports = $reportsQuery->orderBy('created_at', 'desc')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'type' => $r->type,
                'type_label' => match ($r->type) {
                    'rekap_lowongan' => 'Rekap Lowongan',
                    'rekap_lamaran' => 'Rekap Lamaran',
                    'hasil_seleksi' => 'Hasil Seleksi',
                    'aktivitas_rekrutmen' => 'Aktivitas Rekrutmen',
                    default => ucwords(str_replace('_', ' ', $r->type)),
                },
                'period_label' => $r->period_label,
                'start_date' => $r->start_date?->format('Y-m-d'),
                'end_date' => $r->end_date?->format('Y-m-d'),
                'format' => strtolower($r->format),
                'status' => $r->status,
                'created_at_label' => $r->created_at->translatedFormat('d M Y, H:i'),
            ];
        });

        // 4 Report types definition matching Reference UI
        $reportTypes = [
            [
                'id' => 'rekap_lowongan',
                'title' => 'Rekap Lowongan',
                'description' => 'Daftar lowongan dan status publikasinya.',
                'icon' => 'briefcase',
                'color' => 'blue',
                'bg' => 'bg-blue-50 text-[#1769E0]',
            ],
            [
                'id' => 'rekap_lamaran',
                'title' => 'Rekap Lamaran',
                'description' => 'Daftar kandidat dan status lamarannya.',
                'icon' => 'file-text',
                'color' => 'purple',
                'bg' => 'bg-purple-50 text-purple-600',
            ],
            [
                'id' => 'hasil_seleksi',
                'title' => 'Hasil Seleksi',
                'description' => 'Daftar kandidat diterima dan ditolak.',
                'icon' => 'user-check',
                'color' => 'green',
                'bg' => 'bg-emerald-50 text-emerald-600',
            ],
            [
                'id' => 'aktivitas_rekrutmen',
                'title' => 'Aktivitas Rekrutmen',
                'description' => 'Riwayat kegiatan dan perubahan proses rekrutmen.',
                'icon' => 'activity',
                'color' => 'amber',
                'bg' => 'bg-amber-50 text-amber-600',
            ],
        ];

        return Inertia::render('company/reports/index', [
            'reports' => $reports,
            'reportTypes' => $reportTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);

        $validated = $request->validate([
            'type' => 'required|in:rekap_lowongan,rekap_lamaran,hasil_seleksi,aktivitas_rekrutmen',
            'format' => 'required|in:pdf,excel',
            'period_label' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'name' => 'nullable|string',
        ]);

        $now = Carbon::now();
        $startDate = !empty($validated['start_date']) ? Carbon::parse($validated['start_date'])->startOfDay() : $now->copy()->startOfMonth();
        $endDate = !empty($validated['end_date']) ? Carbon::parse($validated['end_date'])->endOfDay() : $now->copy()->endOfMonth();

        $periodLabel = $validated['period_label'] ?? ($startDate->translatedFormat('j M Y') . ' – ' . $endDate->translatedFormat('j M Y'));

        $typeReadable = match ($validated['type']) {
            'rekap_lowongan' => 'Rekap Lowongan',
            'rekap_lamaran' => 'Rekap Lamaran',
            'hasil_seleksi' => 'Hasil Seleksi',
            'aktivitas_rekrutmen' => 'Aktivitas Rekrutmen',
            default => 'Laporan Rekrutmen',
        };

        $reportName = !empty($validated['name'])
            ? $validated['name']
            : ($typeReadable . ' ' . $startDate->translatedFormat('F Y'));

        CompanyReport::create([
            'company_profile_id' => $company->id,
            'name' => $reportName,
            'type' => $validated['type'],
            'period_label' => $periodLabel,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'format' => strtolower($validated['format']),
            'status' => 'selesai',
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dibuat!');
    }

    public function download(Request $request, CompanyReport $report)
    {
        $company = $this->getCompanyProfile($request);
        if ($report->company_profile_id !== $company->id) {
            abort(403, 'Akses tidak diizinkan');
        }

        $startDate = $report->start_date ? Carbon::parse($report->start_date)->startOfDay() : null;
        $endDate = $report->end_date ? Carbon::parse($report->end_date)->endOfDay() : null;

        $vacanciesQuery = Vacancy::where('company_profile_id', $company->id);
        $applicationsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        })->with(['vacancy', 'jobSeekerProfile.user']);

        if ($startDate && $endDate) {
            $applicationsQuery->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('applied_at', [$startDate, $endDate])
                    ->orWhere(function ($sub) use ($startDate, $endDate) {
                        $sub->whereNull('applied_at')->whereBetween('created_at', [$startDate, $endDate]);
                    });
            });
        }

        // If Excel format requested -> Stream CSV with UTF-8 BOM
        if (strtolower($report->format) === 'excel') {
            $filename = str_replace([' ', '/', '\\'], '_', $report->name) . '.csv';

            return response()->streamDownload(function () use ($report, $company, $vacanciesQuery, $applicationsQuery): void {
                $handle = fopen('php://output', 'wb');
                // UTF-8 BOM for Microsoft Excel compatibility
                fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

                fputcsv($handle, ['LAPORAN PERUSAHAAN - PROFABEL']);
                fputcsv($handle, ['Nama Perusahaan', $company->company_name]);
                fputcsv($handle, ['Nama Laporan', $report->name]);
                fputcsv($handle, ['Periode', $report->period_label]);
                fputcsv($handle, ['Tanggal Dibuat', $report->created_at->format('Y-m-d H:i:s')]);
                fputcsv($handle, []);

                if ($report->type === 'rekap_lowongan') {
                    fputcsv($handle, ['No', 'Judul Lowongan', 'Tipe Pekerjaan', 'Model Kerja', 'Lokasi', 'Status', 'Total Lamaran', 'Batas Waktu']);
                    $no = 1;
                    foreach ($vacanciesQuery->withCount('applications')->get() as $vac) {
                        fputcsv($handle, [
                            $no++,
                            $vac->title,
                            $vac->job_type ?? '-',
                            $vac->work_model ?? '-',
                            $vac->location ?? '-',
                            $vac->status ?? 'active',
                            $vac->applications_count ?? 0,
                            $vac->deadline ? $vac->deadline->format('d/m/Y') : 'Tidak ditentukan',
                        ]);
                    }
                } elseif ($report->type === 'rekap_lamaran') {
                    fputcsv($handle, ['No', 'Nama Kandidat', 'Posisi Dilamar', 'Tanggal Melamar', 'Status Lamaran', 'Catatan HR']);
                    $no = 1;
                    foreach ($applicationsQuery->get() as $app) {
                        $candidateName = $app->jobSeekerProfile?->user?->name ?? 'Kandidat';
                        fputcsv($handle, [
                            $no++,
                            $candidateName,
                            $app->vacancy?->title ?? '-',
                            $app->applied_at ? $app->applied_at->format('d/m/Y H:i') : $app->created_at->format('d/m/Y H:i'),
                            match ($app->status) {
                                'submitted' => 'Perlu Ditinjau',
                                'reviewed' => 'Ditinjau',
                                'interview' => 'Wawancara',
                                'hired' => 'Diterima',
                                'rejected' => 'Ditolak',
                                default => $app->status,
                            },
                            $app->status_notes ?? '-',
                        ]);
                    }
                } elseif ($report->type === 'hasil_seleksi') {
                    fputcsv($handle, ['No', 'Nama Kandidat', 'Posisi Dilamar', 'Hasil Keputusan', 'Tanggal Keputusan', 'Catatan']);
                    $no = 1;
                    $selectionApps = (clone $applicationsQuery)->whereIn('status', ['hired', 'rejected'])->get();
                    foreach ($selectionApps as $app) {
                        $candidateName = $app->jobSeekerProfile?->user?->name ?? 'Kandidat';
                        fputcsv($handle, [
                            $no++,
                            $candidateName,
                            $app->vacancy?->title ?? '-',
                            $app->status === 'hired' ? 'DITERIMA' : 'DITOLAK',
                            $app->updated_at ? $app->updated_at->format('d/m/Y H:i') : '-',
                            $app->status_notes ?? '-',
                        ]);
                    }
                } else {
                    // aktivitas_rekrutmen
                    fputcsv($handle, ['No', 'Nama Kandidat', 'Posisi', 'Status Terakhir', 'Terakhir Diperbarui']);
                    $no = 1;
                    foreach ($applicationsQuery->orderBy('updated_at', 'desc')->get() as $app) {
                        $candidateName = $app->jobSeekerProfile?->user?->name ?? 'Kandidat';
                        fputcsv($handle, [
                            $no++,
                            $candidateName,
                            $app->vacancy?->title ?? '-',
                            $app->status,
                            $app->updated_at->format('d/m/Y H:i'),
                        ]);
                    }
                }

                fclose($handle);
            }, $filename, [
                'Content-Type' => 'text/csv; charset=UTF-8',
            ]);
        }

        // PDF / Print format: Returns a clean, high-fidelity printable HTML document
        $applications = $applicationsQuery->get();
        $vacancies = $vacanciesQuery->withCount('applications')->get();

        return response()->view('reports.company-pdf', [
            'report' => $report,
            'company' => $company,
            'applications' => $applications,
            'vacancies' => $vacancies,
        ]);
    }

    public function destroy(Request $request, CompanyReport $report): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        if ($report->company_profile_id !== $company->id) {
            abort(403, 'Akses tidak diizinkan');
        }

        $report->delete();

        return redirect()->back()->with('success', 'Laporan berhasil dihapus.');
    }
}
