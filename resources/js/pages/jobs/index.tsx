import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Accessibility,
    ArrowRight,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
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
    requirements?: string[];
    skills_required?: string[];
    deadline?: string;
    created_at: string;
    company_profile: CompanyItem;
    accessibilities: AccessibilityItem[];
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
    };
}

export default function JobsIndex({ vacancies, filters }: Props): ReactElement {
    const [search, setSearch] = useState(filters.search ?? '');
    const [workModel, setWorkModel] = useState(filters.work_model ?? '');
    const [jobType, setJobType] = useState(filters.job_type ?? '');
    const [accessibility, setAccessibility] = useState(
        filters.accessibility ?? '',
    );
    const [location, setLocation] = useState(filters.location ?? '');
    const [speakingJobId, setSpeakingJobId] = useState<number | null>(null);

    // Selected vacancy for right preview column (defaults to first item)
    const [selectedJob, setSelectedJob] = useState<VacancyItem | null>(
        vacancies.data.length > 0 ? vacancies.data[0] : null,
    );

    useEffect(() => {
        if (vacancies.data.length > 0 && !selectedJob) {
            setSelectedJob(vacancies.data[0]);
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
                    <div className="space-y-5 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-3">
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-[#102B4B]" />
                                <h2 className="text-sm font-bold text-[#102B4B]">
                                    Filter Pencarian
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#1674D1] hover:underline"
                            >
                                Reset
                            </button>
                        </div>

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
                                            onClick={() => setSelectedJob(job)}
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
                                                        {job.company_profile.company_name
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h2 className="line-clamp-1 text-sm font-bold text-[#102B4B] hover:text-[#007F96] sm:text-base">
                                                            {job.title}
                                                        </h2>
                                                        <p className="mt-0.5 text-xs text-[#64748B]">
                                                            {
                                                                job
                                                                    .company_profile
                                                                    .company_name
                                                            }
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
                                                                `${job.title} di ${job.company_profile.company_name}, lokasi ${job.location}`,
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
                                                        className="p-1.5 text-slate-400 hover:text-[#123B5D]"
                                                        aria-label="Simpan lowongan"
                                                    >
                                                        <Bookmark className="h-4 w-4" />
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
                                                    {job.skills_required &&
                                                        job.skills_required
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
                                                <span className="shrink-0 text-[10px] text-[#94A3B8]">
                                                    2 hari yang lalu
                                                </span>
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
                                        {selectedJob.company_profile.company_name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#102B4B]">
                                            {
                                                selectedJob.company_profile
                                                    .company_name
                                            }
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
                                {selectedJob.requirements &&
                                    selectedJob.requirements.length > 0 && (
                                        <div>
                                            <h4 className="mb-1.5 text-xs font-bold text-[#102B4B]">
                                                Kualifikasi Utama
                                            </h4>
                                            <ul className="list-inside list-disc space-y-1 text-xs text-[#475569]">
                                                {selectedJob.requirements
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

                                {/* Big Button: Lihat Detail */}
                                <Link
                                    href={`/jobs/${selectedJob.slug}`}
                                    className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#0A2239]"
                                >
                                    <span>Lihat Detail</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
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
