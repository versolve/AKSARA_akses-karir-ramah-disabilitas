import { useState, useMemo, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, router } from '@inertiajs/react';
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
import {
    Activity,
    Award,
    BarChart,
    BarChart2,
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Compass,
    FileSearch,
    FileText,
    Filter,
    Globe,
    Handshake,
    Hourglass,
    Layers,
    Lightbulb,
    Percent,
    Share2,
    TrendingDown,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrendPoint {
    date: string;
    label: string;
    full_label: string;
    applications: number;
    in_process: number;
    hired: number;
    profabel: number;
    website: number;
    social: number;
    other: number;
    vac_1: number;
    vac_2: number;
    vac_3: number;
    avg_days: number;
}

interface StatusItem {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

interface SourceItem {
    name: string;
    count: number;
    percentage: number;
    in_process: number;
    hired: number;
    acceptance_rate: number;
    color: string;
    bg: string;
    icon: string;
}

interface VacancyBIItem {
    id: number;
    title: string;
    total: number;
    in_process: number;
    hired: number;
    acceptance_rate: number;
    avg_days: number;
    day_change: string;
    day_change_type: 'up' | 'down';
}

interface TimeStageItem {
    stage: string;
    days: number;
    color: string;
}

interface FunnelStageItem {
    stage: string;
    candidates: number;
    percentage: string;
    conversion: string;
    color: string;
}

interface Props {
    activeTab?: 'overview' | 'sources' | 'vacancies' | 'time' | 'funnel';
    filters?: {
        period: string;
        start_date: string;
        end_date: string;
        label: string;
        is_calendar: boolean;
    };
    kpi?: {
        total_applications: number;
        total_applications_growth: string;
        need_review: number;
        need_review_growth: string;
        in_process: number;
        in_process_growth: string;
        hired: number;
        hired_growth: string;
        rejected: number;
        rejected_growth: string;
        active_sources: number;
        active_sources_growth: string;
        top_source: string;
        top_source_rate: string;
        top_source_contribution: string;
        total_vacancies: number;
        total_vacancies_growth: string;
        avg_applications_per_vacancy: number;
        avg_applications_growth: string;
        acceptance_rate: string;
        acceptance_rate_growth: string;
        avg_hire_days: number;
        avg_hire_days_change: string;
        avg_hire_days_prev: number;
        fastest_days: number;
        fastest_vacancy: string;
        longest_days: number;
        longest_vacancy: string;
        hire_time_change_pct: string;
    };
    trendPoints?: TrendPoint[];
    statusDistribution?: StatusItem[];
    applicationsPerVacancy?: Array<{ title: string; count: number; percentage: number }>;
    sourcesData?: SourceItem[];
    vacanciesList?: VacancyBIItem[];
    timeStages?: TimeStageItem[];
    funnelStages?: FunnelStageItem[];
}

// Helper to calculate adaptive nice ceiling for SVG line and bar charts
const getNiceMax = (values: number[], minCeil = 4): number => {
    const rawMax = Math.max(...values, 0);
    if (rawMax <= 0) return minCeil;
    if (rawMax <= 4) return 4;
    if (rawMax <= 5) return 5;
    if (rawMax <= 10) return 10;
    if (rawMax <= 20) return 20;
    if (rawMax <= 50) return 50;
    if (rawMax <= 100) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const normalized = rawMax / magnitude;
    let niceNormalized = 10;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 2.5) niceNormalized = 2.5;
    else if (normalized <= 5) niceNormalized = 5;
    return Math.ceil(niceNormalized * magnitude);
};

const getNiceTicks = (maxVal: number, tickCount = 4): number[] => {
    if (maxVal <= 4) {
        return Array.from({ length: maxVal + 1 }, (_, i) => i);
    }
    const step = maxVal / tickCount;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
        ticks.push(Math.round(i * step));
    }
    return Array.from(new Set(ticks));
};

function formatDateIndo(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function BusinessIntelligenceIndex({
    activeTab = 'overview',
    filters = {
        period: 'this_month',
        start_date: '',
        end_date: '',
        label: '1 Des 2024 – 31 Des 2024',
        is_calendar: false,
    },
    kpi = {
        total_applications: 128,
        total_applications_growth: '+12%',
        need_review: 24,
        need_review_growth: '+33%',
        in_process: 86,
        in_process_growth: '+8%',
        hired: 18,
        hired_growth: '+20%',
        rejected: 12,
        rejected_growth: '+9%',
        active_sources: 4,
        active_sources_growth: '+0',
        top_source: 'Profabel',
        top_source_rate: '18,8%',
        top_source_contribution: '50,0%',
        total_vacancies: 12,
        total_vacancies_growth: '+20%',
        avg_applications_per_vacancy: 10.7,
        avg_applications_growth: '+8%',
        acceptance_rate: '14,1%',
        acceptance_rate_growth: '+2,3%',
        avg_hire_days: 14,
        avg_hire_days_change: '-3 hari',
        avg_hire_days_prev: 17,
        fastest_days: 7,
        fastest_vacancy: 'Frontend Developer',
        longest_days: 22,
        longest_vacancy: 'UI/UX Designer',
        hire_time_change_pct: '-17,6%',
    },
    trendPoints = [],
    statusDistribution = [],
    applicationsPerVacancy = [],
    sourcesData = [],
    vacanciesList = [],
    timeStages = [],
    funnelStages = [],
}: Props): ReactElement {
    // Current Active Tab
    const [currentTab, setCurrentTab] = useState<'overview' | 'sources' | 'vacancies' | 'time' | 'funnel'>(
        activeTab || 'overview'
    );

    // Calendar Range Dialog State
    const isCalendarActive = Boolean(filters.is_calendar);
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    const [startDateInput, setStartDateInput] = useState(filters.start_date ?? '');
    const [endDateInput, setEndDateInput] = useState(filters.end_date ?? '');

    const currentYear = new Date().getFullYear();
    const presetOptions: Array<{ id: string; label: string }> = [
        { id: 'all', label: 'Semua Periode' },
        { id: 'this_year', label: `Tahun Ini (${currentYear})` },
        { id: 'this_month', label: 'Bulan Ini' },
        { id: '30_days', label: '30 Hari Terakhir' },
        { id: '7_days', label: '7 Hari Terakhir' },
    ];

    const activePeriodLabel = useMemo(() => {
        if (isCalendarActive && filters.start_date && filters.end_date) {
            return `${formatDateIndo(filters.start_date)} – ${formatDateIndo(filters.end_date)}`;
        }
        const found = presetOptions.find((p) => p.id === filters.period);
        return found ? found.label : (filters.label || 'Semua Periode');
    }, [isCalendarActive, filters.start_date, filters.end_date, filters.period, filters.label]);

    // Hover state for interactive tooltips on SVG charts
    const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(
        trendPoints.length > 0 ? trendPoints.length - 1 : null
    );

    // Handle Period Change
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            '/company/bi',
            { tab: currentTab, period: newPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Apply calendar range filter
    const applyCalendarFilter = (): void => {
        if (!startDateInput || !endDateInput) return;
        setCalendarDialogOpen(false);
        router.get(
            '/company/bi',
            {
                tab: currentTab,
                start_date: startDateInput,
                end_date: endDateInput,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Handle Tab Change
    const handleTabChange = (newTab: 'overview' | 'sources' | 'vacancies' | 'time' | 'funnel') => {
        setCurrentTab(newTab);
        const queryParams: Record<string, string> = { tab: newTab };
        if (isCalendarActive && filters.start_date && filters.end_date) {
            queryParams.start_date = filters.start_date;
            queryParams.end_date = filters.end_date;
        } else {
            queryParams.period = filters.period || 'all';
        }
        router.get('/company/bi', queryParams, { preserveState: true, preserveScroll: true });
    };

    // --- Dynamic Scales for Flexible Charts ---
    // Tab 1: Overview
    const overviewMaxY = useMemo(
        () => getNiceMax(trendPoints.map((t) => t.applications), 4),
        [trendPoints]
    );
    const overviewTicks = useMemo(() => getNiceTicks(overviewMaxY, 4), [overviewMaxY]);

    const maxAppCount = useMemo(
        () => Math.max(...applicationsPerVacancy.map((v) => v.count), 1),
        [applicationsPerVacancy]
    );
    const barMaxScale = useMemo(() => Math.max(maxAppCount, 4), [maxAppCount]);
    const barTicks = useMemo(
        () => [
            0,
            Math.round(barMaxScale * 0.25),
            Math.round(barMaxScale * 0.5),
            Math.round(barMaxScale * 0.75),
            barMaxScale,
        ],
        [barMaxScale]
    );

    // Tab 2: Sources
    const sourcesMaxY = useMemo(
        () =>
            getNiceMax(
                trendPoints.flatMap((t) => [t.profabel, t.website, t.social, t.other]),
                4
            ),
        [trendPoints]
    );
    const sourcesTicks = useMemo(() => getNiceTicks(sourcesMaxY, 4), [sourcesMaxY]);

    // Tab 3: Vacancies
    const vacanciesMaxY = useMemo(
        () =>
            getNiceMax(
                trendPoints.flatMap((t) => [t.vac_1, t.vac_2, t.vac_3]),
                4
            ),
        [trendPoints]
    );
    const vacanciesTicks = useMemo(() => getNiceTicks(vacanciesMaxY, 4), [vacanciesMaxY]);

    const maxAcceptanceRate = useMemo(() => {
        const m = Math.max(...vacanciesList.map((v) => v.acceptance_rate), 0);
        if (m <= 10) return 10;
        if (m <= 20) return 20;
        if (m <= 50) return 50;
        return 100;
    }, [vacanciesList]);
    const acceptanceRateTicks = useMemo(
        () => [
            0,
            Math.round(maxAcceptanceRate * 0.25),
            Math.round(maxAcceptanceRate * 0.5),
            Math.round(maxAcceptanceRate * 0.75),
            maxAcceptanceRate,
        ],
        [maxAcceptanceRate]
    );

    // Tab 4: Recruitment Time
    const timeMaxY = useMemo(
        () => getNiceMax(trendPoints.map((t) => t.avg_days), 10),
        [trendPoints]
    );
    const timeTicks = useMemo(() => getNiceTicks(timeMaxY, 4), [timeMaxY]);
    const maxStageDays = useMemo(
        () => Math.max(...timeStages.map((s) => s.days), 1),
        [timeStages]
    );

    // Tab 5: Funnel
    const funnelMaxY = useMemo(
        () =>
            getNiceMax(
                trendPoints.flatMap((t) => [t.applications, t.in_process, t.hired]),
                4
            ),
        [trendPoints]
    );
    const funnelTicks = useMemo(() => getNiceTicks(funnelMaxY, 4), [funnelMaxY]);

    // SVG Chart Geometry
    const chartW = 580;
    const chartH = 190;
    const padL = 35;
    const padR = 25;
    const padT = 20;
    const padB = 30;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;

    const getX = (idx: number, total: number) => {
        if (total <= 1) return padL + plotW / 2;
        return padL + (idx / (total - 1)) * plotW;
    };

    const getY = (val: number, max: number) => {
        const safeMax = Math.max(max, 1);
        const clamped = Math.max(0, Math.min(val, safeMax));
        return padT + plotH - (clamped / safeMax) * plotH;
    };

    // SVG Donut helper
    const renderDonutSlices = (
        items: { count: number; percentage: number; color: string }[],
        radius: number,
        strokeWidth: number,
        cx: number,
        cy: number
    ) => {
        const circumference = 2 * Math.PI * radius;
        const total = items.reduce((sum, it) => sum + it.count, 0);

        if (total === 0) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                />
            );
        }

        let accumulated = 0;
        return items.map((slice, i) => {
            const ratio = slice.count / total;
            const strokeDasharray = `${ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulated * circumference;
            accumulated += ratio;

            return (
                <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                />
            );
        });
    };

    return (
        <CompanyLayout>
            <Head title="Business Intelligence - Profabel Perusahaan" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header Title & Date Range Dropdown */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                            Business Intelligence
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                            Analisis mendalam dan evaluasi kinerja proses rekrutmen untuk pengambilan keputusan yang lebih tepat.
                        </p>
                    </div>

                    {/* Date Range Selector matching Dashboard & Admin */}
                    <div className="flex items-center self-start sm:self-auto">
                        <div className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
                            {/* Calendar Icon Button (Triggers Calendar Range Dialog) */}
                            <button
                                type="button"
                                onClick={() => setCalendarDialogOpen(true)}
                                className={`flex h-10 items-center justify-center border-r border-slate-200 px-3.5 transition rounded-l-2xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] cursor-pointer ${
                                    isCalendarActive ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-600'
                                }`}
                                title="Pilih filter rentang waktu kalender"
                                aria-label="Filter dengan rentang kalender"
                            >
                                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                            </button>

                            {/* Dropdown Menu (Triggers Preset Options) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-10 items-center gap-2.5 rounded-r-2xl px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] cursor-pointer"
                                    >
                                        <span className={isCalendarActive ? 'text-[#1769E0]' : 'text-slate-700'}>
                                            {activePeriodLabel}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
                                >
                                    {presetOptions.map((opt) => {
                                        const isSelected = !isCalendarActive && filters.period === opt.id;
                                        return (
                                            <DropdownMenuItem
                                                key={opt.id}
                                                onClick={() => handlePeriodChange(opt.id)}
                                                className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                                    isSelected
                                                        ? 'bg-blue-50 text-[#1769E0]'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <Check className="h-4 w-4 text-[#1769E0]" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <div className="my-1 border-t border-slate-100" />
                                    <DropdownMenuItem
                                        onClick={() => setCalendarDialogOpen(true)}
                                        className="flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] transition"
                                    >
                                        <CalendarDays className="h-4 w-4 text-[#1769E0]" />
                                        <span>Pilih Rentang Kalender...</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Calendar Range Filter Dialog */}
                <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
                    <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#102B4B]">
                                Pilih Rentang Tanggal Kalender
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Tentukan tanggal mulai dan selesai untuk memfilter analisis Business Intelligence perusahaan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <label htmlFor="bi-calendar-start-date" className="text-xs font-semibold text-slate-700">
                                    Tanggal Mulai
                                </label>
                                <Input
                                    id="bi-calendar-start-date"
                                    type="date"
                                    value={startDateInput}
                                    onChange={(e) => setStartDateInput(e.target.value)}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="bi-calendar-end-date" className="text-xs font-semibold text-slate-700">
                                    Tanggal Selesai
                                </label>
                                <Input
                                    id="bi-calendar-end-date"
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
                                className="h-10 rounded-xl text-xs font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={applyCalendarFilter}
                                disabled={!startDateInput || !endDateInput}
                                className="h-10 rounded-xl bg-[#1769E0] text-xs font-bold hover:bg-[#1254B5]"
                            >
                                Terapkan Filter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 5 Main Tabs Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Ringkasan Analisis', icon: BarChart3 },
                            { id: 'sources', label: 'Efektivitas Sumber', icon: Share2 },
                            { id: 'vacancies', label: 'Kinerja Lowongan', icon: Calendar },
                            { id: 'time', label: 'Waktu Rekrutmen', icon: Clock },
                            { id: 'funnel', label: 'Funnel Rekrutmen', icon: Filter },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = currentTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id as any)}
                                    className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                                        isActive
                                            ? 'border-[#1769E0] text-[#1769E0]'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: RINGKASAN ANALISIS (Reference Image 1)                             */}
                {/* ========================================================================= */}
                {currentTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* 5 Top Metric KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Card 1: Total Lamaran */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.total_applications_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Total Lamaran</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.total_applications}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            {/* Card 2: Perlu Ditinjau */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                        <FileSearch className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.need_review_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Perlu Ditinjau</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.need_review}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            {/* Card 3: Dalam Proses Seleksi */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.in_process_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Dalam Proses Seleksi</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.in_process}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            {/* Card 4: Diterima */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.hired_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Diterima</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.hired}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            {/* Card 5: Ditolak */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                                        <X className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.rejected_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Ditolak</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.rejected}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Tren Lamaran Masuk & Distribusi Status Lamaran */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Tren Lamaran Masuk (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                            <TrendingUp className="h-4 w-4 text-[#1769E0]" />
                                            <span>Tren Lamaran Masuk</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Perkembangan jumlah lamaran harian pada periode ini.
                                        </p>
                                    </div>
                                </div>

                                {/* SVG Interactive Line Chart */}
                                <div className="mt-4 relative">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible">
                                        <defs>
                                            <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#1769E0" stopOpacity="0.28" />
                                                <stop offset="100%" stopColor="#1769E0" stopOpacity="0.01" />
                                            </linearGradient>
                                        </defs>

                                        {/* Horizontal grid lines & Y-ticks */}
                                        {overviewTicks.map((tick) => {
                                            const yPos = getY(tick, overviewMaxY);
                                            return (
                                                <g key={tick}>
                                                    <line
                                                        x1={padL}
                                                        y1={yPos}
                                                        x2={chartW - padR}
                                                        y2={yPos}
                                                        stroke="#F1F5F9"
                                                        strokeDasharray="4 4"
                                                    />
                                                    <text
                                                        x={padL - 10}
                                                        y={yPos + 4}
                                                        textAnchor="end"
                                                        className="text-[10px] fill-slate-400 font-medium"
                                                    >
                                                        {tick}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Area Fill */}
                                        {trendPoints.length > 0 && (
                                            <polygon
                                                points={`
                                                    ${getX(0, trendPoints.length)},${padT + plotH}
                                                    ${trendPoints.map((t, idx) => `${getX(idx, trendPoints.length)},${getY(t.applications, overviewMaxY)}`).join(' ')}
                                                    ${getX(trendPoints.length - 1, trendPoints.length)},${padT + plotH}
                                                `}
                                                fill="url(#appGradient)"
                                            />
                                        )}

                                        {/* Line */}
                                        {trendPoints.length > 0 && (
                                            <polyline
                                                fill="none"
                                                stroke="#1769E0"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={trendPoints
                                                    .map((t, idx) => `${getX(idx, trendPoints.length)},${getY(t.applications, overviewMaxY)}`)
                                                    .join(' ')}
                                            />
                                        )}

                                        {/* Data Dots & X-Labels */}
                                        {trendPoints.map((t, idx) => {
                                            const x = getX(idx, trendPoints.length);
                                            const y = getY(t.applications, overviewMaxY);
                                            const isHovered = hoveredTrendIdx === idx;

                                            return (
                                                <g
                                                    key={idx}
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredTrendIdx(idx)}
                                                >
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={isHovered ? 6 : 4}
                                                        fill="#ffffff"
                                                        stroke="#1769E0"
                                                        strokeWidth={isHovered ? 3 : 2}
                                                        className="transition-all"
                                                    />
                                                    <text
                                                        x={x}
                                                        y={chartH - 8}
                                                        textAnchor="middle"
                                                        className={`text-[10px] font-medium ${
                                                            isHovered ? 'fill-[#1769E0] font-bold' : 'fill-slate-400'
                                                        }`}
                                                    >
                                                        {t.label}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Tooltip Badge at hovered point */}
                                        {hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx] && (
                                            <g
                                                transform={`translate(${Math.min(
                                                    Math.max(getX(hoveredTrendIdx, trendPoints.length) - 45, 10),
                                                    chartW - 100
                                                )}, ${Math.max(getY(trendPoints[hoveredTrendIdx].applications, overviewMaxY) - 48, 5)})`}
                                            >
                                                <rect
                                                    width="90"
                                                    height="38"
                                                    rx="10"
                                                    fill="#102B4B"
                                                    className="shadow-xl"
                                                />
                                                <text
                                                    x="45"
                                                    y="16"
                                                    textAnchor="middle"
                                                    fill="#ffffff"
                                                    className="text-[10px] font-bold"
                                                >
                                                    {trendPoints[hoveredTrendIdx].full_label}
                                                </text>
                                                <text
                                                    x="45"
                                                    y="30"
                                                    textAnchor="middle"
                                                    fill="#93C5FD"
                                                    className="text-[11px] font-black"
                                                >
                                                    {trendPoints[hoveredTrendIdx].applications} lamaran
                                                </text>
                                            </g>
                                        )}
                                    </svg>
                                </div>
                            </div>

                            {/* Distribusi Status Lamaran (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Clock className="h-4 w-4 text-[#1769E0]" />
                                        <span>Distribusi Status Lamaran</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Proporsi lamaran berdasarkan status saat ini.
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                                    {/* Donut Chart */}
                                    <div className="relative flex items-center justify-center">
                                        <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
                                            {renderDonutSlices(statusDistribution, 60, 24, 85, 85)}
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-[#102B4B]">
                                                {kpi.total_applications}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                Total Lamaran
                                            </span>
                                        </div>
                                    </div>

                                    {/* Legend Items */}
                                    <div className="space-y-2.5 w-full sm:w-auto">
                                        {statusDistribution.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between sm:justify-start gap-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="h-3 w-3 rounded-md shrink-0"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="font-semibold text-slate-700">{item.label}</span>
                                                </div>
                                                <span className="font-bold text-slate-500 whitespace-nowrap">
                                                    {item.count} ({item.percentage.toLocaleString('id-ID')}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lower Row: Lamaran per Lowongan & Sumber Lamaran */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Lamaran per Lowongan (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Briefcase className="h-4 w-4 text-[#1769E0]" />
                                        <span>Lamaran per Lowongan</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Jumlah lamaran pada setiap lowongan aktif.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {applicationsPerVacancy.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-slate-400 font-medium">
                                            Belum ada data lamaran lowongan pada periode ini.
                                        </p>
                                    ) : (
                                        applicationsPerVacancy.map((vac, idx) => (
                                            <div key={idx} className="flex items-center gap-4 text-xs">
                                                <span className="w-36 font-bold text-slate-700 truncate" title={vac.title}>
                                                    {vac.title}
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        className="bg-[#1769E0] h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (vac.count / barMaxScale) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right font-black text-slate-700">
                                                    {vac.count}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    {/* X-axis indicators */}
                                    <div className="flex justify-between pl-40 pr-8 text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                                        {barTicks.map((val, i) => (
                                            <span key={i}>{val}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sumber Lamaran (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Share2 className="h-4 w-4 text-[#1769E0]" />
                                        <span>Sumber Lamaran</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Asal kandidat mengetahui lowongan perusahaan Anda.
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                                    {/* Donut Chart */}
                                    <div className="relative flex items-center justify-center">
                                        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
                                            {renderDonutSlices(sourcesData, 52, 22, 75, 75)}
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center text-center">
                                            <span className="text-xl font-black text-[#102B4B]">
                                                {kpi.total_applications}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                Lamaran
                                            </span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-2.5 w-full sm:w-auto">
                                        {sourcesData.map((src, idx) => (
                                            <div key={idx} className="flex items-center justify-between sm:justify-start gap-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="h-3 w-3 rounded-md shrink-0"
                                                        style={{ backgroundColor: src.color }}
                                                    />
                                                    <span className="font-semibold text-slate-700">{src.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-500 whitespace-nowrap">
                                                    {src.count} ({src.percentage.toLocaleString('id-ID')}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: 3 Quick Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* Card 1: Rata-rata Waktu Rekrutmen */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0] shrink-0">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-500">Rata-rata Waktu Rekrutmen</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-[#102B4B]">{kpi.avg_hire_days} hari</span>
                                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <TrendingDown className="h-3 w-3" />
                                            <span>{kpi.avg_hire_days_change}</span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Dibanding periode sebelumnya ({kpi.avg_hire_days_prev} hari)
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Tingkat Penerimaan */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-500">Tingkat Penerimaan (Acceptance Rate)</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-[#102B4B]">{kpi.acceptance_rate}</span>
                                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <TrendingUp className="h-3 w-3" />
                                            <span>{kpi.acceptance_rate_growth}</span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Dibanding periode sebelumnya (11,8%)
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Funnel Rekrutmen */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-600">Funnel Rekrutmen</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-xl bg-blue-50 py-2 px-1">
                                        <p className="text-base font-black text-[#1769E0]">{kpi.total_applications}</p>
                                        <p className="text-[10px] font-bold text-blue-700">Lamaran (100%)</p>
                                    </div>
                                    <div className="rounded-xl bg-purple-50 py-2 px-1">
                                        <p className="text-base font-black text-purple-600">{kpi.in_process}</p>
                                        <p className="text-[10px] font-bold text-purple-700">Seleksi (67,2%)</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 py-2 px-1">
                                        <p className="text-base font-black text-emerald-600">{kpi.hired}</p>
                                        <p className="text-[10px] font-bold text-emerald-700">Diterima (14,1%)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: EFEKTIVITAS SUMBER (Reference Image 2)                             */}
                {/* ========================================================================= */}
                {currentTab === 'sources' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* 4 Top KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.total_applications_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Total Lamaran</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.total_applications}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                        <Share2 className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.active_sources_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Sumber Aktif</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.active_sources}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <Award className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Sumber Paling Efektif</p>
                                    <p className="mt-1 text-2xl font-black text-[#102B4B]">{kpi.top_source}</p>
                                    <p className="mt-1 text-[11px] text-emerald-600 font-bold">Tingkat penerimaan {kpi.top_source_rate}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                        <Percent className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Kontribusi Terbesar</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.top_source_contribution}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dari total lamaran ({kpi.top_source})</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row: Distribusi Lamaran per Sumber & Tren Lamaran per Sumber */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Distribusi Lamaran per Sumber (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Clock className="h-4 w-4 text-[#1769E0]" />
                                        <span>Distribusi Lamaran per Sumber</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Proporsi jumlah lamaran berdasarkan sumber kandidat.
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <div className="relative flex items-center justify-center">
                                        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                                            {renderDonutSlices(sourcesData, 56, 22, 80, 80)}
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-[#102B4B]">{kpi.total_applications}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Lamaran</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 w-full sm:w-auto">
                                        {sourcesData.map((src, idx) => (
                                            <div key={idx} className="flex items-center justify-between sm:justify-start gap-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3 w-3 rounded-md shrink-0" style={{ backgroundColor: src.color }} />
                                                    <span className="font-semibold text-slate-700">{src.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-500 whitespace-nowrap">
                                                    {src.count} ({src.percentage.toLocaleString('id-ID')}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tren Lamaran per Sumber (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <TrendingUp className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tren Lamaran per Sumber</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perkembangan jumlah lamaran harian berdasarkan sumber.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible">
                                        {sourcesTicks.map((tick) => {
                                            const yPos = getY(tick, sourcesMaxY);
                                            return (
                                                <g key={tick}>
                                                    <line x1={padL} y1={yPos} x2={chartW - padR} y2={yPos} stroke="#F1F5F9" strokeDasharray="4 4" />
                                                    <text x={padL - 10} y={yPos + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                                                        {tick}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Multi lines */}
                                        <polyline fill="none" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.profabel, sourcesMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.website, sourcesMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.social, sourcesMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.other, sourcesMaxY)}`).join(' ')} />

                                        {/* X-ticks */}
                                        {trendPoints.map((t, i) => (
                                            <text key={i} x={getX(i, trendPoints.length)} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                                                {t.label}
                                            </text>
                                        ))}
                                    </svg>
                                    <div className="flex items-center justify-center gap-6 mt-2 text-xs font-semibold text-slate-600">
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />Profabel</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />Website Perusahaan</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />Media Sosial</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />Lainnya</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lower Row: Kinerja Sumber Lamaran Table & Insight Utama */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Table (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <BarChart2 className="h-4 w-4 text-[#1769E0]" />
                                        <span>Kinerja Sumber Lamaran</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perbandingan performa setiap sumber kandidat.
                                    </p>
                                </div>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500">
                                                <th className="py-3 px-3">Sumber</th>
                                                <th className="py-3 px-3 text-center">Total Lamaran</th>
                                                <th className="py-3 px-3 text-center">Dalam Seleksi</th>
                                                <th className="py-3 px-3 text-center">Diterima</th>
                                                <th className="py-3 px-3 text-center">Tingkat Penerimaan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {sourcesData.map((src, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1769E0]">
                                                                <Globe className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="font-bold text-slate-800">{src.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{src.count}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{src.in_process}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{src.hired}</td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-xl px-2.5 py-1 text-xs font-bold ${
                                                                src.acceptance_rate > 0
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                            }`}
                                                        >
                                                            {src.acceptance_rate.toLocaleString('id-ID')}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Insight Utama Card (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-[#1769E0]" />
                                        <h3 className="text-base font-extrabold text-[#102B4B]">Insight Utama</h3>
                                    </div>

                                    <div className="mt-5 space-y-4 text-xs font-medium text-slate-700">
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Profabel</strong> menjadi sumber lamaran terbesar dengan <strong className="font-bold text-slate-900">50,0%</strong> dari total lamaran.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Tingkat penerimaan tertinggi berasal dari <strong className="font-bold text-slate-900">Profabel (18,8%)</strong>.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Media Sosial</strong> menyumbang <strong className="font-bold text-slate-900">15,6%</strong> lamaran dengan tingkat penerimaan <strong className="font-bold text-slate-900">10,0%</strong>.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Lainnya belum menghasilkan kandidat yang diterima (0,0%).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: KINERJA LOWONGAN (Reference Image 3)                               */}
                {/* ========================================================================= */}
                {currentTab === 'vacancies' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* 4 Top KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.total_vacancies_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Total Lowongan</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.total_vacancies}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.total_applications_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Total Lamaran</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.total_applications}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                        <FileSearch className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.avg_applications_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Rata-rata Lamaran per Lowongan</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.avg_applications_per_vacancy.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.acceptance_rate_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Tingkat Penerimaan (Acceptance Rate)</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.acceptance_rate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Performa Setiap Lowongan Table & Tren Lamaran per Lowongan */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Performa Setiap Lowongan (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Briefcase className="h-4 w-4 text-[#1769E0]" />
                                        <span>Performa Setiap Lowongan</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Kinerja rekrutmen berdasarkan jumlah lamaran, proses seleksi, dan tingkat penerimaan.
                                    </p>
                                </div>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500">
                                                <th className="py-3 px-3">Lowongan</th>
                                                <th className="py-3 px-3 text-center">Total Lamaran</th>
                                                <th className="py-3 px-3 text-center">Dalam Seleksi</th>
                                                <th className="py-3 px-3 text-center">Diterima</th>
                                                <th className="py-3 px-3 text-center">Tingkat Penerimaan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {vacanciesList.map((vac) => (
                                                <tr key={vac.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-3 font-bold text-slate-800">{vac.title}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{vac.total}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{vac.in_process}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{vac.hired}</td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span className="inline-block rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                            {vac.acceptance_rate.toLocaleString('id-ID')}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tren Lamaran per Lowongan (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <TrendingUp className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tren Lamaran per Lowongan</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perkembangan jumlah lamaran untuk 3 lowongan dengan pelamar terbanyak.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible">
                                        {vacanciesTicks.map((tick) => {
                                            const yPos = getY(tick, vacanciesMaxY);
                                            return (
                                                <g key={tick}>
                                                    <line x1={padL} y1={yPos} x2={chartW - padR} y2={yPos} stroke="#F1F5F9" strokeDasharray="4 4" />
                                                    <text x={padL - 10} y={yPos + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                                                        {tick}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        <polyline fill="none" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.vac_1, vacanciesMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.vac_2, vacanciesMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.vac_3, vacanciesMaxY)}`).join(' ')} />

                                        {trendPoints.map((t, i) => (
                                            <text key={i} x={getX(i, trendPoints.length)} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                                                {t.label}
                                            </text>
                                        ))}
                                    </svg>
                                    <div className="flex items-center justify-center gap-6 mt-2 text-xs font-semibold text-slate-600">
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />{vacanciesList[0]?.title || 'Lowongan 1'}</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />{vacanciesList[1]?.title || 'Lowongan 2'}</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />{vacanciesList[2]?.title || 'Lowongan 3'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lower Row: Tingkat Penerimaan per Lowongan & Insight Kinerja Lowongan */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Tingkat Penerimaan per Lowongan (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <BarChart3 className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tingkat Penerimaan per Lowongan</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Persentase kandidat yang diterima dari total lamaran pada setiap lowongan.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {vacanciesList.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-slate-400 font-medium">
                                            Belum ada data lowongan pada periode ini.
                                        </p>
                                    ) : (
                                        vacanciesList.map((vac) => (
                                            <div key={vac.id} className="flex items-center gap-4 text-xs">
                                                <span className="w-36 font-bold text-slate-700 truncate" title={vac.title}>
                                                    {vac.title}
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        className="bg-[#1769E0] h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (vac.acceptance_rate / maxAcceptanceRate) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right font-black text-slate-700">
                                                    {vac.acceptance_rate.toLocaleString('id-ID')}%
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    <div className="flex justify-between pl-40 pr-12 text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                                        {acceptanceRateTicks.map((val, i) => (
                                            <span key={i}>{val}%</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Insight Kinerja Lowongan (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-[#1769E0]" />
                                        <h3 className="text-base font-extrabold text-[#102B4B]">Insight Kinerja Lowongan</h3>
                                    </div>

                                    <div className="mt-5 space-y-4 text-xs font-medium text-slate-700">
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">UI/UX Designer</strong> memiliki jumlah lamaran terbanyak (32) dengan tingkat penerimaan tertinggi (<strong className="font-bold text-slate-900">18,8%</strong>).
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Marketing Specialist</strong> dan <strong className="font-bold text-slate-900">Business Analyst</strong> menunjukkan performa penerimaan yang sama (<strong className="font-bold text-slate-900">16,7%</strong>).
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Frontend Developer</strong> memiliki tingkat penerimaan terendah (14,3%), namun masih dalam tren yang stabil.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: WAKTU REKRUTMEN (Reference Image 4)                                 */}
                {/* ========================================================================= */}
                {currentTab === 'time' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* 4 Top KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingDown className="h-3 w-3" />
                                        <span>{kpi.avg_hire_days_change}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Rata-rata Waktu Rekrutmen</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.avg_hire_days} hari</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya ({kpi.avg_hire_days_prev} hari)</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Waktu Tercepat</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.fastest_days} hari</p>
                                    <p className="mt-1 text-[11px] text-purple-600 font-bold">pada lowongan {kpi.fastest_vacancy}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                        <Hourglass className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Waktu Terlama</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.longest_days} hari</p>
                                    <p className="mt-1 text-[11px] text-amber-600 font-bold">pada lowongan {kpi.longest_vacancy}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <BarChart className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Perubahan Waktu Rekrutmen</p>
                                    <p className="mt-1 text-3xl font-black text-emerald-600">{kpi.hire_time_change_pct}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Tren Rata-rata Waktu Rekrutmen & Rata-rata Waktu per Tahap Seleksi */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Tren Line Chart (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <TrendingUp className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tren Rata-rata Waktu Rekrutmen</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perkembangan rata-rata hari yang dibutuhkan untuk menyelesaikan proses rekrutmen.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible">
                                        {timeTicks.map((tick) => {
                                            const yPos = getY(tick, timeMaxY);
                                            return (
                                                <g key={tick}>
                                                    <line x1={padL} y1={yPos} x2={chartW - padR} y2={yPos} stroke="#F1F5F9" strokeDasharray="4 4" />
                                                    <text x={padL - 10} y={yPos + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                                                        {tick}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        <polyline
                                            fill="none"
                                            stroke="#1769E0"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            points={trendPoints
                                                .map((t, i) => `${getX(i, trendPoints.length)},${getY(t.avg_days, timeMaxY)}`)
                                                .join(' ')}
                                        />

                                        {trendPoints.map((t, i) => {
                                            const x = getX(i, trendPoints.length);
                                            const y = getY(t.avg_days, timeMaxY);
                                            return (
                                                <g key={i}>
                                                    <circle cx={x} cy={y} r={i === trendPoints.length - 1 ? 6 : 4} fill="#ffffff" stroke="#1769E0" strokeWidth="2" />
                                                    <text x={x} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                                                        {t.label}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Highlight Tooltip at the last point */}
                                        {trendPoints.length > 0 && (
                                            <g transform={`translate(${Math.max(10, chartW - padR - 75)}, ${Math.max(5, getY(trendPoints[trendPoints.length - 1].avg_days, timeMaxY) - 45)})`}>
                                                <rect width="72" height="34" rx="8" fill="#102B4B" />
                                                <text x="36" y="14" textAnchor="middle" fill="#ffffff" className="text-[9px] font-bold">
                                                    {trendPoints[trendPoints.length - 1].full_label}
                                                </text>
                                                <text x="36" y="27" textAnchor="middle" fill="#93C5FD" className="text-[11px] font-black">
                                                    {trendPoints[trendPoints.length - 1].avg_days} hari
                                                </text>
                                            </g>
                                        )}
                                    </svg>
                                </div>
                            </div>

                            {/* Rata-rata Waktu per Tahap Seleksi (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Layers className="h-4 w-4 text-[#1769E0]" />
                                        <span>Rata-rata Waktu per Tahap Seleksi</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Rata-rata durasi yang dibutuhkan kandidat pada setiap tahap.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {timeStages.map((st, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs">
                                            <span className="w-32 font-bold text-slate-700 truncate">{st.stage}</span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, (st.days / maxStageDays) * 100)}%`,
                                                        backgroundColor: st.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-12 text-right font-black text-slate-700">{st.days} hari</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Lower Row: Waktu Rekrutmen per Lowongan & Insight Waktu Rekrutmen */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Table (7 Cols) */}
                            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Briefcase className="h-4 w-4 text-[#1769E0]" />
                                        <span>Waktu Rekrutmen per Lowongan</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Rata-rata waktu dari lamaran masuk hingga keputusan akhir pada setiap lowongan.
                                    </p>
                                </div>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500">
                                                <th className="py-3 px-3">Lowongan</th>
                                                <th className="py-3 px-3 text-center">Total Lamaran</th>
                                                <th className="py-3 px-3 text-center">Diterima</th>
                                                <th className="py-3 px-3 text-center">Rata-rata Waktu Rekrutmen</th>
                                                <th className="py-3 px-3 text-center">Perubahan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {vacanciesList.map((vac) => (
                                                <tr key={vac.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-3 font-bold text-slate-800">{vac.title}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{vac.total}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{vac.hired}</td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-xl px-2.5 py-1 text-xs font-bold ${
                                                                vac.avg_days <= 10
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : vac.avg_days <= 18
                                                                    ? 'bg-blue-50 text-[#1769E0] border border-blue-200'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            }`}
                                                        >
                                                            {vac.avg_days} hari
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span
                                                            className={`text-xs font-bold ${
                                                                vac.day_change_type === 'down' ? 'text-emerald-600' : 'text-rose-500'
                                                            }`}
                                                        >
                                                            {vac.day_change}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Insight Waktu Rekrutmen (5 Cols) */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-[#1769E0]" />
                                        <h3 className="text-base font-extrabold text-[#102B4B]">Insight Waktu Rekrutmen</h3>
                                    </div>

                                    <div className="mt-5 space-y-4 text-xs font-medium text-slate-700">
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Rata-rata waktu rekrutmen adalah <strong className="font-bold text-slate-900">14 hari</strong>, lebih cepat 3 hari (-17,6%) dibanding periode sebelumnya.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Proses tercepat pada <strong className="font-bold text-slate-900">Frontend Developer (7 hari)</strong>, sementara yang terlama pada <strong className="font-bold text-slate-900">UI/UX Designer (22 hari)</strong>.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Tahap wawancara membutuhkan waktu paling lama, yaitu rata-rata 5 hari.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <p>
                                                Secara keseluruhan, efisiensi waktu rekrutmen menunjukkan tren yang membaik.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: FUNNEL REKRUTMEN (Reference Image 5)                                */}
                {/* ========================================================================= */}
                {currentTab === 'funnel' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* 4 Top KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.total_applications_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Total Lamaran</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.total_applications}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.in_process_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Dalam Seleksi</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.in_process}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.hired_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Diterima</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.hired}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 font-medium">dibanding periode sebelumnya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                        <Percent className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{kpi.acceptance_rate_growth}</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500">Tingkat Penerimaan (Acceptance Rate)</p>
                                    <p className="mt-1 text-3xl font-black text-[#102B4B]">{kpi.acceptance_rate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Funnel Rekrutmen (Trapezoid) & Tingkat Konversi per Tahap */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Visual Funnel (6 Cols) */}
                            <div className="lg:col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Filter className="h-4 w-4 text-[#1769E0]" />
                                        <span>Funnel Rekrutmen</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perjalanan kandidat dari melamar hingga diterima.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
                                    {/* 3-Tier Funnel SVG Graphic */}
                                    <div className="w-56 h-48 flex items-center justify-center">
                                        <svg viewBox="0 0 240 180" className="w-full h-full overflow-visible">
                                            {/* Tier 1: Lamaran Masuk (Blue Trapezoid) */}
                                            <polygon
                                                points="10,10 230,10 190,65 50,65"
                                                fill="#1769E0"
                                                className="transition-all hover:opacity-90"
                                            />
                                            <text x="120" y="42" textAnchor="middle" fill="#ffffff" className="text-lg font-black">
                                                {kpi.total_applications}
                                            </text>

                                            {/* Tier 2: Dalam Seleksi (Purple Trapezoid) */}
                                            <polygon
                                                points="54,70 186,70 156,120 84,120"
                                                fill="#8B5CF6"
                                                className="transition-all hover:opacity-90"
                                            />
                                            <text x="120" y="99" textAnchor="middle" fill="#ffffff" className="text-lg font-black">
                                                {kpi.in_process}
                                            </text>

                                            {/* Tier 3: Diterima (Green Trapezoid) */}
                                            <polygon
                                                points="87,125 153,125 130,170 110,170"
                                                fill="#10B981"
                                                className="transition-all hover:opacity-90"
                                            />
                                            <text x="120" y="152" textAnchor="middle" fill="#ffffff" className="text-base font-black">
                                                {kpi.hired}
                                            </text>
                                        </svg>
                                    </div>

                                    {/* Legend Beside Funnel */}
                                    <div className="space-y-4 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="h-3 w-3 rounded-full bg-[#1769E0]" />
                                            <div>
                                                <p className="font-bold text-slate-800">Lamaran Masuk</p>
                                                <p className="text-slate-500 font-semibold">{kpi.total_applications} (100%)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="h-3 w-3 rounded-full bg-[#8B5CF6]" />
                                            <div>
                                                <p className="font-bold text-slate-800">Dalam Seleksi</p>
                                                <p className="text-slate-500 font-semibold">{kpi.in_process} ({funnelStages[1]?.percentage || '0%'})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="h-3 w-3 rounded-full bg-[#10B981]" />
                                            <div>
                                                <p className="font-bold text-slate-800">Diterima</p>
                                                <p className="text-slate-500 font-semibold">{kpi.hired} ({funnelStages[2]?.percentage || '0%'})</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tingkat Konversi per Tahap (6 Cols) */}
                            <div className="lg:col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Percent className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tingkat Konversi per Tahap</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Persentase kandidat yang lanjut ke tahap berikutnya.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-5">
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="w-36 font-bold text-slate-700">Lamaran → Seleksi</span>
                                        <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-[#1769E0] h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, parseFloat((funnelStages[1]?.percentage || '0').replace(',', '.')) || 0)}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-right font-black text-slate-800">{funnelStages[1]?.percentage || '0%'}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="w-36 font-bold text-slate-700">Seleksi → Diterima</span>
                                        <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-[#60A5FA] h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, parseFloat((funnelStages[1]?.conversion || '0').replace(',', '.')) || 0)}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-right font-black text-slate-800">{funnelStages[1]?.conversion || '0%'}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="w-36 font-bold text-slate-700">Lamaran → Diterima</span>
                                        <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-[#93C5FD] h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, parseFloat((funnelStages[2]?.percentage || '0').replace(',', '.')) || 0)}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-right font-black text-slate-800">{funnelStages[2]?.percentage || '0%'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lower Row: Tren Funnel Rekrutmen & Konversi per Tahap Seleksi Table */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Tren Funnel Rekrutmen (6 Cols) */}
                            <div className="lg:col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <TrendingUp className="h-4 w-4 text-[#1769E0]" />
                                        <span>Tren Funnel Rekrutmen</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perkembangan jumlah kandidat di setiap tahap rekrutmen.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible">
                                        {funnelTicks.map((tick) => {
                                            const yPos = getY(tick, funnelMaxY);
                                            return (
                                                <g key={tick}>
                                                    <line x1={padL} y1={yPos} x2={chartW - padR} y2={yPos} stroke="#F1F5F9" strokeDasharray="4 4" />
                                                    <text x={padL - 10} y={yPos + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                                                        {tick}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        <polyline fill="none" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.applications, funnelMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.in_process, funnelMaxY)}`).join(' ')} />
                                        <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={trendPoints.map((t, i) => `${getX(i, trendPoints.length)},${getY(t.hired, funnelMaxY)}`).join(' ')} />

                                        {trendPoints.map((t, i) => (
                                            <text key={i} x={getX(i, trendPoints.length)} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                                                {t.label}
                                            </text>
                                        ))}
                                    </svg>
                                    <div className="flex items-center justify-center gap-6 mt-2 text-xs font-semibold text-slate-600">
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />Lamaran Masuk</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />Dalam Seleksi</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />Diterima</span>
                                    </div>
                                </div>
                            </div>

                            {/* Konversi per Tahap Seleksi Table (6 Cols) */}
                            <div className="lg:col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#102B4B]">
                                        <Layers className="h-4 w-4 text-[#1769E0]" />
                                        <span>Konversi per Tahap Seleksi</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Jumlah dan persentase kandidat pada setiap tahapan.
                                    </p>
                                </div>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500">
                                                <th className="py-3 px-3">Tahap Seleksi</th>
                                                <th className="py-3 px-3 text-center">Jumlah Kandidat</th>
                                                <th className="py-3 px-3 text-center">Persentase (dari total lamaran)</th>
                                                <th className="py-3 px-3 text-center">Konversi (ke tahap berikutnya)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {funnelStages.map((fn, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-3 font-bold text-slate-800">{fn.stage}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{fn.candidates}</td>
                                                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{fn.percentage}</td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        {fn.conversion !== '-' ? (
                                                            <span className="inline-block rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                                {fn.conversion}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 font-bold">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
