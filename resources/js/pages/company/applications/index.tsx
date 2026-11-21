import { useState, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ApplicationChatModal } from '@/components/chat/ApplicationChatModal';
import {
    ArrowRight,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileSearch,
    FileText,
    Filter,
    GraduationCap,
    Handshake,
    Layers,
    LayoutGrid,
    Mail,
    MapPin,
    MessageSquare,
    MoreHorizontal,
    Phone,
    RefreshCw,
    Search,
    Send,
    User,
    UserCheck,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TimelineItem {
    title: string;
    date: string;
    completed: boolean;
    status: 'done' | 'failed' | 'pending';
    badge?: string | null;
}

interface ApplicationCandidate {
    id: number;
    profile_id: number;
    name: string;
    avatar: string | null;
    initials: string;
    color: string;
    education: string;
    email: string;
    phone: string;
    domicile: string;
    disability_type: string;
    disability_list: string[];
    accommodations: string[];
    bio: string;
    skills: string[];
}

interface ApplicationItem {
    id: number;
    status: 'submitted' | 'reviewed' | 'interview' | 'hired' | 'rejected' | 'withdrawn';
    status_label: string;
    status_color: string;
    stage_label: string;
    stage_badge: string;
    stage_step: number;
    stage_progress_text: string;
    status_notes: string;
    cover_letter?: string;
    applied_at: string;
    applied_time_ago: string;
    updated_at: string;
    decision_date: string | null;
    cv_url: string | null;
    timeline: TimelineItem[];
    candidate: ApplicationCandidate;
    vacancy: {
        id: number;
        title: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string | number;
    active: boolean;
}

interface Props {
    applications?: {
        data: ApplicationItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links?: PaginationLink[];
    };
    stats?: {
        all: number;
        need_review: number;
        in_process: number;
        decided: number;
    };
    vacancies?: Array<{ id: number; title: string }>;
    filters?: {
        tab?: 'all' | 'need_review' | 'in_process' | 'decided';
        search?: string;
        vacancy?: string;
        status?: string;
        disability?: string;
        stage?: string;
        decision?: string;
        date_range?: string;
    };
}

export default function CompanyApplicationsIndex({
    applications = {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    },
    stats = {
        all: 0,
        need_review: 0,
        in_process: 0,
        decided: 0,
    },
    vacancies = [],
    filters = { tab: 'all' },
}: Props): ReactElement {
    const activeTab = filters?.tab || 'all';

    // Filters state
    const [search, setSearch] = useState<string>(filters?.search || '');
    const [vacancyFilter, setVacancyFilter] = useState<string>(filters?.vacancy || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const [disabilityFilter, setDisabilityFilter] = useState<string>(filters?.disability || 'all');
    const [stageFilter, setStageFilter] = useState<string>(filters?.stage || 'all');
    const [decisionFilter, setDecisionFilter] = useState<string>(filters?.decision || 'all');
    const [dateFilter, setDateFilter] = useState<string>(filters?.date_range || 'all');

    // Selection & Drawer state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
    const [drawerTab, setDrawerTab] = useState<'detail' | 'documents' | 'timeline'>('detail');

    // Modals state
    const [statusModalApp, setStatusModalApp] = useState<ApplicationItem | null>(null);
    const [newStatus, setNewStatus] = useState<string>('reviewed');
    const [newStatusNotes, setNewStatusNotes] = useState<string>('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

    const [notifyModalApp, setNotifyModalApp] = useState<ApplicationItem | null>(null);
    const [notifyMessage, setNotifyMessage] = useState<string>('');
    const [isSendingNotify, setIsSendingNotify] = useState<boolean>(false);

    const [chatModal, setChatModal] = useState<{ id: number; name: string } | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // Avatar image error fallback tracking
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    const handleImgError = (appId: number) => {
        setImgErrors((prev) => ({ ...prev, [appId]: true }));
    };

    // Apply Filter Function
    const applyFilters = (overrides: Record<string, string | undefined> = {}): void => {
        const queryParams = {
            tab: activeTab,
            search: search || undefined,
            vacancy: vacancyFilter !== 'all' ? vacancyFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            disability: disabilityFilter !== 'all' ? disabilityFilter : undefined,
            stage: stageFilter !== 'all' ? stageFilter : undefined,
            decision: decisionFilter !== 'all' ? decisionFilter : undefined,
            date_range: dateFilter !== 'all' ? dateFilter : undefined,
            ...overrides,
        };

        router.get('/company/applications', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Tab Change handler
    const handleTabChange = (newTab: 'all' | 'need_review' | 'in_process' | 'decided'): void => {
        applyFilters({ tab: newTab });
    };

    // Reset Filter Function
    const handleResetFilters = (): void => {
        setSearch('');
        setVacancyFilter('all');
        setStatusFilter('all');
        setDisabilityFilter('all');
        setStageFilter('all');
        setDecisionFilter('all');
        setDateFilter('all');
        router.get('/company/applications', { tab: activeTab }, { preserveState: true, preserveScroll: true });
    };

    // Checkbox toggles
    const appList = applications?.data ?? [];
    const toggleSelectAll = (): void => {
        if (selectedIds.length === appList.length && appList.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(appList.map((a) => a.id));
        }
    };

    const toggleSelectOne = (id: number): void => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Handle Status Update
    const submitStatusUpdate = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!statusModalApp) return;

        setIsUpdatingStatus(true);
        router.patch(
            `/company/applications/${statusModalApp.id}/status`,
            {
                status: newStatus,
                status_notes: newStatusNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsUpdatingStatus(false);
                    setStatusModalApp(null);
                    setFeedbackMessage('Status lamaran berhasil diperbarui.');
                    setTimeout(() => setFeedbackMessage(null), 3500);

                    if (selectedApp && selectedApp.id === statusModalApp.id) {
                        setSelectedApp({
                            ...selectedApp,
                            status: newStatus as any,
                            status_notes: newStatusNotes || selectedApp.status_notes,
                        });
                    }
                },
                onError: () => {
                    setIsUpdatingStatus(false);
                },
            }
        );
    };

    // Handle Send Custom Notification
    const submitSendNotification = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!notifyModalApp) return;

        setIsSendingNotify(true);
        router.post(
            `/company/applications/${notifyModalApp.id}/notify`,
            { message: notifyMessage },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSendingNotify(false);
                    setNotifyModalApp(null);
                    setNotifyMessage('');
                    setFeedbackMessage('Notifikasi berhasil dikirimkan kepada kandidat.');
                    setTimeout(() => setFeedbackMessage(null), 3500);
                },
                onError: () => {
                    setIsSendingNotify(false);
                },
            }
        );
    };

    // Helper: Render status & stage badge (Tab 1: Semua Lamaran)
    const renderStatusStageBadge = (app: ApplicationItem): ReactElement => {
        if (app.status === 'submitted') {
            return (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 px-3 py-1 text-xs border border-amber-200/70 text-amber-700">
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <div>
                        <p className="font-bold leading-none text-amber-800">Perlu Ditinjau</p>
                        <p className="mt-0.5 text-[10px] text-amber-600 font-medium">Menunggu review HR</p>
                    </div>
                </div>
            );
        }

        if (app.status === 'reviewed') {
            return (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-1 text-xs border border-blue-200/70 text-[#1769E0]">
                    <RefreshCw className="h-3.5 w-3.5 text-[#1769E0] shrink-0" />
                    <div>
                        <p className="font-bold leading-none text-[#102B4B]">Dalam Proses</p>
                        <p className="mt-0.5 text-[10px] text-[#1769E0] font-medium">{app.stage_label}</p>
                    </div>
                </div>
            );
        }

        if (app.status === 'interview') {
            return (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-1 text-xs border border-blue-200/70 text-[#1769E0]">
                    <Users className="h-3.5 w-3.5 text-[#1769E0] shrink-0" />
                    <div>
                        <p className="font-bold leading-none text-[#102B4B]">Dalam Proses</p>
                        <p className="mt-0.5 text-[10px] text-[#1769E0] font-medium">{app.stage_label}</p>
                    </div>
                </div>
            );
        }

        if (app.status === 'hired') {
            return (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3 py-1 text-xs border border-emerald-200/70 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div>
                        <p className="font-bold leading-none text-emerald-800">Diterima</p>
                        <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">{app.stage_label}</p>
                    </div>
                </div>
            );
        }

        if (app.status === 'rejected') {
            return (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 px-3 py-1 text-xs border border-rose-200/70 text-rose-700">
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <div>
                        <p className="font-bold leading-none text-rose-800">Ditolak</p>
                        <p className="mt-0.5 text-[10px] text-rose-600 font-medium">{app.stage_label}</p>
                    </div>
                </div>
            );
        }

        return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {app.status_label}
            </span>
        );
    };

    // Helper: Render progress dots for tab 'in_process' (Reference Image 3)
    const renderProgressStepper = (step: number): ReactElement => {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center">
                            <span
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                    i <= step ? 'bg-[#1769E0]' : 'bg-slate-200'
                                }`}
                            />
                            {i < 4 && (
                                <span
                                    className={`h-0.5 w-4 ${
                                        i < step ? 'bg-[#1769E0]' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                    {step} dari 4 tahap
                </span>
            </div>
        );
    };

    // Helper: Render Stage Pill for tab 'in_process'
    const renderStagePill = (stage: string): ReactElement => {
        const lower = (stage || '').toLowerCase();
        if (lower.includes('admin')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1769E0]">
                    <Search className="h-3 w-3" />
                    <span>Seleksi Administrasi</span>
                </span>
            );
        }
        if (lower.includes('wawancara') || lower.includes('interview')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-600">
                    <Users className="h-3 w-3" />
                    <span>Wawancara</span>
                </span>
            );
        }
        if (lower.includes('tes') || lower.includes('asesmen')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <FileText className="h-3 w-3" />
                    <span>Tes Kemampuan</span>
                </span>
            );
        }
        if (lower.includes('penawaran') || lower.includes('offering')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-xl bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                    <Handshake className="h-3 w-3" />
                    <span>Penawaran Kerja</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {stage || 'Seleksi'}
            </span>
        );
    };

    return (
        <CompanyLayout>
            <Head title="Lamaran Masuk - Profabel Perusahaan" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header Title */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                        Lamaran Masuk
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Kelola dan pantau seluruh proses lamaran kandidat di perusahaan Anda.
                    </p>
                </div>

                {/* Feedback Alert */}
                {feedbackMessage && (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{feedbackMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFeedbackMessage(null)}
                            className="text-emerald-700 hover:text-emerald-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* 4 Metric KPI Cards (Top Row) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Semua Lamaran */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('all')}
                        className={`text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md cursor-pointer ${
                            activeTab === 'all'
                                ? 'border-[#1769E0] bg-blue-50/20 ring-2 ring-[#1769E0]/20'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-500">Semua Lamaran</p>
                            <p className="mt-1 text-3xl font-black text-[#102B4B]">
                                {(stats?.all ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Total lamaran yang diterima
                            </p>
                        </div>
                    </button>

                    {/* Card 2: Perlu Ditinjau */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('need_review')}
                        className={`text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md cursor-pointer ${
                            activeTab === 'need_review'
                                ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <FileSearch className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-500">Perlu Ditinjau</p>
                            <p className="mt-1 text-3xl font-black text-[#102B4B]">
                                {(stats?.need_review ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Lamaran baru menunggu review
                            </p>
                        </div>
                    </button>

                    {/* Card 3: Proses Seleksi */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('in_process')}
                        className={`text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md cursor-pointer ${
                            activeTab === 'in_process'
                                ? 'border-purple-400 bg-purple-50/20 ring-2 ring-purple-400/20'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                <Layers className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-500">Proses Seleksi</p>
                            <p className="mt-1 text-3xl font-black text-[#102B4B]">
                                {(stats?.in_process ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Lamaran dalam tahapan seleksi
                            </p>
                        </div>
                    </button>

                    {/* Card 4: Keputusan Lamaran */}
                    <button
                        type="button"
                        onClick={() => handleTabChange('decided')}
                        className={`text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md cursor-pointer ${
                            activeTab === 'decided'
                                ? 'border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-400/20'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-slate-500">Keputusan Lamaran</p>
                            <p className="mt-1 text-3xl font-black text-[#102B4B]">
                                {(stats?.decided ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Telah diputuskan (diterima/ditolak)
                            </p>
                        </div>
                    </button>
                </div>

                {/* 4 Main Tabs Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'all', label: 'Semua Lamaran', icon: LayoutGrid },
                            { id: 'need_review', label: 'Perlu Ditinjau', icon: Clock },
                            { id: 'in_process', label: 'Proses Seleksi', icon: Layers },
                            { id: 'decided', label: 'Keputusan Lamaran', icon: CheckCircle2 },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
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

                {/* Filter Controls Bar */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyFilters({ search });
                                }}
                                placeholder="Cari nama kandidat, posisi, atau kata kunci..."
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                            />
                        </div>

                        {/* Dropdown Filters depending on active tab */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Lowongan Dropdown */}
                            <select
                                value={vacancyFilter}
                                onChange={(e) => {
                                    setVacancyFilter(e.target.value);
                                    applyFilters({ vacancy: e.target.value });
                                }}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                            >
                                <option value="all">Semua Lowongan</option>
                                {vacancies?.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.title}
                                    </option>
                                ))}
                            </select>

                            {/* Tab 1: Semua Status */}
                            {activeTab === 'all' && (
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        applyFilters({ status: e.target.value });
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="submitted">Perlu Ditinjau</option>
                                    <option value="reviewed">Seleksi Administrasi</option>
                                    <option value="interview">Wawancara</option>
                                    <option value="hired">Diterima</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            )}

                            {/* Tab 2 & 3: Disabilitas Filter */}
                            {(activeTab === 'need_review' || activeTab === 'in_process') && (
                                <select
                                    value={disabilityFilter}
                                    onChange={(e) => {
                                        setDisabilityFilter(e.target.value);
                                        applyFilters({ disability: e.target.value });
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="all">Semua Disabilitas</option>
                                    <option value="fisik">Disabilitas Fisik (Kursi Roda)</option>
                                    <option value="rungu">Disabilitas Rungu / Wicara</option>
                                    <option value="netra">Disabilitas Netra</option>
                                    <option value="intelektual">Neurodivergent / Autisme</option>
                                </select>
                            )}

                            {/* Tab 3: Tahap Seleksi Filter */}
                            {activeTab === 'in_process' && (
                                <select
                                    value={stageFilter}
                                    onChange={(e) => {
                                        setStageFilter(e.target.value);
                                        applyFilters({ stage: e.target.value });
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="all">Semua Tahap Seleksi</option>
                                    <option value="admin">Seleksi Administrasi</option>
                                    <option value="assessment">Tes Kemampuan</option>
                                    <option value="interview">Wawancara</option>
                                    <option value="offering">Penawaran Kerja</option>
                                </select>
                            )}

                            {/* Tab 4: Keputusan Filter */}
                            {activeTab === 'decided' && (
                                <select
                                    value={decisionFilter}
                                    onChange={(e) => {
                                        setDecisionFilter(e.target.value);
                                        applyFilters({ decision: e.target.value });
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="all">Semua Keputusan</option>
                                    <option value="hired">Diterima</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            )}

                            {/* Date Filter (Tabs 1, 2, 4) */}
                            {activeTab !== 'in_process' && (
                                <select
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        applyFilters({ date_range: e.target.value });
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="all">Semua Tanggal</option>
                                    <option value="7_days">7 Hari Terakhir</option>
                                    <option value="30_days">30 Hari Terakhir</option>
                                    <option value="this_month">Bulan Ini</option>
                                </select>
                            )}

                            {/* Reset Filter Button */}
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                                title="Reset Filter"
                            >
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-[#050E2E] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <th className="w-10 py-3.5 pl-4 pr-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedIds.length === appList.length &&
                                                appList.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-300 dark:border-white/20 dark:bg-[#050E2E] text-[#1769E0] focus:ring-[#1769E0]"
                                        />
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[200px]">Kandidat</th>
                                    <th className="py-3.5 px-3 min-w-[170px]">Posisi Dilamar</th>

                                    {/* Dynamic Columns based on active tab */}
                                    {activeTab === 'all' && (
                                        <>
                                            <th className="py-3.5 px-3 min-w-[180px]">Status & Tahap</th>
                                            <th className="py-3.5 px-3 min-w-[130px]">Tanggal Melamar</th>
                                        </>
                                    )}

                                    {activeTab === 'need_review' && (
                                        <>
                                            <th className="py-3.5 px-3 min-w-[130px]">Tanggal Melamar</th>
                                            <th className="py-3.5 px-3 min-w-[180px]">Status</th>
                                        </>
                                    )}

                                    {activeTab === 'in_process' && (
                                        <>
                                            <th className="py-3.5 px-3 min-w-[170px]">Tahap Seleksi</th>
                                            <th className="py-3.5 px-3 min-w-[160px]">Progress</th>
                                            <th className="py-3.5 px-3 min-w-[130px]">Update Terakhir</th>
                                        </>
                                    )}

                                    {activeTab === 'decided' && (
                                        <>
                                            <th className="py-3.5 px-3 min-w-[130px]">Keputusan</th>
                                            <th className="py-3.5 px-3 min-w-[140px]">Tanggal Keputusan</th>
                                            <th className="py-3.5 px-3 min-w-[220px]">Catatan</th>
                                        </>
                                    )}

                                    <th className="py-3.5 px-3 w-20 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                                {appList.length > 0 ? (
                                    appList.map((app) => {
                                        const isSelected = selectedIds.includes(app.id);
                                        const hasAvatarImg = Boolean(app.candidate?.avatar) && !imgErrors[app.id];

                                        return (
                                            <tr
                                                key={app.id}
                                                className={`transition hover:bg-slate-50/70 dark:hover:bg-[#0E2254] ${
                                                    isSelected ? 'bg-blue-50/30 dark:bg-[#0B2256]' : ''
                                                }`}
                                            >
                                                {/* Checkbox */}
                                                <td className="py-4 pl-4 pr-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectOne(app.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-[#1769E0] focus:ring-[#1769E0]"
                                                    />
                                                </td>

                                                {/* Kandidat Column */}
                                                <td className="py-4 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                                            {hasAvatarImg ? (
                                                                <img
                                                                    src={app.candidate.avatar!}
                                                                    alt={app.candidate.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={() => handleImgError(app.id)}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`h-full w-full flex items-center justify-center text-xs font-black shadow-sm ${
                                                                        app.candidate?.color || 'bg-blue-100 text-[#1769E0]'
                                                                    }`}
                                                                >
                                                                    {app.candidate?.initials || 'KD'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setDrawerTab('detail');
                                                                }}
                                                                className="font-bold text-[#102B4B] hover:text-[#1769E0] hover:underline text-left truncate max-w-[180px] block cursor-pointer"
                                                                title={app.candidate?.name ?? 'Kandidat'}
                                                            >
                                                                {app.candidate?.name ?? 'Kandidat'}
                                                            </button>
                                                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                                <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate max-w-[180px]" title={app.candidate?.education || '-'}>
                                                                    {app.candidate?.education || '-'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Posisi Dilamar */}
                                                <td className="py-4 px-3 font-semibold text-slate-800">
                                                    <div className="truncate max-w-[200px]" title={app.vacancy?.title}>
                                                        {app.vacancy?.title ?? 'Posisi Umum'}
                                                    </div>
                                                </td>

                                                {/* TAB 1: Semua Lamaran */}
                                                {activeTab === 'all' && (
                                                    <>
                                                        <td className="py-4 px-3">
                                                            {renderStatusStageBadge(app)}
                                                        </td>
                                                        <td className="py-4 px-3 font-medium text-slate-600">
                                                            {app.applied_at}
                                                        </td>
                                                    </>
                                                )}

                                                {/* TAB 2: Perlu Ditinjau */}
                                                {activeTab === 'need_review' && (
                                                    <>
                                                        <td className="py-4 px-3 font-medium text-slate-600">
                                                            {app.applied_at}
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            <div className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 px-3 py-1 text-xs border border-amber-200/70 text-amber-700">
                                                                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                                <div>
                                                                    <p className="font-bold leading-none text-amber-800">Perlu Ditinjau</p>
                                                                    <p className="mt-0.5 text-[10px] text-amber-600 font-medium">Menunggu review HR</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* TAB 3: Proses Seleksi */}
                                                {activeTab === 'in_process' && (
                                                    <>
                                                        <td className="py-4 px-3">
                                                            {renderStagePill(app.stage_label)}
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            {renderProgressStepper(app.stage_step || 1)}
                                                        </td>
                                                        <td className="py-4 px-3 font-medium text-slate-600">
                                                            {app.updated_at}
                                                        </td>
                                                    </>
                                                )}

                                                {/* TAB 4: Keputusan Lamaran */}
                                                {activeTab === 'decided' && (
                                                    <>
                                                        <td className="py-4 px-3">
                                                            {app.status === 'hired' ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    <span>Diterima</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                                                    <X className="h-3.5 w-3.5" />
                                                                    <span>Ditolak</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-3 font-medium text-slate-600">
                                                            {app.decision_date || app.updated_at}
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            <p className="text-xs text-slate-600 line-clamp-2 max-w-[240px]">
                                                                {app.status_notes}
                                                            </p>
                                                        </td>
                                                    </>
                                                )}

                                                {/* Aksi Column */}
                                                <td className="py-4 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Eye Button: Opens Detail Lamaran Drawer */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedApp(app);
                                                                setDrawerTab('detail');
                                                            }}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#1769E0] transition cursor-pointer"
                                                            title="Lihat Detail Lamaran"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {/* More Options Dropdown */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                                                                    title="Opsi Lainnya"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-52 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
                                                            >
                                                                {/* Opsi 1: Lihat Detail Lamaran */}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedApp(app);
                                                                        setDrawerTab('detail');
                                                                    }}
                                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] cursor-pointer"
                                                                >
                                                                    <FileText className="h-4 w-4 text-[#1769E0]" />
                                                                    <span>Lihat Detail Lamaran</span>
                                                                </DropdownMenuItem>

                                                                {/* Opsi 2: Ubah Status Lamaran */}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setStatusModalApp(app);
                                                                        setNewStatus(app.status);
                                                                        setNewStatusNotes(app.status_notes || '');
                                                                    }}
                                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] cursor-pointer"
                                                                >
                                                                    <RefreshCw className="h-4 w-4 text-amber-600" />
                                                                    <span>Ubah Status Lamaran</span>
                                                                </DropdownMenuItem>

                                                                {/* Opsi 3: Kirim Notifikasi */}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setNotifyModalApp(app);
                                                                        setNotifyMessage('');
                                                                    }}
                                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] cursor-pointer"
                                                                >
                                                                    <Send className="h-4 w-4 text-purple-600" />
                                                                    <span>Kirim Notifikasi</span>
                                                                </DropdownMenuItem>

                                                                {/* Opsi 4: Unduh CV */}
                                                                {app.cv_url && (
                                                                    <DropdownMenuItem asChild>
                                                                        <a
                                                                            href={app.cv_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0]"
                                                                        >
                                                                            <Download className="h-4 w-4 text-emerald-600" />
                                                                            <span>Unduh Berkas CV</span>
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {/* Opsi 5: Pesan Kandidat */}
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setChatModal({
                                                                            id: app.id,
                                                                            name: app.candidate?.name || 'Kandidat',
                                                                        })
                                                                    }
                                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] cursor-pointer"
                                                                >
                                                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                                                    <span>Pesan Kandidat</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                                    <FileSearch className="h-7 w-7" />
                                                </div>
                                                <h4 className="mt-3 text-sm font-bold text-slate-800">
                                                    Tidak ada lamaran ditemukan
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Coba sesuaikan kata kunci pencarian atau reset filter.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-3 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#1769E0] hover:bg-blue-50 cursor-pointer"
                                                >
                                                    Reset Filter
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Row */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between text-xs">
                        <p className="font-semibold text-slate-500">
                            Menampilkan {applications.from || (appList.length > 0 ? 1 : 0)}-{applications.to || appList.length} dari {applications.total || appList.length} lamaran
                            {activeTab === 'need_review' && ' yang perlu ditinjau'}
                            {activeTab === 'in_process' && ' dalam proses seleksi'}
                            {activeTab === 'decided' && ' keputusan lamaran'}
                        </p>

                        {applications.last_page > 1 ? (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={applications.current_page <= 1}
                                    onClick={() => applyFilters({ page: String(applications.current_page - 1) } as any)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: applications.last_page }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => applyFilters({ page: String(pageNum) } as any)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                                            pageNum === applications.current_page
                                                ? 'bg-[#1769E0] text-white shadow-sm'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={applications.current_page >= applications.last_page}
                                    onClick={() => applyFilters({ page: String(applications.current_page + 1) } as any)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* DETAIL LAMARAN DRAWER (Slide-Over Panel - As shown in Reference Image 4) */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="relative w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70 shrink-0">
                            <h2 className="text-base font-extrabold text-[#102B4B]">
                                Detail Lamaran
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedApp(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Candidate Hero Card */}
                        <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                        {selectedApp.candidate?.avatar && !imgErrors[selectedApp.id] ? (
                                            <img
                                                src={selectedApp.candidate.avatar}
                                                alt={selectedApp.candidate.name}
                                                className="h-full w-full object-cover"
                                                onError={() => handleImgError(selectedApp.id)}
                                            />
                                        ) : (
                                            <div
                                                className={`h-full w-full flex items-center justify-center text-sm font-black shadow-sm ${
                                                    selectedApp.candidate?.color || 'bg-blue-100 text-[#1769E0]'
                                                }`}
                                            >
                                                {selectedApp.candidate?.initials || 'KD'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#102B4B]">
                                            {selectedApp.candidate?.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-600">
                                            {selectedApp.vacancy?.title}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            <span>Dilamar: {selectedApp.applied_at}</span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {selectedApp.status === 'hired' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            <Check className="h-3.5 w-3.5" />
                                            <span>Diterima</span>
                                        </span>
                                    ) : selectedApp.status === 'rejected' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                            <X className="h-3.5 w-3.5" />
                                            <span>Ditolak</span>
                                        </span>
                                    ) : selectedApp.status === 'submitted' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Perlu Ditinjau</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1769E0] border border-blue-200">
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            <span>Dalam Proses</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Sub-Tabs */}
                            <div className="mt-6 flex border-b border-slate-100">
                                {[
                                    { id: 'detail', label: 'Detail', icon: FileText },
                                    { id: 'documents', label: 'Dokumen', icon: Briefcase },
                                    { id: 'timeline', label: 'Riwayat Seleksi', icon: Clock },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = drawerTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setDrawerTab(tab.id as any)}
                                            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 text-xs font-bold transition cursor-pointer ${
                                                isActive
                                                    ? 'border-[#1769E0] text-[#1769E0]'
                                                    : 'border-transparent text-slate-400 hover:text-slate-700'
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Drawer Body */}
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {drawerTab === 'detail' && (
                                <>
                                    {/* Informasi Kandidat */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold text-[#102B4B] uppercase tracking-wider">
                                            Informasi Kandidat
                                        </h4>
                                        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 text-xs">
                                            <div className="py-2.5 flex items-center justify-between">
                                                <span className="font-semibold text-slate-500 w-32">Nama Lengkap</span>
                                                <span className="font-bold text-slate-800 flex-1">: {selectedApp.candidate?.name}</span>
                                            </div>
                                            <div className="py-2.5 flex items-center justify-between">
                                                <span className="font-semibold text-slate-500 w-32">Email</span>
                                                <span className="font-bold text-[#1769E0] flex-1">: {selectedApp.candidate?.email}</span>
                                            </div>
                                            <div className="py-2.5 flex items-center justify-between">
                                                <span className="font-semibold text-slate-500 w-32">No. Telepon</span>
                                                <span className="font-bold text-slate-800 flex-1">: {selectedApp.candidate?.phone}</span>
                                            </div>
                                            <div className="py-2.5 flex items-center justify-between">
                                                <span className="font-semibold text-slate-500 w-32">Pendidikan</span>
                                                <span className="font-bold text-slate-800 flex-1">: {selectedApp.candidate?.education}</span>
                                            </div>
                                            <div className="py-2.5 flex items-center justify-between">
                                                <span className="font-semibold text-slate-500 w-32">Disabilitas</span>
                                                <span className="font-bold text-slate-800 flex-1">: {selectedApp.candidate?.disability_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hasil Keputusan Card (Reference Image 4) */}
                                    {selectedApp.status === 'hired' && (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                                                        Hasil Keputusan
                                                    </p>
                                                    <h5 className="text-base font-black text-emerald-900">
                                                        Diterima
                                                    </h5>
                                                    <p className="text-xs text-emerald-700 font-medium">
                                                        Keputusan ditetapkan pada {selectedApp.decision_date || selectedApp.updated_at}.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedApp.status === 'rejected' && (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                                                    <XCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                                                        Hasil Keputusan
                                                    </p>
                                                    <h5 className="text-base font-black text-rose-900">
                                                        Ditolak
                                                    </h5>
                                                    <p className="text-xs text-rose-700 font-medium">
                                                        Keputusan ditetapkan pada {selectedApp.decision_date || selectedApp.updated_at}.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Riwayat Seleksi Timeline (Vertical list matching Reference Image 4) */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold text-[#102B4B] uppercase tracking-wider">
                                            Riwayat Seleksi
                                        </h4>
                                        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                                            {selectedApp.timeline?.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        {item.status === 'done' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                        ) : item.status === 'failed' ? (
                                                            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-slate-300 shrink-0" />
                                                        )}
                                                        <span
                                                            className={`font-semibold ${
                                                                item.completed ? 'text-slate-800' : 'text-slate-400'
                                                            }`}
                                                        >
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.badge && (
                                                            <span
                                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                                    item.badge === 'Diterima'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                                }`}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        <span className="text-[11px] text-slate-400 font-medium">
                                                            {item.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Catatan HR (Reference Image 4) */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold text-[#102B4B] uppercase tracking-wider">
                                            Catatan HR
                                        </h4>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {selectedApp.status_notes || 'Belum ada catatan internal dari HR.'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {drawerTab === 'documents' && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-extrabold text-[#102B4B] uppercase tracking-wider">
                                        Berkas & Dokumen Pelamar
                                    </h4>

                                    {selectedApp.cv_url ? (
                                        <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <FileText className="h-6 w-6 text-[#1769E0]" />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">Dokumen CV Pelamar</p>
                                                        <p className="text-[11px] text-slate-400">Format PDF</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={selectedApp.cv_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1769E0] hover:bg-blue-100"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>Unduh CV</span>
                                                </a>
                                            </div>
                                            <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-100">
                                                <iframe
                                                    src={selectedApp.cv_url}
                                                    className="w-full h-full"
                                                    title="CV Preview"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
                                            Pelamar belum mengunggah dokumen CV.
                                        </div>
                                    )}

                                    {selectedApp.cover_letter && (
                                        <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
                                            <span className="text-xs font-bold text-slate-700">Surat Lamaran (Cover Letter):</span>
                                            <p className="text-xs text-slate-600 italic leading-relaxed">
                                                "{selectedApp.cover_letter}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {drawerTab === 'timeline' && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-extrabold text-[#102B4B] uppercase tracking-wider">
                                        Log Riwayat Lengkap
                                    </h4>
                                    <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                                        {selectedApp.timeline?.map((item, idx) => (
                                            <div key={idx} className="relative pl-6 pb-2 border-l border-slate-200 last:pb-0">
                                                <span
                                                    className={`absolute -left-2 top-0.5 h-4 w-4 rounded-full border-2 border-white ${
                                                        item.status === 'done'
                                                            ? 'bg-emerald-500'
                                                            : item.status === 'failed'
                                                            ? 'bg-rose-500'
                                                            : 'bg-slate-300'
                                                    }`}
                                                />
                                                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Waktu: {item.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Sticky Footer with Quick Actions */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusModalApp(selectedApp);
                                        setNewStatus(selectedApp.status);
                                        setNewStatusNotes(selectedApp.status_notes || '');
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition shadow-sm cursor-pointer"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Ubah Status</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setChatModal({
                                            id: selectedApp.id,
                                            name: selectedApp.candidate?.name || 'Kandidat',
                                        })
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
                                >
                                    <MessageSquare className="h-3.5 w-3.5 text-[#1769E0]" />
                                    <span>Pesan</span>
                                </button>
                            </div>

                            <Link
                                href={`/company/candidates/${selectedApp.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                            >
                                <span>Profil Penuh</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* STATUS UPDATE MODAL */}
            {statusModalApp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setStatusModalApp(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
                            <h3 className="text-sm font-extrabold text-[#102B4B]">
                                Ubah Status Lamaran
                            </h3>
                            <button
                                type="button"
                                onClick={() => setStatusModalApp(null)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submitStatusUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Pilih Status Baru
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#1769E0] focus:outline-none"
                                >
                                    <option value="submitted">Perlu Ditinjau (Baru Masuk)</option>
                                    <option value="reviewed">Seleksi Administrasi / Tes Kemampuan</option>
                                    <option value="interview">Wawancara (Interview)</option>
                                    <option value="hired">Diterima (Lolos Seleksi)</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Catatan / Alasan Tahapan
                                </label>
                                <textarea
                                    rows={3}
                                    value={newStatusNotes}
                                    onChange={(e) => setNewStatusNotes(e.target.value)}
                                    placeholder="Tuliskan catatan kemajuan seleksi atau feedback bagi kandidat..."
                                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStatusModalApp(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingStatus}
                                    className="rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                                >
                                    {isUpdatingStatus ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NOTIFICATION MODAL */}
            {notifyModalApp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setNotifyModalApp(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
                            <h3 className="text-sm font-extrabold text-[#102B4B]">
                                Kirim Notifikasi ke Kandidat
                            </h3>
                            <button
                                type="button"
                                onClick={() => setNotifyModalApp(null)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submitSendNotification} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Pesan Notifikasi
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={notifyMessage}
                                    onChange={(e) => setNotifyMessage(e.target.value)}
                                    placeholder="Tulis pesan pengumuman atau instruksi jadwal seleksi kepada kandidat..."
                                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setNotifyModalApp(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSendingNotify}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>{isSendingNotify ? 'Mengirim...' : 'Kirim Sekarang'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CHAT MODAL INTEGRATION */}
            {chatModal && (
                <ApplicationChatModal
                    applicationId={chatModal.id}
                    recipientName={chatModal.name}
                    isOpen={true}
                    onClose={() => setChatModal(null)}
                />
            )}
        </CompanyLayout>
    );
}
