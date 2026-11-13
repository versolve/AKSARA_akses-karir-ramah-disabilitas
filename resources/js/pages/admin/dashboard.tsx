import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Briefcase,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    Compass,
    FileText,
    Info,
    LayoutGrid,
    Monitor,
    Palette,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import AdminLayout from '@/layouts/admin-layout';
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
    processed_applications?: number;
    accepted_applications?: number;
    verified_seekers?: number;
    unverified_seekers?: number;
    application_statuses?: Record<string, number>;
    growth_rates?: {
        users?: string;
        vacancies?: string;
        applications?: string;
        companies?: string;
    };
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

interface GrowthPoint {
    month: string;
    seekers: number;
    companies: number;
}

interface CategoryItem {
    name: string;
    count: number;
    color: string;
    icon: string;
}

interface VacancyStatusItem {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

interface StatusBreakdownData {
    total: number;
    items: VacancyStatusItem[];
}

interface ActivityItem {
    id: string | number;
    title: string;
    time: string;
    icon: string;
    type?: string;
    bg: string;
}

interface Props {
    filters?: {
        period?: string;
        start_date?: string;
        end_date?: string;
        is_calendar?: boolean;
    };
    stats: StatsData;
    recentApplications?: ApplicationItem[];
    recentVacancies?: VacancyItem[];
    growthPoints?: GrowthPoint[];
    categoryBreakdown?: CategoryItem[];
    vacancyStatuses?: StatusBreakdownData;
    recentActivities?: ActivityItem[];
}

const numberFormat = new Intl.NumberFormat('id-ID');

function formatDateIndo(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function KpiCard({
    title,
    value,
    growth,
    icon: Icon,
    iconBg,
    subtext = 'Dari periode sebelumnya',
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
}: {
    title: string;
    value: string | number;
    growth: string;
    icon: typeof Users;
    iconBg: string;
    subtext?: string;
    leftLabel: string;
    leftValue: string | number;
    rightLabel: string;
    rightValue: string | number;
}): ReactElement {
    return (
        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)] transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <span className="text-3xl font-extrabold tracking-tight text-[#101B4D]">
                            {typeof value === 'number' ? numberFormat.format(value) : value}
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                            {growth}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{subtext}</p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                <div>
                    <p className="text-xs text-slate-400">{leftLabel}</p>
                    <p className="mt-0.5 text-sm font-bold text-[#101B4D]">
                        {typeof leftValue === 'number' ? numberFormat.format(leftValue) : leftValue}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">{rightLabel}</p>
                    <p className="mt-0.5 text-sm font-bold text-[#101B4D]">
                        {typeof rightValue === 'number' ? numberFormat.format(rightValue) : rightValue}
                    </p>
                </div>
            </div>
        </article>
    );
}

function UserGrowthLineChart({ data }: { data: GrowthPoint[] }): ReactElement {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const width = 640;
    const height = 210;
    const paddingLeft = 45;
    const paddingRight = 25;
    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = 155;

    // Flexible dynamic scaling on Y axis based on actual visualized data
    const maxSeekers = Math.max(0, ...data.map((d) => d.seekers));
    const maxCompanies = Math.max(0, ...data.map((d) => d.companies));
    const highestVal = Math.max(maxSeekers, maxCompanies);

    // Calculate dynamic upper boundary for clean ticks
    let yMax = 5;
    if (highestVal <= 5) yMax = 5;
    else if (highestVal <= 10) yMax = 10;
    else if (highestVal <= 25) yMax = 25;
    else if (highestVal <= 50) yMax = 50;
    else if (highestVal <= 100) yMax = 100;
    else if (highestVal <= 250) yMax = 250;
    else if (highestVal <= 500) yMax = 500;
    else if (highestVal <= 1000) yMax = 1000;
    else {
        const step = Math.ceil(highestVal / 5 / 50) * 50;
        yMax = Math.max(50, step * 5);
    }

    const yTicks = [
        { label: numberFormat.format(yMax), y: 20 },
        { label: numberFormat.format(Math.round(yMax * 0.8)), y: 51 },
        { label: numberFormat.format(Math.round(yMax * 0.6)), y: 82 },
        { label: numberFormat.format(Math.round(yMax * 0.4)), y: 113 },
        { label: numberFormat.format(Math.round(yMax * 0.2)), y: 144 },
        { label: '0', y: 175 },
    ];

    const getX = (i: number): number => paddingLeft + (i / Math.max(1, data.length - 1)) * plotWidth;
    const getY = (val: number): number => 175 - (val / yMax) * plotHeight;

    const seekersPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.seekers) }));
    const companiesPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.companies) }));

    const seekersLinePath = seekersPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
    const seekersAreaPath = `${seekersLinePath} L ${getX(data.length - 1).toFixed(1)} 175 L ${getX(0).toFixed(1)} 175 Z`;

    const companiesLinePath = companiesPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
    const companiesAreaPath = `${companiesLinePath} L ${getX(data.length - 1).toFixed(1)} 175 L ${getX(0).toFixed(1)} 175 Z`;

    return (
        <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="seekersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1769E0" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#1769E0" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="companiesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-axis labels */}
                {yTicks.map((t) => (
                    <g key={t.y}>
                        <text x="36" y={t.y + 3.5} textAnchor="end" className="text-[11px] font-medium fill-slate-400">
                            {t.label}
                        </text>
                        <line x1={paddingLeft} y1={t.y} x2={width - paddingRight} y2={t.y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                ))}

                {/* X-axis Labels */}
                {data.map((d, i) => (
                    <text key={`${d.month}-${i}`} x={getX(i)} y="196" textAnchor="middle" className="text-[11px] font-medium fill-slate-400">
                        {d.month}
                    </text>
                ))}

                {/* Areas */}
                <path d={seekersAreaPath} fill="url(#seekersGrad)" />
                <path d={companiesAreaPath} fill="url(#companiesGrad)" />

                {/* Lines */}
                <path d={companiesLinePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={seekersLinePath} fill="none" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Hover Guide Line */}
                {hoveredIdx !== null && (
                    <line
                        x1={getX(hoveredIdx)}
                        y1="20"
                        x2={getX(hoveredIdx)}
                        y2="175"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                    />
                )}

                {/* Dots for Seekers */}
                {seekersPoints.map((p, i) => (
                    <circle
                        key={`s-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIdx === i ? '5' : '3.5'}
                        fill="#1769E0"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="transition-all"
                    />
                ))}

                {/* Dots for Companies */}
                {companiesPoints.map((p, i) => (
                    <circle
                        key={`c-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIdx === i ? '5' : '3.5'}
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="transition-all"
                    />
                ))}

                {/* Invisible hover trigger columns */}
                {data.map((_, i) => (
                    <rect
                        key={`hit-${i}`}
                        x={getX(i) - plotWidth / Math.max(1, data.length - 1) / 2}
                        y="10"
                        width={plotWidth / Math.max(1, data.length - 1)}
                        height="180"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    />
                ))}
            </svg>

            {/* Floating Tooltip */}
            {hoveredIdx !== null && (
                <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
                    style={{
                        left: `${(getX(hoveredIdx) / width) * 100}%`,
                        top: '12%',
                    }}
                >
                    <p className="font-bold text-slate-800">{data[hoveredIdx].month}</p>
                    <div className="mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#1769E0] font-semibold">
                            <span className="h-2 w-2 rounded-full bg-[#1769E0]" />
                            {numberFormat.format(data[hoveredIdx].seekers)} Pelamar
                        </span>
                        <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                            {numberFormat.format(data[hoveredIdx].companies)} Perusahaan
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function UserDistributionDonut({
    filterMode,
    totalUsers,
    totalSeekers,
    totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    verifiedSeekers = 0,
    unverifiedSeekers = 0,
}: {
    filterMode: 'Semua Pengguna' | 'Pelamar' | 'Perusahaan';
    totalUsers: number;
    totalSeekers: number;
    totalCompanies: number;
    verifiedCompanies: number;
    pendingCompanies: number;
    verifiedSeekers?: number;
    unverifiedSeekers?: number;
}): ReactElement {
    const radius = 62;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius; // ~389.55

    let centerNumber = totalUsers;
    let centerLabel = 'Total Pengguna';
    let group1Label = 'Pelamar';
    let group1Count = totalSeekers;
    let group1Color = '#1769E0';
    let group2Label = 'Perusahaan';
    let group2Count = totalCompanies;
    let group2Color = '#10B981';

    if (filterMode === 'Pelamar') {
        centerNumber = totalSeekers;
        centerLabel = 'Total Pelamar';
        group1Label = 'Terverifikasi';
        group1Count = verifiedSeekers;
        group1Color = '#1769E0';
        group2Label = 'Belum Verifikasi';
        group2Count = unverifiedSeekers;
        group2Color = '#94A3B8';
    } else if (filterMode === 'Perusahaan') {
        centerNumber = totalCompanies;
        centerLabel = 'Total Perusahaan';
        group1Label = 'Terverifikasi';
        group1Count = verifiedCompanies;
        group1Color = '#10B981';
        group2Label = 'Menunggu';
        group2Count = pendingCompanies;
        group2Color = '#FBBF24';
    }

    const totalSum = group1Count + group2Count || centerNumber || 1;
    const group1Pct = centerNumber > 0 ? Math.round((group1Count / totalSum) * 100) : 0;
    const group2Pct = 100 - group1Pct;

    const group1Length = (group1Pct / 100) * circumference;
    const group2Length = circumference - group1Length;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2 min-w-0">
            <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={group2Color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${group2Length} ${circumference}`}
                        strokeDashoffset={-group1Length}
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={group1Color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${group1Length} ${circumference}`}
                        strokeDashoffset="0"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold tracking-tight text-[#101B4D]">
                        {numberFormat.format(centerNumber)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{centerLabel}</span>
                </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group1Color }} />
                        <span className="text-sm font-semibold text-slate-700">{group1Label}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm font-extrabold text-[#101B4D]">{group1Pct}%</span>
                        <span className="block text-xs text-slate-400">{numberFormat.format(group1Count)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group2Color }} />
                        <span className="text-sm font-semibold text-slate-700">{group2Label}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm font-extrabold text-[#101B4D]">{group2Pct}%</span>
                        <span className="block text-xs text-slate-400">{numberFormat.format(group2Count)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VacancyStatusDonut({
    total,
    statuses,
}: {
    total: number;
    statuses: VacancyStatusItem[];
}): ReactElement {
    const radius = 54;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius; // ~339.29

    let accumulatedLength = 0;
    const segments = statuses.map((item) => {
        const length = total > 0 ? (item.count / total) * circumference : 0;
        const offset = -accumulatedLength;
        accumulatedLength += length;
        return {
            ...item,
            length,
            offset,
        };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 min-w-0">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                    {total === 0 ? (
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke="#E2E8F0"
                            strokeWidth={strokeWidth}
                        />
                    ) : (
                        segments.map((seg) => (
                            <circle
                                key={seg.label}
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${seg.length} ${circumference}`}
                                strokeDashoffset={seg.offset}
                            />
                        ))
                    )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-extrabold tracking-tight text-[#101B4D]">
                        {numberFormat.format(total)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Total Lowongan</span>
                </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
                {statuses.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600 truncate">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.label}</span>
                        </span>
                        <span className="shrink-0 font-bold text-[#101B4D]">
                            {numberFormat.format(item.count)}{' '}
                            <span className="font-normal text-slate-400">({item.percentage}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard({
    filters = {},
    stats,
    growthPoints = [],
    categoryBreakdown = [],
    vacancyStatuses = { total: 0, items: [] },
    recentActivities = [],
}: Props): ReactElement {
    const currentPeriod = filters.period ?? 'all';
    const isCalendarActive = Boolean(filters.is_calendar);
    const currentYear = new Date().getFullYear();

    // Calendar Dialog state for custom date range selection
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    const [startDateInput, setStartDateInput] = useState(filters.start_date ?? '');
    const [endDateInput, setEndDateInput] = useState(filters.end_date ?? '');

    // Role filter for user distribution donut
    const [userDistFilter, setUserDistFilter] = useState<'Semua Pengguna' | 'Pelamar' | 'Perusahaan'>('Semua Pengguna');

    // 5 exact preset choices matching user's photo
    const presetOptions: Array<{ id: string; label: string }> = [
        { id: 'all', label: 'Semua Periode' },
        { id: 'this_year', label: `Tahun Ini (${currentYear})` },
        { id: 'this_month', label: 'Bulan Ini' },
        { id: 'last_30_days', label: '30 Hari Terakhir' },
        { id: 'last_7_days', label: '7 Hari Terakhir' },
    ];

    // Determine current display text on the top filter
    const activeLabel = useMemo(() => {
        if (isCalendarActive && filters.start_date && filters.end_date) {
            return `${formatDateIndo(filters.start_date)} – ${formatDateIndo(filters.end_date)}`;
        }
        const found = presetOptions.find((p) => p.id === currentPeriod);
        return found ? found.label : 'Semua Periode';
    }, [isCalendarActive, filters.start_date, filters.end_date, currentPeriod]);

    // Handle selecting a preset from dropdown (deactivates calendar filter)
    const selectPreset = (presetId: string): void => {
        router.get(
            '/admin/dashboard',
            { period: presetId },
            { preserveState: true, replace: true }
        );
    };

    // Handle applying calendar date range (deactivates preset dropdown)
    const applyCalendarFilter = (): void => {
        if (!startDateInput || !endDateInput) return;
        setCalendarDialogOpen(false);
        router.get(
            '/admin/dashboard',
            { start_date: startDateInput, end_date: endDateInput },
            { preserveState: true, replace: true }
        );
    };

    // Calculate maximum category count for progress bar scaling
    const maxCategoryCount = useMemo(() => {
        const counts = categoryBreakdown.map((c) => c.count);
        return Math.max(1, ...counts);
    }, [categoryBreakdown]);

    const renderCategoryIcon = (iconName: string): ReactElement => {
        switch (iconName) {
            case 'palette':
                return <Palette className="h-3.5 w-3.5 text-[#2F80ED]" />;
            case 'monitor':
                return <Monitor className="h-3.5 w-3.5 text-[#00C0D4]" />;
            case 'compass':
                return <Compass className="h-3.5 w-3.5 text-[#F2C94C]" />;
            case 'user-round':
                return <UserRound className="h-3.5 w-3.5 text-[#9B51E0]" />;
            default:
                return <LayoutGrid className="h-3.5 w-3.5 text-[#7086FD]" />;
        }
    };

    const renderActivityIcon = (iconName: string): ReactElement => {
        switch (iconName) {
            case 'building':
                return <Building2 className="h-4 w-4" />;
            case 'briefcase':
                return <Briefcase className="h-4 w-4" />;
            case 'file-text':
                return <FileText className="h-4 w-4" />;
            case 'shield-check':
                return <ShieldCheck className="h-4 w-4" />;
            default:
                return <UserRound className="h-4 w-4" />;
        }
    };

    return (
        <AdminLayout>
            <Head title="Dashboard Admin - AKSARA" />
            <main className="min-h-full w-full overflow-x-hidden bg-[#F5F9FF] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1440px] space-y-6">
                    {/* Header with Centralized Time Filter */}
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#101B4D]">Dashboard</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Ringkasan data dan aktivitas platform AKSARA untuk memudahkan pemantauan dan pengambilan keputusan.
                            </p>
                        </div>

                        {/* Centralized Filter: Calendar Icon OR Dropdown Preset */}
                        <div className="flex items-center self-start sm:self-auto">
                            <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition hover:border-slate-300">
                                {/* Calendar Icon Button (Triggers Calendar Range Dialog) */}
                                <button
                                    type="button"
                                    onClick={() => setCalendarDialogOpen(true)}
                                    className={`flex h-10 items-center justify-center border-r border-[#E2E8F0] px-3.5 transition rounded-l-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] ${
                                        isCalendarActive ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-600'
                                    }`}
                                    title="Pilih filter rentang waktu kalender"
                                    aria-label="Filter dengan kalender"
                                >
                                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                </button>

                                {/* Dropdown Menu (Triggers 5 Preset Options from user photo) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex h-10 items-center gap-2.5 rounded-r-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
                                        >
                                            <span className={isCalendarActive ? 'text-[#1769E0]' : 'text-slate-700'}>
                                                {activeLabel}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
                                    >
                                        {presetOptions.map((opt) => {
                                            const isSelected = !isCalendarActive && currentPeriod === opt.id;
                                            return (
                                                <DropdownMenuItem
                                                    key={opt.id}
                                                    onClick={() => selectPreset(opt.id)}
                                                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition ${
                                                        isSelected
                                                            ? 'bg-blue-50/70 font-semibold text-[#1769E0]'
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {isSelected && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    {/* Calendar Filter Dialog */}
                    <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
                        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-[#101B4D]">
                                    Pilih Rentang Tanggal Kalender
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Tentukan tanggal mulai dan selesai untuk memfilter seluruh data platform.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="calendar-start-date" className="text-xs font-semibold text-slate-700">
                                        Tanggal Mulai
                                    </label>
                                    <Input
                                        id="calendar-start-date"
                                        type="date"
                                        value={startDateInput}
                                        onChange={(e) => setStartDateInput(e.target.value)}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="calendar-end-date" className="text-xs font-semibold text-slate-700">
                                        Tanggal Selesai
                                    </label>
                                    <Input
                                        id="calendar-end-date"
                                        type="date"
                                        value={endDateInput}
                                        onChange={(e) => setEndDateInput(e.target.value)}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="flex gap-2 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCalendarDialogOpen(false)}
                                    className="h-10 rounded-xl text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={applyCalendarFilter}
                                    disabled={!startDateInput || !endDateInput}
                                    className="h-10 rounded-xl bg-[#1769E0] text-xs hover:bg-[#1254B5]"
                                >
                                    Terapkan Filter
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Top 4 KPI Cards (Realtime Database Stats) */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan platform">
                        <KpiCard
                            title="Total Pengguna"
                            value={stats.total_users}
                            growth={stats.growth_rates?.users ?? '12%'}
                            icon={Users}
                            iconBg="bg-[#EBF5FA] text-[#1769E0]"
                            leftLabel="Pelamar"
                            leftValue={stats.total_seekers}
                            rightLabel="Perusahaan"
                            rightValue={stats.total_companies}
                        />
                        <KpiCard
                            title="Lowongan Aktif"
                            value={stats.active_vacancies}
                            growth={stats.growth_rates?.vacancies ?? '20%'}
                            icon={Briefcase}
                            iconBg="bg-[#ECFDF5] text-[#10B981]"
                            leftLabel="Total Dibuat"
                            leftValue={stats.total_vacancies}
                            rightLabel="Saat Ini Aktif"
                            rightValue={stats.active_vacancies}
                        />
                        <KpiCard
                            title="Lamaran Masuk"
                            value={stats.total_applications}
                            growth={stats.growth_rates?.applications ?? '18%'}
                            icon={FileText}
                            iconBg="bg-[#F5F3FF] text-[#8B5CF6]"
                            leftLabel="Diproses"
                            leftValue={stats.processed_applications ?? 0}
                            rightLabel="Diterima"
                            rightValue={stats.accepted_applications ?? 0}
                        />
                        <KpiCard
                            title="Perusahaan Terdaftar"
                            value={stats.total_companies}
                            growth={stats.growth_rates?.companies ?? '15%'}
                            icon={Building2}
                            iconBg="bg-[#FFFBEB] text-[#F59E0B]"
                            leftLabel="Terverifikasi"
                            leftValue={stats.verified_companies}
                            rightLabel="Menunggu Verifikasi"
                            rightValue={stats.pending_companies}
                        />
                    </section>

                    {/* Middle Section: Tren Pertumbuhan Pengguna (Flexible Scale) & Distribusi Pengguna */}
                    <section className="grid gap-5 lg:grid-cols-[1.8fr_1.2fr]">
                        {/* Tren Pertumbuhan Pengguna */}
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)]">
                            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="flex items-center gap-1.5 text-base font-extrabold text-[#101B4D]">
                                        Tren Pertumbuhan Pengguna
                                        <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                    </h2>
                                    <div className="mt-2 flex items-center gap-5 text-xs font-semibold text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />
                                            Pelamar
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                                            Perusahaan
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <UserGrowthLineChart data={growthPoints} />
                        </article>

                        {/* Distribusi Pengguna */}
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-1.5 text-base font-extrabold text-[#101B4D]">
                                    Distribusi Pengguna
                                    <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </h2>
                                {/* Role Distribution Filter Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
                                        >
                                            <span>{userDistFilter}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                        <DropdownMenuItem
                                            onClick={() => setUserDistFilter('Semua Pengguna')}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${userDistFilter === 'Semua Pengguna' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
                                        >
                                            <span>Semua Pengguna</span>
                                            {userDistFilter === 'Semua Pengguna' && <Check className="h-3.5 w-3.5" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setUserDistFilter('Pelamar')}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${userDistFilter === 'Pelamar' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
                                        >
                                            <span>Pelamar (Verifikasi)</span>
                                            {userDistFilter === 'Pelamar' && <Check className="h-3.5 w-3.5" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setUserDistFilter('Perusahaan')}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${userDistFilter === 'Perusahaan' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
                                        >
                                            <span>Perusahaan (Status)</span>
                                            {userDistFilter === 'Perusahaan' && <Check className="h-3.5 w-3.5" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <UserDistributionDonut
                                filterMode={userDistFilter}
                                totalUsers={stats.total_users}
                                totalSeekers={stats.total_seekers}
                                totalCompanies={stats.total_companies}
                                verifiedCompanies={stats.verified_companies}
                                pendingCompanies={stats.pending_companies}
                                verifiedSeekers={stats.verified_seekers}
                                unverifiedSeekers={stats.unverified_seekers}
                            />
                        </article>
                    </section>

                    {/* Bottom Section: 3 Cards Grid */}
                    <section className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {/* Card 1: Lowongan Berdasarkan Kategori Pekerjaan */}
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)]">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-1.5 text-base font-extrabold text-[#101B4D]">
                                    Lowongan Berdasarkan Kategori Pekerjaan
                                    <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </h2>
                                <Link href="/admin/vacancies" className="text-xs font-bold text-[#1769E0] hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="mt-4 space-y-4">
                                {categoryBreakdown.map((cat) => {
                                    const percentage = Math.min(100, Math.round((cat.count / maxCategoryCount) * 100)) || 0;
                                    return (
                                        <div key={cat.name} className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                                {renderCategoryIcon(cat.icon)}
                                            </div>
                                            <span className="w-28 sm:w-36 shrink-0 truncate text-xs font-semibold text-slate-700">
                                                {cat.name}
                                            </span>
                                            <div className="h-2.5 flex-1 min-w-[40px] overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${cat.color}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-600">
                                                {numberFormat.format(cat.count)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </article>

                        {/* Card 2: Status Lowongan */}
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)]">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-1.5 text-base font-extrabold text-[#101B4D]">
                                    Status Lowongan
                                    <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </h2>
                            </div>

                            <div className="mt-4">
                                <VacancyStatusDonut total={vacancyStatuses.total} statuses={vacancyStatuses.items} />
                            </div>
                        </article>

                        {/* Card 3: Aktivitas Terbaru (Realtime from DB) */}
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(16,27,77,0.02)] md:col-span-2 xl:col-span-1">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-extrabold text-[#101B4D]">Aktivitas Terbaru</h2>
                                <Link href="/admin/vacancies" className="text-xs font-bold text-[#1769E0] hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="mt-4 space-y-3.5 overflow-hidden">
                                {recentActivities.length === 0 ? (
                                    <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">
                                        Belum ada aktivitas tercatat pada sistem.
                                    </p>
                                ) : (
                                    recentActivities.map((act) => (
                                        <div key={act.id} className="flex items-center gap-3 min-w-0">
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${act.bg}`}>
                                                {renderActivityIcon(act.icon)}
                                            </div>
                                            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700" title={act.title}>
                                                {act.title}
                                            </p>
                                            <span className="shrink-0 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                                                {act.time}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </article>
                    </section>
                </div>
            </main>
        </AdminLayout>
    );
}
