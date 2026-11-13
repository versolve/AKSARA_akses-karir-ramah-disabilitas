import { Head, Link, router } from '@inertiajs/react';
import {
    Accessibility,
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    Check,
    ChevronDown,
    Download,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState, type ReactElement } from 'react';
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
import AdminLayout from '@/layouts/admin-layout';
import { TabAksesibilitas } from './components/TabAksesibilitas';
import { TabLowongan } from './components/TabLowongan';
import { TabPengguna } from './components/TabPengguna';
import { TabPenempatan } from './components/TabPenempatan';
import { TabPerusahaan } from './components/TabPerusahaan';
import { TabRingkasan } from './components/TabRingkasan';

type TabKey = 'summary' | 'users' | 'companies' | 'vacancies' | 'placements' | 'accessibility';

interface Filters {
    from: string;
    to: string;
    period?: string;
    tab: TabKey;
    year?: number;
    is_all_period?: boolean;
    available_years?: number[];
}

interface Props {
    filters: Filters;
    summary: any;
    users: any;
    companies: any;
    vacancies: any;
    placements: any;
    accessibility: any;
}

const tabItems: Array<{ key: TabKey; label: string; icon: typeof BarChart3 }> = [
    { key: 'summary', label: 'Ringkasan', icon: BarChart3 },
    { key: 'users', label: 'Pengguna', icon: Users },
    { key: 'companies', label: 'Perusahaan', icon: Building2 },
    { key: 'vacancies', label: 'Lowongan', icon: Briefcase },
    { key: 'placements', label: 'Penempatan Kerja', icon: TrendingUp },
    { key: 'accessibility', label: 'Inklusi & Aksesibilitas', icon: Accessibility },
];

const periodPresetOptions = [
    { label: 'Semua Periode', value: 'all' },
    { label: 'Tahun Ini (2026)', value: 'this_year' },
    { label: 'Bulan Ini', value: 'this_month' },
    { label: '30 Hari Terakhir', value: 'last_30_days' },
    { label: '7 Hari Terakhir', value: 'last_7_days' },
];

export default function BusinessIntelligencePage({
    filters,
    summary,
    users,
    companies,
    vacancies,
    placements,
    accessibility,
}: Props): ReactElement {
    const currentTab = filters.tab || 'summary';
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [startDate, setStartDate] = useState(filters.from || '');
    const [endDate, setEndDate] = useState(filters.to || '');

    const isCalendarActive = !filters.period && Boolean(filters.from && filters.to);

    const activePresetLabel = isCalendarActive
        ? `${filters.from} - ${filters.to}`
        : periodPresetOptions.find((p) => p.value === filters.period)?.label || 'Tahun Ini (2026)';

    const handleSelectPreset = (presetValue: string) => {
        router.get(
            '/admin/reports',
            {
                tab: currentTab,
                period: presetValue,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleApplyCalendar = () => {
        if (!startDate || !endDate) return;
        setIsCalendarOpen(false);
        router.get(
            '/admin/reports',
            {
                tab: currentTab,
                from: startDate,
                to: endDate,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const exportUrl = `/admin/reports/export?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(
        filters.to
    )}&tab=${currentTab}`;

    return (
        <AdminLayout>
            <Head title="Business Intelligence - AKSARA Admin" />

            <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px] space-y-6">
                    {/* Top Header */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#101B4D] sm:text-3xl">
                                Business Intelligence
                            </h1>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Analisis data dan tren platform AKSARA untuk mendukung pengambilan keputusan strategis.
                            </p>
                        </div>

                        {/* Top Filters & Export Action */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Unified Filter Widget */}
                            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                {/* Calendar Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsCalendarOpen(true)}
                                    title="Pilih rentang tanggal kalender kustom"
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                        isCalendarActive
                                            ? 'bg-[#1769E0] text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    <Calendar className="h-4 w-4" />
                                </button>

                                <div className="mx-1 h-5 w-[1px] bg-slate-200" />

                                {/* Preset Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#101B4D] transition hover:bg-slate-50"
                                        >
                                            <span>{activePresetLabel}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-xl">
                                        {periodPresetOptions.map((opt) => {
                                            const isSelected = !isCalendarActive && (filters.period || 'this_year') === opt.value;
                                            return (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    onClick={() => handleSelectPreset(opt.value)}
                                                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold"
                                                >
                                                    <span className={isSelected ? 'font-bold text-[#1769E0]' : 'text-slate-700'}>
                                                        {opt.label}
                                                    </span>
                                                    {isSelected && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Export CSV Button */}
                            <a
                                href={exportUrl}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1769E0] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#1254B5]"
                            >
                                <Download className="h-4 w-4" />
                                <span>Ekspor Laporan</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Tabs Bar */}
                    <div className="flex overflow-x-auto rounded-2xl border border-[#E2EAF3] bg-white p-1.5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                        {tabItems.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = currentTab === tab.key;
                            const queryParams = new URLSearchParams();
                            queryParams.set('tab', tab.key);
                            if (filters.period) {
                                queryParams.set('period', filters.period);
                            } else if (filters.from && filters.to) {
                                queryParams.set('from', filters.from);
                                queryParams.set('to', filters.to);
                            }

                            return (
                                <Link
                                    key={tab.key}
                                    href={`/admin/reports?${queryParams.toString()}`}
                                    prefetch
                                    className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition sm:flex-1 ${
                                        isActive
                                            ? 'bg-[#EBF5FA] text-[#1769E0] shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Active Tab Content */}
                    <div>
                        {currentTab === 'summary' && <TabRingkasan summary={summary} />}
                        {currentTab === 'users' && <TabPengguna users={users} />}
                        {currentTab === 'companies' && <TabPerusahaan companies={companies} />}
                        {currentTab === 'vacancies' && <TabLowongan vacancies={vacancies} />}
                        {currentTab === 'placements' && <TabPenempatan placements={placements} />}
                        {currentTab === 'accessibility' && <TabAksesibilitas accessibility={accessibility} />}
                    </div>
                </div>

                {/* Calendar Range Picker Modal */}
                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-[#101B4D]">
                                Pilih Rentang Waktu Kalender
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Tentukan tanggal awal dan akhir untuk menganalisis data platform AKSARA.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-2">
                            <div className="space-y-1.5">
                                <label htmlFor="start-date" className="text-xs font-bold text-slate-600">
                                    Tanggal Mulai
                                </label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="end-date" className="text-xs font-bold text-slate-600">
                                    Tanggal Selesai
                                </label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCalendarOpen(false)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApplyCalendar}
                                className="bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
                            >
                                Terapkan Filter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </AdminLayout>
    );
}
