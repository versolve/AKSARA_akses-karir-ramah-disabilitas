import { useState, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Accessibility,
    ArrowRight,
    Brain,
    Briefcase,
    Calendar,
    CheckCircle2,
    Download,
    Ear,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    Info,
    Mail,
    MapPin,
    MoreHorizontal,
    Phone,
    Search,
    TrendingUp,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CandidateItem {
    id: number;
    name: string;
    avatar: string | null;
    initials: string;
    color: string;
    education: string;
    applied_position: string;
    skills: string[];
    skills_more_count: number;
    disability_type: string;
    status: string;
    status_label: string;
    status_color: string;
    email?: string;
    phone?: string;
    domicile?: string;
    bio?: string;
    cv_url?: string | null;
    all_skills?: string[];
    applied_at?: string;
    notes?: string;
}

interface StatsData {
    total_candidates: number;
    total_growth: string;
    cv_received: number;
    cv_growth: string;
    in_process: number;
    in_process_growth: string;
    passed: number;
    passed_growth: string;
    distribution: {
        in_process: number;
        in_process_pct: number;
        passed: number;
        passed_pct: number;
        admin_review: number;
        admin_review_pct: number;
        rejected: number;
        rejected_pct: number;
    };
}

interface RecentActivityItem {
    id: number;
    text: string;
    time: string;
    type: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    candidates: CandidateItem[];
    stats: StatsData;
    vacancies: Array<{ id: number; title: string }>;
    recentActivities: RecentActivityItem[];
    filters: {
        search?: string;
        vacancy?: string;
        status?: string;
        disability?: string;
    };
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links: PaginationLink[];
    };
}

export default function CandidatesIndex({
    candidates,
    stats,
    vacancies,
    recentActivities,
    filters,
    pagination,
}: Props): ReactElement {
    const [search, setSearch] = useState<string>(filters.search || '');
    const [vacancyFilter, setVacancyFilter] = useState<string>(filters.vacancy || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [disabilityFilter, setDisabilityFilter] = useState<string>(filters.disability || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [quickViewCandidate, setQuickViewCandidate] = useState<CandidateItem | null>(null);
    const [showRefPopover, setShowRefPopover] = useState<boolean>(true);

    const handleSearchSubmit = (e?: React.FormEvent): void => {
        if (e) e.preventDefault();
        router.get(
            '/company/candidates',
            {
                search: search || undefined,
                vacancy: vacancyFilter !== 'all' ? vacancyFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                disability: disabilityFilter !== 'all' ? disabilityFilter : undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (type: string, value: string): void => {
        const nextFilters = {
            search: search || undefined,
            vacancy: vacancyFilter !== 'all' ? vacancyFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            disability: disabilityFilter !== 'all' ? disabilityFilter : undefined,
            [type]: value !== 'all' ? value : undefined,
        };

        if (type === 'vacancy') setVacancyFilter(value);
        if (type === 'status') setStatusFilter(value);
        if (type === 'disability') setDisabilityFilter(value);

        router.get('/company/candidates', nextFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = (): void => {
        setSearch('');
        setVacancyFilter('all');
        setStatusFilter('all');
        setDisabilityFilter('all');
        router.get('/company/candidates', {}, { preserveState: true, preserveScroll: true });
    };

    const toggleSelectAll = (): void => {
        if (selectedIds.length === candidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(candidates.map((c) => c.id));
        }
    };

    const toggleSelectOne = (id: number): void => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Helper icon disabilitas
    const renderAccessibilityIcon = (disabilityStr: string): ReactElement => {
        const lower = disabilityStr.toLowerCase();
        if (lower.includes('kursi roda') || lower.includes('fisik') || lower.includes('daksa')) {
            return <Accessibility className="h-3.5 w-3.5 text-[#1769E0] shrink-0" />;
        }
        if (lower.includes('rungu') || lower.includes('telinga') || lower.includes('wicara')) {
            return <Ear className="h-3.5 w-3.5 text-purple-600 shrink-0" />;
        }
        if (lower.includes('netra') || lower.includes('mata') || lower.includes('vision') || lower.includes('buta')) {
            return <EyeOff className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
        }
        if (lower.includes('neuro') || lower.includes('autis') || lower.includes('adhd') || lower.includes('mental')) {
            return <Brain className="h-3.5 w-3.5 text-emerald-600 shrink-0" />;
        }
        return <Accessibility className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    };

    // Calculate dynamic SVG circle stroke dashes for Realtime Donut Chart
    const circumference = 2 * Math.PI * 38; // ~238.76
    const totalCount = stats.total_candidates;

    // Segment proportions
    const inProcessRatio = totalCount > 0 ? stats.distribution.in_process / totalCount : 0;
    const passedRatio = totalCount > 0 ? stats.distribution.passed / totalCount : 0;
    const adminReviewRatio = totalCount > 0 ? stats.distribution.admin_review / totalCount : 0;
    const rejectedRatio = totalCount > 0 ? stats.distribution.rejected / totalCount : 0;

    const inProcessDash = inProcessRatio * circumference;
    const passedDash = passedRatio * circumference;
    const adminReviewDash = adminReviewRatio * circumference;
    const rejectedDash = rejectedRatio * circumference;

    const inProcessOffset = 0;
    const passedOffset = -inProcessDash;
    const adminReviewOffset = -(inProcessDash + passedDash);
    const rejectedOffset = -(inProcessDash + passedDash + adminReviewDash);

    return (
        <CompanyLayout>
            <Head title="Kandidat - Profabel Perusahaan" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                        Kandidat
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Kelola seluruh kandidat yang melamar pekerjaan di perusahaan Anda.
                    </p>
                </div>

                {/* 4 Stat Cards Row (100% Realtime dari Database) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Kandidat */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                <TrendingUp className="h-3 w-3" />
                                {stats.total_growth}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500">Total Kandidat</p>
                            <p className="mt-1 text-2xl font-black text-[#102B4B]">
                                {stats.total_candidates.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Dari periode sebelumnya
                            </p>
                        </div>
                    </div>

                    {/* Card 2: CV Diterima */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                <TrendingUp className="h-3 w-3" />
                                {stats.cv_growth}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500">CV Diterima</p>
                            <p className="mt-1 text-2xl font-black text-[#102B4B]">
                                {stats.cv_received.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Dari periode sebelumnya
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Dalam Proses */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                <TrendingUp className="h-3 w-3" />
                                {stats.in_process_growth}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500">Dalam Proses</p>
                            <p className="mt-1 text-2xl font-black text-[#102B4B]">
                                {stats.in_process.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Dari periode sebelumnya
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Lulus Seleksi */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                <TrendingUp className="h-3 w-3" />
                                {stats.passed_growth}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500">Lulus Seleksi</p>
                            <p className="mt-1 text-2xl font-black text-[#102B4B]">
                                {stats.passed.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Dari periode sebelumnya
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    {/* Left Column: Candidate Table (8.5 Columns) */}
                    <div className="xl:col-span-8 space-y-4">
                        {/* Tab Header */}
                        <div className="flex items-center gap-2 border-b border-slate-200">
                            <button
                                type="button"
                                className="flex items-center gap-2 border-b-2 border-[#1769E0] pb-3 text-sm font-bold text-[#1769E0]"
                            >
                                <Users className="h-4 w-4" />
                                <span>Daftar Kandidat</span>
                            </button>
                        </div>

                        {/* Search and Filters Bar (Clean, Responsive, No Weird Outlines) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                {/* Search Bar */}
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="relative flex-1 min-w-[220px]"
                                >
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                        placeholder="Cari nama kandidat, posisi, atau keahlian..."
                                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                                    />
                                </form>

                                {/* Filter Dropdowns Group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Lowongan Dropdown */}
                                    <select
                                        value={vacancyFilter}
                                        onChange={(e) => handleFilterChange('vacancy', e.target.value)}
                                        className="h-10 max-w-[180px] truncate rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                                    >
                                        <option value="all">Semua Lowongan</option>
                                        {vacancies.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.title}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Status Dropdown */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="dalam_proses">Dalam Proses</option>
                                        <option value="lulus_seleksi">Lulus Seleksi</option>
                                        <option value="seleksi_admin">Seleksi Administrasi</option>
                                        <option value="ditolak">Ditolak</option>
                                    </select>

                                    {/* Disabilitas Dropdown */}
                                    <select
                                        value={disabilityFilter}
                                        onChange={(e) => handleFilterChange('disability', e.target.value)}
                                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                                    >
                                        <option value="all">Semua Disabilitas</option>
                                        <option value="fisik">Disabilitas Fisik (Kursi Roda)</option>
                                        <option value="rungu">Tunarungu / Wicara</option>
                                        <option value="netra">Tunanetra (Low Vision / Buta)</option>
                                        <option value="intelektual">Neurodivergent / Autisme</option>
                                    </select>

                                    {/* Reset Filter Button */}
                                    {(search || vacancyFilter !== 'all' || statusFilter !== 'all' || disabilityFilter !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                                            title="Reset Filter"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Candidate Table Card */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500">
                                            <th className="w-10 py-3.5 pl-4 pr-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === candidates.length && candidates.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="h-4 w-4 rounded border-slate-300 text-[#1769E0] focus:ring-[#1769E0]"
                                                />
                                            </th>
                                            <th className="py-3.5 px-3 min-w-[190px]">Nama Kandidat</th>
                                            <th className="py-3.5 px-3 min-w-[150px]">Posisi Dilamar</th>
                                            <th className="py-3.5 px-3 min-w-[130px]">Skill & Pengalaman</th>
                                            <th className="py-3.5 px-3 min-w-[130px]">Accessibility Profile</th>
                                            <th className="py-3.5 px-3 min-w-[100px]">Status</th>
                                            <th className="py-3.5 px-3 min-w-[180px] text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {candidates.length > 0 ? (
                                            candidates.map((c, index) => {
                                                const isSelected = selectedIds.includes(c.id);
                                                return (
                                                    <tr
                                                        key={c.id}
                                                        className={`transition hover:bg-slate-50/70 ${
                                                            isSelected ? 'bg-blue-50/30' : ''
                                                        }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <td className="py-4 pl-4 pr-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectOne(c.id)}
                                                                className="h-4 w-4 rounded border-slate-300 text-[#1769E0] focus:ring-[#1769E0]"
                                                            />
                                                        </td>

                                                        {/* Nama & Foto Asli Pelamar */}
                                                        <td className="py-4 px-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                                                    {c.avatar ? (
                                                                        <img
                                                                            src={c.avatar}
                                                                            alt={c.name}
                                                                            className="h-full w-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLElement).style.display = 'none';
                                                                                const fallback = (e.target as HTMLElement).parentElement?.querySelector('.table-avatar-fallback') as HTMLElement;
                                                                                if (fallback) fallback.style.display = 'flex';
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                    <div
                                                                        className={`table-avatar-fallback ${c.avatar ? 'hidden' : 'flex'} h-full w-full items-center justify-center text-xs font-black shadow-sm ${c.color}`}
                                                                    >
                                                                        {c.initials}
                                                                    </div>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        href={`/company/candidates/${c.id}`}
                                                                        className="font-bold text-[#102B4B] hover:text-[#1769E0] hover:underline"
                                                                    >
                                                                        {c.name}
                                                                    </Link>
                                                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                                        <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                        <span className="truncate max-w-[180px]">{c.education}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Posisi Dilamar */}
                                                        <td className="py-4 px-3 font-semibold text-slate-800">
                                                            <div className="truncate max-w-[200px]" title={c.applied_position}>
                                                                {c.applied_position}
                                                            </div>
                                                        </td>

                                                        {/* Skill & Pengalaman */}
                                                        <td className="py-4 px-3">
                                                            {c.skills.length > 0 ? (
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    {c.skills.map((skill, sIdx) => (
                                                                        <span
                                                                            key={sIdx}
                                                                            className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#1769E0]"
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {c.skills_more_count > 0 && (
                                                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                                                            +{c.skills_more_count}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic">-</span>
                                                            )}
                                                        </td>

                                                        {/* Accessibility Profile */}
                                                        <td className="py-4 px-3">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                                                                {renderAccessibilityIcon(c.disability_type)}
                                                                <span className="truncate max-w-[150px]" title={c.disability_type}>
                                                                    {c.disability_type}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="py-4 px-3">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${c.status_color}`}
                                                            >
                                                                {c.status_label}
                                                            </span>
                                                        </td>

                                                        {/* Aksi */}
                                                        <td className="py-4 px-3 text-center">
                                                            <div className="relative inline-flex items-center justify-center gap-1.5">
                                                                {/* Tombol Utama: Lihat Detail Profil */}
                                                                <Link
                                                                    href={`/company/candidates/${c.id}`}
                                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-[#1769E0] hover:bg-[#1769E0] hover:text-white transition shadow-sm border border-blue-100 group whitespace-nowrap"
                                                                    title="Lihat Detail Profil Kandidat"
                                                                >
                                                                    <FileText className="h-3.5 w-3.5 text-[#1769E0] group-hover:text-white" />
                                                                    <span>Lihat Detail Profil</span>
                                                                </Link>

                                                                {/* Tombol Pratinjau Cepat */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setQuickViewCandidate(c)}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#1769E0] transition"
                                                                    title="Pratinjau Cepat Profil"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>

                                                                {/* Menu Opsi Tambahan */}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                                                            title="Opsi Tambahan"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent
                                                                        align="end"
                                                                        className="w-52 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
                                                                    >
                                                                        <DropdownMenuItem asChild>
                                                                            <Link
                                                                                href={`/company/candidates/${c.id}`}
                                                                                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0]"
                                                                            >
                                                                                <FileText className="h-4 w-4 text-[#1769E0]" />
                                                                                <span>Lihat Detail Profil</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => setQuickViewCandidate(c)}
                                                                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] cursor-pointer"
                                                                        >
                                                                            <Eye className="h-4 w-4 text-emerald-600" />
                                                                            <span>Pratinjau Cepat Profil</span>
                                                                        </DropdownMenuItem>
                                                                        {c.cv_url && (
                                                                            <DropdownMenuItem asChild>
                                                                                <a
                                                                                    href={c.cv_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0]"
                                                                                >
                                                                                    <Download className="h-4 w-4 text-purple-600" />
                                                                                    <span>Unduh Berkas CV</span>
                                                                                </a>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>

                                                                {/* Floating Tooltip / Popover matching Reference Image 1 */}
                                                                {index === 0 && showRefPopover && (
                                                                    <div className="absolute right-0 top-full mt-1.5 z-30 hidden 2xl:flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                                                                        <Link
                                                                            href={`/company/candidates/${c.id}`}
                                                                            className="flex items-center gap-2 text-xs font-bold text-[#102B4B] hover:text-[#1769E0]"
                                                                        >
                                                                            <FileText className="h-4 w-4 text-[#1769E0]" />
                                                                            <span>Lihat Detail Profil</span>
                                                                        </Link>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setShowRefPopover(false);
                                                                            }}
                                                                            className="ml-1 text-slate-300 hover:text-slate-500"
                                                                            title="Tutup Petunjuk"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="py-14 text-center text-xs font-semibold text-slate-400"
                                                >
                                                    Belum ada kandidat yang melamar pada lowongan ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Realtime Pagination Footer */}
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row text-xs text-slate-500 font-medium">
                                <p>
                                    Menampilkan {pagination.from}–{pagination.to} dari {pagination.total.toLocaleString('id-ID')} kandidat
                                </p>

                                {pagination.last_page > 1 ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={pagination.current_page <= 1}
                                            onClick={() => router.get(`/company/candidates?page=${pagination.current_page - 1}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            ‹
                                        </button>
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => router.get(`/company/candidates?page=${pageNum}`)}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                                                    pageNum === pagination.current_page
                                                        ? 'bg-[#1769E0] text-white shadow-sm'
                                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={pagination.current_page >= pagination.last_page}
                                            onClick={() => router.get(`/company/candidates?page=${pagination.current_page + 1}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            ›
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1769E0] text-xs font-bold text-white shadow-sm">
                                            1
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Donut Chart & Recent Activity (3.5 Columns) */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Card 1: Distribusi Kandidat (100% Realtime Donut Chart) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-bold text-[#102B4B]">
                                        Distribusi Kandidat
                                    </h3>
                                    <Info className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                            </div>

                            {/* Donut Chart SVG */}
                            <div className="mt-5 flex flex-col items-center">
                                <div className="relative flex h-44 w-44 items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                        {/* Base empty ring */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="38"
                                            fill="transparent"
                                            stroke="#EEF2F6"
                                            strokeWidth="14"
                                        />

                                        {totalCount > 0 && (
                                            <>
                                                {/* Dalam Proses (Purple) */}
                                                {inProcessDash > 0 && (
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="38"
                                                        fill="transparent"
                                                        stroke="#8B5CF6"
                                                        strokeWidth="14"
                                                        strokeDasharray={`${inProcessDash} ${circumference}`}
                                                        strokeDashoffset={inProcessOffset}
                                                    />
                                                )}
                                                {/* Lulus Seleksi (Emerald) */}
                                                {passedDash > 0 && (
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="38"
                                                        fill="transparent"
                                                        stroke="#10B981"
                                                        strokeWidth="14"
                                                        strokeDasharray={`${passedDash} ${circumference}`}
                                                        strokeDashoffset={passedOffset}
                                                    />
                                                )}
                                                {/* Seleksi Admin (Amber) */}
                                                {adminReviewDash > 0 && (
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="38"
                                                        fill="transparent"
                                                        stroke="#F59E0B"
                                                        strokeWidth="14"
                                                        strokeDasharray={`${adminReviewDash} ${circumference}`}
                                                        strokeDashoffset={adminReviewOffset}
                                                    />
                                                )}
                                                {/* Ditolak / Lainnya (Rose/Blue) */}
                                                {rejectedDash > 0 && (
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="38"
                                                        fill="transparent"
                                                        stroke="#F43F5E"
                                                        strokeWidth="14"
                                                        strokeDasharray={`${rejectedDash} ${circumference}`}
                                                        strokeDashoffset={rejectedOffset}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <p className="text-xl font-extrabold text-[#102B4B]">
                                            {totalCount.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Total Kandidat
                                        </p>
                                    </div>
                                </div>

                                {/* Legend Details Realtime */}
                                <div className="mt-5 w-full space-y-2.5 text-xs font-semibold">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                                            <span className="text-slate-600">Dalam Proses</span>
                                        </div>
                                        <span className="text-slate-900">
                                            {stats.distribution.in_process} ({stats.distribution.in_process_pct}%)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-slate-600">Lulus Seleksi</span>
                                        </div>
                                        <span className="text-slate-900">
                                            {stats.distribution.passed} ({stats.distribution.passed_pct}%)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                            <span className="text-slate-600">Seleksi Admin</span>
                                        </div>
                                        <span className="text-slate-900">
                                            {stats.distribution.admin_review} ({stats.distribution.admin_review_pct}%)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                            <span className="text-slate-600">Ditolak / Batal</span>
                                        </div>
                                        <span className="text-slate-900">
                                            {stats.distribution.rejected} ({stats.distribution.rejected_pct}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Aktivitas Kandidat Terbaru (Realtime) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#102B4B]">
                                    Aktivitas Kandidat Terbaru
                                </h3>
                                <Link
                                    href="/company/applications"
                                    className="text-xs font-bold text-[#1769E0] hover:underline"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="mt-4 space-y-3.5">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((act) => (
                                        <div key={act.id} className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                                                {act.type === 'hired' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                ) : act.type === 'reviewed' ? (
                                                    <FileText className="h-4 w-4 text-[#1769E0]" />
                                                ) : (
                                                    <User className="h-4 w-4 text-[#1769E0]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-slate-800 leading-snug">
                                                    {act.text}
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                                    {act.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs font-semibold text-slate-400">
                                        Belum ada aktivitas kandidat terbaru.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick View Modal Detail Profil Kandidat */}
            {quickViewCandidate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setQuickViewCandidate(null)}
                >
                    <div
                        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#1769E0]" />
                                <h3 className="text-base font-extrabold text-[#102B4B]">Detail Profil Kandidat</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuickViewCandidate(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {/* Profile Overview */}
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                                    {quickViewCandidate.avatar ? (
                                        <img
                                            src={quickViewCandidate.avatar}
                                            alt={quickViewCandidate.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                                const fallback = (e.target as HTMLElement).parentElement?.querySelector('.modal-avatar-fallback') as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`modal-avatar-fallback ${quickViewCandidate.avatar ? 'hidden' : 'flex'} h-full w-full items-center justify-center text-base font-black shadow-sm ${quickViewCandidate.color}`}>
                                        {quickViewCandidate.initials}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[#102B4B]">{quickViewCandidate.name}</h4>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{quickViewCandidate.education}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        {quickViewCandidate.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                {quickViewCandidate.email}
                                            </span>
                                        )}
                                        {quickViewCandidate.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                {quickViewCandidate.phone}
                                            </span>
                                        )}
                                        {quickViewCandidate.domicile && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                {quickViewCandidate.domicile}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio / Ringkasan Diri */}
                            {quickViewCandidate.bio && (
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                                    <span className="text-xs font-bold text-[#102B4B] block mb-1">Ringkasan Profil Diri:</span>
                                    <p className="text-xs text-slate-600 leading-relaxed italic">
                                        "{quickViewCandidate.bio}"
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="rounded-2xl border border-slate-100 p-4 space-y-2.5 bg-slate-50/40">
                                    <span className="font-bold text-slate-700 block">Informasi Lamaran</span>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Posisi:</span>
                                        <span className="font-bold text-slate-800">{quickViewCandidate.applied_position}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Tanggal Melamar:</span>
                                        <span className="font-semibold text-slate-700">{quickViewCandidate.applied_at || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Status:</span>
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${quickViewCandidate.status_color}`}>
                                            {quickViewCandidate.status_label}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 p-4 space-y-2.5 bg-slate-50/40">
                                    <span className="font-bold text-slate-700 block">Accessibility Profile</span>
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                        {renderAccessibilityIcon(quickViewCandidate.disability_type)}
                                        <span>{quickViewCandidate.disability_type}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Kandidat telah terverifikasi dan memenuhi standar inklusivitas Profabel.
                                    </p>
                                </div>
                            </div>

                            {/* Skills */}
                            {quickViewCandidate.all_skills && quickViewCandidate.all_skills.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-slate-700 block mb-2">Keahlian & Kemampuan:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickViewCandidate.all_skills.map((s, idx) => (
                                            <span key={idx} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1769E0]">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/70">
                            <button
                                type="button"
                                onClick={() => setQuickViewCandidate(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Tutup
                            </button>
                            <div className="flex items-center gap-2">
                                {quickViewCandidate.cv_url && (
                                    <a
                                        href={quickViewCandidate.cv_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                                    >
                                        <Download className="h-3.5 w-3.5 text-purple-600" />
                                        <span>Unduh CV</span>
                                    </a>
                                )}
                                <Link
                                    href={`/company/candidates/${quickViewCandidate.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
                                >
                                    <span>Buka Detail Lengkap</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
