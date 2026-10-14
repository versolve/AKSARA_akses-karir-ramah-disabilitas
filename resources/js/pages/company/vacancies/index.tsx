import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, Plus, Trash2, Edit } from 'lucide-react';
import type { ReactElement } from 'react';

interface AccessibilityItem {
  id: number;
  accommodation_type: string;
  description?: string;
}

interface VacancyItem {
  id: number;
  title: string;
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
      <Head title="Kelola Lowongan" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Lowongan Pekerjaan</h1>
            <p className="text-sm text-slate-600">
              Buat dan pantau status lowongan kerja ramah disabilitas dari perusahaan Anda.
            </p>
          </div>
          <Link
            href="/company/vacancies/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Tambah Lowongan Baru
          </Link>
        </div>

        {vacancies.data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Belum ada lowongan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Mulai buat lowongan pekerjaan pertama Anda sekarang.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacancies.data.map((vacancy) => (
              <div
                key={vacancy.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{vacancy.title}</h2>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        vacancy.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vacancy.status === 'draft'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {vacancy.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {vacancy.location} • {vacancy.work_model} • {vacancy.job_type}
                  </p>
                  <p className="text-xs text-slate-500">
                    Pelamar: <span className="font-semibold text-slate-800">{vacancy.applications_count} orang</span> • {vacancy.accessibilities.length} Fasilitas Aksesibilitas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/company/vacancies/${vacancy.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(vacancy.id, vacancy.title)}
                    className="inline-flex items-center gap-1 border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 min-h-[44px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
