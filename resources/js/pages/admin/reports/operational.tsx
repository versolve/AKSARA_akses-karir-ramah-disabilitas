import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
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
import {
    AlertCircle,
    AlertTriangle,
    Archive,
    Briefcase,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    Globe,
    KeyRound,
    MapPin,
    MoreVertical,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    UserX,
    XCircle,
} from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface TabData {
    total?: number;
    growth_total?: number;
    active?: number;
    growth_active?: number;
    complete?: number;
    growth_complete?: number;
    needs_review?: number;
    growth_needs_review?: number;
    verified?: number;
    growth_verified?: number;
    pending?: number;
    growth_pending?: number;
    closed?: number;
    growth_closed?: number;
    rejected?: number;
    growth_rejected?: number;
    in_progress?: number;
    growth_in_progress?: number;
    interview?: number;
    growth_interview?: number;
    hired?: number;
    growth_hired?: number;
    data: any[];
    links: Array<PaginationLinks>;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface Options {
    domiciles?: string[];
    industries?: string[];
    locations?: string[];
    companies?: string[];
}

interface Filters {
    tab: string;
    from: string;
    to: string;
    period?: string;
    status?: string;
    completeness?: string;
    domicile?: string;
    industry?: string;
    location?: string;
    company?: string;
    process_status?: string;
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

const periodPresetOptions = [
    { label: 'Semua Periode', value: 'all' },
    { label: 'Tahun Ini (2026)', value: 'this_year' },
    { label: 'Bulan Ini', value: 'this_month' },
    { label: '30 Hari Terakhir', value: 'last_30_days' },
    { label: '7 Hari Terakhir', value: 'last_7_days' },
];

function initials(name: string): string {
    if (!name) return 'AK';
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function formatDateDisplay(dateString?: string): string {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export default function ReportingIndex({
    filters,
    options,
    users,
    companies,
    vacancies,
    applications,
}: Props): ReactElement {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Period Filter State
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [startDate, setStartDate] = useState(filters.from || '');
    const [endDate, setEndDate] = useState(filters.to || '');

    useEffect(() => {
        setStartDate(filters.from || '');
        setEndDate(filters.to || '');
    }, [filters.from, filters.to]);

    const isCalendarActive = !filters.period && Boolean(filters.from && filters.to);

    const activePeriodLabel = isCalendarActive
        ? `${formatDateDisplay(filters.from)} - ${formatDateDisplay(filters.to)}`
        : periodPresetOptions.find((p) => p.value === filters.period)?.label || 'Tahun Ini (2026)';

    // Lifecycle Action & Detail Modals
    const [actionUser, setActionUser] = useState<any | null>(null);
    const [actionType, setActionType] = useState<'deactivate' | 'activate' | 'destroy' | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorBag, setErrorBag] = useState<Record<string, string>>({});
    const [detailUser, setDetailUser] = useState<any | null>(null);
    const [detailCompany, setDetailCompany] = useState<any | null>(null);

    const handleToggleCompanyVerification = (company: any, isApproved: boolean) => {
        router.post(
            `/admin/companies/${company.id}/verify`,
            { is_approved: isApproved },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (detailCompany?.id === company.id) {
                        setDetailCompany((prev: any) =>
                            prev ? { ...prev, is_approved: isApproved } : null
                        );
                    }
                },
            }
        );
    };

    const closeActionModal = () => {
        setActionType(null);
        setActionUser(null);
        setCurrentPassword('');
        setErrorBag({});
        setIsSubmitting(false);
    };

    const submitAction = () => {
        if (!actionUser || !actionType || !currentPassword) return;
        setIsSubmitting(true);
        setErrorBag({});
        const url = `/admin/users/${actionUser.id}`;
        const data = { current_password: currentPassword };
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                closeActionModal();
            },
            onError: (errors: Record<string, string>) => {
                setErrorBag(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        };

        if (actionType === 'destroy') {
            router.delete(url, { ...options, data });
        } else {
            router.post(`${url}/${actionType}`, data, options);
        }
    };

    const tabs = [
        { id: 'users', label: 'Laporan Pengguna' },
        { id: 'companies', label: 'Laporan Perusahaan' },
        { id: 'vacancies', label: 'Laporan Lowongan' },
        { id: 'applications', label: 'Laporan Lamaran' },
    ];

    const currentTab = filters.tab || 'users';

    const getActiveData = (): TabData => {
        switch (currentTab) {
            case 'users':
                return users || { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
            case 'companies':
                return companies || { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
            case 'vacancies':
                return vacancies || { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
            case 'applications':
                return applications || { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
            default:
                return { data: [], links: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
        }
    };

    const activeData = getActiveData();

    const applyFilter = (newFilters: Partial<Filters>) => {
        const queryParams: Record<string, string | undefined> = {
            tab: currentTab,
            period: newFilters.period !== undefined ? newFilters.period : (newFilters.from ? undefined : filters.period),
            from: newFilters.from !== undefined ? newFilters.from : (newFilters.period ? undefined : filters.from),
            to: newFilters.to !== undefined ? newFilters.to : (newFilters.period ? undefined : filters.to),
            status: filters.status,
            completeness: filters.completeness,
            domicile: filters.domicile,
            industry: filters.industry,
            location: filters.location,
            company: filters.company,
            process_status: filters.process_status,
            search: searchQuery || undefined,
            ...newFilters,
        };

        if (queryParams.period) {
            delete queryParams.from;
            delete queryParams.to;
        } else if (queryParams.from && queryParams.to) {
            delete queryParams.period;
        }

        // Remove empty values
        Object.keys(queryParams).forEach((k) => {
            if (!queryParams[k]) {
                delete queryParams[k];
            }
        });

        router.get('/admin/reporting', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSelectPreset = (presetValue: string) => {
        applyFilter({ period: presetValue, from: '', to: '' });
    };

    const handleApplyCalendar = () => {
        if (!startDate || !endDate) return;
        setIsCalendarOpen(false);
        applyFilter({ from: startDate, to: endDate, period: '' });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search: searchQuery });
    };

    const handleTabChange = (tabId: string) => {
        const queryParams: Record<string, string | undefined> = { tab: tabId };
        if (filters.period) {
            queryParams.period = filters.period;
        } else if (filters.from && filters.to) {
            queryParams.from = filters.from;
            queryParams.to = filters.to;
        }
        router.get('/admin/reporting', queryParams, { preserveState: false });
    };

    const handleExportPdf = () => {
        window.print();
    };

    // Card Header details
    const getCardHeader = () => {
        switch (currentTab) {
            case 'users':
                return {
                    title: 'Laporan Pengguna',
                    subtitle: 'Data seluruh pelamar yang terdaftar di platform.',
                };
            case 'companies':
                return {
                    title: 'Laporan Perusahaan',
                    subtitle: 'Data seluruh perusahaan yang terdaftar di platform.',
                };
            case 'vacancies':
                return {
                    title: 'Laporan Lowongan',
                    subtitle: 'Data seluruh lowongan kerja yang dipublikasikan oleh perusahaan di platform.',
                };
            case 'applications':
                return {
                    title: 'Laporan Lamaran',
                    subtitle: 'Data seluruh lamaran yang masuk pada lowongan di platform.',
                };
            default:
                return {
                    title: 'Laporan Operasional',
                    subtitle: 'Data hasil operasional platform.',
                };
        }
    };

    const cardHeader = getCardHeader();

    // Summary metrics per tab
    const renderSummaryCards = () => {
        if (currentTab === 'users') {
            const cards = [
                {
                    label: 'Total Pengguna',
                    value: activeData.total ?? 0,
                    growth: activeData.growth_total ?? 12,
                    icon: Users,
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-[#1769E0]',
                },
                {
                    label: 'Akun Aktif',
                    value: activeData.active ?? 0,
                    growth: activeData.growth_active ?? 16,
                    icon: UserCheck,
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                },
                {
                    label: 'Profil Lengkap',
                    value: activeData.complete ?? 0,
                    growth: activeData.growth_complete ?? 14,
                    icon: FileCheck,
                    iconBg: 'bg-purple-50',
                    iconColor: 'text-purple-600',
                },
                {
                    label: 'Butuh Tinjauan',
                    value: activeData.needs_review ?? 0,
                    growth: activeData.growth_needs_review ?? 8,
                    icon: AlertCircle,
                    iconBg: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                },
            ];

            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((c) => (
                        <div
                            key={c.label}
                            className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-[#FBFDFF] p-4.5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                                <c.icon className={`h-6 w-6 ${c.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-500">{c.label}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black text-[#101B4D]">
                                        {numberFormat.format(c.value)}
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            c.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}
                                    >
                                        {c.growth >= 0 ? '↑' : '↓'} {Math.abs(c.growth)}%
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[11px] text-slate-400 font-medium">
                                    Dibanding periode sebelumnya
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (currentTab === 'companies') {
            const cards = [
                {
                    label: 'Total Perusahaan',
                    value: activeData.total ?? 0,
                    growth: activeData.growth_total ?? 12,
                    icon: Building2,
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-[#1769E0]',
                },
                {
                    label: 'Terverifikasi',
                    value: activeData.verified ?? 0,
                    growth: activeData.growth_verified ?? 18,
                    icon: CheckCircle2,
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                },
                {
                    label: 'Menunggu Verifikasi',
                    value: activeData.pending ?? 0,
                    growth: activeData.growth_pending ?? 25,
                    icon: Clock,
                    iconBg: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                },
                {
                    label: 'Ditolak',
                    value: activeData.rejected ?? 0,
                    growth: activeData.growth_rejected ?? -12,
                    icon: XCircle,
                    iconBg: 'bg-rose-50',
                    iconColor: 'text-rose-600',
                },
            ];

            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((c) => (
                        <div
                            key={c.label}
                            className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-[#FBFDFF] p-4.5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                                <c.icon className={`h-6 w-6 ${c.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-500">{c.label}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black text-[#101B4D]">
                                        {numberFormat.format(c.value)}
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            c.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}
                                    >
                                        {c.growth >= 0 ? '↑' : '↓'} {Math.abs(c.growth)}%
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[11px] text-slate-400 font-medium">
                                    Dibanding periode sebelumnya
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (currentTab === 'vacancies') {
            const cards = [
                {
                    label: 'Total Lowongan',
                    value: activeData.total ?? 0,
                    growth: activeData.growth_total ?? 12,
                    icon: Briefcase,
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-[#1769E0]',
                },
                {
                    label: 'Lowongan Aktif',
                    value: activeData.active ?? 0,
                    growth: activeData.growth_active ?? 15,
                    icon: CheckCircle2,
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                },
                {
                    label: 'Menunggu Review',
                    value: activeData.pending ?? 0,
                    growth: activeData.growth_pending ?? 28,
                    icon: Clock,
                    iconBg: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                },
                {
                    label: 'Lowongan Ditutup',
                    value: activeData.closed ?? 0,
                    growth: activeData.growth_closed ?? -5,
                    icon: Archive,
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-600',
                },
                {
                    label: 'Lowongan Ditolak',
                    value: activeData.rejected ?? 0,
                    growth: activeData.growth_rejected ?? -12,
                    icon: XCircle,
                    iconBg: 'bg-rose-50',
                    iconColor: 'text-rose-600',
                },
            ];

            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {cards.map((c) => (
                        <div
                            key={c.label}
                            className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-[#FBFDFF] p-4.5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]"
                        >
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                                <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-500">{c.label}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black text-[#101B4D]">
                                        {numberFormat.format(c.value)}
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            c.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}
                                    >
                                        {c.growth >= 0 ? '↑' : '↓'} {Math.abs(c.growth)}%
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-slate-400 font-medium">
                                    Dibanding periode sebelumnya
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Lamaran
        const cards = [
            {
                label: 'Total Lamaran',
                value: activeData.total ?? 0,
                growth: activeData.growth_total ?? 18,
                icon: FileText,
                iconBg: 'bg-blue-50',
                iconColor: 'text-[#1769E0]',
            },
            {
                label: 'Dalam Proses',
                value: activeData.in_progress ?? 0,
                growth: activeData.growth_in_progress ?? 12,
                icon: CheckCircle2,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
            },
            {
                label: 'Dipanggil Interview',
                value: activeData.interview ?? 0,
                growth: activeData.growth_interview ?? 25,
                icon: Clock,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
            },
            {
                label: 'Diterima',
                value: activeData.hired ?? 0,
                growth: activeData.growth_hired ?? -30,
                icon: Users,
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
            },
            {
                label: 'Ditolak',
                value: activeData.rejected ?? 0,
                growth: activeData.growth_rejected ?? -10,
                icon: XCircle,
                iconBg: 'bg-rose-50',
                iconColor: 'text-rose-600',
            },
        ];

        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {cards.map((c) => (
                    <div
                        key={c.label}
                        className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-[#FBFDFF] p-4.5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]"
                    >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                            <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-500">{c.label}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-xl sm:text-2xl font-black text-[#101B4D]">
                                    {numberFormat.format(c.value)}
                                </span>
                                <span
                                    className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        c.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}
                                >
                                    {c.growth >= 0 ? '↑' : '↓'} {Math.abs(c.growth)}%
                                </span>
                            </div>
                            <p className="mt-1 truncate text-[10px] text-slate-400 font-medium">
                                Dibanding periode sebelumnya
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Filter Bar per tab
    const renderFilterBar = () => {
        return (
            <div className="flex flex-wrap items-end gap-3 pt-1">
                {/* Periode */}
                <div className="flex flex-col space-y-1.5 min-w-[240px]">
                    <span className="text-xs font-semibold text-slate-600">Periode</span>
                    <div className="flex h-10.5 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        {/* 1 Calendar Icon Button */}
                        <button
                            type="button"
                            onClick={() => setIsCalendarOpen(true)}
                            title="Pilih rentang tanggal kalender kustom"
                            className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg transition ${
                                isCalendarActive
                                    ? 'bg-[#1769E0] text-white shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                        </button>

                        <div className="mx-1 h-5 w-[1px] bg-slate-200 shrink-0" />

                        {/* Preset Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex flex-1 h-8.5 items-center justify-between gap-2 rounded-lg px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition min-w-0"
                                >
                                    <span className="truncate font-semibold text-[#101B4D]">
                                        {activePeriodLabel}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="bottom" sideOffset={6} className="w-52 rounded-xl p-1.5 shadow-xl">
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
                </div>

                {/* Dropdown 1 */}
                {currentTab === 'users' && (
                    <div className="flex flex-col space-y-1.5 min-w-[140px]">
                        <span className="text-xs font-semibold text-slate-600">Status Akun</span>
                        <select
                            aria-label="Filter status akun"
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter({ status: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                )}
                {currentTab === 'companies' && (
                    <div className="flex flex-col space-y-1.5 min-w-[150px]">
                        <span className="text-xs font-semibold text-slate-600">Status Verifikasi</span>
                        <select
                            aria-label="Filter status verifikasi"
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter({ status: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="verified">Terverifikasi</option>
                            <option value="pending">Menunggu Verifikasi</option>
                        </select>
                    </div>
                )}
                {currentTab === 'vacancies' && (
                    <div className="flex flex-col space-y-1.5 min-w-[140px]">
                        <span className="text-xs font-semibold text-slate-600">Status Lowongan</span>
                        <select
                            aria-label="Filter status lowongan"
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter({ status: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="active">Aktif</option>
                            <option value="draft">Menunggu Review</option>
                            <option value="closed">Ditutup</option>
                        </select>
                    </div>
                )}
                {currentTab === 'applications' && (
                    <div className="flex flex-col space-y-1.5 min-w-[140px]">
                        <span className="text-xs font-semibold text-slate-600">Status Lamaran</span>
                        <select
                            aria-label="Filter status lamaran"
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter({ status: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="in_progress">Dalam Proses</option>
                            <option value="interview">Dipanggil Interview</option>
                            <option value="hired">Diterima</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                )}

                {/* Dropdown 2 */}
                {currentTab === 'users' && (
                    <div className="flex flex-col space-y-1.5 min-w-[150px]">
                        <span className="text-xs font-semibold text-slate-600">Kelengkapan Profil</span>
                        <select
                            aria-label="Filter kelengkapan profil"
                            value={filters.completeness ?? ''}
                            onChange={(e) => applyFilter({ completeness: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="complete">Lengkap</option>
                            <option value="incomplete">Perlu Dilengkapi</option>
                        </select>
                    </div>
                )}
                {(currentTab === 'companies' || currentTab === 'vacancies') && (
                    <div className="flex flex-col space-y-1.5 min-w-[150px]">
                        <span className="text-xs font-semibold text-slate-600">Industri</span>
                        <select
                            aria-label="Filter industri"
                            value={filters.industry ?? ''}
                            onChange={(e) => applyFilter({ industry: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            {(options.industries ?? []).map((ind) => (
                                <option key={ind} value={ind}>
                                    {ind}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {currentTab === 'applications' && (
                    <div className="flex flex-col space-y-1.5 min-w-[150px]">
                        <span className="text-xs font-semibold text-slate-600">Status Proses</span>
                        <select
                            aria-label="Filter status proses"
                            value={filters.process_status ?? ''}
                            onChange={(e) => applyFilter({ process_status: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            <option value="screening">Screening CV</option>
                            <option value="review">Review HR</option>
                            <option value="interview">Interview HR</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Tidak Lulus</option>
                        </select>
                    </div>
                )}

                {/* Dropdown 3 */}
                {currentTab === 'users' && (
                    <div className="flex flex-col space-y-1.5 min-w-[140px]">
                        <span className="text-xs font-semibold text-slate-600">Domisili</span>
                        <select
                            aria-label="Filter domisili"
                            value={filters.domicile ?? ''}
                            onChange={(e) => applyFilter({ domicile: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            {(options.domiciles ?? []).map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {(currentTab === 'companies' || currentTab === 'vacancies') && (
                    <div className="flex flex-col space-y-1.5 min-w-[140px]">
                        <span className="text-xs font-semibold text-slate-600">Lokasi</span>
                        <select
                            aria-label="Filter lokasi"
                            value={filters.location ?? ''}
                            onChange={(e) => applyFilter({ location: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            {(options.locations ?? []).map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {currentTab === 'applications' && (
                    <div className="flex flex-col space-y-1.5 min-w-[150px]">
                        <span className="text-xs font-semibold text-slate-600">Perusahaan</span>
                        <select
                            aria-label="Filter perusahaan"
                            value={filters.company ?? ''}
                            onChange={(e) => applyFilter({ company: e.target.value })}
                            className="h-10.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0] shadow-sm"
                        >
                            <option value="">Semua</option>
                            {(options.companies ?? []).map((comp) => (
                                <option key={comp} value={comp}>
                                    {comp}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                currentTab === 'users'
                                    ? 'Cari nama pengguna...'
                                    : currentTab === 'companies'
                                    ? 'Cari nama perusahaan...'
                                    : currentTab === 'vacancies'
                                    ? 'Cari judul lowongan atau nama perusahaan...'
                                    : 'Cari nama pelamar, judul lowongan...'
                            }
                            className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-[#1769E0] shadow-sm"
                        />
                    </div>
                </form>
            </div>
        );
    };

    // Table Content per tab
    const renderTable = () => {
        const dataItems = activeData.data ?? [];
        const currentPage = activeData.pagination?.current_page ?? 1;
        const perPage = activeData.pagination?.per_page ?? 10;

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        {/* Table Head */}
                        <thead className="bg-[#F8FBFF] border-b border-slate-100 text-[11px] font-extrabold text-slate-600">
                            {currentTab === 'users' && (
                                <tr>
                                    <th className="px-5 py-4 w-12 text-slate-500">No</th>
                                    <th className="px-5 py-4">Nama Pengguna</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Domisili</th>
                                    <th className="px-5 py-4">Tanggal Daftar</th>
                                    <th className="px-5 py-4">Status Akun</th>
                                    <th className="px-5 py-4">Kelengkapan Profil</th>
                                    <th className="px-5 py-4 text-center">Jumlah Lamaran</th>
                                    <th className="px-5 py-4 text-right">Aksi</th>
                                </tr>
                            )}
                            {currentTab === 'companies' && (
                                <tr>
                                    <th className="px-5 py-4 w-12 text-slate-500">No</th>
                                    <th className="px-5 py-4">Nama Perusahaan</th>
                                    <th className="px-5 py-4">Industri</th>
                                    <th className="px-5 py-4">Lokasi</th>
                                    <th className="px-5 py-4">Tanggal Daftar</th>
                                    <th className="px-5 py-4">Status Akun</th>
                                    <th className="px-5 py-4">Status Verifikasi</th>
                                    <th className="px-5 py-4 text-center">Jumlah Lowongan</th>
                                    <th className="px-5 py-4 text-right">Aksi</th>
                                </tr>
                            )}
                            {currentTab === 'vacancies' && (
                                <tr>
                                    <th className="px-5 py-4 w-12 text-slate-500">No</th>
                                    <th className="px-5 py-4">Judul Lowongan</th>
                                    <th className="px-5 py-4">Perusahaan</th>
                                    <th className="px-5 py-4">Industri</th>
                                    <th className="px-5 py-4">Lokasi</th>
                                    <th className="px-5 py-4">Jenis Pekerjaan</th>
                                    <th className="px-5 py-4">Tanggal Dibuat</th>
                                    <th className="px-5 py-4">Tanggal Berakhir</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-center">Jumlah Lamaran</th>
                                    <th className="px-5 py-4 text-right">Aksi</th>
                                </tr>
                            )}
                            {currentTab === 'applications' && (
                                <tr>
                                    <th className="px-5 py-4 w-12 text-slate-500">No</th>
                                    <th className="px-5 py-4">Nama Pelamar</th>
                                    <th className="px-5 py-4">Judul Lowongan</th>
                                    <th className="px-5 py-4">Perusahaan</th>
                                    <th className="px-5 py-4">Tanggal Lamaran</th>
                                    <th className="px-5 py-4">Status Lamaran</th>
                                    <th className="px-5 py-4">Status Proses</th>
                                    <th className="px-5 py-4">Metode Lamaran</th>
                                    <th className="px-5 py-4 text-right">Aksi</th>
                                </tr>
                            )}
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {dataItems.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                                        Tidak ada data laporan ditemukan untuk periode atau filter yang dipilih.
                                    </td>
                                </tr>
                            ) : (
                                dataItems.map((item: any, idx: number) => {
                                    const rowNum = (currentPage - 1) * perPage + idx + 1;

                                    if (currentTab === 'users') {
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => setDetailUser(item)}
                                                className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-5 py-4 text-slate-400 font-bold">{rowNum}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        {item.avatar ? (
                                                            <img
                                                                src={item.avatar}
                                                                alt={item.name}
                                                                className="h-8 w-8 rounded-full object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-[11px]">
                                                                {initials(item.name)}
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-[#101B4D] truncate max-w-[180px]">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">{item.email}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.domicile || '-'}</td>
                                                <td className="px-5 py-4 text-slate-500">{item.created_at}</td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                            item.is_disabled
                                                                ? 'bg-rose-50 text-rose-600'
                                                                : 'bg-emerald-50 text-emerald-600'
                                                        }`}
                                                    >
                                                        {item.is_disabled ? 'Nonaktif' : 'Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                            item.is_complete
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        {item.is_complete ? 'Lengkap' : 'Perlu Dilengkapi'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-slate-700">
                                                    {item.applications_count ?? 0}
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                                                                aria-label={`Menu aksi untuk ${item.name}`}
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            side="top"
                                                            sideOffset={6}
                                                            className="w-48 rounded-xl border border-slate-100 bg-white p-1 text-left shadow-xl ring-1 ring-black/5"
                                                        >
                                                            <DropdownMenuItem
                                                                onSelect={() => setDetailUser(item)}
                                                                onClick={() => setDetailUser(item)}
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                                Lihat Detail
                                                            </DropdownMenuItem>
                                                            {!item.is_disabled ? (
                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        setActionUser(item);
                                                                        setActionType('deactivate');
                                                                        setCurrentPassword('');
                                                                        setErrorBag({});
                                                                    }}
                                                                    onClick={() => {
                                                                        setActionUser(item);
                                                                        setActionType('deactivate');
                                                                        setCurrentPassword('');
                                                                        setErrorBag({});
                                                                    }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                                >
                                                                    <UserX className="h-3.5 w-3.5 text-amber-500" />
                                                                    Nonaktifkan Akun
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setActionUser(item);
                                                                            setActionType('activate');
                                                                            setCurrentPassword('');
                                                                            setErrorBag({});
                                                                        }}
                                                                        onClick={() => {
                                                                            setActionUser(item);
                                                                            setActionType('activate');
                                                                            setCurrentPassword('');
                                                                            setErrorBag({});
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                                    >
                                                                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                                        Aktifkan Akun
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setActionUser(item);
                                                                            setActionType('destroy');
                                                                            setCurrentPassword('');
                                                                            setErrorBag({});
                                                                        }}
                                                                        onClick={() => {
                                                                            setActionUser(item);
                                                                            setActionType('destroy');
                                                                            setCurrentPassword('');
                                                                            setErrorBag({});
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                                        Hapus Akun
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    if (currentTab === 'companies') {
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => setDetailCompany(item)}
                                                className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-5 py-4 text-slate-400 font-bold">{rowNum}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-extrabold">
                                                            {initials(item.company_name)}
                                                        </div>
                                                        <span className="font-bold text-[#101B4D] truncate max-w-[200px]">
                                                            {item.company_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">{item.industry || '-'}</td>
                                                <td className="px-5 py-4 text-slate-600 truncate max-w-[180px]">
                                                    {item.location}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500">{item.created_at}</td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                            item.is_active
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-rose-50 text-rose-600'
                                                        }`}
                                                    >
                                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                            item.is_approved
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        {item.is_approved ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-slate-700">
                                                    {item.vacancies_count ?? 0}
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                                                                aria-label={`Menu aksi untuk ${item.company_name}`}
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            side="top"
                                                            sideOffset={6}
                                                            className="w-52 rounded-xl border border-slate-100 bg-white p-1 text-left shadow-xl ring-1 ring-black/5"
                                                        >
                                                            {/* 1. Lihat Detail */}
                                                            <DropdownMenuItem
                                                                onSelect={() => setDetailCompany(item)}
                                                                onClick={() => setDetailCompany(item)}
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                                Lihat Detail
                                                            </DropdownMenuItem>

                                                            {/* 2. Verifikasi / Cabut Verifikasi */}
                                                            {!item.is_approved ? (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleToggleCompanyVerification(item, true)}
                                                                    onClick={() => handleToggleCompanyVerification(item, true)}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                                >
                                                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                                    Verifikasi Perusahaan
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleToggleCompanyVerification(item, false)}
                                                                    onClick={() => handleToggleCompanyVerification(item, false)}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                                >
                                                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                                                    Cabut Verifikasi
                                                                </DropdownMenuItem>
                                                            )}

                                                            {/* 3. Nonaktifkan / Aktifkan / Hapus Akun */}
                                                            {item.user_id && (
                                                                <>
                                                                    {item.is_active ? (
                                                                        <DropdownMenuItem
                                                                            onSelect={() => {
                                                                                setActionUser({ id: item.user_id, name: item.company_name });
                                                                                setActionType('deactivate');
                                                                                setCurrentPassword('');
                                                                                setErrorBag({});
                                                                            }}
                                                                            onClick={() => {
                                                                                setActionUser({ id: item.user_id, name: item.company_name });
                                                                                setActionType('deactivate');
                                                                                setCurrentPassword('');
                                                                                setErrorBag({});
                                                                            }}
                                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                                        >
                                                                            <UserX className="h-3.5 w-3.5 text-amber-500" />
                                                                            Nonaktifkan Akun
                                                                        </DropdownMenuItem>
                                                                    ) : (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onSelect={() => {
                                                                                    setActionUser({ id: item.user_id, name: item.company_name });
                                                                                    setActionType('activate');
                                                                                    setCurrentPassword('');
                                                                                    setErrorBag({});
                                                                                }}
                                                                                onClick={() => {
                                                                                    setActionUser({ id: item.user_id, name: item.company_name });
                                                                                    setActionType('activate');
                                                                                    setCurrentPassword('');
                                                                                    setErrorBag({});
                                                                                }}
                                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                                            >
                                                                                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                                                Aktifkan Akun
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onSelect={() => {
                                                                                    setActionUser({ id: item.user_id, name: item.company_name });
                                                                                    setActionType('destroy');
                                                                                    setCurrentPassword('');
                                                                                    setErrorBag({});
                                                                                }}
                                                                                onClick={() => {
                                                                                    setActionUser({ id: item.user_id, name: item.company_name });
                                                                                    setActionType('destroy');
                                                                                    setCurrentPassword('');
                                                                                    setErrorBag({});
                                                                                }}
                                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                                                Hapus Akun
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* 4. Lihat Lowongan */}
                                                            <DropdownMenuItem asChild className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                                                                <Link href={`/admin/vacancies?search=${encodeURIComponent(item.company_name)}`}>
                                                                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                                    Lihat Lowongan ({item.vacancies_count ?? 0})
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {/* 5. Kunjungi Website */}
                                                            {item.website && (
                                                                <DropdownMenuItem asChild className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer">
                                                                    <a
                                                                        href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                                                                        Kunjungi Website
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    if (currentTab === 'vacancies') {
                                        return (
                                            <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="px-5 py-4 text-slate-400 font-bold">{rowNum}</td>
                                                <td className="px-5 py-4 font-bold text-[#101B4D] truncate max-w-[200px]">
                                                    {item.title}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-extrabold">
                                                            {initials(item.company_name)}
                                                        </div>
                                                        <span className="truncate max-w-[150px] font-semibold text-slate-700">
                                                            {item.company_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">{item.industry || '-'}</td>
                                                <td className="px-5 py-4 text-slate-600 truncate max-w-[150px]">
                                                    {item.location}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                                                        {item.job_type || 'Full-time'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-500">{item.created_at}</td>
                                                <td className="px-5 py-4 text-slate-500">{item.deadline || '-'}</td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                            item.status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : item.status === 'draft'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {item.status === 'active'
                                                            ? 'Aktif'
                                                            : item.status === 'draft'
                                                            ? 'Menunggu Review'
                                                            : 'Ditutup'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-slate-700">
                                                    {item.applications_count ?? 0}
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            side="top"
                                                            sideOffset={6}
                                                            className="w-44 rounded-xl border border-slate-100 bg-white p-1 text-left shadow-xl ring-1 ring-black/5"
                                                        >
                                                            <DropdownMenuItem asChild className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                                                                <Link href={`/admin/vacancies?search=${encodeURIComponent(item.title)}`}>
                                                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                                    Detail Lowongan
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Lamaran Tab
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="px-5 py-4 text-slate-400 font-bold">{rowNum}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    {item.seeker_avatar ? (
                                                        <img
                                                            src={item.seeker_avatar}
                                                            alt={item.seeker_name}
                                                            className="h-7 w-7 rounded-full object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-[10px]">
                                                            {initials(item.seeker_name)}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-[#101B4D] truncate max-w-[160px]">
                                                        {item.seeker_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-700 truncate max-w-[180px]">
                                                {item.vacancy_title}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-extrabold">
                                                        {initials(item.company_name)}
                                                    </div>
                                                    <span className="truncate max-w-[150px] font-semibold text-slate-700">
                                                        {item.company_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">{item.applied_at}</td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-bold ${
                                                        item.status === 'hired'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : item.status === 'interview'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : item.status === 'rejected'
                                                            ? 'bg-rose-50 text-rose-700'
                                                            : 'bg-sky-50 text-sky-700'
                                                    }`}
                                                >
                                                    {item.status === 'hired'
                                                        ? 'Diterima'
                                                        : item.status === 'interview'
                                                        ? 'Dipanggil Interview'
                                                        : item.status === 'rejected'
                                                        ? 'Ditolak'
                                                        : 'Dalam Proses'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                        item.status_process === 'Offer'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : item.status_process?.includes('Interview')
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : item.status_process?.includes('Tidak Lulus')
                                                            ? 'bg-rose-50 text-rose-700'
                                                            : 'bg-sky-50 text-sky-600'
                                                    }`}
                                                >
                                                    {item.status_process}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{item.method || 'Website'}</td>
                                            <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        side="top"
                                                        sideOffset={6}
                                                        className="w-44 rounded-xl border border-slate-100 bg-white p-1 text-left shadow-xl ring-1 ring-black/5"
                                                    >
                                                        <DropdownMenuItem asChild className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                                                            <Link href="/app/applications">
                                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                                Lihat Lamaran
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer: Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-4">
                    <span className="text-xs font-medium text-slate-500">
                        Menampilkan{' '}
                        {activeData.pagination?.total > 0
                            ? `${(currentPage - 1) * perPage + 1}-${Math.min(
                                  currentPage * perPage,
                                  activeData.pagination?.total
                              )}`
                            : 0}{' '}
                        dari {numberFormat.format(activeData.pagination?.total ?? 0)} data
                    </span>

                    {/* Pagination Links */}
                    {activeData.links && activeData.links.length > 3 && (
                        <div className="flex items-center gap-1.5">
                            {activeData.links.map((link, idx) => {
                                const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                                const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        preserveState
                                        className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-[#1769E0] text-white shadow-sm'
                                                : link.url
                                                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    >
                                        {isPrev ? (
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        ) : isNext ? (
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        ) : (
                                            link.label
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Laporan - AKSARA" />

            <div className="min-h-screen bg-[#F4F8FC] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101B4D]">Laporan</h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">
                            Lihat dan unduh data hasil operasional platform sesuai kebutuhan.
                        </p>
                    </div>

                    {/* Segmented Top Tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative shrink-0 px-6 py-3.5 text-sm font-bold transition-all ${
                                    currentTab === tab.id
                                        ? 'text-[#1769E0]'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab.label}
                                {currentTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1769E0]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main White Card Container */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(23,105,224,0.03)] space-y-6">
                        {/* Card Top: Title & Export Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#101B4D]">{cardHeader.title}</h2>
                                <p className="mt-0.5 text-xs text-slate-500 font-medium">{cardHeader.subtitle}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    className="flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 shadow-sm"
                                >
                                    <Download className="h-4 w-4 text-rose-600" />
                                    Export PDF
                                </button>

                                <a
                                    href={`/admin/reporting/export?tab=${currentTab}&from=${filters.from}&to=${filters.to}`}
                                    download
                                    className="flex items-center gap-2 rounded-xl border border-emerald-400 bg-white px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 shadow-sm"
                                >
                                    <div className="flex h-4 w-4 items-center justify-center rounded bg-emerald-600 text-[10px] font-black text-white">
                                        X
                                    </div>
                                    Export Excel
                                </a>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        {renderFilterBar()}

                        {/* Summary Metric Cards */}
                        {renderSummaryCards()}

                        {/* Data Table */}
                        {renderTable()}
                    </div>
                </div>
            </div>

            {/* User Detail Dialog */}
            <Dialog open={Boolean(detailUser)} onOpenChange={(open) => !open && setDetailUser(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Pengguna</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap akun dan profil pelamar.
                        </DialogDescription>
                    </DialogHeader>

                    {detailUser && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#F8FBFF] p-4">
                                {detailUser.avatar ? (
                                    <img
                                        src={detailUser.avatar}
                                        alt={detailUser.name}
                                        className="h-14 w-14 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-lg">
                                        {initials(detailUser.name)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-[#101B4D] truncate text-base">{detailUser.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{detailUser.email}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                detailUser.is_disabled
                                                    ? 'bg-rose-50 text-rose-600'
                                                    : 'bg-emerald-50 text-emerald-600'
                                            }`}
                                        >
                                            {detailUser.is_disabled ? 'Nonaktif' : 'Aktif'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                detailUser.is_complete
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {detailUser.is_complete ? 'Profil Lengkap' : 'Profil Perlu Dilengkapi'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Domisili</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailUser.domicile || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Tanggal Terdaftar</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailUser.created_at || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Jumlah Lamaran</span>
                                    <span className="font-bold text-[#1769E0] mt-1 block">{detailUser.applications_count ?? 0} Lamaran</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Pekerjaan / Posisi</span>
                                    <span className="font-bold text-slate-800 mt-1 block truncate">{detailUser.current_job_title || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Nomor Telepon</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailUser.phone || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Kelengkapan Profil</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailUser.profile_percentage ?? 0}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center w-full gap-2 pt-2">
                        {detailUser && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                {!detailUser.is_disabled ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const target = detailUser;
                                            setDetailUser(null);
                                            setActionUser(target);
                                            setActionType('deactivate');
                                            setCurrentPassword('');
                                            setErrorBag({});
                                        }}
                                        className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 w-full sm:w-auto"
                                    >
                                        <UserX className="mr-1.5 h-3.5 w-3.5" />
                                        Nonaktifkan Akun
                                    </Button>
                                ) : (
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const target = detailUser;
                                                setDetailUser(null);
                                                setActionUser(target);
                                                setActionType('activate');
                                                setCurrentPassword('');
                                                setErrorBag({});
                                            }}
                                            className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                        >
                                            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                            Aktifkan Akun
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const target = detailUser;
                                                setDetailUser(null);
                                                setActionUser(target);
                                                setActionType('destroy');
                                                setCurrentPassword('');
                                                setErrorBag({});
                                            }}
                                            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                        >
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Hapus Akun
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <Button type="button" variant="outline" onClick={() => setDetailUser(null)} className="w-full sm:w-auto text-xs">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Company Detail Dialog */}
            <Dialog open={Boolean(detailCompany)} onOpenChange={(open) => !open && setDetailCompany(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Perusahaan</DialogTitle>
                        <DialogDescription>
                            Informasi profil, verifikasi, dan lowongan perusahaan.
                        </DialogDescription>
                    </DialogHeader>

                    {detailCompany && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#F8FBFF] p-4">
                                {detailCompany.logo_path ? (
                                    <img
                                        src={detailCompany.logo_path}
                                        alt={detailCompany.company_name}
                                        className="h-14 w-14 rounded-xl object-cover shrink-0 border border-slate-200"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-600 text-lg">
                                        {initials(detailCompany.company_name)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-[#101B4D] truncate text-base">{detailCompany.company_name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{detailCompany.email || '-'}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                detailCompany.is_approved
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {detailCompany.is_approved ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                detailCompany.is_active
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-rose-50 text-rose-600'
                                            }`}
                                        >
                                            {detailCompany.is_active ? 'Akun Aktif' : 'Akun Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Industri</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailCompany.industry || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Tanggal Terdaftar</span>
                                    <span className="font-bold text-slate-800 mt-1 block">{detailCompany.created_at || '-'}</span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Jumlah Lowongan</span>
                                    <Link
                                        href={`/admin/vacancies?search=${encodeURIComponent(detailCompany.company_name)}`}
                                        className="font-bold text-[#1769E0] hover:underline mt-1 block truncate"
                                    >
                                        {detailCompany.vacancies_count ?? 0} Lowongan Dipublikasikan
                                    </Link>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <span className="text-slate-400 block font-medium">Website</span>
                                    {detailCompany.website ? (
                                        <a
                                            href={detailCompany.website.startsWith('http') ? detailCompany.website : `https://${detailCompany.website}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-bold text-blue-600 hover:underline mt-1 flex items-center gap-1 truncate"
                                        >
                                            <span className="truncate">{detailCompany.website}</span>
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                    ) : (
                                        <span className="font-bold text-slate-800 mt-1 block">-</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-xs">
                                <span className="text-slate-400 block font-medium">Alamat / Lokasi</span>
                                <span className="font-semibold text-slate-700 mt-1 block leading-relaxed">
                                    {detailCompany.address || detailCompany.location || '-'}
                                </span>
                            </div>

                            {detailCompany.description && (
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-xs">
                                    <span className="text-slate-400 block font-medium">Deskripsi Perusahaan</span>
                                    <p className="text-slate-600 mt-1 leading-relaxed max-h-32 overflow-y-auto">
                                        {detailCompany.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center w-full gap-2 pt-2">
                        {detailCompany && (
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {!detailCompany.is_approved ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleToggleCompanyVerification(detailCompany, true)}
                                        className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    >
                                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                        Verifikasi Perusahaan
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleToggleCompanyVerification(detailCompany, false)}
                                        className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                                    >
                                        <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                                        Cabut Verifikasi
                                    </Button>
                                )}

                                {detailCompany.user_id && (
                                    <>
                                        {detailCompany.is_active ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const target = { id: detailCompany.user_id, name: detailCompany.company_name };
                                                    setDetailCompany(null);
                                                    setActionUser(target);
                                                    setActionType('deactivate');
                                                    setCurrentPassword('');
                                                    setErrorBag({});
                                                }}
                                                className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                                            >
                                                <UserX className="mr-1.5 h-3.5 w-3.5" />
                                                Nonaktifkan Akun
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const target = { id: detailCompany.user_id, name: detailCompany.company_name };
                                                        setDetailCompany(null);
                                                        setActionUser(target);
                                                        setActionType('activate');
                                                        setCurrentPassword('');
                                                        setErrorBag({});
                                                    }}
                                                    className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                >
                                                    <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                                    Aktifkan Akun
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const target = { id: detailCompany.user_id, name: detailCompany.company_name };
                                                        setDetailCompany(null);
                                                        setActionUser(target);
                                                        setActionType('destroy');
                                                        setCurrentPassword('');
                                                        setErrorBag({});
                                                    }}
                                                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                    Hapus Akun
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        <Button type="button" variant="outline" onClick={() => setDetailCompany(null)} className="w-full sm:w-auto text-xs">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Lifecycle Confirmation Dialog */}
            <Dialog open={Boolean(actionType && actionUser)} onOpenChange={(open) => !open && closeActionModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'destroy'
                                ? 'Hapus Akun Secara Permanen?'
                                : actionType === 'activate'
                                ? 'Aktifkan Akun Pengguna?'
                                : 'Nonaktifkan Akun Pengguna?'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'destroy'
                                ? `Akun ${actionUser?.name} dan seluruh datanya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
                                : actionType === 'activate'
                                ? `Akun ${actionUser?.name} akan diaktifkan kembali dan dapat mengakses platform.`
                                : `Akun ${actionUser?.name} akan dinonaktifkan selama 30 hari sebelum dihapus otomatis.`}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'destroy' && (
                        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                            <span>Pastikan akun ini memang harus dihapus sekarang. Data tidak dapat dipulihkan.</span>
                        </div>
                    )}

                    <div className="space-y-2 py-2">
                        <label htmlFor="admin-action-password" className="text-xs font-semibold text-slate-700">
                            Password Admin
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="admin-action-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && currentPassword && !isSubmitting) {
                                        submitAction();
                                    }
                                }}
                                placeholder="Masukkan password admin untuk konfirmasi"
                                autoComplete="current-password"
                                className="pl-9 text-xs"
                                disabled={isSubmitting}
                            />
                        </div>
                        {errorBag.current_password && (
                            <p className="text-xs font-medium text-rose-600">{errorBag.current_password}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={closeActionModal} disabled={isSubmitting} className="text-xs">
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant={actionType === 'destroy' ? 'destructive' : 'default'}
                            onClick={submitAction}
                            disabled={!currentPassword || isSubmitting}
                            className={`text-xs ${actionType !== 'destroy' ? 'bg-[#1769E0] hover:bg-[#1254B5]' : ''}`}
                        >
                            {isSubmitting
                                ? 'Memproses...'
                                : actionType === 'destroy'
                                ? 'Hapus Permanen'
                                : actionType === 'activate'
                                ? 'Aktifkan Akun'
                                : 'Nonaktifkan Akun'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Pilih Rentang Tanggal Kalender */}
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-[#101B4D]">
                            Pilih Rentang Waktu Kalender
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Tentukan tanggal awal dan akhir untuk menganalisis data laporan operasional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="space-y-1.5">
                            <label htmlFor="modal-start-date" className="text-xs font-bold text-slate-600">
                                Tanggal Mulai
                            </label>
                            <input
                                id="modal-start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="modal-end-date" className="text-xs font-bold text-slate-600">
                                Tanggal Selesai
                            </label>
                            <input
                                id="modal-end-date"
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
        </AdminLayout>
    );
}
