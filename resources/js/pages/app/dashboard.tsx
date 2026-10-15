import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  MapPin,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface StatsData {
  total_applied: number;
  in_review: number;
  interview: number;
  hired: number;
}

interface ApplicationItem {
  id: number;
  status: string;
  applied_at: string;
  vacancy: {
    id: number;
    title: string;
    location: string;
    work_model: string;
    company_profile: {
      company_name: string;
    };
  };
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  location: string;
  work_model: string;
  company_profile: {
    company_name: string;
  };
  accessibilities: Array<{
    id: number;
    accommodation_type: string;
  }>;
}

interface Props {
  stats: StatsData;
  recentApplications: ApplicationItem[];
  recommendedJobs: VacancyItem[];
  unreadNotificationsCount: number;
}

export default function SeekerDashboard({
  stats,
  recentApplications,
  recommendedJobs,
  unreadNotificationsCount,
}: Props): ReactElement {
  return (
    <AppLayout>
      <Head title="Beranda Pencari Kerja" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Selamat Datang */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="rounded-full bg-teal-600/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-100">
                Akses Karier Ramah Disabilitas
              </span>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Ringkasan Aktivitas Pelamar & Peluang Kerja
              </h1>
              <p className="mt-1 text-sm text-teal-100">
                Temukan lowongan dengan dukungan akomodasi ramah disabilitas yang cocok untuk Anda.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/app/ai-assistant"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-teal-950 px-4 py-2.5 text-sm font-bold shadow hover:bg-teal-50 min-h-[44px]"
              >
                <Sparkles className="h-4 w-4 text-teal-600" />
                AI Career Assistant
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-400 min-h-[44px]"
              >
                <Search className="h-4 w-4" />
                Cari Lowongan
              </Link>
            </div>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Lamaran Terkirim</span>
              <FileText className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total_applied}</p>
            <span className="text-[11px] text-slate-400">Total seluruh lowongan</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Sedang Ditinjau</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.in_review}</p>
            <span className="text-[11px] text-slate-400">Menunggu respons HR</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tahap Wawancara</span>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.interview}</p>
            <span className="text-[11px] text-slate-400">Jadwal seleksi aktif</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Diterima Kerja</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.hired}</p>
            <span className="text-[11px] text-slate-400">Karier berhasil diraih</span>
          </div>
        </div>

        {/* Content Columns: Recent Applications & Recommended Vacancies */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Applications Column */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Status Lamaran Terbaru</h2>
                <p className="text-xs text-slate-500">Pantau perkembangan tahapan seleksi Anda.</p>
              </div>
              <Link
                href="/app/applications"
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                Lihat Semua ({stats.total_applied}) →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Anda belum mengirimkan lamaran kerja.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{app.vacancy.title}</p>
                      <p className="text-xs text-slate-500">
                        {app.vacancy.company_profile.company_name} • {new Date(app.applied_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-700">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Jobs Column */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Rekomendasi Lowongan Inklusif</h2>
                <p className="text-xs text-slate-500">Pekerjaan dengan fasilitas ramah disabilitas.</p>
              </div>
              <Link href="/jobs" className="text-xs font-semibold text-teal-600 hover:underline">
                Buka Katalog →
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Belum ada lowongan baru yang dipublikasikan.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-slate-50"
                  >
                    <div>
                      <Link href={`/jobs/${job.slug}`} className="text-sm font-bold text-slate-900 hover:text-teal-600">
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.company_profile.company_name} • {job.work_model}
                      </p>
                    </div>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 min-h-[44px] flex items-center"
                    >
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
