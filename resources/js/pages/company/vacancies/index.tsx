import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Code2,
    Edit2,
    Eye,
    FileText,
    HelpCircle,
    MapPin,
    Megaphone,
    Monitor,
    MoreHorizontal,
    Pause,
    Play,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface VacancyItem {
    id: number;
    title: string;
    slug: string;
    job_type: string;
    work_model: string;
    location: string;
    status: 'draft' | 'active' | 'closed';
    category?: string;
    category_color?: string;
    category_bg?: string;
    category_icon?: string;
    formatted_created_at?: string;
    applications_count?: number;
    is_featured?: boolean;
    is_scheduled?: boolean;
    scheduled_at?: string;
    created_at: string;
}

interface StatsData {
    total_vacancies: number;
    total_growth: string;
    active_vacancies: number;
    active_growth: string;
    closed_vacancies: number;
    closed_growth: string;
    draft_vacancies: number;
    draft_growth: string;
}

interface FilterProps {
    search?: string;
    status?: string;
    category?: string;
    location?: string;
}

interface Props {
    vacancies: {
        data: VacancyItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: StatsData;
    filters: FilterProps;
    locations: string[];
}

export default function VacanciesIndex({
    vacancies,
    stats,
    filters,
    locations = [],
}: Props): ReactElement {
    const [searchVal, setSearchVal] = useState(filters.search ?? '');

    const handleSearchSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        router.get(
            '/company/vacancies',
            { ...filters, search: searchVal, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: string, val: string): void => {
        router.get(
            '/company/vacancies',
            { ...filters, [key]: val, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (id: number, newStatus: 'draft' | 'active' | 'closed'): void => {
        router.patch(`/company/vacancies/${id}/status`, { status: newStatus });
    };

    const handleDelete = (id: number, title: string): void => {
        if (confirm(`Yakin ingin menghapus lowongan "${title}"? Data yang dihapus tidak dapat dikembalikan.`)) {
            router.delete(`/company/vacancies/${id}`);
        }
    };

    const renderCategoryBadge = (vacancy: VacancyItem): ReactElement => {
        const cat = vacancy.category ?? 'Lainnya';
        const color = vacancy.category_color ?? '#64748B';
        const bg = vacancy.category_bg ?? '#F1F5F9';

        const getIcon = () => {
            switch (vacancy.category_icon) {
                case 'monitor':
                    return <Monitor className="h-3.5 w-3.5" />;
                case 'code':
                    return <Code2 className="h-3.5 w-3.5" />;
                case 'user':
                    return <User className="h-3.5 w-3.5" />;
                case 'megaphone':
                    return <Megaphone className="h-3.5 w-3.5" />;
                default:
                    return <MoreHorizontal className="h-3.5 w-3.5" />;
            }
        };

        return (
            <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold dark:!bg-[#0D2352] dark:!text-[#38BDF8] dark:border dark:border-blue-900/50"
                style={{ backgroundColor: bg, color }}
            >
                {getIcon()}
                <span>{cat}</span>
            </span>
        );
    };

    const renderStatusBadge = (vacancy: VacancyItem): ReactElement => {
        if (vacancy.status === 'draft' && vacancy.is_scheduled) {
            return (
                <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                    title={vacancy.scheduled_at ? `Dijadwalkan tayang: ${vacancy.scheduled_at}` : 'Dijadwalkan'}
                >
                    <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    Terjadwal
                </span>
            );
        }

        switch (vacancy.status) {
            case 'active':
                return (
                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-[#10B981] dark:text-emerald-400">
                        Aktif
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] dark:bg-slate-800 px-3 py-1 text-xs font-bold text-[#64748B] dark:text-slate-300">
                        Ditutup
                    </span>
                );
            case 'draft':
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-[#FEF7EC] dark:bg-amber-950/60 px-3 py-1 text-xs font-bold text-[#F59E0B] dark:text-amber-400">
                        Draft
                    </span>
                );
        }
    };

    const categoriesList = [
        'Semua Kategori',
        'UI/UX & Desain',
        'Teknologi Informasi',
        'Administrasi',
        'Pemasaran',
        'Lainnya',
    ];

    const statusOptions = [
        { label: 'Semua Status', value: 'all' },
        { label: 'Aktif', value: 'active' },
        { label: 'Ditutup', value: 'closed' },
        { label: 'Draft', value: 'draft' },
    ];

    const currentStatusLabel =
        statusOptions.find((s) => s.value === (filters.status ?? 'all'))?.label ?? 'Semua Status';
    const currentCategoryLabel =
        !filters.category || filters.category === 'all' ? 'Semua Kategori' : filters.category;
    const currentLocationLabel =
        !filters.location || filters.location === 'all' ? 'Semua Lokasi' : filters.location;

    return (
        <CompanyLayout>
            <Head title="Lowongan Perusahaan - Profabel" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                        Lowongan Perusahaan
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Kelola seluruh lowongan pekerjaan perusahaan Anda, mulai dari membuat, mengubah, hingga memantau status lowongan.
                    </p>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Lowongan */}
                    <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1769E0] dark:text-[#38BDF8]">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Total Lowongan</p>
                                <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                                    {stats.total_vacancies}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-[#10B981] dark:text-emerald-400">
                                        ↑ {stats.total_growth}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Lowongan Aktif */}
                    <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F8F0] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-400">
                                <Play className="h-6 w-6 fill-[#10B981] dark:fill-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Lowongan Aktif</p>
                                <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                                    {stats.active_vacancies}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-[#10B981] dark:text-emerald-400">
                                        {stats.active_growth}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Lowongan Ditutup */}
                    <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3EFFE] dark:bg-purple-950/60 text-[#8B5CF6] dark:text-purple-400">
                                <Pause className="h-6 w-6 fill-[#8B5CF6] dark:fill-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Lowongan Ditutup</p>
                                <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                                    {stats.closed_vacancies}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-[#64748B] dark:text-slate-300">
                                        {stats.closed_growth}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Draft */}
                    <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEF7EC] dark:bg-amber-950/60 text-[#F59E0B] dark:text-amber-400">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Draft</p>
                                <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                                    {stats.draft_vacancies}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-[#10B981] dark:text-emerald-400">
                                        ↑ {stats.draft_growth}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Action Bar */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search and Dropdowns */}
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1 sm:max-w-xs">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder="Cari nama lowongan atau kata kunci..."
                                className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                            />
                        </form>

                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <span>{currentStatusLabel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44 rounded-xl bg-white dark:bg-[#071336] p-1 shadow-lg border border-slate-100 dark:border-white/10">
                                {statusOptions.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => handleFilterChange('status', opt.value)}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                            (filters.status ?? 'all') === opt.value
                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1769E0] dark:text-[#38BDF8]'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Category Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <span>{currentCategoryLabel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 rounded-xl bg-white dark:bg-[#071336] p-1 shadow-lg border border-slate-100 dark:border-white/10">
                                {categoriesList.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        onClick={() => handleFilterChange('category', cat === 'Semua Kategori' ? 'all' : cat)}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                            currentCategoryLabel === cat
                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1769E0] dark:text-[#38BDF8]'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {cat}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Location Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <span>{currentLocationLabel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44 rounded-xl bg-white dark:bg-[#071336] p-1 shadow-lg border border-slate-100 dark:border-white/10">
                                <DropdownMenuItem
                                    onClick={() => handleFilterChange('location', 'all')}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                        currentLocationLabel === 'Semua Lokasi'
                                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1769E0] dark:text-[#38BDF8]'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    Semua Lokasi
                                </DropdownMenuItem>
                                {locations.map((loc) => (
                                    <DropdownMenuItem
                                        key={loc}
                                        onClick={() => handleFilterChange('location', loc)}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                            currentLocationLabel === loc
                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1769E0] dark:text-[#38BDF8]'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {loc}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* + Tambah Lowongan Button */}
                    <Link
                        href="/company/vacancies/create"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1769E0] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1258c2] transition shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Lowongan</span>
                    </Link>
                </div>

                {/* Table Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#071336] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#050E2E] text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    <th className="py-3.5 pl-6 pr-3 w-14">No</th>
                                    <th className="py-3.5 px-4 min-w-[180px]">Nama Lowongan</th>
                                    <th className="py-3.5 px-4 min-w-[150px]">Kategori</th>
                                    <th className="py-3.5 px-4 min-w-[130px]">Lokasi</th>
                                    <th className="py-3.5 px-4 min-w-[120px]">Tgl Dibuat</th>
                                    <th className="py-3.5 px-4 min-w-[100px]">Status</th>
                                    <th className="py-3.5 pl-4 pr-6 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {vacancies.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-[#102B4B] dark:text-white">
                                                Tidak Ada Lowongan Ditemukan
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Cobalah mengubah kata kunci pencarian atau pasang lowongan pekerjaan baru.
                                            </p>
                                            <div className="mt-5">
                                                <Link
                                                    href="/company/vacancies/create"
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769E0] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1258c2] transition"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Tambah Lowongan
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    vacancies.data.map((vacancy, index) => {
                                        const rowNumber = (vacancies.from ?? 1) + index;

                                        return (
                                            <tr
                                                key={vacancy.id}
                                                className="transition hover:bg-slate-50/70 dark:hover:bg-[#0E2254]"
                                            >
                                                <td className="py-4 pl-6 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                                                    {rowNumber}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-[#102B4B] dark:text-white">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Link
                                                            href={`/jobs/${vacancy.slug}`}
                                                            className="hover:text-[#1769E0] dark:hover:text-[#38BDF8] transition"
                                                        >
                                                            {vacancy.title}
                                                        </Link>
                                                        {vacancy.is_featured && (
                                                            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                                                ⭐ Unggulan
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {renderCategoryBadge(vacancy)}
                                                </td>
                                                <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        <span>{vacancy.location}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                                                    {vacancy.formatted_created_at ?? vacancy.created_at}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {renderStatusBadge(vacancy)}
                                                </td>
                                                <td className="py-4 pl-4 pr-6">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* View / Preview */}
                                                        <Link
                                                            href={`/jobs/${vacancy.slug}`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#1769E0] dark:hover:text-[#38BDF8] transition"
                                                            title="Lihat Pratinjau Publik"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>

                                                        {/* Edit */}
                                                        <Link
                                                            href={`/company/vacancies/${vacancy.id}/edit`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#1769E0] dark:hover:text-[#38BDF8] transition"
                                                            title="Ubah Lowongan"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>

                                                        {/* More Menu */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition"
                                                                    title="Opsi Lainnya"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-48 rounded-xl bg-white dark:bg-[#071336] p-1.5 shadow-xl border border-slate-100 dark:border-white/10 text-xs"
                                                            >
                                                                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">
                                                                    Ubah Status
                                                                </div>
                                                                {vacancy.status !== 'active' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusChange(vacancy.id, 'active')}
                                                                        className="cursor-pointer rounded-lg px-2.5 py-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                                                    >
                                                                        Jadikan Aktif
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {vacancy.status !== 'closed' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusChange(vacancy.id, 'closed')}
                                                                        className="cursor-pointer rounded-lg px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                                                    >
                                                                        Tutup Lowongan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {vacancy.status !== 'draft' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusChange(vacancy.id, 'draft')}
                                                                        className="cursor-pointer rounded-lg px-2.5 py-1.5 font-semibold text-amber-600 hover:bg-amber-50"
                                                                    >
                                                                        Kembalikan ke Draft
                                                                    </DropdownMenuItem>
                                                                )}

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(vacancy.id, vacancy.title)}
                                                                    className="cursor-pointer rounded-lg px-2.5 py-1.5 font-semibold text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                                    <span>Hapus Lowongan</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    {vacancies.total > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
                            <div>
                                Menampilkan{' '}
                                <span className="font-bold text-[#102B4B]">
                                    {vacancies.from ?? 0} – {vacancies.to ?? 0}
                                </span>{' '}
                                dari <span className="font-bold text-[#102B4B]">{vacancies.total}</span> lowongan
                            </div>

                            {/* Pagination Links */}
                            {vacancies.links && vacancies.links.length > 3 && (
                                <div className="flex items-center gap-1.5">
                                    {vacancies.links.map((link, idx) => {
                                        const isPrev = link.label.includes('&laquo;') || link.label.includes('Previous');
                                        const isNext = link.label.includes('&raquo;') || link.label.includes('Next');

                                        if (isPrev) {
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url ?? '#'}
                                                    preserveScroll
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition ${
                                                        link.url
                                                            ? 'text-slate-700 hover:bg-slate-50'
                                                            : 'text-slate-300 pointer-events-none'
                                                    }`}
                                                    aria-label="Halaman Sebelumnya"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Link>
                                            );
                                        }

                                        if (isNext) {
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url ?? '#'}
                                                    preserveScroll
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition ${
                                                        link.url
                                                            ? 'text-slate-700 hover:bg-slate-50'
                                                            : 'text-slate-300 pointer-events-none'
                                                    }`}
                                                    aria-label="Halaman Berikutnya"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition ${
                                                    link.active
                                                        ? 'bg-[#1769E0] text-white shadow-sm'
                                                        : link.url
                                                        ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                                        : 'text-slate-400 pointer-events-none'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CompanyLayout>
    );
}
