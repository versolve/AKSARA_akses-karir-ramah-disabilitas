import { Head, Link } from '@inertiajs/react';
import {
    Accessibility,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Download,
    FileText,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type Point = { label: string; value: number };
type MonthlyPoint = { label: string; seekers: number; companies: number };

type Filters = { from: string; to: string; tab: TabKey };
type TabKey = 'summary' | 'users' | 'companies' | 'vacancies' | 'placements' | 'accessibility';

interface Summary {
    total_users: number;
    total_seekers: number;
    total_companies: number;
    total_vacancies: number;
    active_vacancies: number;
    pending_vacancies: number;
    closed_vacancies: number;
    total_applications: number;
    verified_companies: number;
    application_statuses: Record<string, number>;
    monthly_users: MonthlyPoint[];
    work_models: Record<string, number>;
}

interface UsersReport {
    total: number;
    seekers: number;
    companies: number;
    domiciles: Point[];
}

interface CompaniesReport {
    total: number;
    verified: number;
    pending: number;
    top_industries: Point[];
}

interface VacanciesReport {
    total: number;
    active: number;
    draft: number;
    closed: number;
    work_models: Point[];
    locations: Point[];
}

interface PlacementsReport {
    total_applications: number;
    hired: number;
    rate: number;
    statuses: Point[];
}

interface AccessibilityReport {
    seekers_with_profile: number;
    disability_types: Point[];
    accommodations: Point[];
}

interface Props {
    filters: Filters;
    summary: Summary;
    users: UsersReport;
    companies: CompaniesReport;
    vacancies: VacanciesReport;
    placements: PlacementsReport;
    accessibility: AccessibilityReport;
}

const numberFormat = new Intl.NumberFormat('id-ID');
const tabLabels: Array<{ key: TabKey; label: string; icon: typeof BarChart3 }> = [
    { key: 'summary', label: 'Ringkasan', icon: BarChart3 },
    { key: 'users', label: 'Pengguna', icon: Users },
    { key: 'companies', label: 'Perusahaan', icon: Building2 },
    { key: 'vacancies', label: 'Lowongan', icon: BriefcaseBusiness },
    { key: 'placements', label: 'Penempatan Kerja', icon: CheckCircle2 },
    { key: 'accessibility', label: 'Aksesibilitas', icon: Accessibility },
];

const colors = ['#2A78D6', '#EB6834', '#1BAF7A', '#EDA100', '#E87BA4', '#008300'];
const seekerColor = colors[0];
const companyColor = colors[2];
const mutedInk = '#64748B';
const gridColor = '#E7EDF5';

function formatLabel(value: string): string {
    return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function query(filters: Filters, tab: TabKey): string {
    return `?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}&tab=${tab}`;
}

function Panel({ title, description, children, action }: { title: string; description?: string; children: ReactElement; action?: ReactElement }): ReactElement {
    return (
        <section className="rounded-xl border border-[#E2EAF3] bg-white p-4 shadow-[0_3px_14px_rgba(45,79,122,0.04)] sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-extrabold text-[#101B4D]">{title}</h2>
                    {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: number | string; detail: string; icon: typeof Users; tone: 'blue' | 'green' | 'amber' | 'purple' }): ReactElement {
    const toneClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-violet-50 text-violet-600',
    };

    return (
        <article className="rounded-xl border border-[#E2EAF3] bg-white p-4 shadow-[0_3px_14px_rgba(45,79,122,0.04)]">
            <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#101B4D]">{typeof value === 'number' ? numberFormat.format(value) : value}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
                </div>
            </div>
        </article>
    );
}

function Donut({ values, total, label }: { values: Array<{ label: string; value: number; color: string }>; total: number; label: string }): ReactElement {
    let cursor = 0;
    const stops = values.map((item) => {
        const start = cursor;
        cursor += total ? (item.value / total) * 100 : 0;
        return `${item.color} ${start}% ${cursor}%`;
    });

    return (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${stops.join(', ')})` }} role="img" aria-label={`${label}: ${numberFormat.format(total)}`}>
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl text-[#101B4D]">{numberFormat.format(total)}</strong><span className="text-[11px] text-slate-500">{label}</span></div>
            </div>
            <div className="w-full space-y-2">
                {values.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><strong className="text-[#101B4D]">{numberFormat.format(item.value)}</strong></div>)}
            </div>
        </div>
    );
}

function BarList({ items, empty = 'Belum ada data pada periode ini.' }: { items: Point[]; empty?: string }): ReactElement {
    const max = Math.max(...items.map((item) => item.value), 1);
    if (!items.length) return <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">{empty}</p>;

    return (
        <div className="space-y-3">
            {items.map((item, index) => <div key={item.label}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-600">{formatLabel(item.label)}</span><strong className="text-[#101B4D]">{numberFormat.format(item.value)}</strong></div><div className="h-2 rounded-full bg-slate-100" title={`${formatLabel(item.label)}: ${numberFormat.format(item.value)}`}><div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: colors[index % colors.length] }} /></div></div>)}
        </div>
    );
}

function LineChart({ points }: { points: MonthlyPoint[] }): ReactElement {
    const max = Math.max(...points.flatMap((point) => [point.seekers, point.companies]), 1);
    const x = (index: number) => points.length > 1 ? 24 + (index * 352) / (points.length - 1) : 200;
    const y = (value: number) => 150 - (value / max) * 120;
    const seekerPoints = points.map((point, index) => `${x(index)},${y(point.seekers)}`).join(' ');
    const companyPoints = points.map((point, index) => `${x(index)},${y(point.companies)}`).join(' ');

    if (!points.length) return <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">Belum ada data pengguna pada periode ini.</p>;

    return (
        <div>
            <div className="mb-3 flex gap-4 text-xs text-slate-600"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seekerColor }} /> Pelamar</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: companyColor }} /> Perusahaan</span></div>
            <svg viewBox="0 0 400 190" className="h-56 w-full overflow-visible" role="img" aria-label="Tren pendaftaran pengguna per bulan">
                {[30, 70, 110, 150].map((line) => <line key={line} x1="24" x2="376" y1={line} y2={line} stroke={gridColor} strokeWidth="1" />)}
                <polyline points={seekerPoints} fill="none" stroke={seekerColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><title>Pelamar</title></polyline>
                <polyline points={companyPoints} fill="none" stroke={companyColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><title>Perusahaan</title></polyline>
                {points.map((point, index) => <g key={`${point.label}-${index}`}><circle cx={x(index)} cy={y(point.seekers)} r="4" fill={seekerColor}><title>{point.label} · Pelamar: {numberFormat.format(point.seekers)}</title></circle><circle cx={x(index)} cy={y(point.companies)} r="4" fill={companyColor}><title>{point.label} · Perusahaan: {numberFormat.format(point.companies)}</title></circle><text x={x(index)} y="176" textAnchor="middle" fontSize="10" fill={mutedInk}>{point.label}</text></g>)}
            </svg>
            <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[420px] text-xs"><caption className="sr-only">Data tren pengguna per bulan</caption><thead><tr className="border-b text-left text-slate-400"><th className="py-2 font-medium">Bulan</th><th className="py-2 font-medium">Pelamar</th><th className="py-2 font-medium">Perusahaan</th></tr></thead><tbody>{points.map((point) => <tr key={point.label} className="border-b border-slate-50"><td className="py-2 text-slate-600">{point.label}</td><td className="py-2 font-semibold text-[#101B4D]">{numberFormat.format(point.seekers)}</td><td className="py-2 font-semibold text-[#101B4D]">{numberFormat.format(point.companies)}</td></tr>)}</tbody></table></div>
        </div>
    );
}

function ReportContent({ tab, summary, users, companies, vacancies, placements, accessibility }: Omit<Props, 'filters'> & { tab: TabKey }): ReactElement {
    if (tab === 'users') return <><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Total pengguna" value={users.total} detail="Dalam periode terpilih" icon={Users} tone="blue" /><MetricCard label="Pelamar" value={users.seekers} detail="Akun pencari kerja" icon={Users} tone="green" /><MetricCard label="Perusahaan" value={users.companies} detail="Akun perusahaan" icon={Building2} tone="amber" /></div><div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]"><Panel title="Tren pendaftaran pengguna" description="Jumlah akun baru per bulan."><LineChart points={summary.monthly_users} /></Panel><Panel title="Sebaran domisili pengguna" description="10 domisili pelamar terbanyak."><BarList items={users.domiciles} /></Panel></div></>;
    if (tab === 'companies') return <><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Perusahaan terdaftar" value={companies.total} detail="Dalam periode terpilih" icon={Building2} tone="blue" /><MetricCard label="Terverifikasi" value={companies.verified} detail="Akun yang disetujui" icon={CheckCircle2} tone="green" /><MetricCard label="Menunggu verifikasi" value={companies.pending} detail="Perlu ditinjau admin" icon={Building2} tone="amber" /></div><div className="grid gap-5 lg:grid-cols-2"><Panel title="Industri dengan perusahaan terbanyak" description="Dihitung dari profil perusahaan yang terdaftar."><BarList items={companies.top_industries} /></Panel><Panel title="Komposisi verifikasi perusahaan"><Donut values={[{ label: 'Terverifikasi', value: companies.verified, color: colors[2] }, { label: 'Menunggu', value: companies.pending, color: colors[3] }]} total={companies.total} label="Perusahaan" /></Panel></div></>;
    if (tab === 'vacancies') return <><div className="grid gap-3 sm:grid-cols-4"><MetricCard label="Total lowongan" value={vacancies.total} detail="Dalam periode terpilih" icon={BriefcaseBusiness} tone="blue" /><MetricCard label="Aktif" value={vacancies.active} detail="Sedang tayang" icon={CheckCircle2} tone="green" /><MetricCard label="Menunggu review" value={vacancies.draft} detail="Status draft" icon={FileText} tone="amber" /><MetricCard label="Ditutup" value={vacancies.closed} detail="Tidak lagi tayang" icon={BriefcaseBusiness} tone="purple" /></div><div className="grid gap-5 lg:grid-cols-2"><Panel title="Model kerja" description="Distribusi lowongan berdasarkan model kerja."><Donut values={vacancies.work_models.map((item, index) => ({ ...item, color: colors[index] }))} total={vacancies.total} label="Lowongan" /></Panel><Panel title="Sebaran lokasi lowongan" description="Lokasi dengan lowongan terbanyak."><BarList items={vacancies.locations} /></Panel></div></>;
    if (tab === 'placements') return <><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Total lamaran" value={placements.total_applications} detail="Dalam periode terpilih" icon={FileText} tone="blue" /><MetricCard label="Diterima kerja" value={placements.hired} detail="Lamaran berstatus hired" icon={CheckCircle2} tone="green" /><MetricCard label="Tingkat penempatan" value={`${placements.rate}%`} detail="Diterima dibanding total lamaran" icon={BarChart3} tone="purple" /></div><div className="grid gap-5 lg:grid-cols-2"><Panel title="Status proses lamaran" description="Distribusi status lamaran aktual."><BarList items={placements.statuses} /></Panel><Panel title="Ringkasan penempatan"><Donut values={placements.statuses.map((item, index) => ({ ...item, color: colors[index] }))} total={placements.total_applications} label="Lamaran" /></Panel></div></>;
    if (tab === 'accessibility') return <><div className="grid gap-3 sm:grid-cols-2"><MetricCard label="Profil aksesibilitas" value={accessibility.seekers_with_profile} detail="Pelamar dengan data aksesibilitas" icon={Accessibility} tone="blue" /><MetricCard label="Profil pelamar" value={users.seekers} detail="Pelamar pada periode terpilih" icon={Users} tone="green" /></div><div className="grid gap-5 lg:grid-cols-2"><Panel title="Jenis disabilitas pelamar" description="Berdasarkan profil aksesibilitas yang diisi."><BarList items={accessibility.disability_types} /></Panel><Panel title="Fasilitas lowongan" description="Akomodasi yang dicantumkan pada lowongan."><BarList items={accessibility.accommodations} /></Panel></div></>;

    return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><MetricCard label="Total pengguna" value={summary.total_users} detail="Akun terdaftar" icon={Users} tone="blue" /><MetricCard label="Pelamar" value={summary.total_seekers} detail="Pencari kerja" icon={Users} tone="green" /><MetricCard label="Perusahaan" value={summary.total_companies} detail="Profil perusahaan" icon={Building2} tone="amber" /><MetricCard label="Lowongan" value={summary.total_vacancies} detail="Semua status" icon={BriefcaseBusiness} tone="purple" /><MetricCard label="Penempatan" value={summary.application_statuses.hired ?? 0} detail="Lamaran diterima" icon={CheckCircle2} tone="green" /><MetricCard label="Lamaran" value={summary.total_applications} detail="Lamaran masuk" icon={FileText} tone="blue" /></div><div className="grid gap-5 lg:grid-cols-[1.45fr_0.85fr]"><Panel title="Tren pendaftaran pengguna" description="Pelamar dan perusahaan baru per bulan."><LineChart points={summary.monthly_users} /></Panel><Panel title="Model kerja lowongan" description="Distribusi berdasarkan data lowongan."><Donut values={Object.entries(summary.work_models).map(([label, value], index) => ({ label: formatLabel(label), value, color: colors[index] }))} total={summary.total_vacancies} label="Lowongan" /></Panel></div><div className="grid gap-5 lg:grid-cols-3"><Panel title="Status lowongan"><BarList items={[{ label: 'active', value: summary.active_vacancies }, { label: 'draft', value: summary.pending_vacancies }, { label: 'closed', value: summary.closed_vacancies }]} /></Panel><Panel title="Status lamaran"><BarList items={Object.entries(summary.application_statuses).map(([label, value]) => ({ label, value }))} /></Panel><Panel title="Akses cepat" description="Buka data operasional untuk tindak lanjut."><div className="space-y-2"><Link href="/admin/users" className="flex min-h-10 items-center gap-2 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100"><Users className="h-4 w-4" /> Kelola pengguna</Link><Link href="/admin/companies/verification" className="flex min-h-10 items-center gap-2 rounded-lg bg-amber-50 px-3 text-xs font-bold text-amber-700 hover:bg-amber-100"><Building2 className="h-4 w-4" /> Verifikasi perusahaan</Link><Link href="/admin/vacancies" className="flex min-h-10 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><BriefcaseBusiness className="h-4 w-4" /> Moderasi lowongan</Link></div></Panel></div></>;
}

export default function AdminReports({ filters, summary, users, companies, vacancies, placements, accessibility }: Props): ReactElement {
    const exportHref = `/admin/reports/export?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`;

    return <AdminLayout><Head title="Business Intelligence - AKSARA" /><main className="min-h-full bg-[#F5F9FF] px-4 py-5 sm:px-6 lg:px-7"><div className="mx-auto max-w-[1440px]"><header className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="mb-1 text-xs font-bold text-blue-600">Analitik platform</p><h1 className="text-3xl font-extrabold tracking-tight text-[#101B4D]">Business Intelligence</h1><p className="mt-1 text-sm text-slate-500">Pantau perkembangan AKSARA melalui data dan insight yang dapat ditindaklanjuti.</p></div><div className="flex flex-wrap items-center gap-2"><form method="get" action="/admin/reports" className="flex flex-wrap items-center gap-2 rounded-lg border border-[#DDE5EF] bg-white p-1.5 shadow-sm"><input type="hidden" name="tab" value={filters.tab} /><label className="sr-only" htmlFor="from">Mulai periode</label><input id="from" name="from" type="date" defaultValue={filters.from} className="min-h-9 rounded-md border-0 bg-transparent px-2 text-xs text-slate-600 outline-none" /><span className="text-slate-300">—</span><label className="sr-only" htmlFor="to">Akhir periode</label><input id="to" name="to" type="date" defaultValue={filters.to} className="min-h-9 rounded-md border-0 bg-transparent px-2 text-xs text-slate-600 outline-none" /><button type="submit" className="min-h-9 rounded-md bg-[#101B4D] px-3 text-xs font-bold text-white hover:bg-[#17276B]">Terapkan</button></form><a href={exportHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1769E0] px-4 text-xs font-bold text-white hover:bg-[#1254B5]"><Download className="h-4 w-4" /> Export CSV</a></div></header><nav className="mb-5 flex overflow-x-auto rounded-xl border border-[#E2EAF3] bg-white p-1 shadow-[0_3px_14px_rgba(45,79,122,0.04)]" aria-label="Tab Business Intelligence">{tabLabels.map(({ key, label, icon: Icon }) => <Link key={key} href={`/admin/reports${query(filters, key)}`} className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition sm:flex-1 ${filters.tab === key ? 'bg-[#EBF5FA] text-[#1769E0]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>)}</nav><div className="space-y-5"><ReportContent tab={filters.tab} summary={summary} users={users} companies={companies} vacancies={vacancies} placements={placements} accessibility={accessibility} /></div><p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" /> Periode data: {filters.from} sampai {filters.to} · Semua angka dihitung dari database platform.</p></div></main></AdminLayout>;
}
