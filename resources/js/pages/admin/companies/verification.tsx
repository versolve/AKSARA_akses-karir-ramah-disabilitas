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
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  Mail,
  MapPin,
  MoreVertical,
  Search,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyItem {
  id: number;
  company_name: string;
  industry?: string;
  address?: string;
  website?: string;
  description?: string;
  logo_path?: string;
  logo_url?: string;
  is_approved: boolean;
  created_at: string;
  vacancies_count: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    is_disabled: boolean;
  };
}

interface Props {
  companies: {
    data: CompanyItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    status?: string;
    search?: string;
  };
  counts: {
    all: number;
    pending: number;
    verified: number;
  };
}

const numberFormat = new Intl.NumberFormat('id-ID');

function initials(name: string): string {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function getCompanyLogoUrl(company?: CompanyItem | null): string | null {
  if (!company) return null;
  const raw = company.logo_url || company.logo_path || company.user?.avatar;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }
  return `/storage/${raw}`;
}

export default function CompanyVerification({ companies, filters, counts }: Props): ReactElement {
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'info' | 'docs'>('info');
  const activeStatus = filters.status ?? '';

  const applyFilters = (status = activeStatus): void => {
    router.get('/admin/companies/verification', { status: status || undefined, search: search || undefined }, { preserveState: true, preserveScroll: true });
  };

  const updateVerification = (company: CompanyItem, isApproved: boolean): void => {
    router.post(`/admin/companies/${company.id}/verify`, { is_approved: isApproved }, {
      preserveScroll: true,
      onSuccess: () => setSelectedCompany((current) => current ? { ...current, is_approved: isApproved } : current),
    });
  };

  const openCompanyDetails = (company: CompanyItem): void => {
    setSelectedCompany(company);
    setDrawerTab('info');
  };

  return (
    <AdminLayout>
      <Head title="Verifikasi Perusahaan - Profabel" />
      <main className="min-h-screen bg-[#F5F9FD] dark:bg-[#020B3C] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6">
            <p className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">Manajemen platform</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white sm:text-4xl">Verifikasi perusahaan</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">Tinjau akun perusahaan sebelum mereka mendapat akses penuh ke fitur rekrutmen Profabel.</p>
          </header>

          <section className="mb-6 grid gap-4 sm:grid-cols-3" aria-label="Ringkasan verifikasi">
            {[
              { label: 'Menunggu verifikasi', value: counts.pending, icon: Clock3, tone: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
              { label: 'Terverifikasi', value: counts.verified, icon: CheckCircle2, tone: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
              { label: 'Total perusahaan', value: counts.all, icon: Building2, tone: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
            ].map(({ label, value, icon: Icon, tone }) => (
              <article key={label} className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
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

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1E2B4D] bg-white dark:bg-[#050E2E] shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <nav className="flex overflow-x-auto border-b border-slate-100 dark:border-[#1E2B4D] px-4 sm:px-6" aria-label="Status verifikasi">
              {[
                { label: `Semua (${counts.all})`, value: '' },
                { label: `Menunggu (${counts.pending})`, value: 'pending' },
                { label: `Terverifikasi (${counts.verified})`, value: 'verified' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => applyFilters(tab.value)}
                  className={`min-h-14 shrink-0 border-b-2 px-4 text-sm font-bold transition ${
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

            <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-[#1E2B4D] p-4 sm:flex-row sm:p-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                  placeholder="Cari perusahaan, industri, atau email..."
                  aria-label="Cari perusahaan"
                  className="min-h-11 rounded-xl pl-10 dark:border-[#1E2B4D] dark:bg-[#050E2E] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <Button onClick={() => applyFilters()} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5] text-white">
                Cari
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-[#F8FBFF] dark:bg-[#050E2E] border-b border-slate-200/80 dark:border-[#1E2B4D] text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Perusahaan</th>
                    <th className="px-5 py-4">Industri</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Tanggal daftar</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B4D]">
                  {companies.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        Tidak ada perusahaan yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    companies.data.map((company) => (
                      <tr
                        key={company.id}
                        onClick={() => openCompanyDetails(company)}
                        className="hover:bg-slate-50 dark:hover:bg-[#0E2254] cursor-pointer transition group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 text-left">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] shadow-xs group-hover:border-[#1769E0]/50 transition">
                              {getCompanyLogoUrl(company) ? (
                                <img
                                  src={getCompanyLogoUrl(company)!}
                                  alt={company.company_name}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span
                                className={`flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-950/40 font-extrabold text-xs text-[#1769E0] dark:text-[#38BDF8] group-hover:bg-[#1769E0] group-hover:text-white transition ${
                                  getCompanyLogoUrl(company) ? 'hidden' : ''
                                }`}
                              >
                                {initials(company.company_name)}
                              </span>
                            </div>
                            <div>
                              <span className="block font-bold text-slate-800 dark:text-white group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8] transition">
                                {company.company_name}
                              </span>
                              <span className="block text-xs text-slate-500 dark:text-slate-400">
                                {company.vacancies_count} lowongan aktif
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{company.industry ?? 'Belum diisi'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{company.user?.email ?? 'Tidak tersedia'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{new Date(company.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-5 py-4">
                          {company.is_approved ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 dark:border dark:border-emerald-800/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 dark:border dark:border-amber-800/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              Menunggu
                            </span>
                          )}
                        </td>
                        {/* Aksi: Titik 3 Button */}
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                                aria-label={`Menu aksi untuk ${company.company_name}`}
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
                                onSelect={() => openCompanyDetails(company)}
                                onClick={() => openCompanyDetails(company)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                Lihat Detail
                              </DropdownMenuItem>

                              {!company.is_approved ? (
                                <DropdownMenuItem
                                  onSelect={() => updateVerification(company, true)}
                                  onClick={() => updateVerification(company, true)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Setujui Verifikasi
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => updateVerification(company, false)}
                                  onClick={() => updateVerification(company, false)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                  Cabut Verifikasi
                                </DropdownMenuItem>
                              )}

                              {company.user?.email && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`mailto:${company.user.email}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                                  >
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    Kirim Email
                                  </a>
                                </DropdownMenuItem>
                              )}

                              {company.website && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                    Buka Website
                                  </a>
                                </DropdownMenuItem>
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

            {companies.links.length > 3 && (
              <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 dark:border-white/10 p-4">
                {companies.links.map((link, index) => (
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

      {/* Detail Verifikasi Perusahaan Drawer (Full Height Above Header with Backdrop Blur) */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCompany(null)}
          aria-hidden="true"
        >
          <aside
            className="relative flex h-full w-full max-w-xl flex-col bg-white dark:bg-[#071336] shadow-2xl animate-in slide-in-from-right duration-300 border-l dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
            aria-label="Detail verifikasi perusahaan"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/70 dark:bg-[#050E2E] shrink-0">
              <h2 className="text-base font-extrabold text-[#102B4B] dark:text-white">Detail Verifikasi Perusahaan</h2>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                aria-label="Tutup detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/10 px-6 py-5 shrink-0 bg-white dark:bg-[#071336]">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] shadow-xs p-0.5">
                {getCompanyLogoUrl(selectedCompany) ? (
                  <img
                    src={getCompanyLogoUrl(selectedCompany)!}
                    alt={selectedCompany.company_name}
                    className="h-full w-full rounded-xl object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span
                  className={`flex h-full w-full items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-lg font-black text-[#1769E0] dark:text-[#38BDF8] ${
                    getCompanyLogoUrl(selectedCompany) ? 'hidden' : ''
                  }`}
                >
                  {initials(selectedCompany.company_name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-[#102B4B] dark:text-white truncate">{selectedCompany.company_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedCompany.industry ?? 'Industri Umum'} &bull; {selectedCompany.vacancies_count} Lowongan Aktif
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    selectedCompany.is_approved
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedCompany.is_approved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {selectedCompany.is_approved ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}
                </span>
              </div>
            </div>

            {/* Drawer Tabs (2 Tabs: Informasi & Dokumen) */}
            <nav className="flex border-b border-slate-100 dark:border-white/10 px-6 text-xs font-bold shrink-0 bg-white dark:bg-[#071336]" aria-label="Tab Detail Verifikasi">
              <button
                type="button"
                onClick={() => setDrawerTab('info')}
                className={`py-3.5 border-b-2 mr-6 transition ${
                  drawerTab === 'info'
                    ? 'border-[#1769E0] dark:border-[#38BDF8] text-[#1769E0] dark:text-[#38BDF8]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Informasi Perusahaan
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('docs')}
                className={`py-3.5 border-b-2 transition ${
                  drawerTab === 'docs'
                    ? 'border-[#1769E0] dark:border-[#38BDF8] text-[#1769E0] dark:text-[#38BDF8]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Dokumen & Pemeriksaan
              </button>
            </nav>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 text-xs">
              {drawerTab === 'info' && (
                <>
                  {/* Foto Profil & Logo Perusahaan */}
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#050E2E] p-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] shadow-xs p-1">
                      {getCompanyLogoUrl(selectedCompany) ? (
                        <img
                          src={getCompanyLogoUrl(selectedCompany)!}
                          alt={selectedCompany.company_name}
                          className="h-full w-full rounded-xl object-contain object-center"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-lg font-black text-[#1769E0] dark:text-[#38BDF8]">
                          {initials(selectedCompany.company_name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Foto Profil & Logo Resmi
                      </p>
                      <p className="font-bold text-[#102B4B] dark:text-white text-sm truncate">
                        {selectedCompany.company_name}
                      </p>
                      {getCompanyLogoUrl(selectedCompany) ? (
                        <a
                          href={getCompanyLogoUrl(selectedCompany)!}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#1769E0] dark:text-[#38BDF8] hover:underline"
                        >
                          <span>Buka Ukuran Penuh</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Perusahaan belum mengunggah foto profil / logo resmi
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informasi Dasar Perusahaan */}
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                      <Building2 className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                      Informasi Perusahaan
                    </h4>
                    <dl className="space-y-2.5">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Nama Perusahaan</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.company_name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Bidang Industri</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.industry ?? 'Belum diisi'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Alamat Kantor</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.address ?? 'Belum diisi'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Website Resmi</dt>
                        <dd className="font-semibold text-right">
                          {selectedCompany.website ? (
                            <a
                              href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1769E0] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                            >
                              {selectedCompany.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Belum dicantumkan</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Total Lowongan</dt>
                        <dd className="font-bold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.vacancies_count} lowongan</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Profil & Deskripsi Perusahaan */}
                  <section className="pt-2 border-t border-slate-100 dark:border-white/10">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                      <FileText className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                      Deskripsi & Profil Perusahaan
                    </h4>
                    <div className="rounded-xl bg-slate-50 dark:bg-[#050E2E] p-3.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedCompany.description ?? 'Perusahaan belum menambahkan ringkasan profil deskripsi.'}
                    </div>
                  </section>

                  {/* Kontak & Akun Penanggung Jawab */}
                  <section className="pt-2 border-t border-slate-100 dark:border-white/10">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B] dark:text-white text-sm">
                      <UserRound className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                      Akun Penanggung Jawab (PIC)
                    </h4>
                    <dl className="space-y-2.5">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Nama Akun</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.user?.name ?? '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Email Login</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedCompany.user?.email ?? 'Tidak tersedia'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Status Akun</dt>
                        <dd className="font-bold text-right">
                          {selectedCompany.user?.is_disabled ? (
                            <span className="text-rose-600 dark:text-rose-400">Nonaktif</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Aktif</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">Tanggal Terdaftar</dt>
                        <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                          {new Date(selectedCompany.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </>
              )}

              {drawerTab === 'docs' && (
                <div className="space-y-5">
                  {/* Status Pemeriksaan */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050E2E] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                        <h4 className="font-extrabold text-[#102B4B] dark:text-white text-xs uppercase tracking-wider">
                          Status Pemeriksaan Verifikasi
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          selectedCompany.is_approved
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {selectedCompany.is_approved ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Terverifikasi Resmi
                          </>
                        ) : (
                          <>
                            <Clock3 className="h-3 w-3" />
                            Menunggu Verifikasi
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedCompany.is_approved
                        ? 'Akun perusahaan ini telah resmi diverifikasi. Perusahaan memiliki lencana terverifikasi di profil publik dan lowongan kerja diprioritaskan di pencarian talenta.'
                        : 'Akun perusahaan sedang menunggu persetujuan verifikasi oleh Administrator sebelum mendapatkan akses penuh ke publikasi lowongan dan rekrutmen.'}
                    </p>
                  </div>

                  {/* Pemeriksaan Logo & Foto Profil */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3 bg-white dark:bg-[#071336]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                        <h4 className="font-bold text-[#102B4B] dark:text-white text-xs">Pemeriksaan Logo & Foto Profil</h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          getCompanyLogoUrl(selectedCompany)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {getCompanyLogoUrl(selectedCompany) ? 'Tersedia' : 'Belum Ada'}
                      </span>
                    </div>

                    {getCompanyLogoUrl(selectedCompany) ? (
                      <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 dark:bg-[#050E2E] p-3">
                        <img
                          src={getCompanyLogoUrl(selectedCompany)!}
                          alt={selectedCompany.company_name}
                          className="h-12 w-12 rounded-xl object-contain bg-white dark:bg-[#071336] border border-slate-200 dark:border-white/10 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            File Logo Resmi Perusahaan
                          </p>
                          <a
                            href={getCompanyLogoUrl(selectedCompany)!}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769E0] dark:text-[#38BDF8] hover:underline mt-0.5"
                          >
                            <span>Buka Ukuran Asli</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        Perusahaan belum mengunggah foto profil / logo resmi bisnis.
                      </p>
                    )}
                  </div>

                  {/* Verifikasi Domain & Website */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-2 bg-white dark:bg-[#071336]">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                      <h4 className="font-bold text-[#102B4B] dark:text-white text-xs">Pemeriksaan Domain & Website</h4>
                    </div>
                    {selectedCompany.website ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-600 dark:text-slate-300 text-xs truncate max-w-[280px]">{selectedCompany.website}</span>
                        <a
                          href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-bold text-[#1769E0] dark:text-[#38BDF8] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                        >
                          <span>Kunjungi</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic">Perusahaan belum mencantumkan tautan website resmi.</p>
                    )}
                  </div>

                  {/* Panduan Verifikator */}
                  <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/30 p-4 text-xs space-y-1.5 text-blue-900 dark:text-blue-300">
                    <p className="font-bold flex items-center gap-1.5 text-[#102B4B] dark:text-white">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1769E0] dark:text-[#38BDF8]" />
                      Panduan Verifikasi Admin
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Pastikan nama perusahaan, alamat, dan email domain terdaftar sesuai dengan identitas bisnis yang sah. Menyetujui verifikasi akan otomatis mengirimkan email konfirmasi resmi kepada pihak perusahaan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-100 dark:border-white/10 p-5 shrink-0 flex flex-col gap-2.5 bg-white dark:bg-[#071336]">
              <div className="flex gap-2">
                {selectedCompany.is_approved ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateVerification(selectedCompany, false)}
                    className="flex-1 rounded-xl text-xs font-bold border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 min-h-11 cursor-pointer"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Cabut Status Verifikasi
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => updateVerification(selectedCompany, true)}
                    className="flex-1 rounded-xl text-xs font-bold bg-[#1769E0] text-white hover:bg-[#1254B5] min-h-11 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Setujui Verifikasi
                  </Button>
                )}
              </div>

              {selectedCompany.user?.email && (
                <a
                  href={`mailto:${selectedCompany.user.email}`}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050E2E] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-xs"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Kirim Pesan Email ke Perusahaan</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}
