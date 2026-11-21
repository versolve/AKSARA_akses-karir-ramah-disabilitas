import { Button } from '@/components/ui/button';
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
  Accessibility,
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Coins,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  Mail,
  MapPin,
  MoreVertical,
  Search,
  Tag,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyInfo {
  id: number;
  company_name: string;
  industry?: string;
  website?: string;
  address?: string;
  description?: string;
  logo_path?: string;
  logo_url?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    is_disabled?: boolean;
  };
}

interface AccessibilityItem {
  id: number;
  accommodation_type: string;
  description?: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  job_type?: string;
  work_model: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  is_salary_public?: boolean;
  experience_level?: string;
  requirements?: string[] | string;
  skills_required?: string[] | string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  deadline?: string;
  applications_count: number;
  company_profile: CompanyInfo;
  accessibilities?: AccessibilityItem[];
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
  counts?: {
    total: number;
    active: number;
    closed: number;
    draft: number;
  };
}

const numberFormat = new Intl.NumberFormat('id-ID');

function initials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function getCompanyLogoUrl(company?: CompanyInfo | null): string | null {
  if (!company) return null;
  const raw = company.logo_url || company.logo_path || company.user?.avatar;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }
  return `/storage/${raw}`;
}

function formatSalary(min?: number, max?: number, isPublic?: boolean): string {
  if (isPublic === false) return 'Dirahasiakan';
  if (!min && !max) return 'Gaji belum ditentukan';
  if (min && max) return `Rp ${numberFormat.format(min)} - ${numberFormat.format(max)}`;
  if (min) return `Mulai dari Rp ${numberFormat.format(min)}`;
  return `Hingga Rp ${numberFormat.format(max!)}`;
}

function statusBadge(status: VacancyItem['status']): ReactElement {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 dark:border dark:border-emerald-800/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Aktif
      </span>
    );
  }
  if (status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 dark:border dark:border-white/10 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
        <XCircle className="h-3.5 w-3.5" />
        Ditutup
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 dark:border dark:border-amber-800/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
      <Clock3 className="h-3.5 w-3.5" />
      Draft
    </span>
  );
}

export default function AdminVacanciesIndex({ vacancies, filters, counts }: Props): ReactElement {
  const [status, setStatus] = useState(filters.status ?? '');
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'details' | 'company'>('details');

  const applyFilters = (nextStatus = status): void => {
    router.get(
      '/admin/vacancies',
      { status: nextStatus || undefined, search: search || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleUpdateStatus = (vacancyId: number, newStatus: string): void => {
    router.patch(
      `/admin/vacancies/${vacancyId}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedVacancy((current) =>
            current && current.id === vacancyId
              ? { ...current, status: newStatus as VacancyItem['status'] }
              : current
          );
        },
      }
    );
  };

  const handleTakedown = (vacancyId: number, title: string): void => {
    if (confirm(`PERINGATAN: Anda yakin ingin men-takedown lowongan "${title}"? Lowongan akan ditarik dari katalog publik.`)) {
      router.delete(`/admin/vacancies/${vacancyId}`, {
        preserveScroll: true,
        onSuccess: () => setSelectedVacancy(null),
      });
    }
  };

  const openVacancyDetails = (vacancy: VacancyItem): void => {
    setSelectedVacancy(vacancy);
    setDrawerTab('details');
  };

  const totalCount = counts?.total ?? 0;
  const activeCount = counts?.active ?? 0;
  const closedCount = counts?.closed ?? 0;
  const draftCount = counts?.draft ?? 0;
  const activeStatus = filters.status ?? '';

  return (
    <AdminLayout>
      <Head title="Kelola Lowongan - Profabel" />
      <main className="min-h-screen bg-[#F5F9FD] dark:bg-[#020B3C] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6">
            <p className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">Manajemen platform</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white sm:text-4xl">
              Kelola lowongan
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Tinjau dan kelola seluruh lowongan kerja yang dibuat mitra perusahaan di Profabel.
            </p>
          </header>

          {/* Cards Ringkasan */}
          <section className="mb-6 grid gap-4 sm:grid-cols-4" aria-label="Ringkasan lowongan">
            {[
              { label: 'Semua lowongan', value: totalCount, icon: BriefcaseBusiness, tone: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
              { label: 'Lowongan aktif', value: activeCount, icon: CheckCircle2, tone: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
              { label: 'Lowongan ditutup', value: closedCount, icon: XCircle, tone: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300' },
              { label: 'Menunggu review / draft', value: draftCount, icon: Clock3, tone: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
            ].map(({ label, value, icon: Icon, tone }) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-extrabold text-[#102B4B] dark:text-white">{numberFormat.format(value)}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Tabel Lowongan */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1E2B4D] bg-white dark:bg-[#050E2E] shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            {/* Status Tabs */}
            <nav className="flex overflow-x-auto border-b border-slate-100 dark:border-[#1E2B4D] px-4 sm:px-6" aria-label="Status lowongan">
              {[
                { label: `Semua (${totalCount})`, value: '' },
                { label: `Aktif (${activeCount})`, value: 'active' },
                { label: `Ditutup (${closedCount})`, value: 'closed' },
                { label: `Draft (${draftCount})`, value: 'draft' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatus(tab.value);
                    applyFilters(tab.value);
                  }}
                  className={`min-h-14 shrink-0 border-b-2 px-4 text-sm font-bold transition cursor-pointer ${
                    activeStatus === tab.value
                      ? 'border-blue-600 dark:border-[#38BDF8] text-blue-700 dark:text-[#38BDF8]'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  aria-current={activeStatus === tab.value ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-[#1E2B4D] p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                  placeholder="Cari judul lowongan, lokasi, atau nama perusahaan..."
                  aria-label="Cari lowongan"
                  className="min-h-11 rounded-xl pl-10 dark:border-[#1E2B4D] dark:bg-[#050E2E] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  applyFilters(event.target.value);
                }}
                className="min-h-11 rounded-xl border border-slate-200 dark:border-[#1E2B4D] bg-white dark:bg-[#050E2E] px-3 text-sm text-slate-600 dark:text-slate-200 cursor-pointer"
                aria-label="Filter status"
              >
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="closed">Ditutup</option>
                <option value="draft">Draft</option>
              </select>
              <Button
                onClick={() => applyFilters()}
                className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5] text-white cursor-pointer"
              >
                Cari
              </Button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full text-left text-sm">
                <thead className="bg-[#F8FBFF] dark:bg-[#050E2E] border-b border-slate-200/80 dark:border-[#1E2B4D] text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Lowongan</th>
                    <th className="px-5 py-4">Perusahaan</th>
                    <th className="px-5 py-4">Lokasi & Model</th>
                    <th className="px-5 py-4">Pelamar</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B4D]">
                  {vacancies.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        Tidak ada lowongan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    vacancies.data.map((vacancy) => (
                      <tr
                        key={vacancy.id}
                        onClick={() => openVacancyDetails(vacancy)}
                        className="hover:bg-slate-50 dark:hover:bg-[#0E2254] cursor-pointer transition group"
                      >
                        {/* Judul Lowongan */}
                        <td className="px-5 py-4">
                          <div className="text-left">
                            <span className="block font-bold text-slate-800 dark:text-white group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8] transition">
                              {vacancy.title}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {new Date(vacancy.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Perusahaan (dengan Foto Profil / Logo) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] shadow-2xs">
                              {getCompanyLogoUrl(vacancy.company_profile) ? (
                                <img
                                  src={getCompanyLogoUrl(vacancy.company_profile)!}
                                  alt={vacancy.company_profile?.company_name}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span
                                className={`flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-950/40 font-bold text-[10px] text-[#1769E0] dark:text-[#38BDF8] ${
                                  getCompanyLogoUrl(vacancy.company_profile) ? 'hidden' : ''
                                }`}
                              >
                                {initials(vacancy.company_profile?.company_name ?? 'P')}
                              </span>
                            </div>
                            <div>
                              <span className="block font-semibold text-slate-700 dark:text-slate-200">
                                {vacancy.company_profile?.company_name ?? 'Perusahaan'}
                              </span>
                              {vacancy.company_profile?.industry && (
                                <span className="block text-[11px] text-slate-400">
                                  {vacancy.company_profile.industry}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Lokasi & Model */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold capitalize text-slate-800 dark:text-white">{vacancy.work_model}</span> &bull; {vacancy.location}
                        </td>

                        {/* Pelamar */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                            {vacancy.applications_count}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">{statusBadge(vacancy.status)}</td>

                        {/* Aksi: Menu Titik 3 */}
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                                aria-label={`Menu aksi untuk lowongan ${vacancy.title}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="bottom"
                              sideOffset={6}
                              className="w-48 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-1 text-left shadow-xl ring-1 ring-black/5"
                            >
                              <DropdownMenuItem
                                onSelect={() => openVacancyDetails(vacancy)}
                                onClick={() => openVacancyDetails(vacancy)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                Lihat Detail
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <a
                                  href={`/jobs/${vacancy.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                  Buka di Publik
                                </a>
                              </DropdownMenuItem>

                              {vacancy.status === 'active' ? (
                                <DropdownMenuItem
                                  onSelect={() => handleUpdateStatus(vacancy.id, 'closed')}
                                  onClick={() => handleUpdateStatus(vacancy.id, 'closed')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  Tutup Lowongan
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => handleUpdateStatus(vacancy.id, 'active')}
                                  onClick={() => handleUpdateStatus(vacancy.id, 'active')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Aktifkan Lowongan
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onSelect={() => handleTakedown(vacancy.id, vacancy.title)}
                                onClick={() => handleTakedown(vacancy.id, vacancy.title)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                Takedown Lowongan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Links */}
            {vacancies.links && vacancies.links.length > 3 && (
              <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 dark:border-white/10 p-4">
                {vacancies.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url ?? '#'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
                      link.active
                        ? 'bg-[#1769E0] text-white'
                        : link.url
                        ? 'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 dark:hover:bg-white/10'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Detail Lowongan Drawer (Full Height Above Header with Backdrop Blur) */}
      {selectedVacancy && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedVacancy(null)}
          aria-hidden="true"
        >
          <aside
            className="relative flex h-full w-full max-w-xl flex-col bg-white dark:bg-[#071336] shadow-2xl animate-in slide-in-from-right duration-300 border-l dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
            aria-label="Detail lowongan kerja"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/70 dark:bg-[#050E2E] shrink-0">
              <h2 className="text-base font-extrabold text-[#102B4B] dark:text-white">Detail Lowongan Pekerjaan</h2>
              <button
                type="button"
                onClick={() => setSelectedVacancy(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                aria-label="Tutup detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Brief with Company Logo */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/10 px-6 py-5 shrink-0 bg-white dark:bg-[#071336]">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] shadow-xs p-0.5">
                {getCompanyLogoUrl(selectedVacancy.company_profile) ? (
                  <img
                    src={getCompanyLogoUrl(selectedVacancy.company_profile)!}
                    alt={selectedVacancy.company_profile?.company_name}
                    className="h-full w-full rounded-xl object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span
                  className={`flex h-full w-full items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-lg font-black text-[#1769E0] dark:text-[#38BDF8] ${
                    getCompanyLogoUrl(selectedVacancy.company_profile) ? 'hidden' : ''
                  }`}
                >
                  {initials(selectedVacancy.company_profile?.company_name ?? selectedVacancy.title)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-[#102B4B] dark:text-white truncate">{selectedVacancy.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedVacancy.company_profile?.company_name} &bull; {selectedVacancy.location}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {statusBadge(selectedVacancy.status)}
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    {selectedVacancy.work_model} {selectedVacancy.job_type ? `&bull; ${selectedVacancy.job_type}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Tabs (2 Tabs: Detail Lowongan & Perusahaan & Aksesibilitas) */}
            <nav className="flex border-b border-slate-100 dark:border-white/10 px-6 text-xs font-bold shrink-0 bg-white dark:bg-[#071336]" aria-label="Tab Detail Lowongan">
              <button
                type="button"
                onClick={() => setDrawerTab('details')}
                className={`py-3.5 border-b-2 mr-6 transition cursor-pointer ${
                  drawerTab === 'details'
                    ? 'border-[#1769E0] dark:border-[#38BDF8] text-[#1769E0] dark:text-[#38BDF8]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Detail Lowongan
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('company')}
                className={`py-3.5 border-b-2 transition cursor-pointer ${
                  drawerTab === 'company'
                    ? 'border-[#1769E0] dark:border-[#38BDF8] text-[#1769E0] dark:text-[#38BDF8]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Perusahaan & Aksesibilitas
              </button>
            </nav>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 text-xs">
              {drawerTab === 'details' && (
                <>
                  {/* Quick Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                        <Users className="h-4 w-4" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Total Pelamar</span>
                      </div>
                      <p className="text-xl font-black text-[#102B4B] dark:text-white">
                        {selectedVacancy.applications_count} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">orang</span>
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050E2E] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Rentang Gaji</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">
                        {formatSalary(selectedVacancy.salary_min, selectedVacancy.salary_max, selectedVacancy.is_salary_public)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050E2E] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Model Kerja</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white capitalize leading-tight">
                        {selectedVacancy.work_model} &bull; {selectedVacancy.location}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050E2E] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Batas Lamaran</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">
                        {selectedVacancy.deadline
                          ? new Date(selectedVacancy.deadline).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Tidak ada batas'}
                      </p>
                    </div>
                  </div>

                  {/* Deskripsi Pekerjaan */}
                  <section>
                    <h4 className="mb-2.5 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                      <FileText className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                      Deskripsi Pekerjaan
                    </h4>
                    <div className="rounded-2xl bg-slate-50 dark:bg-[#050E2E] border border-slate-100 dark:border-white/10 p-4 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                      {selectedVacancy.description ?? 'Belum ada deskripsi pekerjaan yang ditambahkan.'}
                    </div>
                  </section>

                  {/* Kualifikasi & Persyaratan */}
                  {selectedVacancy.requirements && (
                    <section className="pt-2 border-t border-slate-100 dark:border-white/10">
                      <h4 className="mb-2.5 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                        <UserCheck className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                        Persyaratan & Kualifikasi
                      </h4>
                      {Array.isArray(selectedVacancy.requirements) ? (
                        <ul className="space-y-1.5">
                          {selectedVacancy.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1769E0] dark:bg-[#38BDF8] mt-1.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {selectedVacancy.requirements}
                        </p>
                      )}
                    </section>
                  )}

                  {/* Keahlian yang Dibutuhkan */}
                  {selectedVacancy.skills_required && (
                    <section className="pt-2 border-t border-slate-100 dark:border-white/10">
                      <h4 className="mb-2.5 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                        <Tag className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                        Keahlian yang Dibutuhkan
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(selectedVacancy.skills_required) ? (
                          selectedVacancy.skills_required.map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-bold text-[#1769E0] dark:text-[#38BDF8]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-bold text-[#1769E0] dark:text-[#38BDF8]">
                            {selectedVacancy.skills_required}
                          </span>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}

              {drawerTab === 'company' && (
                <div className="space-y-5">
                  {/* Profil Perusahaan Mitra (dengan Foto Profil / Logo) */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] p-4 space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] shadow-xs p-1">
                        {getCompanyLogoUrl(selectedVacancy.company_profile) ? (
                          <img
                            src={getCompanyLogoUrl(selectedVacancy.company_profile)!}
                            alt={selectedVacancy.company_profile?.company_name}
                            className="h-full w-full rounded-xl object-contain object-center"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-base font-black text-[#1769E0] dark:text-[#38BDF8]">
                            {initials(selectedVacancy.company_profile?.company_name ?? 'P')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Perusahaan Pemilik Lowongan
                        </p>
                        <h4 className="font-extrabold text-[#102B4B] dark:text-white text-sm truncate">
                          {selectedVacancy.company_profile?.company_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {selectedVacancy.company_profile?.industry ?? 'Industri Umum'}
                        </p>
                      </div>
                    </div>

                    <dl className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Website</dt>
                        <dd className="font-semibold text-right">
                          {selectedVacancy.company_profile?.website ? (
                            <a
                              href={
                                selectedVacancy.company_profile.website.startsWith('http')
                                  ? selectedVacancy.company_profile.website
                                  : `https://${selectedVacancy.company_profile.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1769E0] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                            >
                              {selectedVacancy.company_profile.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Tidak ada website</span>
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Alamat</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                          {selectedVacancy.company_profile?.address ?? selectedVacancy.location}
                        </dd>
                      </div>

                      {selectedVacancy.company_profile?.user && (
                        <>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500 dark:text-slate-400">PIC Akun</dt>
                            <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                              {selectedVacancy.company_profile.user.name}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500 dark:text-slate-400">Email PIC</dt>
                            <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                              <a
                                href={`mailto:${selectedVacancy.company_profile.user.email}`}
                                className="text-[#1769E0] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                              >
                                {selectedVacancy.company_profile.user.email}
                                <Mail className="h-3 w-3" />
                              </a>
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Aksesibilitas Kerja */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Accessibility className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-bold text-[#102B4B] dark:text-white text-xs">Akomodasi & Aksesibilitas Disabilitas</h4>
                      </div>
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {selectedVacancy.accessibilities?.length ?? 0} Fasilitas
                      </span>
                    </div>

                    {selectedVacancy.accessibilities && selectedVacancy.accessibilities.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedVacancy.accessibilities.map((acc) => (
                          <li
                            key={acc.id}
                            className="rounded-xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 space-y-1"
                          >
                            <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              {acc.accommodation_type}
                            </p>
                            {acc.description && (
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                                {acc.description}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-xl bg-slate-50 dark:bg-[#050E2E] p-3 text-slate-500 dark:text-slate-400 text-xs italic">
                        Lowongan ini belum mencantumkan rincian akomodasi khusus disabilitas.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer Actions */}
            <div className="border-t border-slate-100 dark:border-white/10 p-5 shrink-0 flex flex-col gap-2.5 bg-white dark:bg-[#071336]">
              <div className="flex gap-2">
                {selectedVacancy.status === 'active' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedVacancy.id, 'closed')}
                    className="flex-1 rounded-xl text-xs font-bold border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 min-h-11 cursor-pointer"
                  >
                    <XCircle className="mr-1.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Tutup Lowongan
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedVacancy.id, 'active')}
                    className="flex-1 rounded-xl text-xs font-bold bg-[#1769E0] text-white hover:bg-[#1254B5] min-h-11 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Aktifkan Lowongan
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTakedown(selectedVacancy.id, selectedVacancy.title)}
                  className="rounded-xl text-xs font-bold border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 min-h-11 px-4 cursor-pointer"
                  title="Takedown / Hapus Lowongan"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">Takedown</span>
                </Button>
              </div>

              <a
                href={`/jobs/${selectedVacancy.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Lihat di Katalog Publik</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}
