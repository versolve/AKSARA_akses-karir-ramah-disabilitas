import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyInfo {
  id: number;
  company_name: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  work_model: string;
  location: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  applications_count: number;
  company_profile: CompanyInfo;
}

interface Props {
  vacancies: {
    data: VacancyItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    status?: string;
    search?: string;
  };
}

export default function AdminVacanciesIndex({ vacancies, filters }: Props): ReactElement {
  const [status, setStatus] = useState(filters.status ?? '');
  const [search, setSearch] = useState(filters.search ?? '');

  const applyFilters = (): void => {
    router.get(
      '/admin/vacancies',
      {
        status: status || undefined,
        search: search || undefined,
      },
      { preserveState: true }
    );
  };

  const handleUpdateStatus = (vacancyId: number, newStatus: string): void => {
    router.patch(`/admin/vacancies/${vacancyId}/status`, {
      status: newStatus,
    });
  };

  const handleTakedown = (vacancyId: number, title: string): void => {
    if (confirm(`PERINGATAN: Anda yakin ingin men-takedown lowongan "${title}"? Lowongan akan ditarik dari katalog publik.`)) {
      router.delete(`/admin/vacancies/${vacancyId}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Moderasi Lowongan - Admin AKSARA" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Moderasi Lowongan Kerja</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tinjau seluruh lowongan yang dipublikasikan oleh mitra perusahaan dan lakukan penyesuaian status atau penarikan berkas.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Cari judul lowongan atau lokasi..."
              aria-label="Cari judul lowongan atau lokasi"
              className="pl-10 min-h-[44px]"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm min-h-[44px]"
              aria-label="Filter status lowongan"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="closed">Ditutup</option>
              <option value="draft">Draf</option>
            </select>
          </div>

          <Button onClick={applyFilters} className="bg-slate-900 hover:bg-slate-800 min-h-[44px]">
            Filter
          </Button>
        </div>

        {/* Vacancies Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Lowongan & Perusahaan</th>
                <th className="px-6 py-4">Model & Lokasi</th>
                <th className="px-6 py-4">Pelamar</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vacancies.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada lowongan ditemukan.
                  </td>
                </tr>
              ) : (
                vacancies.data.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{v.title}</div>
                      <div className="text-xs text-slate-500">{v.company_profile.company_name}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>{v.work_model.toUpperCase()}</div>
                      <div className="text-slate-400">{v.location}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {v.applications_count} orang
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          v.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'closed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.status === 'active' ? (
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(v.id, 'closed')}
                            className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 min-h-[44px]"
                          >
                            Tutup
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(v.id, 'active')}
                            className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 min-h-[44px]"
                          >
                            Aktifkan
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleTakedown(v.id, v.title)}
                          className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Takedown / Soft Delete"
                          aria-label={`Takedown lowongan ${v.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Links */}
        {vacancies.links && vacancies.links.length > 3 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            {vacancies.links.map((link, i) => (
              <Link
                key={i}
                href={link.url ?? '#'}
                dangerouslySetInnerHTML={{ __html: link.label }}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold min-h-[44px] min-w-[44px] flex items-center justify-center transition ${
                  link.active
                    ? 'bg-slate-900 text-white'
                    : link.url
                    ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
