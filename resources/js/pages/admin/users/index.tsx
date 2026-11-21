import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  KeyRound,
  Mail,
  MoreVertical,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyInfo {
  id: number;
  company_name: string;
  is_approved: boolean;
  industry?: string;
  website?: string;
  address?: string;
  about?: string;
  logo_path?: string;
  logo_url?: string;
}

interface SeekerInfo {
  id: number;
  current_job_title?: string;
  domicile?: string;
  gender?: string;
  phone?: string;
  birth_date?: string;
  bio?: string;
  cv_path?: string;
  skills?: string[];
  certifications?: Array<{ name: string; issuer?: string; year?: string }>;
  projects?: Array<{ name: string; description?: string }>;
  work_experiences?: Array<{ role: string; company: string }>;
  educations?: Array<{ school: string; degree?: string }>;
}

interface AccessibilityInfo {
  disability_types?: string[];
  accommodations_needed?: string[];
  notes?: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'admin' | 'perusahaan' | 'pelamar';
  is_verified: boolean;
  is_disabled: boolean;
  disabled_at?: string | null;
  scheduled_deletion_at?: string | null;
  created_at: string;
  updated_at: string;
  company_profile?: CompanyInfo;
  job_seeker_profile?: SeekerInfo;
  accessibility_profile?: AccessibilityInfo;
}

interface Filters {
  role?: string;
  search?: string;
  status?: string;
  gender?: string;
  domicile?: string;
  disability?: string;
}

interface Counts {
  pelamar: number;
  perusahaan: number;
  total: number;
  active: number;
  disabled: number;
  new_30_days: number;
  active_pct: number;
  disabled_pct: number;
}

interface Props {
  users: {
    data: UserItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from?: number;
    to?: number;
    total?: number;
  };
  filters: Filters;
  counts?: Counts;
  availableDomiciles?: string[];
}

const numberFormat = new Intl.NumberFormat('id-ID');

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarUrl(user?: UserItem | null): string | null {
  if (!user) return null;
  const raw = user.avatar || (user.role === 'perusahaan' ? (user.company_profile?.logo_url || user.company_profile?.logo_path) : null);
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }
  return `/storage/${raw}`;
}

function getCvUrl(user?: UserItem | null): string | null {
  if (!user) return null;
  const path = user.job_seeker_profile?.cv_path;
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/storage/${path}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatLongDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDisability(user: UserItem): string {
  const types = user.accessibility_profile?.disability_types;
  if (Array.isArray(types) && types.length > 0) {
    return types.join(', ');
  }
  if (typeof types === 'string' && types) {
    return types;
  }
  return '-';
}

export default function AdminUsersIndex({
  users,
  filters,
  counts,
  availableDomiciles = [],
}: Props): ReactElement {
  const activeRole = filters.role ?? 'pelamar';
  const [role, setRole] = useState(activeRole);
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [gender, setGender] = useState(filters.gender ?? '');
  const [domicile, setDomicile] = useState(filters.domicile ?? '');
  const [disability, setDisability] = useState(filters.disability ?? '');

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'info' | 'docs'>('info');
  const [action, setAction] = useState<'deactivate' | 'activate' | 'destroy' | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBag, setErrorBag] = useState<Record<string, string>>({});

  const applyFilters = (overrides: Partial<Filters> = {}): void => {
    const query = {
      role: overrides.role !== undefined ? overrides.role : role || undefined,
      search: overrides.search !== undefined ? overrides.search : search || undefined,
      status: overrides.status !== undefined ? overrides.status : status || undefined,
      gender: overrides.gender !== undefined ? overrides.gender : gender || undefined,
      domicile: overrides.domicile !== undefined ? overrides.domicile : domicile || undefined,
      disability: overrides.disability !== undefined ? overrides.disability : disability || undefined,
    };
    router.get('/admin/users', query, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = (): void => {
    setSearch('');
    setStatus('');
    setGender('');
    setDomicile('');
    setDisability('');
    router.get('/admin/users', { role }, { preserveState: true, preserveScroll: true });
  };

  const openAction = (nextAction: 'deactivate' | 'activate' | 'destroy', user: UserItem): void => {
    setAction(nextAction);
    setSelectedUser(user);
    setErrorBag({});
    setCurrentPassword('');
  };

  const closeAction = (): void => {
    setAction(null);
    setCurrentPassword('');
    setErrorBag({});
  };

  const submitAction = (): void => {
    if (!selectedUser || !action || !currentPassword) return;

    setIsSubmitting(true);
    setErrorBag({});
    const url = `/admin/users/${selectedUser.id}`;
    const data = { current_password: currentPassword };
    const options = {
      preserveScroll: true,
      onSuccess: closeAction,
      onError: (errors: Record<string, string>) => setErrorBag(errors),
      onFinish: () => setIsSubmitting(false),
    };

    if (action === 'destroy') {
      router.delete(url, { ...options, data });
      return;
    }

    router.post(`${url}/${action}`, data, options);
  };

  const handleToggleVerify = (companyId: number, currentApproved: boolean): void => {
    const actionText = currentApproved ? 'mencabut verifikasi' : 'memverifikasi';
    if (confirm(`Yakin ingin ${actionText} akun perusahaan ini?`)) {
      router.post(`/admin/companies/${companyId}/verify`, { is_approved: !currentApproved }, { preserveScroll: true });
    }
  };

  const handleSelectUser = (user: UserItem): void => {
    setSelectedUser(user);
    setDrawerTab('info');
  };

  const closeDetails = (): void => {
    setSelectedUser(null);
    setDrawerTab('info');
  };

  const totalUsersCount = counts?.total ?? (counts?.pelamar ?? 0) + (counts?.perusahaan ?? 0);
  const activeCount = counts?.active ?? 0;
  const disabledCount = counts?.disabled ?? 0;
  const newCount = counts?.new_30_days ?? 0;
  const activePct = counts?.active_pct ?? (totalUsersCount > 0 ? ((activeCount / totalUsersCount) * 100).toFixed(1) : 0);
  const disabledPct = counts?.disabled_pct ?? (totalUsersCount > 0 ? ((disabledCount / totalUsersCount) * 100).toFixed(1) : 0);

  return (
    <AdminLayout>
      <Head title="Kelola Pengguna - Profabel" />
      <main className="min-h-screen bg-[#F8FBFE] dark:bg-[#020B3C] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#102B4B] dark:text-white sm:text-3xl">Kelola Pengguna</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Kelola data pengguna yang terdaftar di Profabel, baik pelamar maupun perusahaan.
            </p>
          </div>

          {/* Role Navigation Tabs */}
          <nav className="flex gap-2" aria-label="Navigasi Jenis Pengguna">
            <button
              type="button"
              onClick={() => {
                setRole('pelamar');
                applyFilters({ role: 'pelamar' });
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                activeRole === 'pelamar'
                  ? 'bg-white dark:bg-[#071336] text-[#1769E0] dark:text-[#38BDF8] ring-1 ring-[#1769E0]/20 dark:ring-white/10 shadow-[0_4px_14px_rgba(23,105,224,0.08)]'
                  : 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <UserRound className="h-4 w-4" />
              <span>Pelamar ({numberFormat.format(counts?.pelamar ?? 0)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('perusahaan');
                applyFilters({ role: 'perusahaan' });
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                activeRole === 'perusahaan'
                  ? 'bg-white dark:bg-[#071336] text-[#1769E0] dark:text-[#38BDF8] ring-1 ring-[#1769E0]/20 dark:ring-white/10 shadow-[0_4px_14px_rgba(23,105,224,0.08)]'
                  : 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Perusahaan ({numberFormat.format(counts?.perusahaan ?? 0)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('');
                applyFilters({ role: '' });
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                activeRole === ''
                  ? 'bg-white dark:bg-[#071336] text-[#1769E0] dark:text-[#38BDF8] ring-1 ring-[#1769E0]/20 dark:ring-white/10 shadow-[0_4px_14px_rgba(23,105,224,0.08)]'
                  : 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>Semua Pengguna</span>
            </button>
          </nav>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total */}
            <article className="rounded-2xl border border-[#E2EAF3] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {activeRole === 'pelamar' ? 'Total Pelamar' : activeRole === 'perusahaan' ? 'Total Perusahaan' : 'Total Pengguna'}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B] dark:text-white">{numberFormat.format(totalUsersCount)}</span>
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> 12%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">Dari bulan sebelumnya</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1769E0] dark:text-[#38BDF8]">
                <Users className="h-6 w-6" />
              </div>
            </article>

            {/* Card 2: Akun Aktif */}
            <article className="rounded-2xl border border-[#E2EAF3] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Akun Aktif</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B] dark:text-white">{numberFormat.format(activeCount)}</span>
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> 10%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">{activePct}% dari total {activeRole || 'pengguna'}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </article>

            {/* Card 3: Akun Nonaktif */}
            <article className="rounded-2xl border border-[#E2EAF3] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Akun Nonaktif</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B] dark:text-white">{numberFormat.format(disabledCount)}</span>
                  <span className="inline-flex items-center text-[11px] font-bold text-rose-500 dark:text-rose-400">
                    <TrendingDown className="mr-0.5 h-3 w-3" /> 5%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">{disabledPct}% dari total {activeRole || 'pengguna'}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
            </article>

            {/* Card 4: Pengguna Baru */}
            <article className="rounded-2xl border border-[#E2EAF3] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pengguna Baru</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B] dark:text-white">{numberFormat.format(newCount)}</span>
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> 18%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">Dalam 30 hari terakhir</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <UserPlus className="h-6 w-6" />
              </div>
            </article>
          </div>

          {/* Table Container Card */}
          <section className="rounded-2xl border border-[#E2EAF3] dark:border-[#1E2B4D] bg-white dark:bg-[#050E2E] shadow-[0_2px_12px_rgba(23,105,224,0.03)] overflow-hidden">
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-[#1E2B4D] p-4 sm:p-5">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                  placeholder="Cari nama, email, atau skill..."
                  className="min-h-10 rounded-xl pl-10 text-xs border-slate-200 dark:border-white/10 dark:bg-[#050E2E] dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              {/* Status Akun */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  applyFilters({ status: e.target.value });
                }}
                className="min-h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-3 text-xs font-semibold text-slate-600 dark:text-slate-200 outline-none focus:border-[#1769E0]"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="disabled">Nonaktif</option>
              </select>

              {/* Jenis Kelamin */}
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  applyFilters({ gender: e.target.value });
                }}
                className="min-h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-3 text-xs font-semibold text-slate-600 dark:text-slate-200 outline-none focus:border-[#1769E0]"
              >
                <option value="">Semua Gender</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              {/* Domisili */}
              <select
                value={domicile}
                onChange={(e) => {
                  setDomicile(e.target.value);
                  applyFilters({ domicile: e.target.value });
                }}
                className="min-h-10 max-w-[160px] truncate rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-3 text-xs font-semibold text-slate-600 dark:text-slate-200 outline-none focus:border-[#1769E0]"
              >
                <option value="">Semua Domisili</option>
                {availableDomiciles.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>

              {/* Jenis Disabilitas */}
              <select
                value={disability}
                onChange={(e) => {
                  setDisability(e.target.value);
                  applyFilters({ disability: e.target.value });
                }}
                className="min-h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-3 text-xs font-semibold text-slate-600 dark:text-slate-200 outline-none focus:border-[#1769E0]"
              >
                <option value="">Semua Disabilitas</option>
                <option value="Fisik">Disabilitas Fisik</option>
                <option value="Sensorik">Disabilitas Sensorik</option>
                <option value="Intelektual">Disabilitas Intelektual</option>
                <option value="Mental">Disabilitas Mental</option>
                <option value="Ganda">Disabilitas Ganda</option>
              </select>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-xs">
                <thead className="bg-[#F8FBFE] dark:bg-[#050E2E] border-b border-slate-200/80 dark:border-[#1E2B4D] font-extrabold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="w-12 px-5 py-3.5 text-center">
                      <input type="checkbox" aria-label="Pilih semua" className="h-4 w-4 rounded border-slate-300 dark:border-white/20 dark:bg-[#050E2E] text-[#1769E0] focus:ring-0" />
                    </th>
                    <th className="px-5 py-3.5">Nama</th>
                    <th className="px-5 py-3.5">Email</th>
                    {activeRole === 'pelamar' && <th className="px-5 py-3.5">Jenis Disabilitas</th>}
                    {activeRole === 'pelamar' && <th className="px-5 py-3.5">Domisili</th>}
                    {activeRole === 'perusahaan' && <th className="px-5 py-3.5">Industri</th>}
                    {activeRole === 'perusahaan' && <th className="px-5 py-3.5">Verifikasi</th>}
                    {activeRole === '' && <th className="px-5 py-3.5">Tipe</th>}
                    <th className="px-5 py-3.5">Status Akun</th>
                    <th className="px-5 py-3.5">Tanggal Daftar</th>
                    <th className="px-5 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B4D] text-slate-700 dark:text-slate-200">
                  {users.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-xs font-medium text-slate-400">
                        Tidak ada pengguna yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    users.data.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`transition cursor-pointer ${
                          selectedUser?.id === user.id ? 'bg-blue-50/70 dark:bg-[#0B2256]' : 'hover:bg-slate-50 dark:hover:bg-[#0E2254]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" aria-label={`Pilih ${user.name}`} className="h-4 w-4 rounded border-slate-300 dark:border-white/20 dark:bg-[#050E2E] text-[#1769E0] focus:ring-0" />
                        </td>

                        {/* Nama */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 text-left group">
                            {getAvatarUrl(user) ? (
                              <img
                                src={getAvatarUrl(user)!}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-black text-[#1769E0] dark:text-[#38BDF8] group-hover:bg-[#1769E0] group-hover:text-white transition">
                                {initials(user.name)}
                              </span>
                            )}
                            <div>
                              <span className="block font-bold text-[#102B4B] dark:text-white group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8] transition">
                                {user.name}
                              </span>
                              <span className="block text-[11px] text-slate-400">
                                {user.role === 'perusahaan'
                                  ? user.company_profile?.company_name ?? 'Perusahaan'
                                  : user.job_seeker_profile?.current_job_title ?? (user.role === 'admin' ? 'Administrator' : 'Pelamar')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">{user.email}</td>

                        {/* Role Pelamar: Jenis Disabilitas & Domisili */}
                        {activeRole === 'pelamar' && (
                          <>
                            <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">{formatDisability(user)}</td>
                            <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">
                              {user.job_seeker_profile?.domicile ?? '-'}
                            </td>
                          </>
                        )}

                        {/* Role Perusahaan: Industri & Verifikasi */}
                        {activeRole === 'perusahaan' && (
                          <>
                            <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">
                              {user.company_profile?.industry ?? '-'}
                            </td>
                            <td className="px-5 py-4">
                              {user.company_profile?.is_approved ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 dark:border dark:border-emerald-800/40">
                                  <ShieldCheck className="h-3 w-3" /> Terverifikasi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 dark:border dark:border-amber-800/40">
                                  <ShieldAlert className="h-3 w-3" /> Menunggu
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Role All: Tipe */}
                        {activeRole === '' && (
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 dark:bg-[#050E2E] dark:border dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-slate-600 dark:text-slate-300">
                              {user.role}
                            </span>
                          </td>
                        )}

                        {/* Status Akun */}
                        <td className="px-5 py-4">
                          {user.is_disabled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 dark:border dark:border-rose-900/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Nonaktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 dark:border dark:border-emerald-900/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif
                            </span>
                          )}
                        </td>

                        {/* Tanggal Daftar */}
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(user.created_at)}</td>

                        {/* Aksi: Titik 3 Button */}
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition"
                                aria-label={`Menu aksi untuk ${user.name}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="top"
                              sideOffset={6}
                              className="w-48 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-1 text-left shadow-xl ring-1 ring-black/5"
                            >
                              {/* 1. Lihat Detail */}
                              <DropdownMenuItem
                                onSelect={() => handleSelectUser(user)}
                                onClick={() => handleSelectUser(user)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                Lihat Detail
                              </DropdownMenuItem>

                              {/* 2. Verifikasi Perusahaan */}
                              {user.role === 'perusahaan' && user.company_profile && (
                                !user.company_profile.is_approved ? (
                                  <DropdownMenuItem
                                    onSelect={() => handleToggleVerify(user.company_profile!.id, false)}
                                    onClick={() => handleToggleVerify(user.company_profile!.id, false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    Verifikasi Perusahaan
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onSelect={() => handleToggleVerify(user.company_profile!.id, true)}
                                    onClick={() => handleToggleVerify(user.company_profile!.id, true)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
                                  >
                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                    Cabut Verifikasi
                                  </DropdownMenuItem>
                                )
                              )}

                              {/* 3. Nonaktifkan / Aktifkan & Hapus Akun */}
                              {user.role !== 'admin' && (
                                <>
                                  {!user.is_disabled ? (
                                    <DropdownMenuItem
                                      onSelect={() => openAction('deactivate', user)}
                                      onClick={() => openAction('deactivate', user)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
                                    >
                                      <UserX className="h-3.5 w-3.5 text-amber-500" />
                                      Nonaktifkan Akun
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onSelect={() => openAction('activate', user)}
                                      onClick={() => openAction('activate', user)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                    >
                                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                      Aktifkan Akun
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onSelect={() => openAction('destroy', user)}
                                    onClick={() => openAction('destroy', user)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    Hapus Akun Permanen
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-4 sm:flex-row text-xs text-slate-500">
              <p>
                Menampilkan{' '}
                <span className="font-bold text-[#102B4B]">
                  {users.from ?? (users.data.length > 0 ? 1 : 0)}-{users.to ?? users.data.length}
                </span>{' '}
                dari <span className="font-bold text-[#102B4B]">{users.total ?? users.data.length}</span> pengguna
              </p>

              {users.links && users.links.length > 3 && (
                <div className="flex items-center gap-1">
                  {users.links.map((link, idx) => {
                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    if (isPrev) {
                      return (
                        <Link
                          key={idx}
                          href={link.url ?? '#'}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition ${
                            link.url ? 'hover:bg-slate-50 text-slate-600' : 'cursor-not-allowed opacity-40 text-slate-400'
                          }`}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      );
                    }
                    if (isNext) {
                      return (
                        <Link
                          key={idx}
                          href={link.url ?? '#'}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition ${
                            link.url ? 'hover:bg-slate-50 text-slate-600' : 'cursor-not-allowed opacity-40 text-slate-400'
                          }`}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      );
                    }
                    return (
                      <Link
                        key={idx}
                        href={link.url ?? '#'}
                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                          link.active
                            ? 'bg-[#1769E0] text-white shadow-sm'
                            : link.url
                            ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            : 'cursor-not-allowed text-slate-400'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Right Detail Drawer (Full Height Above Header with Backdrop Blur) */}
      {selectedUser && !action && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDetails}
          aria-hidden="true"
        >
          <aside
            className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            aria-label="Detail Pengguna"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70 shrink-0">
              <h2 className="text-base font-extrabold text-[#102B4B]">Detail Pengguna</h2>
              <button
                type="button"
                onClick={closeDetails}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
                aria-label="Tutup detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5 shrink-0 bg-white">
              {getAvatarUrl(selectedUser) ? (
                <img
                  src={getAvatarUrl(selectedUser)!}
                  alt={selectedUser.name}
                  className="h-14 w-14 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-black text-[#1769E0]">
                  {initials(selectedUser.name)}
                </span>
              )}
              <div>
                <h3 className="text-base font-black text-[#102B4B]">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedUser.role === 'perusahaan'
                    ? selectedUser.company_profile?.company_name ?? 'Perusahaan'
                    : selectedUser.job_seeker_profile?.current_job_title ?? (selectedUser.role === 'admin' ? 'Administrator' : 'Pelamar')}
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    selectedUser.is_disabled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedUser.is_disabled ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  {selectedUser.is_disabled ? 'Nonaktif' : 'Aktif'}
                </span>
              </div>
            </div>

            {/* Drawer Tabs (2 Tabs: Informasi & Dokumen) */}
            <nav className="flex border-b border-slate-100 px-6 text-xs font-bold shrink-0 bg-white" aria-label="Tab Detail Pengguna">
              <button
                type="button"
                onClick={() => setDrawerTab('info')}
                className={`py-3.5 border-b-2 mr-6 transition ${
                  drawerTab === 'info' ? 'border-[#1769E0] text-[#1769E0]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Informasi
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('docs')}
                className={`py-3.5 border-b-2 transition ${
                  drawerTab === 'docs' ? 'border-[#1769E0] text-[#1769E0]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Dokumen
              </button>
            </nav>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 text-xs">
              {drawerTab === 'info' && (
                <>
                  {/* Informasi Dasar */}
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] text-sm">
                      <UserRound className="h-4 w-4 text-[#1769E0]" />
                      Informasi Dasar
                    </h4>
                    <dl className="space-y-2.5">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Nama Lengkap</dt>
                        <dd className="font-semibold text-slate-800 text-right">{selectedUser.name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Email</dt>
                        <dd className="font-semibold text-slate-800 text-right">{selectedUser.email}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Nomor Telepon</dt>
                        <dd className="font-semibold text-slate-800 text-right">
                          {selectedUser.job_seeker_profile?.phone ?? '-'}
                        </dd>
                      </div>
                      {selectedUser.role === 'pelamar' && (
                        <>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Tanggal Lahir</dt>
                            <dd className="font-semibold text-slate-800 text-right">
                              {formatLongDate(selectedUser.job_seeker_profile?.birth_date)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Jenis Kelamin</dt>
                            <dd className="font-semibold text-slate-800 text-right">
                              {selectedUser.job_seeker_profile?.gender ?? '-'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Domisili</dt>
                            <dd className="font-semibold text-slate-800 text-right">
                              {selectedUser.job_seeker_profile?.domicile ?? '-'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Jenis Disabilitas</dt>
                            <dd className="font-semibold text-slate-800 text-right">{formatDisability(selectedUser)}</dd>
                          </div>
                        </>
                      )}
                      {selectedUser.role === 'perusahaan' && selectedUser.company_profile?.address && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Alamat Perusahaan</dt>
                          <dd className="font-semibold text-slate-800 text-right">
                            {selectedUser.company_profile.address}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>

                  {/* Profil & Bio / Detail Perusahaan */}
                  <section className="pt-2 border-t border-slate-100">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] text-sm">
                      <FileText className="h-4 w-4 text-[#1769E0]" />
                      {selectedUser.role === 'perusahaan' ? 'Profil Perusahaan' : 'Profil & Bio'}
                    </h4>

                    {selectedUser.role === 'perusahaan' && selectedUser.company_profile ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-slate-500 mb-1.5 font-medium">Tentang Perusahaan</p>
                          <p className="rounded-xl bg-slate-50 p-3 text-slate-600 leading-relaxed">
                            {selectedUser.company_profile.about ?? 'Perusahaan belum menambahkan informasi profil.'}
                          </p>
                        </div>
                        <dl className="space-y-2 pt-1">
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Nama Perusahaan</dt>
                            <dd className="font-semibold text-slate-800 text-right">{selectedUser.company_profile.company_name}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Bidang Industri</dt>
                            <dd className="font-semibold text-slate-800 text-right">{selectedUser.company_profile.industry ?? '-'}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Alamat Kantor</dt>
                            <dd className="font-semibold text-slate-800 text-right">{selectedUser.company_profile.address ?? '-'}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Website</dt>
                            <dd className="font-semibold text-slate-800 text-right">
                              {selectedUser.company_profile.website ? (
                                <a
                                  href={selectedUser.company_profile.website.startsWith('http') ? selectedUser.company_profile.website : `https://${selectedUser.company_profile.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#1769E0] hover:underline inline-flex items-center gap-1"
                                >
                                  {selectedUser.company_profile.website}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : '-'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-slate-500 mb-1.5 font-medium">Tentang / Bio</p>
                          <p className="rounded-xl bg-slate-50 p-3 text-slate-600 leading-relaxed">
                            {selectedUser.job_seeker_profile?.bio ?? 'Pengguna belum menambahkan informasi bio.'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500 mb-1.5 font-medium">Keahlian & Kompetensi</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(selectedUser.job_seeker_profile?.skills) && selectedUser.job_seeker_profile.skills.length > 0 ? (
                              selectedUser.job_seeker_profile.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1769E0]"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">Belum menambahkan keahlian</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Sertifikasi</span>
                          <span className="font-semibold text-slate-800">
                            {Array.isArray(selectedUser.job_seeker_profile?.certifications) ? selectedUser.job_seeker_profile.certifications.length : 0} sertifikasi
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Proyek / Pengalaman</span>
                          <span className="font-semibold text-slate-800">
                            {Array.isArray(selectedUser.job_seeker_profile?.projects) ? selectedUser.job_seeker_profile.projects.length : 0} proyek
                          </span>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Status Akun */}
                  <section className="pt-2 border-t border-slate-100">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                      Status Akun
                    </h4>
                    <dl className="space-y-2.5">
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-slate-500">Status</dt>
                        <dd className="font-bold text-emerald-600">
                          {selectedUser.is_disabled ? 'Nonaktif' : '● Aktif'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Tanggal Daftar</dt>
                        <dd className="font-semibold text-slate-800 text-right">
                          {formatLongDate(selectedUser.created_at)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Terakhir Aktif</dt>
                        <dd className="font-semibold text-slate-800 text-right">
                          {formatLongDate(selectedUser.updated_at)}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </>
              )}

              {drawerTab === 'docs' && (
                <div className="space-y-5">
                  {/* Dokumen CV untuk Pelamar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#1769E0]" />
                        <h4 className="font-extrabold text-[#102B4B] text-sm">Dokumen Curriculum Vitae (CV)</h4>
                      </div>
                      {getCvUrl(selectedUser) && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={getCvUrl(selectedUser)!}
                            download
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                            title="Unduh Berkas CV"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                            <span>Unduh</span>
                          </a>
                          <a
                            href={getCvUrl(selectedUser)!}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#1769E0] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1254B5] transition shadow-xs"
                            title="Buka di Tab Baru"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Buka Tab Baru</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {getCvUrl(selectedUser) ? (
                      <div className="space-y-3">
                        {/* File Info Bar */}
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100">
                              PDF
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">
                                {selectedUser.job_seeker_profile?.cv_path?.split('/').pop() || `cv_${selectedUser.name.toLowerCase().replace(/\s+/g, '_')}.pdf`}
                              </p>
                              <p className="text-[11px] text-slate-400">Dokumen Resume / CV Terlampir</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Tersedia
                          </span>
                        </div>

                        {/* Interactive CV Preview Frame */}
                        <div className="relative h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                          <iframe
                            src={`${getCvUrl(selectedUser)!}#toolbar=1&navpanes=0`}
                            className="w-full h-full border-0"
                            title={`Pratinjau CV ${selectedUser.name}`}
                          />
                        </div>

                        <p className="text-[11px] text-slate-400 italic text-center">
                          Pratinjau dokumen CV langsung. Anda juga dapat memperbesar atau mencetak menggunakan kontrol PDF di atas.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-xs">
                          <FileText className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-xs">Belum Ada Dokumen CV</p>
                        <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                          Pengguna ini belum mengunggah berkas Curriculum Vitae (CV) ke dalam akun Profabel mereka.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dokumen & Status Legalitas untuk Akun Perusahaan */}
                  {selectedUser.role === 'perusahaan' && selectedUser.company_profile && (
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#1769E0]" />
                          <h4 className="font-extrabold text-[#102B4B] text-xs uppercase tracking-wider">
                            Legalitas & Verifikasi Perusahaan
                          </h4>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            selectedUser.company_profile.is_approved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {selectedUser.company_profile.is_approved ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Terverifikasi Resmi
                            </>
                          ) : (
                            'Menunggu Verifikasi'
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Perusahaan <strong>{selectedUser.company_profile.company_name}</strong> terdaftar di industri{' '}
                        <strong>{selectedUser.company_profile.industry ?? 'Umum'}</strong>.
                      </p>
                      <div className="pt-1">
                        <a
                          href={`/admin/companies/verification?search=${encodeURIComponent(selectedUser.company_profile.company_name)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1769E0] hover:underline"
                        >
                          <span>Buka Menu Verifikasi Perusahaan</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-100 p-5 shrink-0 flex flex-col gap-2.5 bg-white">
              <div className="flex gap-2">
                {selectedUser.role !== 'admin' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAction(selectedUser.is_disabled ? 'activate' : 'deactivate', selectedUser)}
                    className={`flex-1 rounded-xl text-xs font-bold ${
                      selectedUser.is_disabled
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <UserX className="mr-1.5 h-3.5 w-3.5" />
                    {selectedUser.is_disabled ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                  </Button>
                )}
                {selectedUser.role !== 'admin' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAction('destroy', selectedUser)}
                    className="flex-1 rounded-xl text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Hapus Permanen
                  </Button>
                )}
              </div>
              <a
                href={`mailto:${selectedUser.email}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1769E0] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1254B5] transition shadow-sm"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Kirim Pesan Email</span>
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation Password Dialog */}
      <Dialog open={Boolean(action && selectedUser)} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">
              {action === 'destroy'
                ? 'Hapus Akun Pengguna Secara Permanen?'
                : action === 'activate'
                ? 'Aktifkan Akun Pengguna?'
                : 'Nonaktifkan Akun Pengguna?'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {action === 'destroy'
                ? `Akun ${selectedUser?.name} (${selectedUser?.email}) akan dihapus secara permanen dari database. Email ini akan dapat didaftarkan kembali jika diinginkan.`
                : action === 'activate'
                ? `Akun ${selectedUser?.name} akan diaktifkan kembali dan dapat masuk ke platform Profabel.`
                : `Akun ${selectedUser?.name} hanya akan dinonaktifkan sementara (suspend) selama 30 hari. Data dan email tetap tersimpan di database.`}
            </DialogDescription>
          </DialogHeader>

          {action === 'destroy' && (
            <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>Pastikan akun ini memang harus dihapus sekarang. Data tidak dapat dipulihkan.</span>
            </div>
          )}

          <div className="space-y-1.5 py-1">
            <label htmlFor="admin-current-password" className="text-xs font-bold text-slate-700">
              Konfirmasi Password Admin
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="admin-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password akun admin Anda"
                autoComplete="current-password"
                className="pl-9 text-xs"
                disabled={isSubmitting}
              />
            </div>
            {errorBag.current_password && (
              <p className="text-xs text-rose-600">{errorBag.current_password}</p>
            )}
          </div>

          <DialogFooter className="mt-2 flex gap-2">
            <Button type="button" variant="outline" onClick={closeAction} disabled={isSubmitting} className="text-xs">
              Batal
            </Button>
            <Button
              type="button"
              variant={action === 'destroy' ? 'destructive' : 'default'}
              onClick={submitAction}
              disabled={!currentPassword || isSubmitting}
              className={`text-xs font-bold ${
                action === 'destroy'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#1769E0] hover:bg-[#1254B5] text-white'
              }`}
            >
              {isSubmitting
                ? 'Memproses...'
                : action === 'destroy'
                ? 'Hapus Permanen'
                : action === 'activate'
                ? 'Aktifkan Akun'
                : 'Nonaktifkan Akun'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
