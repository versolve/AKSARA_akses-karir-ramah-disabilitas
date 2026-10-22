import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Search,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';

interface CompanyItem {
  id: number;
  company_name: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  location: string;
  work_model: string;
  job_type: string;
  company_profile: CompanyItem;
}

interface ApplicationItem {
  id: number;
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
  status_notes?: string;
  applied_at: string;
  cv_path: string;
  vacancy: VacancyItem;
}

interface StatsData {
  total: number;
  in_progress: number;
  hired: number;
  rejected: number;
}

interface Props {
  applications: {
    data: ApplicationItem[];
    total?: number;
    from?: number;
    to?: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  stats?: StatsData;
  filters?: {
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default function ApplicationsIndex({
  applications,
  stats = { total: 0, in_progress: 0, hired: 0, rejected: 0 },
  filters = {},
}: Props): ReactElement {
  // Guard against Inertia returning an empty array instead of filter object.
  const safeFilters = filters && !Array.isArray(filters) ? filters : {};
  const [search, setSearch] = useState(safeFilters.search ?? '');
  const [status, setStatus] = useState(safeFilters.status ?? '');
  const [sort, setSort] = useState(safeFilters.sort ?? 'newest');

  const handleFilter = (e?: FormEvent): void => {
    if (e) e.preventDefault();
    router.get(
      '/app/applications',
      {
        search: search || undefined,
        status: status || undefined,
        sort: sort || undefined,
      },
      { preserveState: true }
    );
  };

  const handleExport = (): void => {
    // Generate CSV export directly in browser
    if (applications.data.length === 0) {
      alert('Belum ada data lamaran untuk diekspor.');
      return;
    }

    const headers = ['No', 'Posisi', 'Perusahaan', 'Lokasi', 'Tanggal Melamar', 'Status'];
    const rows = applications.data.map((app, idx) => [
      idx + 1,
      `"${app.vacancy.title}"`,
      `"${app.vacancy.company_profile.company_name}"`,
      `"${app.vacancy.location}"`,
      new Date(app.applied_at).toLocaleDateString('id-ID'),
      app.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_lamaran_aksara_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st: ApplicationItem['status']) => {
    switch (st) {
      case 'hired':
        return (
          <span className="inline-block rounded-md bg-[#DCFCE7] text-[#15803D] font-bold px-3 py-1 text-xs">
            Diterima
          </span>
        );
      case 'rejected':
      case 'withdrawn':
        return (
          <span className="inline-block rounded-md bg-[#FEE2E2] text-[#B91C1C] font-bold px-3 py-1 text-xs">
            Ditolak
          </span>
        );
      case 'submitted':
      case 'reviewed':
      case 'interview':
      default:
        return (
          <span className="inline-block rounded-md bg-[#FEF9C3] text-[#A16207] font-bold px-3 py-1 text-xs">
            Dalam Proses
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <Head title="Lamaran Saya - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
            Lamaran Saya
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Lihat daftar pekerjaan yang sudah kamu lamar dan pantau statusnya disini.
          </p>
        </div>

        {/* 4 Summary Cards (matches Lamaran.png) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* 1. Total Lamaran */}
          <div className="flex items-center gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#EBF5FA] text-[#1674D1] shrink-0">
              <Send className="h-6 w-6 -rotate-45 text-[#1674D1]" />
            </div>
            <div>
              <span className="block text-xs font-medium text-[#64748B]">Total Lamaran</span>
              <p className="text-2xl font-extrabold text-[#102B4B] leading-tight">{stats.total}</p>
              <span className="text-[10px] text-[#94A3B8]">Semua lamaran yang kamu kirim</span>
            </div>
          </div>

          {/* 2. Dalam Proses */}
          <div className="flex items-center gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#F3E8FF] text-[#7E22CE] shrink-0">
              <Clock className="h-6 w-6 text-[#7E22CE]" />
            </div>
            <div>
              <span className="block text-xs font-medium text-[#64748B]">Dalam Proses</span>
              <p className="text-2xl font-extrabold text-[#102B4B] leading-tight">{stats.in_progress}</p>
              <span className="text-[10px] text-[#94A3B8]">Sedan ditinjau perusahaan</span>
            </div>
          </div>

          {/* 3. Diterima */}
          <div className="flex items-center gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D] shrink-0">
              <Check className="h-6 w-6 text-[#15803D] stroke-[3]" />
            </div>
            <div>
              <span className="block text-xs font-medium text-[#64748B]">Diterima</span>
              <p className="text-2xl font-extrabold text-[#102B4B] leading-tight">{stats.hired}</p>
              <span className="text-[10px] text-[#94A3B8]">Lolos ke tahap selanjutnya</span>
            </div>
          </div>

          {/* 4. Ditolak */}
          <div className="flex items-center gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#FEE2E2] text-[#B91C1C] shrink-0">
              <X className="h-6 w-6 text-[#B91C1C] stroke-[3]" />
            </div>
            <div>
              <span className="block text-xs font-medium text-[#64748B]">Ditolak</span>
              <p className="text-2xl font-extrabold text-[#102B4B] leading-tight">{stats.rejected}</p>
              <span className="text-[10px] text-[#94A3B8]">Tidak memenuhi kriteria</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleFilter} className="relative flex-1 max-w-sm flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari posisi, Perusahaan, atau status"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-10 pr-4 py-2.5 text-xs text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[44px]"
              />
            </form>

            {/* Status Dropdown */}
            <div className="w-full sm:w-44">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  router.get(
                    '/app/applications',
                    { search: search || undefined, status: e.target.value || undefined, sort: sort || undefined },
                    { preserveState: true }
                  );
                }}
                aria-label="Filter berdasarkan status"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs text-[#102B4B] focus:border-[#007F96] outline-none min-h-[44px] cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="submitted">Terkirim</option>
                <option value="reviewed">Ditinjau</option>
                <option value="interview">Wawancara</option>
                <option value="hired">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-44">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  router.get(
                    '/app/applications',
                    { search: search || undefined, status: status || undefined, sort: e.target.value || undefined },
                    { preserveState: true }
                  );
                }}
                aria-label="Urutan data"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs text-[#102B4B] focus:border-[#007F96] outline-none min-h-[44px] cursor-pointer"
              >
                <option value="newest">Urutkan Terbaru</option>
                <option value="oldest">Urutkan Terlama</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1674D1] bg-white px-5 py-2.5 text-xs font-bold text-[#1674D1] hover:bg-blue-50 transition min-h-[44px] cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Riwayat</span>
          </button>
        </div>

        {/* Data Table Container */}
        <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#EBF5FA] text-[#102B4B] font-extrabold border-b border-[#E2E8F0]">
                  <th className="py-4 px-6 w-16">NO</th>
                  <th className="py-4 px-6">Posisi yang Dilamar</th>
                  <th className="py-4 px-6">Perusahaan</th>
                  <th className="py-4 px-6">Tanggal Melamar</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#102B4B]">
                {applications.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Belum ada data lamaran kerja yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  applications.data.map((app, index) => {
                    const rowNumber = (applications.from ?? 1) + index;
                    const dateObj = new Date(app.applied_at);
                    const formattedDate = dateObj.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-bold text-slate-500">{rowNumber}</td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/app/applications/${app.id}`}
                            className="font-extrabold text-sm text-[#102B4B] hover:text-[#1674D1]"
                          >
                            {app.vacancy.title}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="rounded-md bg-[#EBF5FA] text-[#1674D1] font-semibold px-2 py-0.5 text-[10px] capitalize">
                              {app.vacancy.work_model}
                            </span>
                            <span className="rounded-md bg-[#F1F5F9] text-[#475569] font-medium px-2 py-0.5 text-[10px] capitalize">
                              {app.vacancy.job_type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#102B4B]">
                            {app.vacancy.company_profile.company_name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{app.vacancy.location}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#102B4B]">{formattedDate}</div>
                          <div className="text-[10px] text-slate-400">{formattedTime}</div>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(app.status)}</td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/app/applications/${app.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-[#1674D1] text-[#1674D1] hover:bg-blue-50 font-bold px-3.5 py-1.5 text-xs transition min-h-[36px]"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#F1F5F9] text-xs text-[#64748B]">
            <div>
              Menampilkan {applications.from ?? 0}-{applications.to ?? 0} dari {applications.total ?? 0} Data
            </div>

            {applications.links && applications.links.length > 3 && (
              <div className="flex items-center gap-1">
                {applications.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url ?? '#'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                      link.active
                        ? 'bg-[#123B5D] text-white'
                        : link.url
                        ? 'border border-[#E2E8F0] bg-white text-[#102B4B] hover:bg-slate-50'
                        : 'text-slate-300 pointer-events-none'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
