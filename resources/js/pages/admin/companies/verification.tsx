import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
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
  is_approved: boolean;
  created_at: string;
  vacancies_count: number;
  user?: {
    name: string;
    email: string;
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

export default function CompanyVerification({ companies, filters, counts }: Props): ReactElement {
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
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

  return (
    <AdminLayout>
      <Head title="Verifikasi Perusahaan - AKSARA" />
      <main className="min-h-screen bg-[#F5F9FD] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6"><p className="mb-2 text-sm font-semibold text-blue-600">Manajemen platform</p><h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] sm:text-4xl">Verifikasi perusahaan</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Tinjau akun perusahaan sebelum mereka mendapat akses penuh ke fitur rekrutmen AKSARA.</p></header>

          <section className="mb-6 grid gap-4 sm:grid-cols-3" aria-label="Ringkasan verifikasi">
            {[
              { label: 'Menunggu verifikasi', value: counts.pending, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
              { label: 'Terverifikasi', value: counts.verified, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'Total perusahaan', value: counts.all, icon: Building2, tone: 'bg-blue-50 text-blue-700' },
            ].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]"><div className="flex items-center gap-3"><div className={`rounded-xl p-3 ${tone}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div></div></article>)}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <nav className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6" aria-label="Status verifikasi">
              {[{ label: `Semua (${counts.all})`, value: '' }, { label: `Menunggu (${counts.pending})`, value: 'pending' }, { label: `Terverifikasi (${counts.verified})`, value: 'verified' }].map((tab) => <button key={tab.value} type="button" onClick={() => applyFilters(tab.value)} className={`min-h-14 shrink-0 border-b-2 px-4 text-sm font-bold ${activeStatus === tab.value ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={activeStatus === tab.value ? 'page' : undefined}>{tab.label}</button>)}
            </nav>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5"><div className="relative flex-1"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} placeholder="Cari perusahaan, industri, atau email..." aria-label="Cari perusahaan" className="min-h-11 rounded-xl pl-10" /></div><Button onClick={() => applyFilters()} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button></div>

            <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500"><tr><th className="px-5 py-4">Perusahaan</th><th className="px-5 py-4">Industri</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Tanggal daftar</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{companies.data.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Tidak ada perusahaan yang cocok dengan filter.</td></tr> : companies.data.map((company) => <tr key={company.id} className="hover:bg-blue-50/40"><td className="px-5 py-4"><button type="button" onClick={() => setSelectedCompany(company)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-blue-700">{initials(company.company_name)}</span><span><span className="block font-bold text-slate-800">{company.company_name}</span><span className="block text-xs text-slate-500">{company.vacancies_count} lowongan</span></span></button></td><td className="px-5 py-4 text-slate-600">{company.industry ?? 'Belum diisi'}</td><td className="px-5 py-4 text-slate-600">{company.user?.email ?? 'Tidak tersedia'}</td><td className="px-5 py-4 text-slate-600">{new Date(company.created_at).toLocaleDateString('id-ID')}</td><td className="px-5 py-4">{company.is_approved ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Terverifikasi</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Clock3 className="h-3.5 w-3.5" />Menunggu</span>}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSelectedCompany(company)} className="min-h-10 rounded-lg text-xs">Tinjau <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>{!company.is_approved && <Button onClick={() => updateVerification(company, true)} className="min-h-10 rounded-lg bg-[#1769E0] text-xs hover:bg-[#1254B5]">Verifikasi</Button>}</div></td></tr>)}</tbody></table></div>
            {companies.links.length > 3 && <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">{companies.links.map((link, index) => <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />)}</div>}
          </section>
        </div>
      </main>

      {selectedCompany && <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl" aria-label="Detail verifikasi perusahaan"><div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-sm font-semibold text-blue-600">Detail verifikasi</p><h2 className="mt-1 text-xl font-extrabold text-[#102B4B]">{selectedCompany.company_name}</h2><span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${selectedCompany.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{selectedCompany.is_approved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{selectedCompany.is_approved ? 'Terverifikasi' : 'Menunggu verifikasi'}</span></div><button type="button" onClick={() => setSelectedCompany(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Tutup detail"><X className="h-5 w-5" /></button></div><div className="flex-1 space-y-6 overflow-y-auto p-5"><section><h3 className="mb-3 font-bold text-[#102B4B]">Informasi perusahaan</h3><dl className="space-y-3 text-sm"><div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Industri</dt><dd className="font-semibold text-slate-700">{selectedCompany.industry ?? 'Belum diisi'}</dd></div></div><div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Email</dt><dd className="font-semibold text-slate-700">{selectedCompany.user?.email ?? 'Tidak tersedia'}</dd></div></div><div className="flex items-start gap-3"><Globe2 className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Website</dt><dd className="font-semibold text-blue-600">{selectedCompany.website ?? 'Belum diisi'}</dd></div></div><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Alamat</dt><dd className="font-semibold text-slate-700">{selectedCompany.address ?? 'Belum diisi'}</dd></div></div></dl></section><section className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="flex items-center gap-2 font-bold text-[#102B4B]"><ShieldCheck className="h-4 w-4 text-emerald-600" />Pemeriksaan profil</h3><p className="mt-2 text-sm leading-6 text-slate-600">Data yang tampil berasal dari profil perusahaan. Dokumen legal dan data aksesibilitas belum tersedia pada model saat ini.</p>{selectedCompany.website && <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600">Buka website <ExternalLink className="h-3.5 w-3.5" /></a>}</section></div><div className="grid gap-2 border-t border-slate-100 p-5 sm:grid-cols-2">{selectedCompany.is_approved ? <Button variant="outline" onClick={() => updateVerification(selectedCompany, false)} className="min-h-11 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"><XCircle className="mr-2 h-4 w-4" />Cabut verifikasi</Button> : <><Button variant="outline" onClick={() => setSelectedCompany(null)} className="min-h-11 rounded-xl">Tutup</Button><Button onClick={() => updateVerification(selectedCompany, true)} className="min-h-11 rounded-xl bg-[#1769E0] hover:bg-[#1254B5]"><CheckCircle2 className="mr-2 h-4 w-4" />Setujui</Button></>}</div></aside>}
    </AdminLayout>
  );
}
