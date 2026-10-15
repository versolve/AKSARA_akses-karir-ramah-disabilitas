import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface StatsData {
  total_users: number;
  total_seekers: number;
  total_companies: number;
  pending_companies: number;
  active_vacancies: number;
  total_vacancies: number;
  total_applications: number;
}

interface ApplicationItem {
  id: number;
  status: string;
  applied_at: string;
  vacancy: {
    title: string;
    company_profile: {
      company_name: string;
    };
  };
  job_seeker_profile: {
    user: {
      name: string;
    };
  };
}

interface VacancyItem {
  id: number;
  title: string;
  status: string;
  created_at: string;
  company_profile: {
    company_name: string;
  };
}

interface Props {
  stats: StatsData;
  recentApplications: ApplicationItem[];
  recentVacancies: VacancyItem[];
}

export default function AdminDashboard({
  stats,
  recentApplications,
  recentVacancies,
}: Props): ReactElement {
  return (
    <AppLayout>
      <Head title="Panel Administrator - AKSARA" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Admin */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="flex items-center gap-1.5 rounded-full bg-indigo-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200 w-fit">
                <ShieldCheck className="h-4 w-4" />
                Sistem Moderasi & Kontrol Platform
              </span>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Dashboard Eksekutif Administrator
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Pengawasan platform AKSARA: verifikasi kemitraan perusahaan, moderasi lowongan, dan metrik serapan kerja disabilitas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 min-h-[44px]"
              >
                Kelola Pengguna
              </Link>
              <Link
                href="/admin/vacancies"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 min-h-[44px]"
              >
                Moderasi Lowongan
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Verification Notice */}
        {stats.pending_companies > 0 && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  {stats.pending_companies} Perusahaan Menunggu Verifikasi
                </h2>
                <p className="text-xs text-amber-800">
                  Periksa kelengkapan data legalitas dan fasilitas sebelum menyetujui akun perusahaan.
                </p>
              </div>
            </div>
            <Link
              href="/admin/users?role=perusahaan"
              className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 min-h-[44px] flex items-center"
            >
              Tinjau Akun
            </Link>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pencari Kerja</span>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total_seekers}</p>
            <span className="text-[11px] text-slate-400">Penyandang disabilitas</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Perusahaan</span>
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total_companies}</p>
            <span className="text-[11px] text-slate-400">{stats.pending_companies} belum terverifikasi</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Lowongan Aktif</span>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.active_vacancies}</p>
            <span className="text-[11px] text-slate-400">Dari total {stats.total_vacancies}</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Lamaran Masuk</span>
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total_applications}</p>
            <span className="text-[11px] text-slate-400">Seluruh platform</span>
          </div>
        </div>

        {/* Two Columns: Recent Applications & Recent Vacancies */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Applications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Aktivitas Lamaran Terbaru</h2>
              <span className="text-xs text-slate-400">Global Feed</span>
            </div>

            {recentApplications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Belum ada aktivitas lamaran.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{app.job_seeker_profile?.user?.name ?? 'Pelamar'}</p>
                      <p className="text-slate-500">
                        Melamar: <span className="font-medium text-slate-700">{app.vacancy?.title ?? 'Lowongan Dihapus'}</span> di {app.vacancy?.company_profile?.company_name ?? 'Perusahaan'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-700">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Vacancies */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Lowongan Baru Dipublikasikan</h2>
              <Link
                href="/admin/vacancies"
                className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 min-h-[44px]"
              >
                Kelola Semua →
              </Link>
            </div>

            {recentVacancies.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Belum ada lowongan terdaftar.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentVacancies.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{v.title}</p>
                      <p className="text-slate-500">{v.company_profile.company_name}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        v.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
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
