import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyInfo {
  id: number;
  company_name: string;
  is_approved: boolean;
  industry?: string;
  website?: string;
}

interface SeekerInfo {
  id: number;
  current_job_title?: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'perusahaan' | 'pelamar';
  is_verified: boolean;
  created_at: string;
  company_profile?: CompanyInfo;
  job_seeker_profile?: SeekerInfo;
}

interface Props {
  users: {
    data: UserItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    role?: string;
    search?: string;
  };
}

export default function AdminUsersIndex({ users, filters }: Props): ReactElement {
  const [role, setRole] = useState(filters.role ?? '');
  const [search, setSearch] = useState(filters.search ?? '');

  const applyFilters = (): void => {
    router.get(
      '/admin/users',
      {
        role: role || undefined,
        search: search || undefined,
      },
      { preserveState: true }
    );
  };

  const handleToggleVerify = (companyId: number, currentApproved: boolean): void => {
    const actionText = currentApproved ? 'mencabut verifikasi' : 'memverifikasi';
    if (confirm(`Yakin ingin ${actionText} akun perusahaan ini?`)) {
      router.post(`/admin/companies/${companyId}/verify`, {
        is_approved: !currentApproved,
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Kelola Pengguna & Verifikasi - Admin AKSARA" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Kelola Pengguna Platform</h1>
            <p className="mt-1 text-sm text-slate-600">
              Daftar pelamar, verifikasi kredibilitas akun perusahaan, dan audit pengguna terdaftar.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Cari nama pengguna atau email..."
              aria-label="Cari nama pengguna atau email"
              className="pl-10 min-h-[44px]"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm min-h-[44px]"
              aria-label="Filter berdasarkan role pengguna"
            >
              <option value="">Semua Role</option>
              <option value="pelamar">Pelamar Kerja</option>
              <option value="perusahaan">Perusahaan / HR</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Button onClick={applyFilters} className="bg-slate-900 hover:bg-slate-800 min-h-[44px]">
            Filter
          </Button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Informasi Profil</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                users.data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'perusahaan'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {u.company_profile && (
                        <div>
                          <strong className="text-slate-800">{u.company_profile.company_name}</strong>
                          <div className="text-slate-400">{u.company_profile.industry ?? 'Industri umum'}</div>
                        </div>
                      )}
                      {u.job_seeker_profile && (
                        <span>{u.job_seeker_profile.current_job_title ?? 'Pencari kerja'}</span>
                      )}
                      {u.role === 'admin' && <span className="text-slate-400">Pengelola Platform</span>}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'perusahaan' && u.company_profile ? (
                        u.company_profile.is_approved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <XCircle className="h-4 w-4" />
                            Menunggu Verifikasi
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-slate-400" />
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'perusahaan' && u.company_profile && (
                        <Button
                          variant={u.company_profile.is_approved ? 'outline' : 'default'}
                          onClick={() => handleToggleVerify(u.company_profile!.id, u.company_profile!.is_approved)}
                          className={`text-xs min-h-[44px] ${
                            u.company_profile.is_approved
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {u.company_profile.is_approved ? 'Cabut Verifikasi' : 'Verifikasi Akun'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Links */}
        {users.links && users.links.length > 3 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            {users.links.map((link, i) => (
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
