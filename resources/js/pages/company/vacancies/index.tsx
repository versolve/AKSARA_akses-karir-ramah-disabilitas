import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, Plus, Trash2, Edit, Users, Eye } from 'lucide-react';
import type { ReactElement } from 'react';

interface AccessibilityItem {
  id: number;
  accommodation_type: string;
  description?: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  job_type: string;
  work_model: string;
  location: string;
  status: 'draft' | 'active' | 'closed';
  applications_count: number;
  accessibilities: AccessibilityItem[];
  created_at: string;
}

interface Props {
  vacancies: {
    data: VacancyItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
}

export default function VacanciesIndex({ vacancies }: Props): ReactElement {
  const handleDelete = (id: number, title: string): void => {
    if (confirm(`Yakin ingin menghapus lowongan "${title}"?`)) {
      router.delete(`/company/vacancies/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Kelola Lowongan - Mitra Perusahaan Profabel" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Kelola Lowongan Kerja</h1>
            <p className="mt-1 text-sm text-slate-600">
              Publikasikan lowongan kerja inklusif dan cantumkan fasilitas aksesibilitas tempat kerja Anda.
            </p>
          </div>
          <Link
            href="/company/vacancies/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Tambah Lowongan Baru
          </Link>
        </div>

        {vacancies.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-bold text-slate-900">Belum ada lowongan dibuat</h3>
            <p className="mt-1 text-sm text-slate-500">
              Mulai buka lowongan pekerjaan ramah disabilitas pertama dari perusahaan Anda.
            </p>
            <div className="mt-6">
              <Link
                href="/company/vacancies/create"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 min-h-[44px]"
              >
                <Plus className="h-4 w-4" />
                Buat Lowongan Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {vacancies.data.map((vacancy) => (
              <div
                key={vacancy.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center transition hover:border-slate-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-slate-900">
                      <Link href={`/jobs/${vacancy.slug}`} className="hover:text-emerald-700">
                        {vacancy.title}
                      </Link>
                    </h2>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        vacancy.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vacancy.status === 'draft'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {vacancy.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {vacancy.location} • <span className="capitalize">{vacancy.work_model}</span> • <span className="capitalize">{vacancy.job_type}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      {vacancy.applications_count} Pelamar Terdaftar
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">
                      {vacancy.accessibilities.length} Fasilitas Aksesibilitas
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/jobs/${vacancy.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                    title="Lihat Pratinjau Publik"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat
                  </Link>
                  <Link
                    href={`/company/vacancies/${vacancy.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(vacancy.id, vacancy.title)}
                    className="inline-flex items-center gap-1 border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 min-h-[44px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {vacancies.links && vacancies.links.length > 3 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
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
