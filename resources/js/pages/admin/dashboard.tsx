import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    FileText,
    Info,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';
import AdminLayout from '@/layouts/admin-layout';

interface StatsData {
    total_users: number;
    total_seekers: number;
    total_companies: number;
    verified_companies: number;
    pending_companies: number;
    active_vacancies: number;
    closed_vacancies: number;
    pending_vacancies: number;
    total_vacancies: number;
    total_applications: number;
    application_statuses?: Record<string, number>;
}

interface ApplicationItem {
    id: number;
    status: string;
    applied_at: string;
    vacancy?: {
        title: string;
        company_profile?: {
            company_name: string;
        };
    } | null;
    job_seeker_profile?: {
        user?: {
            name: string;
        } | null;
    } | null;
}

interface VacancyItem {
    id: number;
    title: string;
    status: string;
    created_at: string;
    company_profile?: {
        company_name: string;
    } | null;
}

interface Props {
    stats: StatsData;
    recentApplications: ApplicationItem[];
    recentVacancies: VacancyItem[];
}

const numberFormat = new Intl.NumberFormat('id-ID');

function formatStatus(status: string): string {
    return status.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status: string): string {
    if (['hired', 'accepted', 'active'].includes(status)) return 'bg-emerald-50 text-emerald-700';
    if (['rejected', 'closed'].includes(status)) return 'bg-rose-50 text-rose-700';
    if (['interview', 'reviewed'].includes(status)) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
}

function Donut({ first, second, firstColor, secondColor, total, label }: { first: number; second: number; firstColor: string; secondColor: string; total: number; label: string }): ReactElement {
    const firstPercentage = total ? Math.round((first / total) * 100) : 0;

    return (
        <div className="flex items-center gap-5">
            <div
                className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${firstColor} 0 ${firstPercentage}%, ${secondColor} ${firstPercentage}% 100%)` }}
                aria-label={`${firstPercentage}% ${label}`}
                role="img"
            >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-extrabold tracking-tight text-[#101B4D]">{numberFormat.format(total)}</span>
                    <span className="text-[11px] text-slate-500">{label}</span>
                </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: firstColor }} /> Pelamar</span>
                    <span className="text-right font-bold text-[#101B4D]">{firstPercentage}%<br /><span className="text-xs font-normal text-slate-500">{numberFormat.format(first)}</span></span>
                </div>
                <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondColor }} /> Perusahaan</span>
                    <span className="text-right font-bold text-[#101B4D]">{100 - firstPercentage}%<br /><span className="text-xs font-normal text-slate-500">{numberFormat.format(second)}</span></span>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, iconClass, valueClass, detail, footer }: { title: string; value: number; icon: typeof Users; iconClass: string; valueClass: string; detail: string; footer: ReactElement }): ReactElement {
    return (
        <article className="rounded-xl border border-[#E5EBF3] bg-white p-3 shadow-[0_3px_14px_rgba(45,79,122,0.05)] sm:p-4">
            <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500">{title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className={`text-2xl font-extrabold tracking-tight ${valueClass}`}>{numberFormat.format(value)}</p>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight className="h-3 w-3" aria-hidden="true" /> Aktif</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 divide-x divide-[#E7ECF3] rounded-lg border border-[#EEF2F7] bg-[#FBFCFE] py-2 text-xs">{footer}</div>
        </article>
    );
}

function Panel({ children, className = '' }: { children: ReactElement | ReactElement[]; className?: string }): ReactElement {
    return <article className={`rounded-xl border border-[#E5EBF3] bg-white p-4 shadow-[0_3px_14px_rgba(45,79,122,0.04)] sm:p-5 ${className}`}>{children}</article>;
}

export default function AdminDashboard({ stats, recentApplications, recentVacancies }: Props): ReactElement {
    const applicationStatuses = Object.entries(stats.application_statuses ?? {});
    const processedApplications = (stats.application_statuses?.reviewed ?? 0) + (stats.application_statuses?.interview ?? 0) + (stats.application_statuses?.accepted ?? 0) + (stats.application_statuses?.hired ?? 0);
    const acceptedApplications = (stats.application_statuses?.accepted ?? 0) + (stats.application_statuses?.hired ?? 0);

    return (
        <AdminLayout>
            <Head title="Dashboard Admin - AKSARA" />
            <main className="min-h-full bg-[#F5F9FF] px-4 py-5 sm:px-6 lg:px-7">
                <div className="mx-auto max-w-[1440px]">
                    <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#101B4D]">Dashboard</h1>
                            <p className="mt-1 text-sm text-slate-500">Ringkasan data dan aktivitas platform AKSARA untuk memudahkan pemantauan dan pengambilan keputusan.</p>
                        </div>
                        <button type="button" className="inline-flex min-h-11 items-center justify-between gap-4 rounded-lg border border-[#DDE5EF] bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm sm:min-w-[220px]">
                            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#101B4D]" aria-hidden="true" /> Semua periode</span>
                            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </button>
                    </header>

                    {stats.pending_companies > 0 && (
                        <Link href="/admin/companies/verification" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition hover:border-amber-300">
                            <span className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> {numberFormat.format(stats.pending_companies)} perusahaan menunggu verifikasi</span>
                            <span className="font-bold text-blue-700">Tinjau</span>
                        </Link>
                    )}

                    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan platform">
                        <KpiCard title="Total Pengguna" value={stats.total_users} icon={Users} iconClass="bg-blue-50 text-blue-600" valueClass="text-[#101B4D]" detail="Dari periode saat ini" footer={<><span className="px-3"><span className="block text-[11px] text-slate-400">Pelamar</span><strong className="text-[#101B4D]">{numberFormat.format(stats.total_seekers)}</strong></span><span className="px-3"><span className="block text-[11px] text-slate-400">Perusahaan</span><strong className="text-[#101B4D]">{numberFormat.format(stats.total_companies)}</strong></span></>} />
                        <KpiCard title="Lowongan Aktif" value={stats.active_vacancies} icon={BriefcaseBusiness} iconClass="bg-emerald-50 text-emerald-600" valueClass="text-[#101B4D]" detail="Lowongan yang sedang tayang" footer={<><span className="px-3"><span className="block text-[11px] text-slate-400">Total dibuat</span><strong className="text-[#101B4D]">{numberFormat.format(stats.total_vacancies)}</strong></span><span className="px-3"><span className="block text-[11px] text-slate-400">Saat ini aktif</span><strong className="text-[#101B4D]">{numberFormat.format(stats.active_vacancies)}</strong></span></>} />
                        <KpiCard title="Lamaran Masuk" value={stats.total_applications} icon={FileText} iconClass="bg-violet-50 text-violet-600" valueClass="text-[#101B4D]" detail="Total lamaran di platform" footer={<><span className="px-3"><span className="block text-[11px] text-slate-400">Diproses</span><strong className="text-[#101B4D]">{numberFormat.format(processedApplications)}</strong></span><span className="px-3"><span className="block text-[11px] text-slate-400">Diterima</span><strong className="text-[#101B4D]">{numberFormat.format(acceptedApplications)}</strong></span></>} />
                        <KpiCard title="Perusahaan Terdaftar" value={stats.total_companies} icon={Building2} iconClass="bg-amber-50 text-amber-600" valueClass="text-[#101B4D]" detail="Perusahaan di platform" footer={<><span className="px-3"><span className="block text-[11px] text-slate-400">Terverifikasi</span><strong className="text-[#101B4D]">{numberFormat.format(stats.verified_companies)}</strong></span><span className="px-3"><span className="block text-[11px] text-slate-400">Menunggu verifikasi</span><strong className="text-[#101B4D]">{numberFormat.format(stats.pending_companies)}</strong></span></>} />
                    </section>

                    <section className="mb-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
                        <Panel>
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div><h2 className="flex items-center gap-2 text-base font-extrabold text-[#101B4D]">Ringkasan Pengguna <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /></h2><p className="mt-1 text-xs text-slate-500">Perbandingan pengguna berdasarkan peran.</p></div>
                                <span className="rounded-lg border border-[#E3EAF2] px-3 py-1.5 text-xs font-semibold text-slate-500">Semua pengguna</span>
                            </div>
                            <div className="space-y-5">
                                {[['Pelamar', stats.total_seekers, stats.total_users ? Math.round((stats.total_seekers / stats.total_users) * 100) : 0, 'bg-blue-500'], ['Perusahaan', stats.total_companies, stats.total_users ? Math.round((stats.total_companies / stats.total_users) * 100) : 0, 'bg-emerald-500']].map(([label, count, percentage, color]) => (
                                    <div key={String(label)}>
                                        <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">{label}</span><span className="font-bold text-[#101B4D]">{numberFormat.format(Number(count))} <span className="font-normal text-slate-400">({percentage}%)</span></span></div>
                                        <div className="h-3 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-lg bg-blue-50/70 p-3"><UserRound className="h-5 w-5 text-blue-600" aria-hidden="true" /><p className="mt-2 text-xs text-slate-500">Pelamar aktif</p><strong className="text-lg text-[#101B4D]">{numberFormat.format(stats.total_seekers)}</strong></div><div className="rounded-lg bg-emerald-50/70 p-3"><Building2 className="h-5 w-5 text-emerald-600" aria-hidden="true" /><p className="mt-2 text-xs text-slate-500">Perusahaan aktif</p><strong className="text-lg text-[#101B4D]">{numberFormat.format(stats.total_companies)}</strong></div></div>
                        </Panel>
                        <Panel>
                            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-base font-extrabold text-[#101B4D]">Distribusi Pengguna <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /></h2><p className="mt-1 text-xs text-slate-500">Komposisi akun platform.</p></div><Users className="h-5 w-5 text-blue-500" aria-hidden="true" /></div>
                            <Donut first={stats.total_seekers} second={stats.total_companies} firstColor="#2F80ED" secondColor="#19B88A" total={stats.total_users} label="Total Pengguna" />
                        </Panel>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr_1fr]">
                        <Panel>
                            <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-extrabold text-[#101B4D]">Lowongan Berdasarkan Status <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /></h2><Link href="/admin/vacancies" className="text-xs font-bold text-blue-600 hover:text-blue-800">Lihat semua</Link></div>
                            <div className="space-y-4">{[['Aktif', stats.active_vacancies, 'bg-emerald-500'], ['Menunggu review', stats.pending_vacancies, 'bg-amber-400'], ['Ditutup', stats.closed_vacancies, 'bg-slate-400']].map(([label, count, color]) => { const percentage = stats.total_vacancies ? Math.round((Number(count) / stats.total_vacancies) * 100) : 0; return <div key={String(label)}><div className="mb-1.5 flex justify-between text-xs"><span className="flex items-center gap-2 font-semibold text-slate-600"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span><span className="font-bold text-[#101B4D]">{numberFormat.format(Number(count))}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>; })}</div>
                        </Panel>
                        <Panel>
                            <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-extrabold text-[#101B4D]">Status Lamaran <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /></h2><FileText className="h-5 w-5 text-violet-500" aria-hidden="true" /></div>
                            <div className="space-y-2">{applicationStatuses.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">Belum ada lamaran masuk.</p> : applicationStatuses.slice(0, 5).map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-lg border border-[#EEF2F7] px-3 py-2"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(status)}`}>{formatStatus(status)}</span><strong className="text-sm text-[#101B4D]">{numberFormat.format(count)}</strong></div>)}</div>
                        </Panel>
                        <Panel>
                            <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-extrabold text-[#101B4D]">Aktivitas Terbaru</h2><Link href="/admin/vacancies" className="text-xs font-bold text-blue-600 hover:text-blue-800">Lihat semua</Link></div>
                            <div className="space-y-2">{recentVacancies.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">Belum ada aktivitas terbaru.</p> : recentVacancies.slice(0, 4).map((vacancy) => <div key={vacancy.id} className="flex items-center gap-2.5 rounded-lg border border-[#EEF2F7] p-2.5"><div className="rounded-lg bg-blue-50 p-2 text-blue-600"><BriefcaseBusiness className="h-4 w-4" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{vacancy.title}</p><p className="truncate text-[11px] text-slate-400">{vacancy.company_profile?.company_name ?? 'Perusahaan'} · {formatStatus(vacancy.status)}</p></div></div>)}</div>
                        </Panel>
                    </section>

                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" /> Data dashboard menggunakan ringkasan terbaru platform.</div>
                </div>
            </main>
        </AdminLayout>
    );
}
