import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  KeyRound,
  Search,
  ShieldCheck,
  UserRound,
  Users,
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
}

interface SeekerInfo {
  id: number;
  current_job_title?: string;
  domicile?: string;
  gender?: string;
  bio?: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'perusahaan' | 'pelamar';
  is_verified: boolean;
  is_disabled: boolean;
  disabled_at?: string | null;
  scheduled_deletion_at?: string | null;
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
  counts?: {
    pelamar: number;
    perusahaan: number;
  };
}

const numberFormat = new Intl.NumberFormat('id-ID');

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminUsersIndex({ users, filters, counts }: Props): ReactElement {
  const [role, setRole] = useState(filters.role ?? '');
  const [search, setSearch] = useState(filters.search ?? '');
  const [action, setAction] = useState<'deactivate' | 'activate' | 'destroy' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBag, setErrorBag] = useState<Record<string, string>>({});

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

  const applyFilters = (nextRole = role): void => {
    router.get('/admin/users', { role: nextRole || undefined, search: search || undefined }, { preserveState: true, preserveScroll: true });
  };

  const handleToggleVerify = (companyId: number, currentApproved: boolean): void => {
    const actionText = currentApproved ? 'mencabut verifikasi' : 'memverifikasi';
    if (confirm(`Yakin ingin ${actionText} akun perusahaan ini?`)) {
      router.post(`/admin/companies/${companyId}/verify`, { is_approved: !currentApproved }, { preserveScroll: true });
    }
  };

  const closeDetails = (): void => setSelectedUser(null);
  const activeRole = filters.role ?? '';

  return (
    <AdminLayout>
      <Head title="Kelola Pengguna - AKSARA" />
      <main className="min-h-screen bg-[#F5F9FD] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-6">
            <p className="mb-2 text-sm font-semibold text-blue-600">Manajemen platform</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4B] sm:text-4xl">Kelola pengguna</h1>
            <p className="mt-2 text-sm text-slate-500">Kelola data pelamar dan perusahaan yang terdaftar di AKSARA.</p>
          </header>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><CircleUserRound className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Total pelamar</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(counts?.pelamar ?? 0)}</p></div></div>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-3 text-violet-600"><Building2 className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Total perusahaan</p><p className="text-2xl font-extrabold text-[#102B4B]">{numberFormat.format(counts?.perusahaan ?? 0)}</p></div></div>
            </article>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(31,65,114,0.05)]">
            <nav className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6" aria-label="Jenis pengguna">
              {[
                { label: `Pelamar (${numberFormat.format(counts?.pelamar ?? 0)})`, value: 'pelamar', icon: UserRound },
                { label: `Perusahaan (${numberFormat.format(counts?.perusahaan ?? 0)})`, value: 'perusahaan', icon: Building2 },
              ].map(({ label, value, icon: Icon }) => (
                <button key={value} type="button" onClick={() => { setRole(value); applyFilters(value); }} className={`inline-flex min-h-14 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${activeRole === value ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={activeRole === value ? 'page' : undefined}>
                  <Icon className="h-4 w-4" aria-hidden="true" />{label}
                </button>
              ))}
              <button type="button" onClick={() => { setRole(''); applyFilters(''); }} className={`inline-flex min-h-14 shrink-0 items-center border-b-2 px-4 text-sm font-bold transition ${activeRole === '' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={activeRole === '' ? 'page' : undefined}>Semua pengguna</button>
            </nav>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="relative min-w-0 flex-1"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} placeholder="Cari nama, email, atau perusahaan..." aria-label="Cari pengguna" className="min-h-11 rounded-xl pl-10" /></div>
              <select value={role} onChange={(event) => { setRole(event.target.value); applyFilters(event.target.value); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600" aria-label="Filter jenis pengguna"><option value="">Semua pengguna</option><option value="pelamar">Pelamar</option><option value="perusahaan">Perusahaan</option></select>
              <Button onClick={() => applyFilters()} className="min-h-11 rounded-xl bg-[#1769E0] px-5 hover:bg-[#1254B5]">Cari</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-left text-sm">
                <thead className="bg-[#F8FBFF] text-xs font-bold text-slate-500"><tr><th className="px-5 py-4">Pengguna</th><th className="px-5 py-4">Tipe</th><th className="px-5 py-4">Profil</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {users.data.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">Tidak ada pengguna yang cocok dengan filter.</td></tr> : users.data.map((user) => (
                    <tr key={user.id} className="transition hover:bg-blue-50/40">
                      <td className="px-5 py-4"><button type="button" onClick={() => setSelectedUser(user)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-blue-700">{initials(user.name)}</span><span><span className="block font-bold text-slate-800">{user.name}</span><span className="block text-xs text-slate-500">{user.email}</span></span></button></td>
                      <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">{user.role}</span></td>
                      <td className="px-5 py-4 text-xs text-slate-600">{user.company_profile?.company_name ?? user.job_seeker_profile?.current_job_title ?? 'Profil belum dilengkapi'}</td>
                      <td className="px-5 py-4">{user.is_disabled ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><XCircle className="h-3.5 w-3.5" />Nonaktif</span> : user.role === 'perusahaan' && user.company_profile ? user.company_profile.is_approved ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Terverifikasi</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><ShieldCheck className="h-3.5 w-3.5" />Menunggu</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Aktif</span>}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSelectedUser(user)} className="min-h-10 rounded-lg text-xs">Detail <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>{user.role === 'perusahaan' && user.company_profile && <Button type="button" variant="outline" onClick={() => handleToggleVerify(user.company_profile!.id, user.company_profile!.is_approved)} className="min-h-10 rounded-lg text-xs">{user.company_profile.is_approved ? 'Cabut' : 'Verifikasi'}</Button>} {user.role !== 'admin' && <Button type="button" variant="ghost" onClick={() => openAction(user.is_disabled ? 'activate' : 'deactivate', user)} className="min-h-10 rounded-lg px-2 text-xs text-slate-500">{user.is_disabled ? 'Aktifkan' : 'Nonaktifkan'}</Button>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.links && users.links.length > 3 && <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-100 p-4">{users.links.map((link, index) => <Link key={index} href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-xs font-bold ${link.active ? 'bg-[#1769E0] text-white' : link.url ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'cursor-not-allowed bg-slate-50 text-slate-300'}`} />)}</div>}
          </section>
        </div>
      </main>

      {selectedUser && !action && <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl" aria-label="Detail pengguna">
        <div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-sm font-semibold text-blue-600">Detail pengguna</p><h2 className="mt-1 text-xl font-extrabold text-[#102B4B]">{selectedUser.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p></div><button type="button" onClick={closeDetails} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800" aria-label="Tutup detail"><X className="h-5 w-5" /></button></div>
        <div className="flex-1 space-y-6 overflow-y-auto p-5"><div className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-extrabold text-blue-700">{initials(selectedUser.name)}</span><div><p className="font-bold capitalize text-slate-800">{selectedUser.role}</p><p className={`mt-1 text-xs font-bold ${selectedUser.is_disabled ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedUser.is_disabled ? 'Akun nonaktif' : 'Akun aktif'}</p></div></div><section><h3 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B]"><Users className="h-4 w-4 text-blue-600" />Informasi dasar</h3><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Nama</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.name}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.email}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Terdaftar</dt><dd className="text-right font-semibold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</dd></div></dl></section>{selectedUser.company_profile && <section><h3 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B]"><Building2 className="h-4 w-4 text-violet-600" />Informasi perusahaan</h3><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Nama</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.company_profile.company_name}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Industri</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.company_profile.industry ?? 'Belum diisi'}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Website</dt><dd className="max-w-[210px] truncate text-right font-semibold text-blue-600">{selectedUser.company_profile.website ?? 'Belum diisi'}</dd></div></dl></section>}{selectedUser.job_seeker_profile && <section><h3 className="mb-3 flex items-center gap-2 font-bold text-[#102B4B]"><UserRound className="h-4 w-4 text-blue-600" />Informasi pelamar</h3><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Posisi</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.job_seeker_profile.current_job_title ?? 'Belum diisi'}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Domisili</dt><dd className="text-right font-semibold text-slate-700">{selectedUser.job_seeker_profile.domicile ?? 'Belum diisi'}</dd></div></dl></section>}</div>
        <div className="border-t border-slate-100 p-5">{selectedUser.role !== 'admin' && <Button type="button" onClick={() => openAction(selectedUser.is_disabled ? 'activate' : 'deactivate', selectedUser)} className="min-h-11 w-full rounded-xl bg-[#1769E0] hover:bg-[#1254B5]">{selectedUser.is_disabled ? 'Aktifkan akun' : 'Nonaktifkan akun'}</Button>}</div>
      </aside>}

      <Dialog open={Boolean(action && selectedUser)} onOpenChange={(open) => !open && closeAction()}><DialogContent><DialogHeader><DialogTitle>{action === 'destroy' ? 'Hapus akun secara permanen?' : action === 'activate' ? 'Aktifkan akun pengguna?' : 'Nonaktifkan akun pengguna?'}</DialogTitle><DialogDescription>{action === 'destroy' ? `Akun ${selectedUser?.name} dan seluruh datanya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.` : action === 'activate' ? `Akun ${selectedUser?.name} akan dapat digunakan kembali.` : `Akun ${selectedUser?.name} akan dinonaktifkan selama 30 hari sebelum dihapus otomatis.`}</DialogDescription></DialogHeader>{action === 'destroy' && <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span>Pastikan akun ini memang harus dihapus sekarang.</span></div>}<div className="space-y-2"><label htmlFor="admin-current-password" className="text-sm font-medium text-slate-900">Password admin</label><div className="relative"><KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input id="admin-current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Masukkan password akun admin" autoComplete="current-password" className="pl-9" disabled={isSubmitting} /></div>{errorBag.current_password && <p className="text-sm text-rose-600">{errorBag.current_password}</p>}</div><DialogFooter><Button type="button" variant="outline" onClick={closeAction} disabled={isSubmitting}>Batal</Button><Button type="button" variant={action === 'destroy' ? 'destructive' : 'default'} onClick={submitAction} disabled={!currentPassword || isSubmitting}>{isSubmitting ? 'Memproses...' : action === 'destroy' ? 'Hapus permanen' : action === 'activate' ? 'Aktifkan akun' : 'Nonaktifkan akun'}</Button></DialogFooter></DialogContent></Dialog>
    </AdminLayout>
  );
}
