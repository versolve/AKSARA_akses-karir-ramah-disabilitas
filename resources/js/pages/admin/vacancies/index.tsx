import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Accessibility,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  Search,
  Trash2,
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
  experience_level?: string;
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
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function statusBadge(status: VacancyItem['status']): ReactElement {
  if (status === 'active') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Aktif</span>;
  }
  if (status === 'closed') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"><XCircle className="h-3.5 w-3.5" />Ditutup</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Clock3 className="h-3.5 w-3.5" />Draft</span>;
}

export default function AdminVacanciesIndex({ vacancies, filters, counts }: Props): ReactElement {
  const [status, setStatus] = useState(filters.status ?? '');
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);

  const applyFilters = (nextStatus = status): void => {
    router.get('/admin/vacancies', { status: nextStatus || undefined, search: search || undefined }, { preserveState: true, preserveScroll: true });
  };

  const handleUpdateStatus = (vacancyId: number, newStatus: string): void => {
    router.patch(`/admin/vacancies/${vacancyId}/status`, { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedVacancy((current) => current ? { ...current, status: newStatus as VacancyItem['status'] } : current);
      },
    });
  };

  const handleTakedown = (vacancyId: number, title: string): void => {
    if (confirm(`PERINGATAN: Anda yakin ingin men-takedown lowongan "${title}"? Lowongan akan ditarik dari katalog publik.`)) {
      router.delete(`/admin/vacancies/${vacancyId}`, {
        preserveScroll: true,
        onSuccess: () => setSelectedVacancy(null),
      });
    }
  };

  const totalCount = counts?.total ?? 0;
  const activeCount = counts?.active ?? 0;
  const closedCount = counts?.closed ?? 0;
  const draftCount = counts?.draft ?? 0;
  const activeStatus = filters.status ?? '';

  return (
    <AdminLayout>
      <Head title="Kelola Lowongan - AKSARA" />
      <main className="min-h-screen bg-[#F5F9FD] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6"><p className="mb-2 text-sm font-semibold text-blue-600">Manajemen platform</p><h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] sm:text-4xl">Kelola lowongan</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Tinjau dan kelola seluruh lowongan kerja yang dibuat mitra perusahaan di AKSARA.</p></header>

          <section className="mb-6 grid gap-4 sm:grid-cols-4" aria-label="Ringkasan lowongan">
            {[
              { label: 'Semua lowongan', value: totalCount, icon: BriefcaseBusiness, tone: 'bg-blue-50 text-blue-700' },
              { label: 'Lowongan aktif', value: activeCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'Lowongan ditutup', value: closedCount, icon: XCircle, tone: 'bg-slate-100 text-slate-600' },
              { label: 'Menunggu review / draft', value: draftCount, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
            ].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]"><div className="flex items-center gap-3"><div className={`rounded-xl p-3 ${tone}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(value)}</p></div></div></article>)}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <nav className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6" aria-label="Status lowongan">
              {[
                { label: `Semua (${totalCount})`, value: '' },
                { label: `Aktif (${activeCount})`, value: 'active' },
                { label: `Ditutup (${closedCount})`, value: 'closed' },
                { label: `Draft (${draftCount})`, value: 'draft' },
              ].map((tab) => <button key={tab.value} type="button" onClick={() => { setStatus(tab.value); applyFilters(tab.value); }} className={`min-h-14 shrink-0 border-b-2 px-4 text-sm font-bold transition ${activeStatus === tab.value ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={activeStatus === tab.value ? 'page' : undefined}>{tab.label}</button>)}
            </nav>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="relative flex-1"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} placeholder="Cari judul lowongan, lokasi, atau perusahaan..." aria-label="Cari lowongan" className="min-h-11 rounded-xl pl-10" /></div>
              <select value={status} onChange={(event) => { setStatus(event.target.value); applyFilters(event.target.value); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter status"><option value="">Semua status</option><option value="active">Aktif</option><option value="closed">Ditutup</option><option value="draft">Draft</option></select>
              <Button onClick={() => applyFilters()} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500"><tr><th className="px-5 py-4">Lowongan</th><th className="px-5 py-4">Perusahaan</th><th className="px-5 py-4">Lokasi & Model</th><th className="px-5 py-4">Pelamar</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {vacancies.data.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Tidak ada lowongan ditemukan.</td></tr> : vacancies.data.map((vacancy) => (
                    <tr key={vacancy.id} className="hover:bg-blue-50/40">
                      <td className="px-5 py-4"><button type="button" onClick={() => setSelectedVacancy(vacancy)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-blue-700">{initials(vacancy.title)}</span><span><span className="block font-bold text-slate-800">{vacancy.title}</span><span className="block text-xs text-slate-500">{new Date(vacancy.created_at).toLocaleDateString('id-ID')}</span></span></button></td>
                      <td className="px-5 py-4 text-slate-600">{vacancy.company_profile.company_name}</td>
                      <td className="px-5 py-4 text-slate-600"><span className="font-semibold capitalize text-slate-800">{vacancy.work_model}</span> · {vacancy.location}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{vacancy.applications_count} orang</td>
                      <td className="px-5 py-4">{statusBadge(vacancy.status)}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSelectedVacancy(vacancy)} className="min-h-10 rounded-lg text-xs">Detail <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button><Button variant="outline" onClick={() => handleUpdateStatus(vacancy.id, vacancy.status === 'active' ? 'closed' : 'active')} className="min-h-10 rounded-lg text-xs">{vacancy.status === 'active' ? 'Tutup' : 'Aktifkan'}</Button><Button variant="outline" onClick={() => handleTakedown(vacancy.id, vacancy.title)} className="min-h-10 rounded-lg px-2.5 text-rose-600 hover:bg-rose-50" aria-label={`Takedown lowongan ${vacancy.title}`}><Trash2 className="h-4 w-4" /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vacancies.links && vacancies.links.length > 3 && <div className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">{vacancies.links.map((link, index) => <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300'}`} />)}</div>}
          </section>
        </div>
      </main>

      {selectedVacancy && <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl" aria-label="Detail lowongan"><div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-sm font-semibold text-blue-600">Detail lowongan</p><h2 className="mt-1 text-xl font-extrabold text-[#102B4B]">{selectedVacancy.title}</h2><p className="text-sm text-slate-500">{selectedVacancy.company_profile.company_name}</p></div><button type="button" onClick={() => setSelectedVacancy(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Tutup detail"><X className="h-5 w-5" /></button></div><div className="flex-1 space-y-6 overflow-y-auto p-5"><section className="space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status saat ini</span>{statusBadge(selectedVacancy.status)}</div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-400">Total pelamar</p><p className="text-2xl font-extrabold text-[#102B4B]">{selectedVacancy.applications_count} pelamar</p></div></section><section><h3 className="mb-3 font-bold text-[#102B4B]">Informasi pekerjaan</h3><dl className="space-y-3 text-sm"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Lokasi & Model</dt><dd className="font-semibold capitalize text-slate-700">{selectedVacancy.work_model} · {selectedVacancy.location}</dd></div></div><div className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 text-blue-600" /><div><dt className="text-xs text-slate-400">Dibuat</dt><dd className="font-semibold text-slate-700">{new Date(selectedVacancy.created_at).toLocaleDateString('id-ID')}</dd></div></div></dl></section><section><h3 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B]"><Accessibility className="h-4 w-4 text-emerald-600" />Aksesibilitas kerja</h3>{selectedVacancy.accessibilities && selectedVacancy.accessibilities.length > 0 ? <ul className="space-y-2">{selectedVacancy.accessibilities.map((acc) => <li key={acc.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs"><p className="font-bold text-emerald-900">{acc.accommodation_type}</p>{acc.description && <p className="mt-1 text-slate-600">{acc.description}</p>}</li>)}</ul> : <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Tidak ada data akomodasi khusus pada lowongan ini.</p>}</section><Link href={`/jobs/${selectedVacancy.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">Lihat katalog publik <ExternalLink className="h-3.5 w-3.5" /></Link></div><div className="grid gap-2 border-t border-slate-100 p-5 sm:grid-cols-2"><Button variant="outline" onClick={() => handleUpdateStatus(selectedVacancy.id, selectedVacancy.status === 'active' ? 'closed' : 'active')} className="min-h-11 rounded-xl">{selectedVacancy.status === 'active' ? 'Tutup lowongan' : 'Aktifkan lowongan'}</Button><Button variant="outline" onClick={() => handleTakedown(selectedVacancy.id, selectedVacancy.title)} className="min-h-11 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"><Trash2 className="mr-2 h-4 w-4" />Takedown</Button></div></aside>}
    </AdminLayout>
  );
}
