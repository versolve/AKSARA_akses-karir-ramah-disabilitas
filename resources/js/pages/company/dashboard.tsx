import { useMemo, useState } from 'react';
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
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Code2,
    FileText,
    GitFork,
    Info,
    Megaphone,
    Monitor,
    MoreHorizontal,
    User,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

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

interface CompanyData {
    id: number;
    company_name: string;
    address: string;
    is_approved?: boolean;
}

interface StatsData {
    active_vacancies: number;
    active_vacancies_growth: string;
    total_vacancies: number;
    draft_vacancies: number;
    closed_vacancies: number;
    total_candidates: number;
    candidates_growth: string;
    verified_candidates: number;
    unverified_candidates: number;
    new_applications: number;
    new_applications_growth: string;
    need_review: number;
    reviewed: number;
    recruitment_process: number;
    recruitment_growth: string;
    interview: number;
    other_process: number;
    hired: number;
    rejected: number;
}

interface TrendPoint {
    month: string;
    applications: number;
    unique_candidates: number;
}

interface StatusItem {
    name: string;
    count: number;
    percentage: number;
    color: string;
}

interface CategoryItem {
    name: string;
    count: number;
    max: number;
    color: string;
    icon: string;
}

interface VacancyStatusItem {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

interface ActivityItem {
    id: number;
    type: string;
    title: string;
    time: string;
    icon: string;
    color: string;
    bgColor: string;
}

interface VacancyOption {
    id: number;
    title: string;
}

interface FiltersData {
    period: string;
    start_date?: string;
    end_date?: string;
    is_calendar?: boolean;
    year?: number;
    vacancy_id?: string | number;
}

interface Props {
    company: CompanyData;
    stats: StatsData;
    trends: TrendPoint[];
    statusDistribution: StatusItem[];
    categoryBreakdown: CategoryItem[];
    vacancyStatus: VacancyStatusItem[];
    recentActivities: ActivityItem[];
    vacancyOptions?: VacancyOption[];
    filters: FiltersData;
}

export default function CompanyDashboard({
    company,
    stats,
    trends,
    statusDistribution,
    categoryBreakdown,
    vacancyStatus,
    recentActivities,
    vacancyOptions = [],
    filters,
}: Props): ReactElement {
    const currentPeriod = filters.period ?? 'all';
    const isCalendarActive = Boolean(filters.is_calendar);
    const currentYear = new Date().getFullYear();
    const activeYear = filters.year ?? currentYear;

    // Calendar Range Dialog State
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    const [startDateInput, setStartDateInput] = useState(filters.start_date ?? '');
    const [endDateInput, setEndDateInput] = useState(filters.end_date ?? '');

    // Hover state for interactive SVG trend chart
    const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

    // Preset period choices identical to Admin
    const presetOptions: Array<{ id: string; label: string }> = [
        { id: 'all', label: 'Semua Periode' },
        { id: 'this_year', label: `Tahun Ini (${currentYear})` },
        { id: 'this_month', label: 'Bulan Ini' },
        { id: 'last_30_days', label: '30 Hari Terakhir' },
        { id: 'last_7_days', label: '7 Hari Terakhir' },
    ];

    // Compute display text for centralized header time filter
    const activePeriodLabel = useMemo(() => {
        if (isCalendarActive && filters.start_date && filters.end_date) {
            return `${formatDateIndo(filters.start_date)} – ${formatDateIndo(filters.end_date)}`;
        }
        const found = presetOptions.find((p) => p.id === currentPeriod);
        return found ? found.label : 'Semua Periode';
    }, [isCalendarActive, filters.start_date, filters.end_date, currentPeriod]);

    // Handle selecting a preset from dropdown
    const selectPreset = (presetId: string): void => {
        router.get(
            '/company/dashboard',
            { period: presetId, vacancy_id: filters.vacancy_id ?? 'all' },
            { preserveState: true, replace: true }
        );
    };

    // Handle applying calendar range dialog
    const applyCalendarFilter = (): void => {
        if (!startDateInput || !endDateInput) return;
        setCalendarDialogOpen(false);
        router.get(
            '/company/dashboard',
            {
                start_date: startDateInput,
                end_date: endDateInput,
                vacancy_id: filters.vacancy_id ?? 'all',
            },
            { preserveState: true, replace: true }
        );
    };

    // Filter year for "Tren Lamaran Masuk" when period is 'all'
    const selectTrendYear = (year: number): void => {
        router.get(
            '/company/dashboard',
            {
                period: 'all',
                year,
                vacancy_id: filters.vacancy_id ?? 'all',
            },
            { preserveState: true, replace: true }
        );
    };

    // Filter by specific vacancy for "Distribusi Status Lamaran"
    const selectVacancyFilter = (vacId: string | number): void => {
        const queryParams: Record<string, any> = {
            ...filters,
            vacancy_id: vacId,
        };
        router.get('/company/dashboard', queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    // Active vacancy label
    const selectedVacancyTitle = useMemo(() => {
        if (!filters.vacancy_id || filters.vacancy_id === 'all') {
            return 'Semua Lowongan';
        }
        const found = vacancyOptions.find((v) => String(v.id) === String(filters.vacancy_id));
        return found ? found.title : 'Semua Lowongan';
    }, [filters.vacancy_id, vacancyOptions]);

    // Available year choices for year filter
    const yearChoices = [currentYear, currentYear - 1, currentYear - 2];

    // Boolean: Filter tahun di Tren Masuk HANYA MUNCUL saat SEMUA PERIODE
    const showYearFilterInTrends = currentPeriod === 'all' && !isCalendarActive;

    // Flexible SVG chart calculations
    const chartWidth = 620;
    const chartHeight = 200;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    // Calculate dynamic maxY from the data points
    const maxDataValue = useMemo(() => {
        if (!trends || trends.length === 0) return 100;
        const highest = Math.max(
            ...trends.flatMap((t) => [t.applications ?? 0, t.unique_candidates ?? 0])
        );
        return Math.max(highest, 10);
    }, [trends]);

    const niceCeil = (val: number): number => {
        if (val <= 20) return 20;
        if (val <= 50) return 50;
        if (val <= 100) return 100;
        if (val <= 150) return 150;
        if (val <= 200) return 200;
        if (val <= 300) return 300;
        if (val <= 500) return 500;
        if (val <= 1000) return 1000;
        return Math.ceil(val / 100) * 100;
    };

    const maxY = niceCeil(maxDataValue * 1.25);
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round(pct * maxY));

    const getX = (index: number) => {
        if (trends.length <= 1) return paddingLeft + plotWidth / 2;
        return paddingLeft + (index / (trends.length - 1)) * plotWidth;
    };

    const getY = (value: number) => {
        const clamped = Math.max(0, Math.min(value, maxY));
        return paddingTop + plotHeight - (clamped / maxY) * plotHeight;
    };

    const appPoints = trends.map((t, i) => `${getX(i)},${getY(t.applications)}`).join(' ');
    const candidatePoints = trends.map((t, i) => `${getX(i)},${getY(t.unique_candidates)}`).join(' ');

    const appAreaPoints =
        trends.length > 0
            ? `${getX(0)},${paddingTop + plotHeight} ` +
              appPoints +
              ` ${getX(trends.length - 1)},${paddingTop + plotHeight}`
            : '';

    // Helper for rendering SVG Donut Slices
    const renderDonutSlices = (
        items: { count: number; percentage: number; color: string }[],
        radius: number,
        strokeWidth: number,
        cx: number,
        cy: number
    ) => {
        const circumference = 2 * Math.PI * radius;
        const total = items.reduce((sum, item) => sum + item.count, 0);

        if (total === 0) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                />
            );
        }

        let cumulativeAngle = -90; // Start at 12 o'clock

        return (
            <>
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                />
                {items.map((item, index) => {
                    const strokeDasharray = `${(Math.max(0, item.percentage) / 100) * circumference} ${circumference}`;
                    const rotation = cumulativeAngle;
                    cumulativeAngle += (Math.max(0, item.percentage) / 100) * 360;

                    return (
                        <circle
                            key={index}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            transform={`rotate(${rotation} ${cx} ${cy})`}
                            className="transition-all duration-300 hover:opacity-90"
                        />
                    );
                })}
            </>
        );
    };

    return (
        <CompanyLayout>
            <Head title="Dashboard Perusahaan - Profabel" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header: Title & Centralized Time Filter (Calendar Range + Dropdown Presets) */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                            Halaman ini membantu perusahaan memantau aktivitas rekrutmen dan pengelolaan lowongan pekerjaan secara realtime.
                        </p>
                    </div>

                    {/* Centralized Time Filter matching Admin */}
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
                                aria-label="Filter dengan rentang kalender"
                            >
                                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                            </button>

                            {/* Dropdown Menu (Triggers 5 Preset Options) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-10 items-center gap-2.5 rounded-r-xl px-4 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
                                    >
                                        <span className={isCalendarActive ? 'text-[#1769E0]' : 'text-slate-700'}>
                                            {activePeriodLabel}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
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
                                                className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm transition ${
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

                {/* Calendar Range Filter Dialog */}
                <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
                    <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#102B4B]">
                                Pilih Rentang Tanggal Kalender
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Tentukan tanggal mulai dan selesai untuk memfilter statistik aktivitas rekrutmen perusahaan.
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

                {/* Row 1: 4 Metric Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Lowongan Aktif */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F8F0] text-[#10B981]">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500">Lowongan Aktif</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-[#102B4B]">
                                        {stats.active_vacancies}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-xs font-bold text-[#10B981]">
                                        ↑ {stats.active_vacancies_growth}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">Dari periode sebelumnya</p>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-left">
                                <div>
                                    <span className="text-[11px] text-slate-400">Total Lowongan</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.total_vacancies}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400">Draft</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.draft_vacancies}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Kandidat Masuk */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FE] text-[#1769E0]">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500">Kandidat Masuk</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-[#102B4B]">
                                        {stats.total_candidates.toLocaleString('id-ID')}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-xs font-bold text-[#10B981]">
                                        ↑ {stats.candidates_growth}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">Dari periode sebelumnya</p>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-left">
                                <div>
                                    <span className="text-[11px] text-slate-400">Kandidat Terverifikasi</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">
                                        {stats.verified_candidates.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400">Belum Verifikasi</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">
                                        {stats.unverified_candidates}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Lamaran Baru */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3EFFE] text-[#7C3AED]">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500">Lamaran Baru</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-[#102B4B]">
                                        {stats.new_applications}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-xs font-bold text-[#10B981]">
                                        ↑ {stats.new_applications_growth}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">Dari periode sebelumnya</p>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-left">
                                <div>
                                    <span className="text-[11px] text-slate-400">Perlu Ditinjau</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.need_review}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400">Sudah Ditinjau</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.reviewed}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Proses Rekrutmen */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEF7EC] text-[#F59E0B]">
                                <GitFork className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500">Proses Rekrutmen</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-[#102B4B]">
                                        {stats.recruitment_process}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-xs font-bold text-[#10B981]">
                                        ↑ {stats.recruitment_growth}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">Dari periode sebelumnya</p>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-left">
                                <div>
                                    <span className="text-[11px] text-slate-400">Interview</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.interview}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400">Dalam Proses Lainnya</span>
                                    <p className="text-sm font-extrabold text-[#102B4B]">{stats.other_process}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Charts (Tren Lamaran Masuk & Distribusi Status Lamaran) */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Left: Tren Lamaran Masuk (col-span-7) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-base font-bold text-[#102B4B]">Tren Lamaran Masuk</h2>
                                <Info className="h-4 w-4 text-slate-400" />
                            </div>

                            {/* Filter Tahun HANYA MUNCUL saat SEMUA PERIODE */}
                            {showYearFilterInTrends ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
                                        >
                                            <span>Tahun {activeYear}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32 rounded-xl bg-white p-1 shadow-lg border border-slate-100">
                                        {yearChoices.map((yr) => (
                                            <DropdownMenuItem
                                                key={yr}
                                                onClick={() => selectTrendYear(yr)}
                                                className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                                    activeYear === yr
                                                        ? 'bg-blue-50 text-[#1769E0]'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                Tahun {yr}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                    Periode: {activePeriodLabel}
                                </span>
                            )}
                        </div>

                        {/* Legends */}
                        <div className="mt-3 flex items-center gap-5 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />
                                <span className="font-medium text-slate-600">Lamaran Masuk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                                <span className="font-medium text-slate-600">Kandidat Unik</span>
                            </div>
                        </div>

                        {/* SVG Line Chart (Flexible & Readable) */}
                        <div className="mt-6 w-full overflow-x-auto">
                            <div className="min-w-[500px]">
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    className="w-full overflow-visible"
                                >
                                    <defs>
                                        <linearGradient id="companyBlueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#1769E0" stopOpacity="0.16" />
                                            <stop offset="100%" stopColor="#1769E0" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal grid lines & dynamic Y tick labels */}
                                    {yTicks.map((val) => {
                                        const y = getY(val);
                                        return (
                                            <g key={val}>
                                                <line
                                                    x1={paddingLeft}
                                                    y1={y}
                                                    x2={chartWidth - paddingRight}
                                                    y2={y}
                                                    stroke="#F1F5F9"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={paddingLeft - 10}
                                                    y={y + 3.5}
                                                    textAnchor="end"
                                                    fontSize="10"
                                                    fill="#94A3B8"
                                                    fontWeight="500"
                                                >
                                                    {val}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Gradient Area under blue curve */}
                                    {appAreaPoints && (
                                        <polygon points={appAreaPoints} fill="url(#companyBlueGrad)" />
                                    )}

                                    {/* Blue Line (Lamaran Masuk) */}
                                    {appPoints && (
                                        <polyline
                                            fill="none"
                                            stroke="#1769E0"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={appPoints}
                                        />
                                    )}

                                    {/* Green Line (Kandidat Unik) */}
                                    {candidatePoints && (
                                        <polyline
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={candidatePoints}
                                        />
                                    )}

                                    {/* Data Points and X labels */}
                                    {trends.map((t, i) => {
                                        const x = getX(i);
                                        const yApp = getY(t.applications);
                                        const yCand = getY(t.unique_candidates);
                                        const isHovered = hoveredTrendIndex === i;

                                        return (
                                            <g
                                                key={t.month + i}
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredTrendIndex(i)}
                                                onMouseLeave={() => setHoveredTrendIndex(null)}
                                            >
                                                {/* Vertical guide line on hover */}
                                                {isHovered && (
                                                    <line
                                                        x1={x}
                                                        y1={paddingTop}
                                                        x2={x}
                                                        y2={paddingTop + plotHeight}
                                                        stroke="#CBD5E1"
                                                        strokeWidth="1"
                                                        strokeDasharray="3 3"
                                                    />
                                                )}

                                                {/* Blue Point */}
                                                <circle
                                                    cx={x}
                                                    cy={yApp}
                                                    r={isHovered ? 5.5 : 3.5}
                                                    fill="#FFFFFF"
                                                    stroke="#1769E0"
                                                    strokeWidth={isHovered ? 3 : 2.5}
                                                    className="transition-all"
                                                />

                                                {/* Green Point */}
                                                <circle
                                                    cx={x}
                                                    cy={yCand}
                                                    r={isHovered ? 5.5 : 3.5}
                                                    fill="#FFFFFF"
                                                    stroke="#10B981"
                                                    strokeWidth={isHovered ? 3 : 2.5}
                                                    className="transition-all"
                                                />

                                                {/* X Month/Day Label */}
                                                <text
                                                    x={x}
                                                    y={chartHeight - 8}
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fill={isHovered ? '#102B4B' : '#64748B'}
                                                    fontWeight={isHovered ? '700' : '500'}
                                                >
                                                    {t.month}
                                                </text>

                                                {/* Hover Tooltip Box */}
                                                {isHovered && (
                                                    <g transform={`translate(${Math.min(Math.max(x - 55, 10), chartWidth - 120)}, ${Math.max(yApp - 50, 5)})`}>
                                                        <rect
                                                            width="110"
                                                            height="44"
                                                            rx="6"
                                                            fill="#101B4D"
                                                            opacity="0.95"
                                                        />
                                                        <text x="8" y="16" fill="#93C5FD" fontSize="9.5" fontWeight="600">
                                                            {t.month} {showYearFilterInTrends ? activeYear : ''}
                                                        </text>
                                                        <text x="8" y="28" fill="#FFFFFF" fontSize="9" fontWeight="500">
                                                            Lamaran: {t.applications}
                                                        </text>
                                                        <text x="8" y="39" fill="#86EFAC" fontSize="9" fontWeight="500">
                                                            Kandidat: {t.unique_candidates}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right: Distribusi Status Lamaran (col-span-5) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-base font-bold text-[#102B4B]">Distribusi Status Lamaran</h2>
                                    <Info className="h-4 w-4 text-slate-400" />
                                </div>

                                {/* Filter per Lowongan */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex max-w-[170px] items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 truncate"
                                        >
                                            <span className="truncate">{selectedVacancyTitle}</span>
                                            <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 max-h-60 overflow-y-auto rounded-xl bg-white p-1 shadow-lg border border-slate-100">
                                        <DropdownMenuItem
                                            onClick={() => selectVacancyFilter('all')}
                                            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                                !filters.vacancy_id || filters.vacancy_id === 'all'
                                                    ? 'bg-blue-50 text-[#1769E0]'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            Semua Lowongan
                                        </DropdownMenuItem>
                                        {vacancyOptions.map((v) => (
                                            <DropdownMenuItem
                                                key={v.id}
                                                onClick={() => selectVacancyFilter(v.id)}
                                                className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold truncate ${
                                                    String(filters.vacancy_id) === String(v.id)
                                                        ? 'bg-blue-50 text-[#1769E0]'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                {v.title}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Donut Chart & Legend Side-by-Side */}
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                                {/* SVG Donut */}
                                <div className="relative flex shrink-0 items-center justify-center">
                                    <svg width="180" height="180" viewBox="0 0 180 180">
                                        {renderDonutSlices(statusDistribution, 62, 22, 90, 90)}
                                    </svg>
                                    <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-xl font-extrabold text-[#102B4B]">
                                            {statusDistribution.reduce((acc, curr) => acc + curr.count, 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            Total Lamaran
                                        </span>
                                    </div>
                                </div>

                                {/* Status Legend List */}
                                <div className="w-full sm:w-auto flex-1 space-y-2.5 text-xs">
                                    {statusDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="font-semibold text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="font-extrabold text-[#102B4B]">
                                                {item.count} <span className="font-medium text-slate-400">({item.percentage}%)</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom link to applications */}
                        <div className="mt-4 border-t border-slate-100 pt-3 text-right">
                            <Link
                                href="/company/applications"
                                className="text-xs font-bold text-[#1769E0] hover:underline"
                            >
                                Kelola Seluruh Lamaran →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Row 3: 3 Bottom Widgets (Grid 3 cols) */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {/* Widget 1: Lowongan Berdasarkan Kategori */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-sm font-bold text-[#102B4B]">Lowongan Berdasarkan Kategori</h2>
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                            </div>

                            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                {showYearFilterInTrends ? `Tahun ${activeYear}` : activePeriodLabel}
                            </span>
                        </div>

                        <div className="mt-5 space-y-4">
                            {categoryBreakdown.map((item) => {
                                const renderIcon = () => {
                                    switch (item.icon) {
                                        case 'monitor':
                                            return <Monitor className="h-4 w-4" />;
                                        case 'code':
                                            return <Code2 className="h-4 w-4" />;
                                        case 'user':
                                            return <User className="h-4 w-4" />;
                                        case 'megaphone':
                                            return <Megaphone className="h-4 w-4" />;
                                        default:
                                            return <MoreHorizontal className="h-4 w-4" />;
                                    }
                                };

                                return (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                        >
                                            {renderIcon()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                                                <span className="font-extrabold text-[#102B4B] ml-2">{item.count}</span>
                                            </div>
                                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, (item.count / Math.max(1, item.max)) * 100)}%`,
                                                        backgroundColor: item.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Widget 2: Status Lowongan */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-sm font-bold text-[#102B4B]">Status Lowongan</h2>
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                            </div>

                            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
                                {/* SVG Donut */}
                                <div className="relative flex shrink-0 items-center justify-center">
                                    <svg width="150" height="150" viewBox="0 0 150 150">
                                        {renderDonutSlices(vacancyStatus, 50, 18, 75, 75)}
                                    </svg>
                                    <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-xl font-extrabold text-[#102B4B]">
                                            {vacancyStatus.reduce((acc, curr) => acc + curr.count, 0)}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            Total Lowongan
                                        </span>
                                    </div>
                                </div>

                                {/* Status Legend List */}
                                <div className="space-y-3 text-xs w-full sm:w-auto">
                                    {vacancyStatus.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between sm:justify-start gap-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="font-semibold text-slate-700">{item.label}</span>
                                            </div>
                                            <span className="font-extrabold text-[#102B4B]">
                                                {item.count} <span className="font-medium text-slate-400">({item.percentage}%)</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3 text-right">
                            <Link
                                href="/company/vacancies"
                                className="text-xs font-bold text-[#1769E0] hover:underline"
                            >
                                Kelola Lowongan →
                            </Link>
                        </div>
                    </div>

                    {/* Widget 3: Aktivitas Terbaru */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-[#102B4B]">Aktivitas Terbaru</h2>
                                <Link
                                    href="/company/applications"
                                    className="text-xs font-bold text-[#1769E0] hover:underline"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {recentActivities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-slate-700">Belum Ada Aktivitas</p>
                                    <p className="mt-0.5 text-[11px] text-slate-400">Tidak ada lamaran masuk pada periode ini.</p>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-3.5">
                                    {recentActivities.map((act) => {
                                        const renderActivityIcon = () => {
                                            switch (act.icon) {
                                                case 'file':
                                                    return <FileText className="h-4 w-4" />;
                                                case 'briefcase':
                                                    return <Briefcase className="h-4 w-4" />;
                                                case 'user':
                                                    return <Users className="h-4 w-4" />;
                                                case 'check':
                                                    return <CheckCircle2 className="h-4 w-4" />;
                                                default:
                                                    return <FileText className="h-4 w-4" />;
                                            }
                                        };

                                        return (
                                            <div key={act.id} className="flex items-start gap-3">
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
                                                    style={{ backgroundColor: act.bgColor, color: act.color }}
                                                >
                                                    {renderActivityIcon()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium leading-snug text-slate-800 line-clamp-2">
                                                        {act.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-slate-400 font-medium">
                                                        {act.time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                            <Link
                                href="/company/vacancies/create"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1258c2] transition"
                            >
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>Pasang Lowongan Baru</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
