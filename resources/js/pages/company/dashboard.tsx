import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface CompanyData {
  company_name: string;
  address: string;
  is_approved: boolean;
}

interface StatsData {
  total_vacancies: number;
  active_vacancies: number;
  total_applicants: number;
  in_review: number;
  interview: number;
  hired: number;
}

interface RecentApplicant {
  id: number;
  status: string;
  applied_at: string;
  vacancy: {
    id: number;
    title: string;
  };
  job_seeker_profile: {
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface Props {
  company: CompanyData;
  stats: StatsData;
  recentApplications: RecentApplicant[];
}

export default function CompanyDashboard({ company, stats, recentApplications }: Props): ReactElement {
  return (
    <AppLayout>
      <Head title="Dashboard Perusahaan" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-teal-800 to-teal-950 p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="rounded-full bg-teal-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200">
                Portal Perusahaan Inklusif
              </span>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Statistik Rekrutmen Perusahaan - {company.company_name}
              </h1>
              <p className="mt-1 text-sm text-teal-100">
                Pantau progres penyerapan tenaga kerja disabilitas dan kelola kandidat secara efisien.
              </p>
            </div>
            <Link
              href="/company/vacancies/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-400 min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Buat Lowongan Baru
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Lowongan Aktif</span>
              <Briefcase className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.active_vacancies}</p>
            <span className="text-[11px] text-slate-400">Dari total {stats.total_vacancies} lowongan</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Pelamar</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total_applicants}</p>
            <span className="text-[11px] text-slate-400">Seluruh posisi</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tahap Wawancara</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.interview}</p>
            <span className="text-[11px] text-slate-400">{stats.in_review} masih ditinjau</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Kandidat Diterima</span>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.hired}</p>
            <span className="text-[11px] text-slate-400">Kandidat direkrut</span>
          </div>
        </div>

        {/* Recent Applicants Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pelamar Terbaru</h2>
              <p className="text-xs text-slate-500">Daftar kandidat yang baru saja mengirimkan lamaran kerja.</p>
            </div>
            <Link
              href="/company/applications"
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Lihat Semua Pelamar →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              Belum ada lamaran masuk saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3.5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">{app.job_seeker_profile.user.name}</p>
                    <p className="text-xs text-slate-500">
                      Melamar: <span className="font-medium text-slate-700">{app.vacancy.title}</span> • {new Date(app.applied_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-700">
                      {app.status}
                    </span>
                    <Link
                      href="/company/applications"
                      className="text-xs font-medium text-teal-600 hover:underline min-h-[44px] flex items-center"
                    >
                      Tinjau
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
