import { TimeAgo } from '@/components/time-ago';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Accessibility,
    ArrowRight,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Compass,
    DollarSign,
    Filter,
    GraduationCap,
    MapPin,
    RotateCcw,
    Search,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';

interface AccessibilityItem {
    id: number;
    accommodation_type: string;
    description?: string;
}

interface CompanyItem {
    id: number;
    company_name: string;
    industry?: string;
}

interface VacancyItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    job_type: string;
    work_model: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    is_salary_public: boolean;
    experience_level: string;
    requirements?: any;
    skills_required?: any;
    deadline?: string;
    created_at: string;
    time_ago?: string;
    company_profile?: CompanyItem | null;
    accessibilities: AccessibilityItem[];
}

function parseSkillList(skills: unknown): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) {
        return skills.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    }
    if (typeof skills === 'object') {
        const obj = skills as Record<string, unknown>;
        if (Array.isArray(obj.responsibilities)) {
            return obj.responsibilities.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
        }
        if (Array.isArray(obj.skills)) {
            return obj.skills.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
        }
        return Object.values(obj).filter((s): s is string => typeof s === 'string' && s.trim().length > 0 && s.length < 50);
    }
    if (typeof skills === 'string') {
        try {
            const parsed = JSON.parse(skills);
            return parseSkillList(parsed);
        } catch {
            return skills.split(',').map((s) => s.trim()).filter(Boolean);
        }
    }
    return [];
}

function parseRequirementsList(reqs: unknown): string[] {
    if (!reqs) return [];
    if (Array.isArray(reqs)) {
        return reqs.filter((r): r is string => typeof r === 'string' && r.trim().length > 0);
    }
    if (typeof reqs === 'string') {
        try {
            const parsed = JSON.parse(reqs);
            return parseRequirementsList(parsed);
        } catch {
            return reqs.split('\n').map((r) => r.trim()).filter(Boolean);
        }
    }
    if (typeof reqs === 'object') {
        return Object.values(reqs as Record<string, unknown>).filter((r): r is string => typeof r === 'string' && r.trim().length > 0);
    }
    return [];
}

interface Props {
    vacancies: {
        data: VacancyItem[];
        total?: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        work_model?: string;
        job_type?: string;
        accessibility?: string;
        location?: string;
        experience_level?: string;
        only_favorites?: boolean;
    };
    savedVacancyIds?: number[];
}

export default function JobsIndex({ vacancies, filters, savedVacancyIds = [] }: Props): ReactElement {
    const page = usePage();
    const auth = (page.props as any).auth;
    const [savedIds, setSavedIds] = useState<number[]>(savedVacancyIds);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');
    const [workModel, setWorkModel] = useState(filters.work_model ?? '');
    const [jobType, setJobType] = useState(filters.job_type ?? '');
    const [accessibility, setAccessibility] = useState(
        filters.accessibility ?? '',
    );
    const [location, setLocation] = useState(filters.location ?? '');
    const [onlyFavorites, setOnlyFavorites] = useState(Boolean(filters.only_favorites));
    const [speakingJobId, setSpeakingJobId] = useState<number | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        if (savedVacancyIds) {
            setSavedIds(savedVacancyIds);
        }
    }, [savedVacancyIds]);

    const handleToggleFavorite = (e: React.MouseEvent, vacancyId: number): void => {
        e.stopPropagation();
        e.preventDefault();
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        if (togglingId === vacancyId) return;

        const isSaved = savedIds.includes(vacancyId);
        setSavedIds((prev) =>
            isSaved ? prev.filter((id) => id !== vacancyId) : [...prev, vacancyId]
        );
        setTogglingId(vacancyId);

        router.post(
            `/vacancies/${vacancyId}/favorite`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const activeFiltersCount = [
        Boolean(location),
        Boolean(jobType),
        Boolean(workModel),
        Boolean(accessibility),
        Boolean(onlyFavorites),
    ].filter(Boolean).length;

    // Selected vacancy for right preview column (defaults to first item)
    const [selectedJob, setSelectedJob] = useState<VacancyItem | null>(
        vacancies.data.length > 0 ? vacancies.data[0] : null,
    );

    useEffect(() => {
        if (vacancies.data.length > 0) {
            const exists =
                selectedJob &&
                vacancies.data.some((j) => j.id === selectedJob.id);
            if (!exists) {
                setSelectedJob(vacancies.data[0]);
            }
        } else {
            setSelectedJob(null);
        }
    }, [vacancies.data]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const applyFilters = (e?: FormEvent): void => {
        if (e) e.preventDefault();
        router.get(
            '/jobs',
            {
                search: search || undefined,
                work_model: workModel || undefined,
                job_type: jobType || undefined,
                accessibility: accessibility || undefined,
                only_favorites: onlyFavorites ? true : undefined,
            },
            { preserveState: true },
        );
    };

    const resetFilters = (): void => {
        setSearch('');
        setWorkModel('');
        setJobType('');
        setAccessibility('');
        setLocation('');
        setOnlyFavorites(false);
        router.get('/jobs');
    };

    const handleSpeak = (
        e: React.MouseEvent,
        jobId: number,
        text: string,
    ): void => {
        e.stopPropagation();
        if (typeof window === 'undefined' || !('speechSynthesis' in window))
            return;

        if (speakingJobId === jobId || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setSpeakingJobId(null);
            if (speakingJobId === jobId) return;
        }

        window.speechSynthesis.cancel();
        setSpeakingJobId(jobId);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.onstart = () => setSpeakingJobId(jobId);
        utterance.onend = () => setSpeakingJobId(null);
        utterance.onerror = () => setSpeakingJobId(null);
        window.speechSynthesis.speak(utterance);
    };

    const totalCount = vacancies.total ?? vacancies.data.length;

    return (
        <AppLayout>
            <Head title="Cari Kerja - Lowongan Ramah Disabilitas Profabel" />

            <div className="space-y-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* ===================== 1. LEFT COLUMN: FILTER PENCARIAN (3 COLS) ===================== */}
                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5 lg:sticky lg:top-24 lg:col-span-3 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                        {/* Header: Clickable on mobile to toggle minimize with animated 'V' */}
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileFilterOpen((prev) => !prev)
                                }
                                className="flex flex-1 cursor-pointer items-center justify-between text-left lg:cursor-default"
                                aria-expanded={isMobileFilterOpen}
                                aria-controls="filter-body-container"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-[#102B4B]" />
                                    <h2 className="text-sm font-bold text-[#102B4B]">
                                        Filter Pencarian
                                    </h2>
                                    {activeFiltersCount > 0 && (
                                        <span className="rounded-full bg-[#EBF5FA] px-2 py-0.5 text-[10px] font-bold text-[#007F96]">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </div>

                                {/* Tombol V dengan animasi naik-turun (rotasi smooth) khusus tampilan HP */}
                                <div className="flex items-center gap-2 lg:hidden">
                                    {activeFiltersCount > 0 && (
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                resetFilters();
                                            }}
                                            className="cursor-pointer text-xs font-semibold text-[#1674D1] hover:underline"
                                        >
                                            Reset
                                        </span>
                                    )}
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-transform duration-300 ease-in-out hover:bg-slate-200 ${
                                            isMobileFilterOpen
                                                ? 'rotate-180 bg-[#EBF5FA] text-[#007F96]'
                                                : 'rotate-0'
                                        }`}
                                        title={
                                            isMobileFilterOpen
                                                ? 'Minimize Filter'
                                                : 'Buka Filter'
                                        }
                                        aria-label={
                                            isMobileFilterOpen
                                                ? 'Minimize Filter'
                                                : 'Buka Filter'
                                        }
                                    >
                                        <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                                    </div>
                                </div>
                            </button>

                            {/* Reset button untuk tampilan desktop (lg+) */}
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="hidden cursor-pointer items-center gap-1 text-xs font-semibold text-[#1674D1] hover:underline lg:flex"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Body Filter: Bisa di-minimize secara smooth naik-turun di HP, selalu tampil di Desktop */}
                        <div
                            id="filter-body-container"
                            className={`grid transition-all duration-300 ease-in-out lg:!grid lg:!grid-rows-[1fr] lg:!opacity-100 ${
                                isMobileFilterOpen
                                    ? 'grid-rows-[1fr] opacity-100 pt-3.5'
                                    : 'grid-rows-[0fr] opacity-0 overflow-hidden lg:overflow-visible lg:pt-3.5'
                            }`}
                        >
                            <div className="min-h-0 space-y-5 overflow-hidden lg:overflow-visible">

                        {/* Lokasi */}
                        <div>
                            <label
                                htmlFor="filter-location"
                                className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#102B4B]"
                            >
                                <MapPin className="h-3.5 w-3.5 text-[#1674D1]" />
                                Lokasi
                            </label>
                            <select
                                id="filter-location"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setSearch(e.target.value);
                                    router.get(
                                        '/jobs',
                                        { search: e.target.value || undefined },
                                        { preserveState: true },
                                    );
                                }}
                                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#102B4B] outline-none focus:border-[#007F96] focus:bg-white"
                            >
                                <option value="">Semua Lokasi</option>
                                <option value="Jakarta">Jakarta</option>
                                <option value="Bandung">Bandung</option>
                                <option value="Surabaya">Surabaya</option>
                                <option value="Yogyakarta">Yogyakarta</option>
                                <option value="Semarang">Semarang</option>
                            </select>
                        </div>

                        {/* Jenis Pekerjaan */}
                        <div>
                            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#102B4B]">
                                <Briefcase className="h-3.5 w-3.5 text-[#1674D1]" />
                                Jenis Pekerjaan
                            </span>
                            <div className="space-y-2 text-xs text-[#475569]">
                                {[
                                    { id: 'full-time', label: 'Full Time' },
                                    { id: 'part-time', label: 'Part Time' },
                                    { id: 'freelance', label: 'Freelance' },
                                    { id: 'internship', label: 'Magang' },
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex cursor-pointer items-center gap-2.5"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={jobType === item.id}
                                            onChange={() => {
                                                const newType =
                                                    jobType === item.id
                                                        ? ''
                                                        : item.id;
                                                setJobType(newType);
                                                router.get(
                                                    '/jobs',
                                                    {
                                                        job_type:
                                                            newType ||
                                                            undefined,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }}
                                            className="h-4 w-4 rounded border-[#E2E8F0] text-[#123B5D] focus:ring-[#007F96]"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Industri */}
                        <div>
                            <label
                                htmlFor="filter-industry"
                                className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#102B4B]"
                            >
                                <Building2 className="h-3.5 w-3.5 text-[#1674D1]" />
                                Industri
                            </label>
                            <select
                                id="filter-industry"
                                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#102B4B] outline-none focus:border-[#007F96] focus:bg-white"
                            >
                                <option value="">Semua Industri</option>
                                <option value="it">Teknologi Informasi</option>
                                <option value="service">
                                    Layanan Pelanggan
                                </option>
                                <option value="admin">
                                    Administrasi & Keuangan
                                </option>
                                <option value="creative">
                                    Desain & Kreatif
                                </option>
                            </select>
                        </div>

                        {/* Aksesibilitas */}
                        <div>
                            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#102B4B]">
                                <Accessibility className="h-3.5 w-3.5 text-[#1674D1]" />
                                Aksesibilitas
                            </span>
                            <div className="space-y-2 text-xs text-[#475569]">
                                {[
                                    {
                                        id: 'ramp_access',
                                        label: 'Akses Ram / Kursi Roda',
                                    },
                                    {
                                        id: 'screen_reader_software',
                                        label: 'Screen Reader Friendly',
                                    },
                                    {
                                        id: 'remote_option',
                                        label: 'Dapat Bekerja Remote',
                                    },
                                    {
                                        id: 'written_communication',
                                        label: 'Komunikasi Tertulis',
                                    },
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex cursor-pointer items-center gap-2.5"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={accessibility === item.id}
                                            onChange={() => {
                                                const newAcc =
                                                    accessibility === item.id
                                                        ? ''
                                                        : item.id;
                                                setAccessibility(newAcc);
                                                router.get(
                                                    '/jobs',
                                                    {
                                                        accessibility:
                                                            newAcc || undefined,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }}
                                            className="h-4 w-4 rounded border-[#E2E8F0] text-[#123B5D] focus:ring-[#007F96]"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Model Kerja */}
                        <div>
                            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#102B4B]">
                                <Compass className="h-3.5 w-3.5 text-[#1674D1]" />
                                Model Kerja
                            </span>
                            <div className="space-y-2 text-xs text-[#475569]">
                                {[
                                    { id: 'onsite', label: 'Onsite (Kantor)' },
                                    { id: 'remote', label: 'Remote (WFH)' },
                                    { id: 'hybrid', label: 'Hybrid' },
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex cursor-pointer items-center gap-2.5"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={workModel === item.id}
                                            onChange={() => {
                                                const newModel =
                                                    workModel === item.id
                                                        ? ''
                                                        : item.id;
                                                setWorkModel(newModel);
                                                router.get(
                                                    '/jobs',
                                                    {
                                                        work_model:
                                                            newModel ||
                                                            undefined,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }}
                                            className="h-4 w-4 rounded border-[#E2E8F0] text-[#123B5D] focus:ring-[#007F96]"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filter Khusus: Lowongan Favorit Saya (Khusus User Login) */}
                        {auth?.user && (
                            <div className="border-t border-[#F1F5F9] pt-3">
                                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#102B4B]">
                                    <input
                                        type="checkbox"
                                        checked={onlyFavorites}
                                        onChange={(e) => {
                                            setOnlyFavorites(e.target.checked);
                                            router.get(
                                                '/jobs',
                                                {
                                                    search: search || undefined,
                                                    work_model: workModel || undefined,
                                                    job_type: jobType || undefined,
                                                    accessibility: accessibility || undefined,
                                                    only_favorites: e.target.checked ? true : undefined,
                                                },
                                                { preserveState: true },
                                            );
                                        }}
                                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#1769E0] focus:ring-[#1769E0]"
                                    />
                                    <Bookmark className="h-3.5 w-3.5 text-[#1769E0] fill-[#1769E0]" />
                                    <span>Hanya Lowongan Favorit</span>
                                </label>
                            </div>
                        )}

                        {/* Tombol Tutup / Minimize Khusus Tampilan HP */}
                        <div className="border-t border-[#F1F5F9] pt-2 pb-1 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#F1F5F9] py-2.5 text-xs font-bold text-[#475569] transition hover:bg-[#E2E8F0]"
                            >
                                <span>Tutup Filter</span>
                                <ChevronDown className="h-4 w-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

                    {/* ===================== 2. MIDDLE COLUMN: DAFTAR LOWONGAN (5 COLS) ===================== */}
                    <div className="space-y-4 lg:col-span-5">
                        {/* Title & Subtitle */}
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#102B4B] sm:text-3xl">
                                Cari Pekerjaan
                            </h1>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Temukan peluang karier yang sesuai dengan minat,
                                keahlian, dan kebutuhanmu.
                            </p>
                        </div>

                        {/* Search Input Bar */}
                        <form
                            onSubmit={applyFilters}
                            className="relative flex items-center"
                        >
                            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="cari nama pekerjaan, perusahaan, atau kata kunci..."
                                className="min-h-[46px] w-full rounded-2xl border border-[#E2E8F0] bg-white py-3 pr-24 pl-10 text-xs text-[#102B4B] transition outline-none placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 cursor-pointer rounded-xl bg-[#007F96] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#123B5D]"
                            >
                                Cari
                            </button>
                        </form>

                        {/* Count & Sorting Bar */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="font-bold text-[#102B4B]">
                                <strong className="font-extrabold">
                                    {totalCount}
                                </strong>{' '}
                                lowongan ditemukan
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <span>Urutan:</span>
                                <select className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#102B4B] outline-none">
                                    <option value="newest">Terbaru</option>
                                    <option value="relevant">
                                        Paling Relevan
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Vacancy Cards List */}
                        {vacancies.data.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center text-xs text-slate-400">
                                Tidak ada lowongan yang sesuai kriteria filter.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vacancies.data.map((job) => {
                                    const isSelected =
                                        selectedJob?.id === job.id;

                                    return (
                                        <div
                                            key={job.id}
                                            onClick={() => {
                                                setSelectedJob(job);
                                                if (
                                                    typeof window !==
                                                        'undefined' &&
                                                    window.innerWidth < 1024
                                                ) {
                                                    router.visit(
                                                        `/jobs/${job.slug}`,
                                                    );
                                                }
                                            }}
                                            className={`relative cursor-pointer rounded-2xl border bg-white p-4 transition sm:p-5 ${
                                                isSelected
                                                    ? 'border-[#20B8C1] shadow-md ring-2 ring-[#20B8C1]/30'
                                                    : 'border-[#E2E8F0] shadow-2xs hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    {/* Company Logo Badge */}
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] text-sm font-extrabold text-[#16A36B]">
                                                        {(job.company_profile?.company_name || 'Perusahaan')
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/jobs/${job.slug}`}
                                                            onClick={(e) => {
                                                                if (
                                                                    typeof window !==
                                                                        'undefined' &&
                                                                    window.innerWidth >=
                                                                        1024
                                                                ) {
                                                                    e.preventDefault();
                                                                    setSelectedJob(
                                                                        job,
                                                                    );
                                                                }
                                                            }}
                                                            className="line-clamp-1 text-sm font-bold text-[#102B4B] hover:text-[#007F96] sm:text-base"
                                                        >
                                                            {job.title}
                                                        </Link>
                                                        <p className="mt-0.5 text-xs text-[#64748B]">
                                                            {job.company_profile?.company_name || 'Perusahaan'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions (Speaker + Bookmark) */}
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleSpeak(
                                                                e,
                                                                job.id,
                                                                `${job.title} di ${job.company_profile?.company_name || 'Perusahaan'}, lokasi ${job.location}`,
                                                            )
                                                        }
                                                        aria-label={
                                                            speakingJobId ===
                                                            job.id
                                                                ? `Hentikan suara ${job.title}`
                                                                : `Bacakan ${job.title}`
                                                        }
                                                        className={`rounded-lg p-1.5 transition ${
                                                            speakingJobId ===
                                                            job.id
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-700'
                                                        }`}
                                                    >
                                                        {speakingJobId ===
                                                        job.id ? (
                                                            <VolumeX className="h-4 w-4 animate-pulse" />
                                                        ) : (
                                                            <Volume2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleToggleFavorite(e, job.id)}
                                                        disabled={togglingId === job.id}
                                                        className={`p-1.5 transition rounded-lg cursor-pointer ${
                                                            savedIds.includes(job.id)
                                                                ? 'text-[#1769E0] bg-blue-50 hover:bg-blue-100'
                                                                : 'text-slate-400 hover:text-[#123B5D] hover:bg-slate-50'
                                                        }`}
                                                        aria-label={savedIds.includes(job.id) ? "Hapus dari favorit" : "Simpan lowongan ke favorit"}
                                                        title={savedIds.includes(job.id) ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
                                                    >
                                                        <Bookmark className={`h-4 w-4 ${savedIds.includes(job.id) ? 'fill-[#1769E0]' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Location & Metadata Row */}
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="capitalize">
                                                        {job.job_type}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-700 uppercase">
                                                    ★ {job.work_model}
                                                </span>
                                            </div>

                                            {/* Tags & Time */}
                                            <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="flex items-center gap-1 rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Ramah Disabilitas
                                                    </span>
                                                    {parseSkillList(job.skills_required)
                                                        .slice(0, 2)
                                                        .map((s, i) => (
                                                            <span
                                                                key={i}
                                                                className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]"
                                                            >
                                                                {s}
                                                            </span>
                                                        ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-[#94A3B8]">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        <TimeAgo
                                                            date={job.created_at}
                                                            fallback={job.time_ago}
                                                        />
                                                    </span>
                                                    <Link
                                                        href={`/jobs/${job.slug}`}
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="flex items-center gap-0.5 rounded-lg bg-[#EBF5FA] px-2 py-1 text-[10px] font-bold text-[#123B5D] transition hover:bg-[#D0E5F0] lg:hidden"
                                                    >
                                                        <span>Detail</span>
                                                        <ArrowRight className="h-2.5 w-2.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ===================== 3. RIGHT COLUMN: PREVIEW LOWONGAN (4 COLS) ===================== */}
                    <div className="sticky top-24 hidden lg:col-span-4 lg:block">
                        {selectedJob ? (
                            <div className="space-y-5 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                                {/* Company Header */}
                                <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DCFCE7] bg-[#F0FDF4] text-base font-extrabold text-[#16A36B]">
                                        {(selectedJob.company_profile?.company_name || 'Perusahaan')
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#102B4B]">
                                            {selectedJob.company_profile?.company_name || 'Perusahaan'}
                                        </h3>
                                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#64748B]">
                                            <span>{selectedJob.location}</span>
                                            <span>•</span>
                                            <span className="capitalize">
                                                {selectedJob.work_model}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Title & Accessibility Badge */}
                                <div>
                                    <h2 className="text-xl font-extrabold text-[#102B4B]">
                                        {selectedJob.title}
                                    </h2>
                                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Ramah Disabilitas
                                    </span>
                                </div>

                                {/* Detail Pekerjaan */}
                                <div>
                                    <h4 className="mb-1.5 text-xs font-bold text-[#102B4B]">
                                        Detail Pekerjaan
                                    </h4>
                                    <p className="line-clamp-4 text-xs leading-relaxed text-[#64748B]">
                                        {selectedJob.description}
                                    </p>
                                </div>

                                {/* Tanggung Jawab / Kualifikasi */}
                                {parseRequirementsList(selectedJob.requirements).length > 0 && (
                                    <div>
                                        <h4 className="mb-1.5 text-xs font-bold text-[#102B4B]">
                                            Kualifikasi Utama
                                        </h4>
                                        <ul className="list-inside list-disc space-y-1 text-xs text-[#475569]">
                                            {parseRequirementsList(selectedJob.requirements)
                                                .slice(0, 3)
                                                .map((r, i) => (
                                                    <li key={i}>{r}</li>
                                                ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Metadata List */}
                                <div className="space-y-2.5 border-t border-[#F1F5F9] pt-3 text-xs">
                                    <div className="flex items-center gap-2 text-[#475569]">
                                        <Clock className="h-4 w-4 text-[#1674D1]" />
                                        <span>
                                            Diposting:{' '}
                                            <strong className="text-[#102B4B]">
                                                <TimeAgo
                                                    date={selectedJob.created_at}
                                                    fallback={selectedJob.time_ago}
                                                />
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[#475569]">
                                        <DollarSign className="h-4 w-4 text-[#1674D1]" />
                                        <span>
                                            Gaji:{' '}
                                            <strong className="text-[#102B4B]">
                                                {selectedJob.is_salary_public &&
                                                selectedJob.salary_min
                                                    ? `Rp ${selectedJob.salary_min.toLocaleString('id-ID')} - ${selectedJob.salary_max?.toLocaleString('id-ID')} / bulan`
                                                    : 'Gaji Kompetitif'}
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[#475569]">
                                        <Calendar className="h-4 w-4 text-[#1674D1]" />
                                        <span>
                                            Batas Lamaran:{' '}
                                            <strong className="text-[#102B4B]">
                                                {selectedJob.deadline
                                                    ? new Date(
                                                          selectedJob.deadline,
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                      )
                                                    : '30 Desember 2026'}
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[#475569]">
                                        <MapPin className="h-4 w-4 text-[#1674D1]" />
                                        <span>
                                            Lokasi Kerja:{' '}
                                            <strong className="text-[#102B4B]">
                                                {selectedJob.location} (
                                                {selectedJob.work_model})
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Actions: Lihat Detail & Simpan Favorit */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/jobs/${selectedJob.slug}`}
                                        className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#0A2239]"
                                    >
                                        <span>Lihat Detail</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleFavorite(e, selectedJob.id)}
                                        disabled={togglingId === selectedJob.id}
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition cursor-pointer shrink-0 ${
                                            savedIds.includes(selectedJob.id)
                                                ? 'border-[#1769E0] bg-blue-50 text-[#1769E0]'
                                                : 'border-[#E2E8F0] text-slate-400 hover:bg-slate-50 hover:text-[#123B5D]'
                                        }`}
                                        title={savedIds.includes(selectedJob.id) ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
                                        aria-label="Simpan lowongan ke favorit"
                                    >
                                        <Bookmark className={`h-5 w-5 ${savedIds.includes(selectedJob.id) ? 'fill-[#1769E0]' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center text-xs text-slate-400">
                                Pilih lowongan di sebelah kiri untuk melihat
                                rincian pratinjau.
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating AI Career Assistant button; above accessibility control */}
                <Link
                    href="/app/ai-assistant"
                    aria-label="Buka AI Career Assistant"
                    title="AI Career Assistant"
                    className="fixed right-6 bottom-[6.5rem] z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[#B8D6E5] bg-white p-2 shadow-xl transition hover:border-[#1674D1] hover:bg-[#F7FAFD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1] active:scale-95"
                >
                    <img
                        src="/images/logos/logo_profabel_ai.svg"
                        alt=""
                        className="h-full w-full object-contain"
                    />
                </Link>
            </div>
        </AppLayout>
    );
}
