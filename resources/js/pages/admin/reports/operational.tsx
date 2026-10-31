import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { type ReactElement, useState } from 'react';

interface OptionItem { label: string; value: string }

interface PaginationLinks { url: string | null; label: string; active: boolean }

interface TabData {
  total?: number;
  active?: number;
  verified?: number;
  pending?: number;
  closed?: number;
  complete?: number;
  needs_review?: number;
  in_progress?: number;
  interview?: number;
  hired?: number;
  rejected?: number;
  data: any[];
  links: Array<PaginationLinks>;
  pagination: { current_page: number; last_page: number; per_page: number; total: number };
}

interface Options { domiciles?: string[]; industries?: string[]; locations?: string[] }

interface Filters {
  tab: string;
  from: string;
  to: string;
  status?: string;
  completeness?: string;
  domicile?: string;
  industry?: string;
  location?: string;
  search?: string;
}

interface Props {
  filters: Filters;
  options: Options;
  users?: TabData;
  companies?: TabData;
  vacancies?: TabData;
  applications?: TabData;
}

const numberFormat = new Intl.NumberFormat('id-ID');

function initials(name: string): string {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function UserTab({ filters, options }: Pick<Props, 'filters' | 'options'>): ReactElement {
  const tabData = getTabData();
  const totalCount = tabData.total ?? 0;
  const activeCount = tabData.active ?? 0;
  const completeCount = tabData.complete ?? 0;
  const needsReviewCount = tabData.needs_review ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Pengguna', value: totalCount, icon: Users },
          { label: 'Akun Aktif', value: activeCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Profil Lengkap', value: completeCount, icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700' },
          { label: 'Butuh Tinjauan', value: needsReviewCount, icon: XCircle, tone: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${tone || 'bg-blue-50 text-blue-700'}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
        <nav className="flex flex-wrap overflow-visible gap-2 border-b border-slate-100 p-4" aria-label="Filter pengguna">
          <div className="relative min-w-[260px]"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Cari nama atau email..." aria-label="Cari nama pengguna" className="min-h-11 rounded-xl pl-10" /></div>
          <select value={filters.status ?? ''} onChange={(e) => { updateFilter('status', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter status akun"><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
          <select value={filters.completeness ?? ''} onChange={(e) => { updateFilter('completeness', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter kelengkapan profil"><option value="">Semua kelengkapan</option><option value="complete">Lengkap</option><option value="incomplete">Perlu Dilengkapi</option></select>
          <select value={filters.domicile ?? ''} onChange={(e) => { updateFilter('domicile', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter domisili"><option value="">Semua domisili</option>{(options.domiciles ?? []).map((d) => <option key={d} value={d}>{d}</option>)}</select>
          <Button onClick={applyFilters} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
        </nav>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500">
              <tr><th className="px-5 py-4">Pelamar</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Domisili</th><th className="px-5 py-4">Tanggal Daftar</th><th className="px-5 py-4">Status Akun</th><th className="px-5 py-4">Kelengkapan Profil</th><th className="px-5 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tabData.data ?? []).length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Tidak ada pelamar ditemukan.</td></tr> : (tabData.data ?? []).map((user) => renderUserRow(user))}
            </tbody>
          </table>
        </div>

        {tabData.links && tabData.links.length > 3 && (
          <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">
            {tabData.links.map((link, index) => (
              <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CompanyTab({ filters, options }: Pick<Props, 'filters' | 'options'>): ReactElement {
  const tabData = getTabData();
  const totalCount = tabData.total ?? 0;
  const verifiedCount = tabData.verified ?? 0;
  const pendingCount = tabData.pending ?? 0;
  const rejectedCount = tabData.rejected ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Perusahaan', value: totalCount, icon: Building2 },
          { label: 'Terverifikasi', value: verifiedCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Menunggu Verifikasi', value: pendingCount, icon: Calendar, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Ditolak', value: rejectedCount, icon: XCircle, tone: 'bg-slate-100 text-slate-600' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${tone || 'bg-blue-50 text-blue-700'}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
        <nav className="flex flex-wrap overflow-visible gap-2 border-b border-slate-100 p-4" aria-label="Filter perusahaan">
          <div className="relative min-w-[260px]"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Cari nama perusahaan..." aria-label="Cari nama perusahaan" className="min-h-11 rounded-xl pl-10" /></div>
          <select value={filters.status ?? ''} onChange={(e) => { updateFilter('status', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter status verifikasi"><option value="">Semua status</option><option value="verified">Terverifikasi</option><option value="pending">Menunggu</option></select>
          <select value={filters.industry ?? ''} onChange={(e) => { updateFilter('industry', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter industri"><option value="">Semua industri</option>{(options.industries ?? []).map((ind) => <option key={ind} value={ind}>{ind}</option>)}</select>
          <select value={filters.location ?? ''} onChange={(e) => { updateFilter('location', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter lokasi"><option value="">Semua lokasi</option>{(options.locations ?? []).map((loc) => <option key={loc} value={loc}>{loc}</option>)}</select>
          <Button onClick={applyFilters} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
        </nav>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500">
              <tr><th className="px-5 py-4">Nama Perusahaan</th><th className="px-5 py-4">Industri</th><th className="px-5 py-4">Lokasi</th><th className="px-5 py-4">Tanggal Daftar</th><th className="px-5 py-4">Status Akun</th><th className="px-5 py-4">Verifikasi</th><th className="px-5 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tabData.data ?? []).length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Tidak ada perusahaan ditemukan.</td></tr> : (tabData.data ?? []).map((company) => renderCompanyRow(company))}
            </tbody>
          </table>
        </div>

        {tabData.links && tabData.links.length > 3 && (
          <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">
            {tabData.links.map((link, index) => (
              <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VacancyTab({ filters, options }: Pick<Props, 'filters' | 'options'>): ReactElement {
  const tabData = getTabData();
  const totalCount = tabData.total ?? 0;
  const activeCount = tabData.active ?? 0;
  const pendingCount = tabData.pending ?? 0;
  const closedCount = tabData.closed ?? 0;
  const rejectedCount = tabData.rejected ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-5">
        {[
          { label: 'Total Lowongan', value: totalCount, icon: FileText },
          { label: 'Lowongan Aktif', value: activeCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Menunggu Review', value: pendingCount, icon: Calendar, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Ditutup', value: closedCount, icon: XCircle, tone: 'bg-slate-100 text-slate-600' },
          { label: 'Ditolak', value: rejectedCount, icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${tone || 'bg-blue-50 text-blue-700'}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
        <nav className="flex flex-wrap overflow-visible gap-2 border-b border-slate-100 p-4" aria-label="Filter lowongan">
          <div className="relative min-w-[260px]"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Cari judul, lokasi, atau perusahaan..." aria-label="Cari lowongan" className="min-h-11 rounded-xl pl-10" /></div>
          <select value={filters.status ?? ''} onChange={(e) => { updateFilter('status', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter status lowongan"><option value="">Semua status</option><option value="active">Aktif</option><option value="draft">Draft</option><option value="closed">Ditutup</option></select>
          <select value={filters.industry ?? ''} onChange={(e) => { updateFilter('industry', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter industri"><option value="">Semua industri</option>{(options.industries ?? []).map((ind) => <option key={ind} value={ind}>{ind}</option>)}</select>
          <select value={filters.location ?? ''} onChange={(e) => { updateFilter('location', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter lokasi"><option value="">Semua lokasi</option>{(options.locations ?? []).map((loc) => <option key={loc} value={loc}>{loc}</option>)}</select>
          <Button onClick={applyFilters} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
        </nav>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500">
              <tr><th className="px-5 py-4">Judul Lowongan</th><th className="px-5 py-4">Perusahaan</th><th className="px-5 py-4">Industri</th><th className="px-5 py-4">Lokasi</th><th className="px-5 py-4">Jenis Pekerjaan</th><th className="px-5 py-4">Tanggal Dibuat</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tabData.data ?? []).length === 0 ? <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">Tidak ada lowongan ditemukan.</td></tr> : (tabData.data ?? []).map((vacancy) => renderVacancyRow(vacancy))}
            </tbody>
          </table>
        </div>

        {tabData.links && tabData.links.length > 3 && (
          <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">
            {tabData.links.map((link, index) => (
              <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ApplicationTab({ filters, options }: Pick<Props, 'filters' | 'options'>): ReactElement {
  const tabData = getTabData();
  const totalCount = tabData.total ?? 0;
  const inProgressCount = tabData.in_progress ?? 0;
  const interviewCount = tabData.interview ?? 0;
  const hiredCount = tabData.hired ?? 0;
  const rejectedCount = tabData.rejected ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-5">
        {[
          { label: 'Total Lamaran', value: totalCount, icon: Users },
          { label: 'Dalam Proses', value: inProgressCount, icon: Calendar, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Dipanggil Interview', value: interviewCount, icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700' },
          { label: 'Diterima', value: hiredCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Ditolak', value: rejectedCount, icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${tone || 'bg-blue-50 text-blue-700'}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
        <nav className="flex flex-wrap overflow-visible gap-2 border-b border-slate-100 p-4" aria-label="Filter lamaran">
          <div className="relative min-w-[260px]"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Cari nama pelamar, lowongan, atau perusahaan..." aria-label="Cari lamaran" className="min-h-11 rounded-xl pl-10" /></div>
          <select value={filters.status ?? ''} onChange={(e) => { updateFilter('status', e.target.value); applyFilters(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter status lamaran"><option value="">Semua status</option><option value="submitted">Disubmit</option><option value="reviewed">Ditinjau</option><option value="interview">Interview</option><option value="hired">Diterima</option><option value="rejected">Ditolak</option></select>
          <Button onClick={applyFilters} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
        </nav>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500">
              <tr><th className="px-5 py-4">Nama Pelamar</th><th className="px-5 py-4">Judul Lowongan</th><th className="px-5 py-4">Perusahaan</th><th className="px-5 py-4">Tanggal Lamaran</th><th className="px-5 py-4">Status Lamaran</th><th className="px-5 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tabData.data ?? []).length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Tidak ada lamaran ditemukan.</td></tr> : (tabData.data ?? []).map((application) => renderApplicationRow(application))}
            </tbody>
          </table>
        </div>

        {tabData.links && tabData.links.length > 3 && (
          <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">
            {tabData.links.map((link, index) => (
              <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CurrentDateDisplay(): ReactElement {
  const { props } = usePage<any>();
  const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return <span className="text-sm text-slate-500">{date}</span>;
}

export default function ReportingIndex({ filters, options, users, companies, vacancies, applications }: Props): ReactElement {
  const tabs = [
    { id: 'users', label: 'Pelamar', icon: Users },
    { id: 'companies', label: 'Perusahaan', icon: Building2 },
    { id: 'vacancies', label: 'Lowongan', icon: FileText },
    { id: 'applications', label: 'Lamaran', icon: Users },
  ];

  return (
    <AdminLayout>
      <Head title="Laporan Operasional - AKSARA" />
      <main className="min-h-screen bg-[#F5F9FD] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Manajemen platform</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] sm:text-4xl">Laporan operasional</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">Tinjau dan ekspor data real-time dari seluruh entitas platform — pelamar, perusahaan, lowongan, dan lamaran. Filter berdasarkan periode dan kategori lalu unduh CSV yang dapat dibuka di Excel.</p>
            </div>
            <CurrentDateDisplay />
          </header>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <nav className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6" aria-label="Tab laporan">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} type="button" onClick={() => router.get('/admin/reporting', { tab: tab.id, from: filters.from, to: filters.to }, { preserveState: true, preserveScroll: true })} className={`group min-h-14 shrink-0 border-b-2 flex-1 px-4 text-center text-sm font-bold transition ${filters.tab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={filters.tab === tab.id ? 'page' : undefined}>
                    <Icon className="mb-1 inline-block h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4">
              {filters.tab === 'users' && <UserTab filters={filters} options={options} />}
              {filters.tab === 'companies' && <CompanyTab filters={filters} options={options} />}
              {filters.tab === 'vacancies' && <VacancyTab filters={filters} options={options} />}
              {filters.tab === 'applications' && <ApplicationTab filters={filters} options={options} />}
            </div>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}

function getTabData(): TabData {
  const { props } = usePage<any>();
  switch (props.filters?.tab) {
    case 'users': return props.users ?? {};
    case 'companies': return props.companies ?? {};
    case 'vacancies': return props.vacancies ?? {};
    case 'applications': return props.applications ?? {};
    default: return { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
  }
}

function updateFilter(key: string, value: string): void {
  router.get('/admin/reporting', { [key]: value || undefined }, { preserveState: true, preserveScroll: true });
}

function applyFilters(): void {
  router.get('/admin/reporting', {}, { preserveState: true, preserveScroll: true });
}

function renderUserRow(user: any): ReactElement {
  const { props } = usePage<any>();
  const isComplete = user.is_complete ?? false;
  return (
    <tr key={user.id} className="hover:bg-blue-50/40">
      <td className="px-5 py-4">
        <button type="button" className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-blue-700">{initials(user.name)}</span>
          <span><span className="block font-bold text-slate-800">{user.name}</span><span className="block text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString('id-ID')}</span></span>
        </button>
      </td>
      <td className="px-5 py-4 text-slate-600">{user.email}</td>
      <td className="px-5 py-4 text-slate-600">{user.domicile ?? '-'}</td>
      <td className="px-5 py-4 text-slate-600">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${user.is_disabled ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{user.is_disabled ? 'Nonaktif' : 'Aktif'}</span></td>
      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isComplete ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{isComplete ? 'Lengkap' : 'Perlu Dilengkapi'}</span></td>
      <td className="px-5 py-4"><div className="flex justify-end"><Link href="/app/profile" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Detail <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></div></td>
    </tr>
  );
}

function renderCompanyRow(company: any): ReactElement {
  const { props } = usePage<any>();
  return (
    <tr key={company.id} className="hover:bg-blue-50/40">
      <td className="px-5 py-4"><span className="font-bold text-slate-800">{company.company_name}</span></td>
      <td className="px-5 py-4 text-slate-600">{company.industry ?? '-'}</td>
      <td className="px-5 py-4 text-slate-600">{company.location}</td>
      <td className="px-5 py-4 text-slate-600">{new Date(company.created_at).toLocaleDateString('id-ID')}</td>
      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${company.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{company.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${company.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{company.is_approved ? 'Terverifikasi' : 'Menunggu Verifikasi'}</span></td>
      <td className="px-5 py-4"><div className="flex justify-end"><Link href={`/admin/companies/verification?search=${encodeURIComponent(company.company_name)}`} className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Verifikasi <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></div></td>
    </tr>
  );
}

function renderVacancyRow(vacancy: any): ReactElement {
  const { props } = usePage<any>();
  return (
    <tr key={vacancy.id} className="hover:bg-blue-50/40">
      <td className="px-5 py-4"><button type="button" className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-blue-700">{initials(vacancy.title)}</span><span><span className="block font-bold text-slate-800">{vacancy.title}</span><span className="block text-xs text-slate-500">{new Date(vacancy.created_at).toLocaleDateString('id-ID')}</span></span></button></td>
      <td className="px-5 py-4 text-slate-600">{vacancy.company_name}</td>
      <td className="px-5 py-4 text-slate-600">{vacancy.industry ?? '-'}</td>
      <td className="px-5 py-4 text-slate-600">{vacancy.location}</td>
      <td className="px-5 py-4 text-slate-600"><span className="capitalize">{vacancy.job_type}</span></td>
      <td className="px-5 py-4 text-slate-600">{new Date(vacancy.created_at).toLocaleDateString('id-ID')}</td>
      <td className="px-5 py-4">{statusBadge(vacancy.status)}</td>
      <td className="px-5 py-4"><div className="flex justify-end"><Link href={`/admin/vacancies?search=${encodeURIComponent(vacancy.title)}`} className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Detail <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></div></td>
    </tr>
  );
}

function renderApplicationRow(application: any): ReactElement {
  const { props } = usePage<any>();
  return (
    <tr key={application.id} className="hover:bg-blue-50/40">
      <td className="px-5 py-4"><span className="font-bold text-slate-800">{application.seeker_name}</span></td>
      <td className="px-5 py-4 text-slate-600">{application.vacancy_title}</td>
      <td className="px-5 py-4 text-slate-600">{application.company_name}</td>
      <td className="px-5 py-4 text-slate-600">{application.applied_at}</td>
      <td className="px-5 py-4">{applicationStatusBadge(application.status)}</td>
      <td className="px-5 py-4"><div className="flex justify-end"><Link href="/app/applications" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Detail <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></div></td>
    </tr>
  );
}

function statusBadge(status: string): ReactElement {
  if (status === 'active') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Aktif</span>;
  if (status === 'draft') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Calendar className="h-3.5 w-3.5" />Draft</span>;
  if (status === 'closed') return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"><XCircle className="h-3.5 w-3.5" />Ditutup</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 capitalize">{status}</span>;
}

function applicationStatusBadge(status: string): ReactElement {
  if (status === 'hired') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Diterima</span>;
  if (status === 'interview') return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"><ArrowUpRight className="h-3.5 w-3.5" />Interview</span>;
  if (status === 'reviewed' || status === 'submitted') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Calendar className="h-3.5 w-3.5" />Dalam Proses</span>;
  if (status === 'rejected') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><XCircle className="h-3.5 w-3.5" />Ditolak</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 capitalize">{status}</span>;
}
