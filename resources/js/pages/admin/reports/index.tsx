import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
  Building2,
  Briefcase,
  ChartBar,
  CheckCircle2,
  FileCheck,
  FileText,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface UserStatsData {
  total_users: number;
  total_seekers: number;
  total_companies: number;
  verified_companies: number;
  unverified_companies: number;
}

interface VacancyStatsData {
  total_vacancies: number;
  active_vacancies: number;
  closed_vacancies: number;
  draft_vacancies: number;
  work_models: {
    remote: number;
    onsite: number;
    hybrid: number;
  };
}

interface ApplicationStatsData {
  total_applications: number;
  status_breakdown: {
    submitted: number;
    reviewed: number;
    interview: number;
    hired: number;
    rejected: number;
  };
  hired_rate: number;
}

interface Props {
  userStats: UserStatsData;
  vacancyStats: VacancyStatsData;
  applicationStats: ApplicationStatsData;
}

export default function AdminReports({
  userStats,
  vacancyStats,
  applicationStats,
}: Props): ReactElement {
  return (
    <AppLayout>
      <Head title="Laporan & Statistik - Admin AKSARA" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <h1 className="text-2xl font-black sm:text-3xl">Laporan Platform AKSARA</h1>
          <p className="mt-1 text-sm text-slate-300">
            Ringkasan statistik seluruh aktivitas platform: pengguna, lowongan, dan serapan kerja penyandang disabilitas.
          </p>
        </div>

        {/* User Statistics Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Pengguna</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{userStats.total_users}</p>
            <span className="text-[11px] text-slate-400">Semua akun terdaftar</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pencari Kerja</span>
              <UserCheck className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{userStats.total_seekers}</p>
            <span className="text-[11px] text-slate-400">Penyandang disabilitas</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Perusahaan Terdaftar</span>
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{userStats.total_companies}</p>
            <span className="text-[11px] text-slate-400">{userStats.verified_companies} terverifikasi</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Lowongan Total</span>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{vacancyStats.total_vacancies}</p>
            <span className="text-[11px] text-slate-400">Semua status</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Kecocokan Serapan</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{applicationStats.hired_rate}%</p>
            <span className="text-[11px] text-slate-400">Tingkat penerimaan lamaran</span>
          </div>
        </div>

        {/* Two Columns: User/Vacancy Breakdown and Application Stats */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* User & Vacancy Breakdown */}
          <div className="space-y-6">
            {/* Company Verification Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Verifikasi Akun Perusahaan</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">Terverifikasi</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-800">{userStats.verified_companies}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <FileCheck className="h-5 w-5" />
                    <span className="text-sm font-semibold">Menunggu Verifikasi</span>
                  </div>
                  <span className="text-sm font-bold text-amber-800">{userStats.unverified_companies}</span>
                </div>
              </div>
            </div>

            {/* Work Model Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Distribusi Model Kerja</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
                  <span className="text-sm font-semibold text-indigo-800">Remote (Jarak Jauh)</span>
                  <span className="text-sm font-bold text-indigo-800">{vacancyStats.work_models.remote}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                  <span className="text-sm font-semibold text-blue-800">Onsite (Di Kantor)</span>
                  <span className="text-sm font-bold text-blue-800">{vacancyStats.work_models.onsite}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-3">
                  <span className="text-sm font-semibold text-purple-800">Hybrid</span>
                  <span className="text-sm font-bold text-purple-800">{vacancyStats.work_models.hybrid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Status Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Status Lamaran Masuk ({applicationStats.total_applications})</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Terkirim</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{applicationStats.status_breakdown.submitted}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <ChartBar className="h-4 w-4" />
                  <span className="text-sm">Sedang Ditinjau</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{applicationStats.status_breakdown.reviewed}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-blue-50/60 p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">Wawancara</span>
                </div>
                <span className="text-sm font-bold text-blue-700">{applicationStats.status_breakdown.interview}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Diterima Kerja</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">{applicationStats.status_breakdown.hired}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-rose-50/60 p-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-semibold">Ditolak</span>
                </div>
                <span className="text-sm font-bold text-rose-700">{applicationStats.status_breakdown.rejected}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/80 p-4">
              <div className="flex items-center gap-2 text-teal-800 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold text-teal-900">Tingkat Penerimaan</span>
              </div>
              <p className="text-xs text-teal-800">
                Persentase lamaran yang mencapai tahap penerimaan kerja dibandingkan dengan total keseluruhan lamaran masuk.
              </p>
              <p className="mt-1 text-2xl font-black text-teal-950">{applicationStats.hired_rate}%</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
