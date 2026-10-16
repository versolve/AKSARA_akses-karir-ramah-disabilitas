import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, Building2, MapPin, Search, Filter, Volume2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface AccessibilityItem {
  id: number;
  accommodation_type: string;
  description?: string;
}

interface CompanyItem {
  id: number;
  company_name: string;
  logo_path?: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  job_type: string;
  work_model: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  is_salary_public: boolean;
  company_profile: CompanyItem;
  accessibilities: AccessibilityItem[];
}

interface Props {
  vacancies: {
    data: VacancyItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    search?: string;
    work_model?: string;
    job_type?: string;
    accessibility?: string;
  };
}

const ACCESSIBILITY_LABELS: Record<string, string> = {
  ramp_access: 'Akses Ram / Kursi Roda',
  elevator: 'Akses Lift Prioritas',
  accessible_restroom: 'Toilet Khusus Disabilitas',
  screen_reader_software: 'Dukungan Screen Reader',
  sign_language_interpreter: 'Juru Bahasa Isyarat',
  written_communication: 'Komunikasi Tertulis',
  flexible_hours: 'Jam Fleksibel',
  remote_option: 'Kerja Remote',
  ergonomic_workspace: 'Ruang Ergonomis',
  quiet_space: 'Ruang Tenang',
};

export default function JobsIndex({ vacancies, filters }: Props): ReactElement {
  const [search, setSearch] = useState(filters.search ?? '');
  const [workModel, setWorkModel] = useState(filters.work_model ?? '');
  const [accessibility, setAccessibility] = useState(filters.accessibility ?? '');

  const applyFilters = (): void => {
    router.get(
      '/jobs',
      {
        search: search || undefined,
        work_model: workModel || undefined,
        accessibility: accessibility || undefined,
      },
      { preserveState: true }
    );
  };

  const handleSpeak = (text: string): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppLayout>
      <Head title="Cari Lowongan Kerja Ramah Disabilitas" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Katalog Lowongan Ramah Disabilitas
          </h1>
          <p className="mt-1 text-slate-600">
            Temukan pekerjaan impian yang disesuaikan dengan keahlian dan kebutuhan aksesibilitas Anda.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="search-input" className="sr-only">Cari lowongan</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Cari judul pekerjaan, skill, lokasi..."
                  className="pl-10 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <select
                aria-label="Model kerja"
                value={workModel}
                onChange={(e) => setWorkModel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm min-h-[44px]"
              >
                <option value="">Semua Model Kerja</option>
                <option value="remote">Remote (Jarak Jauh)</option>
                <option value="onsite">Onsite (Kantor)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <select
                aria-label="Fasilitas aksesibilitas"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm min-h-[44px]"
              >
                <option value="">Semua Fasilitas Aksesibilitas</option>
                {Object.entries(ACCESSIBILITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setWorkModel('');
                setAccessibility('');
                router.get('/jobs');
              }}
              className="min-h-[44px]"
            >
              Reset Filter
            </Button>
            <Button onClick={applyFilters} className="min-h-[44px]">
              Terapkan Filter
            </Button>
          </div>
        </div>

        {/* Vacancies Grid */}
        {vacancies.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Tidak ada lowongan yang cocok</h3>
            <p className="mt-1 text-sm text-slate-500">
              Coba sesuaikan kata kunci atau bersihkan filter aksesibilitas Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vacancies.data.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {job.work_model.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(`${job.title} di ${job.company_profile.company_name}, lokasi ${job.location}`)}
                      aria-label={`Bacakan detail lowongan ${job.title}`}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    <Link href={`/jobs/${job.slug}`} className="hover:text-emerald-700">
                      {job.title}
                    </Link>
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    {job.company_profile.company_name}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {job.location}
                  </p>

                  {/* Accessibility tags */}
                  {job.accessibilities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.accessibilities.slice(0, 3).map((acc) => (
                        <span
                          key={acc.id}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {ACCESSIBILITY_LABELS[acc.accommodation_type] ?? acc.accommodation_type}
                        </span>
                      ))}
                      {job.accessibilities.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          +{job.accessibilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 min-h-[44px]"
                  >
                    Lihat Detail Lowongan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
