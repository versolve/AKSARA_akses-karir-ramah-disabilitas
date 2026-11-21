import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeAgo } from '@/components/time-ago';
import AppLayout from '@/layouts/app-layout';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Accessibility,
    AlertCircle,
    ArrowRight,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    DollarSign,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Send,
    Share2,
    Sparkles,
    Users,
    Volume2,
    VolumeX,
    X,
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
    address: string;
    website?: string;
    description?: string;
    logo_url?: string | null;
    logo_path?: string | null;
}

interface VacancyDetail {
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
    status: string;
    deadline?: string;
    created_at: string;
    time_ago?: string;
    company_profile?: CompanyItem | null;
    accessibilities: AccessibilityItem[];
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

interface OtherVacancyItem {
    id: number;
    title: string;
    slug: string;
    job_type: string;
    work_model: string;
    status: string;
}

interface Props {
    vacancy: VacancyDetail;
    alreadyApplied: boolean;
    isSaved?: boolean;
    isOwner?: boolean;
    applicationsCount?: number;
    pendingApplicationsCount?: number;
    otherVacancies?: OtherVacancyItem[];
}

const ACCESSIBILITY_LABELS: Record<string, string> = {
    ramp_access: 'Akses Ram / Kursi Roda',
    elevator: 'Akses Lift Prioritas',
    accessible_restroom: 'Toilet Khusus Disabilitas',
    screen_reader_software: 'Screen Reader Friendly',
    sign_language_interpreter: 'Juru Bahasa Isyarat',
    written_communication: 'Komunikasi Kerja Tertulis',
    flexible_hours: 'Jadwal Fleksibel',
    remote_option: 'Kerja Remote (Fleksibel)',
    ergonomic_workspace: 'Ruang Kerja Aksesibel',
    quiet_space: 'Ruang Tenang / Ramah Sensorik',
};

export default function JobShow({
    vacancy,
    alreadyApplied,
    isSaved = false,
    isOwner = false,
    applicationsCount = 0,
    pendingApplicationsCount = 0,
    otherVacancies = [],
}: Props): ReactElement {
    const page = usePage();
    const user = (page.props.auth as any)?.user;
    const userRole = user?.role;
    const isPelamar = userRole === 'pelamar';
    const isCompany = userRole === 'perusahaan';
    const isAdmin = userRole === 'admin';
    const isOwnerOrAdmin = Boolean(isOwner || isAdmin);
    const [isCopied, setIsCopied] = useState(false);

    const skillsData = typeof vacancy.skills_required === 'string'
        ? JSON.parse(vacancy.skills_required || '{}')
        : (vacancy.skills_required || {});
    const showAccessibility = skillsData.show_accessibility ?? true;
    const isFeatured = skillsData.is_featured ?? false;

    const [activeTab, setActiveTab] = useState<
        'deskripsi' | 'perusahaan' | 'aksesibilitas' | 'proses'
    >('deskripsi');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [saved, setSaved] = useState(Boolean(isSaved));
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    useEffect(() => {
        setSaved(Boolean(isSaved));
    }, [isSaved]);

    const handleToggleFavorite = (): void => {
        if (!user) {
            router.visit('/login');
            return;
        }
        if (isTogglingFavorite) return;

        const next = !saved;
        setSaved(next);
        setIsTogglingFavorite(true);

        router.post(
            `/vacancies/${vacancy.id}/favorite`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsTogglingFavorite(false),
            }
        );
    };
    const [aiMatch, setAiMatch] = useState<any>(null);
    const [isMatchingAi, setIsMatchingAi] = useState(false);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm<{
        cover_letter: string;
        cv: File | null;
    }>({
        cover_letter: '',
        cv: null,
    });

    const handleRunAiMatch = async (): Promise<void> => {
        setIsMatchingAi(true);
        setIsMatchModalOpen(true);
        try {
            const res = await fetch(`/app/ai/match/${vacancy.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });
            if (res.ok) {
                const matchData = await res.json();
                setAiMatch(matchData);
            }
        } catch (e) {
            console.error('AI Match error', e);
        } finally {
            setIsMatchingAi(false);
        }
    };

    const handleSpeak = (): void => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window))
            return;

        if (window.speechSynthesis.speaking || isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        const textToRead = `${vacancy.title} di ${vacancy.company_profile.company_name}. Lokasi ${vacancy.location}. Model kerja ${vacancy.work_model}. Deskripsi pekerjaan: ${vacancy.description}. Fasilitas aksesibilitas meliputi: ${vacancy.accessibilities.map((a) => (ACCESSIBILITY_LABELS[a.accommodation_type] || a.accommodation_type) + (a.description ? `: ${a.description}` : '')).join(', ')}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'id-ID';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleApplySubmit = (e: FormEvent): void => {
        e.preventDefault();
        post(`/app/vacancies/${vacancy.id}/apply`, {
            onSuccess: () => {
                setIsApplyModalOpen(false);
                reset();
            },
        });
    };

    const handleCopyLink = (): void => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }
    };

    const handleShare = (): void => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator
                .share({
                    title: vacancy.title,
                    text: `Lowongan kerja ramah disabilitas: ${vacancy.title} di ${vacancy.company_profile?.company_name || 'Profabel'}`,
                    url: window.location.href,
                })
                .catch(() => {});
        } else {
            handleCopyLink();
        }
    };

    const LayoutComponent = isCompany ? CompanyLayout : AppLayout;

    return (
        <LayoutComponent>
            <Head
                title={`${vacancy.title} - ${vacancy.company_profile?.company_name || 'Lowongan Kerja'}`}
            />

            <div className={isCompany ? "mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6" : "space-y-6 py-6 sm:py-8"}>
                {/* Breadcrumb Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {isCompany ? (
                        <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                            <Link
                                href="/company/vacancies"
                                className="flex items-center gap-1.5 text-[#1674D1] hover:underline"
                            >
                                ← Kembali ke Kelola Lowongan
                            </Link>
                            <span className="text-slate-300">/</span>
                            <span className="max-w-[200px] truncate text-slate-500 sm:max-w-xs" title={vacancy.title}>
                                {vacancy.title}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <Link
                                href="/jobs"
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#1674D1] hover:underline sm:text-sm"
                            >
                                ← Kembali ke Daftar Lowongan
                            </Link>
                        </div>
                    )}

                    {isOwnerOrAdmin && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#123B5D]">
                            <Building2 className="h-3.5 w-3.5 text-[#1769E0]" />
                            Mode Tinjau Perusahaan
                        </span>
                    )}
                </div>

                {/* Banner Pratinjau Perusahaan (Hanya untuk Pemilik / Admin) */}
                {isOwnerOrAdmin && (
                    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#1769E0]/20 dark:border-white/10 bg-gradient-to-r from-blue-50/90 via-sky-50/40 to-white dark:from-[#0B1E48] dark:via-[#071336] dark:to-[#071336] p-5 shadow-xs sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#123B5D] dark:bg-blue-600 text-white shadow-xs">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h2 className="text-base font-extrabold text-[#102B4B] dark:text-white">
                                        Pratinjau Tampilan Lowongan Perusahaan
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                            vacancy.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-700/50'
                                                : vacancy.status === 'draft'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-700/50'
                                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                vacancy.status === 'active'
                                                    ? 'bg-emerald-500 animate-pulse'
                                                    : 'bg-amber-500'
                                            }`}
                                        />
                                        {vacancy.status === 'active'
                                            ? 'Tayang (Aktif)'
                                            : vacancy.status === 'draft'
                                            ? 'Draf'
                                            : 'Ditutup'}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-300">
                                    Ini adalah tampilan lowongan Anda sebagaimana dilihat oleh para calon pelamar kerja.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                            <Link
                                href={`/company/vacancies/${vacancy.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#123B5D] dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#0C2742] dark:hover:bg-blue-500"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Lowongan</span>
                            </Link>
                            <Link
                                href={`/company/applications?vacancy=${vacancy.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#123B5D] bg-white px-4 py-2 text-xs font-bold text-[#123B5D] shadow-2xs transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-blue-300 dark:hover:bg-white/10"
                            >
                                <Users className="h-3.5 w-3.5" />
                                <span>Kelola Pelamar ({applicationsCount})</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Main Content Grid: Left Main Section (8 cols) & Right Sidebar Cards (4 cols) */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* ===================== LEFT COLUMN: DETAIL PEKERJAAN (8 COLS) ===================== */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-xs sm:p-8">
                            {/* Header Title Row */}
                            <div className="flex flex-col justify-between gap-4 border-b border-[#F1F5F9] dark:border-white/10 pb-6 sm:flex-row sm:items-center">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-extrabold tracking-tight text-[#102B4B] dark:text-white sm:text-3xl">
                                            {vacancy.title}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#DCFCE7] dark:bg-emerald-950/50 dark:border dark:border-emerald-700/40 px-2.5 py-0.5 text-xs font-bold text-[#15803D] dark:text-emerald-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Ramah Disabilitas
                                        </span>
                                        {isFeatured && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-700/50 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-2xs">
                                                ⭐ Lowongan Unggulan
                                            </span>
                                        )}
                                        {isOwnerOrAdmin && (
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                                    vacancy.status === 'active'
                                                        ? 'bg-blue-100 dark:bg-blue-950/60 text-[#1769E0] dark:text-blue-300 dark:border dark:border-blue-700/40'
                                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 dark:border dark:border-amber-700/40'
                                                }`}
                                            >
                                                ● {vacancy.status === 'active' ? 'Tayang' : vacancy.status === 'draft' ? 'Draf' : 'Ditutup'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Company Info Row */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCFCE7] dark:border-white/10 bg-[#F0FDF4] dark:bg-emerald-950/60 text-xs font-extrabold text-[#16A36B] dark:text-emerald-400 overflow-hidden">
                                                {vacancy.company_profile?.logo_url ? (
                                                    <img
                                                        src={vacancy.company_profile.logo_url}
                                                        alt={vacancy.company_profile?.company_name || 'Perusahaan'}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                ) : (
                                                    (vacancy.company_profile?.company_name || 'Perusahaan')
                                                        .substring(0, 2)
                                                        .toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {
                                                    vacancy.company_profile
                                                        ?.company_name
                                                }
                                            </span>
                                        </div>

                                        <span className="hidden sm:inline">
                                            •
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                            {vacancy.location}
                                        </span>

                                        <span className="hidden sm:inline">
                                            •
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="capitalize">
                                                {vacancy.job_type}
                                            </span>
                                        </span>

                                        <span className="hidden sm:inline">
                                            •
                                        </span>

                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                            ★ {vacancy.work_model}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Icons (Speech, Favorite/Edit, Share) */}
                                <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                                    <button
                                        type="button"
                                        onClick={handleSpeak}
                                        aria-label={
                                            isSpeaking
                                                ? 'Hentikan pembacaan'
                                                : 'Bacakan detail lowongan'
                                        }
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                                            isSpeaking
                                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                                : 'border-[#E2E8F0] dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-emerald-700 dark:hover:text-emerald-400'
                                        }`}
                                        title={
                                            isSpeaking
                                                ? 'Hentikan suara'
                                                : 'Bacakan lowongan'
                                        }
                                    >
                                        {isSpeaking ? (
                                            <VolumeX className="h-5 w-5 animate-pulse" />
                                        ) : (
                                            <Volume2 className="h-5 w-5" />
                                        )}
                                    </button>

                                    {isOwnerOrAdmin ? (
                                        <Link
                                            href={`/company/vacancies/${vacancy.id}/edit`}
                                            aria-label="Edit lowongan ini"
                                            title="Edit Lowongan Ini"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-white/10 text-slate-600 dark:text-slate-300 transition hover:border-[#123B5D] dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#123B5D] dark:hover:text-white"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleToggleFavorite}
                                            disabled={isTogglingFavorite}
                                            aria-label={saved ? "Hapus dari favorit" : "Simpan lowongan ke favorit"}
                                            title={saved ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer disabled:opacity-50 ${
                                                saved
                                                    ? 'border-[#1769E0] bg-[#1769E0] text-white'
                                                    : 'border-[#E2E8F0] dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#123B5D] dark:hover:text-white'
                                            }`}
                                        >
                                            <Bookmark className={`h-5 w-5 ${saved ? 'fill-white' : ''}`} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        aria-label="Bagikan lowongan"
                                        title={isCopied ? "Tautan telah disalin" : "Bagikan lowongan"}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-white/10 text-slate-500 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#123B5D] dark:hover:text-white"
                                    >
                                        {isCopied ? (
                                            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <Share2 className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs (Deskripsi, Perusahaan, Aksesibilitas, Proses Lamaran) */}
                            <div className="flex items-center gap-8 border-b border-[#F1F5F9] dark:border-white/10 pt-2 text-xs font-semibold text-[#64748B] dark:text-slate-400 sm:text-sm">
                                {[
                                    { key: 'deskripsi', label: 'Deskripsi' },
                                    { key: 'perusahaan', label: 'Perusahaan' },
                                    ...(showAccessibility ? [{ key: 'aksesibilitas', label: 'Aksesibilitas' }] : []),
                                    { key: 'proses', label: 'Proses Lamaran' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() =>
                                            setActiveTab(tab.key as any)
                                        }
                                        className={`cursor-pointer pt-2 pb-3 font-bold transition select-none ${
                                            activeTab === tab.key
                                                ? 'border-b-2 border-[#123B5D] text-[#123B5D] dark:border-[#38BDF8] dark:text-[#38BDF8]'
                                                : 'hover:text-[#102B4B] dark:hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-6 py-6">
                                {activeTab === 'deskripsi' && (
                                    <>
                                        {/* Deskripsi Pekerjaan */}
                                        <div>
                                            <h3 className="mb-2 text-sm font-extrabold text-[#102B4B] dark:text-white">
                                                Deskripsi Pekerjaan
                                            </h3>
                                            <p className="text-xs leading-relaxed whitespace-pre-line text-[#475569] dark:text-slate-300 sm:text-sm">
                                                {vacancy.description}
                                            </p>
                                        </div>

                                        {/* Tanggung Jawab */}
                                        <div>
                                            <h3 className="mb-2 text-sm font-extrabold text-[#102B4B] dark:text-white">
                                                Tanggung Jawab
                                            </h3>
                                            <ul className="list-inside list-disc space-y-1.5 text-xs text-[#475569] dark:text-slate-300 sm:text-sm">
                                                <li>
                                                    Merancang user interface
                                                    yang menarik, intuitif, dan
                                                    mudah digunakan
                                                </li>
                                                <li>
                                                    Melakukan riset pengguna
                                                    serta usability testing
                                                    berkala
                                                </li>
                                                <li>
                                                    Berkolaborasi erat dengan
                                                    tim produk dan developer
                                                </li>
                                                <li>
                                                    Memastikan seluruh aset
                                                    desain memenuhi standar
                                                    aksesibilitas inklusif (WCAG
                                                    2.1)
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Kualifikasi */}
                                        {parseRequirementsList(vacancy.requirements).length > 0 && (
                                            <div>
                                                <h3 className="mb-2 text-sm font-extrabold text-[#102B4B] dark:text-white">
                                                    Kualifikasi
                                                </h3>
                                                <ul className="list-inside list-disc space-y-1.5 text-xs text-[#475569] dark:text-slate-300 sm:text-sm">
                                                    {parseRequirementsList(vacancy.requirements).map(
                                                        (req, i) => (
                                                            <li key={i}>
                                                                {req}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'perusahaan' && (
                                    <div className="space-y-4 text-xs text-[#475569] dark:text-slate-300 sm:text-sm">
                                        <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                            Tentang Perusahaan
                                        </h3>
                                        <p className="leading-relaxed">
                                            {vacancy.company_profile
                                                .description ??
                                                'Informasi tentang profil perusahaan belum dicantumkan secara lengkap.'}
                                        </p>
                                        <div className="pt-2">
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                Alamat Kantor:
                                            </strong>{' '}
                                            {vacancy.company_profile.address}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'aksesibilitas' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                            Fasilitas Kerja Inklusif
                                        </h3>
                                        {!showAccessibility ? (
                                            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                                Informasi Workplace Accessibility disembunyikan oleh perusahaan untuk lowongan ini.
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs text-[#64748B] dark:text-slate-400">
                                                    Perusahaan ini menyediakan akomodasi
                                                    berikut untuk memastikan kenyamanan
                                                    kerja bagi penyandang disabilitas:
                                                </p>
                                                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                                    {vacancy.accessibilities.map(
                                                        (acc) => (
                                                            <div
                                                                key={acc.id}
                                                                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3"
                                                            >
                                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                                        {ACCESSIBILITY_LABELS[
                                                                            acc
                                                                                .accommodation_type
                                                                        ] ??
                                                                            acc.accommodation_type}
                                                                    </div>
                                                                    {acc.description && (
                                                                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                                                                            {
                                                                                acc.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'proses' && (
                                    <div className="space-y-4 text-xs text-[#475569] dark:text-slate-300 sm:text-sm">
                                        <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                            Alur & Tahapan Rekrutmen
                                        </h3>
                                        <ol className="list-inside list-decimal space-y-2 leading-relaxed">
                                            <li>
                                                <strong>
                                                    Pengiriman Berkas:
                                                </strong>{' '}
                                                Unggah CV dan surat pengantar
                                                melalui portal Profabel.
                                            </li>
                                            <li>
                                                <strong>
                                                    Peninjauan Kualifikasi:
                                                </strong>{' '}
                                                Tim HR meninjau berkas dan
                                                kesesuaian fasilitas
                                                aksesibilitas (1-3 hari kerja).
                                            </li>
                                            <li>
                                                <strong>Sesi Wawancara:</strong>{' '}
                                                Wawancara kerja dengan akomodasi
                                                yang disesuaikan (Google Meet
                                                dengan teks otomatis / juru
                                                bahasa isyarat).
                                            </li>
                                            <li>
                                                <strong>
                                                    Penerimaan / Offering:
                                                </strong>{' '}
                                                Pengumuman hasil seleksi
                                                disampaikan langsung melalui
                                                dashboard dan notifikasi.
                                            </li>
                                        </ol>
                                    </div>
                                )}
                            </div>

                            {/* Section: Informasi Perusahaan (matches Reference) */}
                            <div className="space-y-4 border-t border-[#F1F5F9] dark:border-white/10 pt-6">
                                <h3 className="text-base font-extrabold text-[#102B4B] dark:text-white">
                                    Informasi Perusahaan
                                </h3>

                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D0E5F0] dark:border-white/10 bg-[#EBF5FA] dark:bg-[#0B2256] text-lg font-black text-[#123B5D] dark:text-[#38BDF8] overflow-hidden">
                                            {vacancy.company_profile?.logo_url ? (
                                                <img
                                                    src={vacancy.company_profile.logo_url}
                                                    alt={vacancy.company_profile?.company_name || 'Perusahaan'}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : (
                                                (vacancy.company_profile?.company_name || 'Perusahaan')
                                                    .substring(0, 2)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-base font-bold text-[#102B4B] dark:text-white">
                                                    {
                                                        vacancy.company_profile
                                                            .company_name
                                                    }
                                                </h4>
                                                <CheckCircle2 className="h-4 w-4 text-[#1674D1] dark:text-[#38BDF8]" />
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                                                {vacancy.company_profile
                                                    .industry ??
                                                    'Teknologi Informasi'}
                                            </p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                {
                                                    vacancy.company_profile
                                                        .address
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={
                                            vacancy.company_profile.website ??
                                            '#'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-[#1674D1] dark:border-[#38BDF8] bg-white dark:bg-transparent px-4 py-2 text-xs font-bold text-[#1674D1] dark:text-[#38BDF8] transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    >
                                        <span>Lihat Profil Perusahaan</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>

                                <p className="text-xs leading-relaxed text-[#475569] dark:text-slate-300">
                                    {vacancy.company_profile.description ??
                                        `${vacancy.company_profile.company_name} adalah perusahaan yang berkomitmen menciptakan lingkungan kerja yang inklusif, setara, dan terbuka untuk semua talenta, termasuk penyandang disabilitas.`}
                                </p>

                                {/* Box: Aksesibilitas di Perusahaan */}
                                <div className="space-y-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-xs font-bold text-white">
                                            A11y
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                                                Aksesibilitas di Perusahaan
                                            </h5>
                                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                                                Kami menyediakan berbagai
                                                dukungan agar kamu dapat bekerja
                                                dengan nyaman dan produktif.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Accessibility Pill Badges */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Ruang kerja aksesibel
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Kerja remote (fleksibel)
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Screen reader friendly
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Pendamping kerja (jika diperlukan)
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Jadwal fleksibel
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-transparent dark:border-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            Teknologi asistif tersedia
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== RIGHT COLUMN: SIDEBAR CARDS (4 COLS) ===================== */}
                    <div className="sticky top-24 space-y-6 lg:col-span-4">
                        {/* 1. Card Utama: Kelola Lowongan (Perusahaan Pemilik) vs Lowongan Mitra vs Lamar Pekerjaan (Pelamar) */}
                        {isOwnerOrAdmin ? (
                            <div className="space-y-4 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/10 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#123B5D] dark:bg-blue-600 text-white">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                                Kelola Lowongan Ini
                                            </h3>
                                            <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                                                Panel Khusus Perusahaan
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                            vacancy.status === 'active'
                                                ? 'border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                                : vacancy.status === 'draft'
                                                ? 'border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                : 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                vacancy.status === 'active'
                                                    ? 'bg-emerald-500 animate-pulse'
                                                    : 'bg-amber-500'
                                            }`}
                                        />
                                        {vacancy.status === 'active'
                                            ? 'Tayang Aktif'
                                            : vacancy.status === 'draft'
                                            ? 'Draf'
                                            : 'Ditutup'}
                                    </span>
                                </div>

                                {/* Ringkasan Metrik Pelamar */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#050E2E] p-3 text-center transition hover:bg-slate-100/60 dark:hover:bg-[#0B1E48]">
                                        <span className="text-2xl font-black text-[#102B4B] dark:text-white">
                                            {applicationsCount}
                                        </span>
                                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                            Total Pelamar
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/30 p-3 text-center transition hover:bg-amber-100/60 dark:hover:bg-amber-900/40">
                                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                            {pendingApplicationsCount}
                                        </span>
                                        <p className="mt-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                                            Perlu Ditinjau
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Aksi Perusahaan */}
                                <div className="space-y-2.5 pt-1">
                                    <Link
                                        href={`/company/applications?vacancy=${vacancy.id}`}
                                        className="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] dark:bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] dark:hover:bg-blue-500 active:bg-[#0A2239]"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Lihat Pelamar Masuk</span>
                                        {pendingApplicationsCount > 0 && (
                                            <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-900">
                                                {pendingApplicationsCount} Baru
                                            </span>
                                        )}
                                    </Link>

                                    <Link
                                        href={`/company/vacancies/${vacancy.id}/edit`}
                                        className="flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#123B5D] bg-white px-4 py-2.5 text-xs font-bold text-[#123B5D] shadow-2xs transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-blue-300 dark:hover:bg-white/10"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span>Edit Lowongan Ini</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-[#475569] dark:text-slate-300 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-white/10 hover:text-[#102B4B] dark:hover:text-white"
                                    >
                                        {isCopied ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-emerald-700 dark:text-emerald-300">Tautan Berhasil Disalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Salin Tautan Lowongan Publik</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Fakta-fakta Lowongan Pekerjaan */}
                                <div className="space-y-3 border-t border-[#F1F5F9] dark:border-white/10 pt-3 text-xs">
                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Waktu Tayang
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                <TimeAgo
                                                    date={vacancy.created_at}
                                                    fallback={vacancy.time_ago}
                                                />
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tipe Pekerjaan
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.job_type}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Lokasi
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.location} ({vacancy.work_model})
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Batasan Lamaran
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.deadline
                                                    ? new Date(vacancy.deadline).toLocaleDateString('id-ID')
                                                    : '30 Desember 2026'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Gaji
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.is_salary_public &&
                                                vacancy.salary_min
                                                    ? `Rp ${vacancy.salary_min.toLocaleString('id-ID')} - ${vacancy.salary_max?.toLocaleString('id-ID')} / bulan`
                                                    : 'Gaji Kompetitif'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tingkat Pengalaman
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.experience_level}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : isCompany ? (
                            <div className="space-y-4 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-xs">
                                <div className="flex items-center gap-2 border-b border-[#F1F5F9] dark:border-white/10 pb-4">
                                    <Building2 className="h-5 w-5 text-[#1769E0] dark:text-[#38BDF8]" />
                                    <div>
                                        <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                            Lowongan Mitra Perusahaan
                                        </h3>
                                        <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                                            Ditinjau sebagai Akun Perusahaan
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs leading-relaxed text-[#475569] dark:text-slate-300">
                                    Anda sedang melihat lowongan ini menggunakan akun Perusahaan. Pilihan melamar pekerjaan hanya tersedia bagi akun pelamar.
                                </p>

                                <div className="space-y-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] dark:bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0C2742] dark:hover:bg-blue-500"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span>Bagikan Lowongan Ini</span>
                                    </button>

                                    <Link
                                        href="/company/vacancies"
                                        className="flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-[#102B4B] dark:text-white shadow-2xs transition hover:bg-slate-50 dark:hover:bg-white/10"
                                    >
                                        <span>Kembali ke Lowongan Saya</span>
                                    </Link>
                                </div>

                                {/* Fakta-fakta Lowongan Pekerjaan */}
                                <div className="space-y-3 border-t border-[#F1F5F9] dark:border-white/10 pt-3 text-xs">
                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Waktu Tayang
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                <TimeAgo
                                                    date={vacancy.created_at}
                                                    fallback={vacancy.time_ago}
                                                />
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tipe Pekerjaan
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.job_type}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Lokasi
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.location} ({vacancy.work_model})
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Batasan Lamaran
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.deadline
                                                    ? new Date(vacancy.deadline).toLocaleDateString('id-ID')
                                                    : '30 Desember 2026'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Gaji
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.is_salary_public &&
                                                vacancy.salary_min
                                                    ? `Rp ${vacancy.salary_min.toLocaleString('id-ID')} - ${vacancy.salary_max?.toLocaleString('id-ID')} / bulan`
                                                    : 'Gaji Kompetitif'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tingkat Pengalaman
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.experience_level}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-xs">
                                <h3 className="text-sm font-extrabold text-[#102B4B] dark:text-white">
                                    Lamar Pekerjaan Ini
                                </h3>

                                {/* Action Buttons */}
                                <div className="space-y-2.5">
                                    {alreadyApplied ? (
                                        <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DCFCE7] dark:bg-emerald-950/60 dark:border dark:border-emerald-700/40 px-4 py-3.5 text-sm font-bold text-[#15803D] dark:text-emerald-300 shadow-2xs">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Sudah Dilamar</span>
                                        </div>
                                    ) : isPelamar ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsApplyModalOpen(true)
                                            }
                                            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] dark:bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] dark:hover:bg-blue-500 active:bg-[#0A2239]"
                                        >
                                            <Send className="h-4 w-4 rotate-45" />
                                            <span>Lamar Sekarang</span>
                                        </button>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] dark:bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] dark:hover:bg-blue-500 active:bg-[#0A2239]"
                                        >
                                            <Send className="h-4 w-4 rotate-45" />
                                            <span>Masuk untuk Melamar</span>
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleToggleFavorite}
                                        disabled={isTogglingFavorite}
                                        className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition sm:text-sm disabled:opacity-50 ${
                                            saved
                                                ? 'border-[#1769E0] bg-blue-50 dark:bg-blue-950/60 text-[#1769E0] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                                                : 'border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-[#102B4B] dark:text-white shadow-2xs hover:bg-slate-50 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <Bookmark
                                            className={`h-4 w-4 ${saved ? 'fill-[#1769E0] text-[#1769E0] dark:fill-blue-300 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}
                                        />
                                        <span>
                                            {saved
                                                ? 'Tersimpan di Favorit'
                                                : 'Simpan ke Favorit'}
                                        </span>
                                    </button>

                                    {isPelamar && (
                                        <button
                                            type="button"
                                            onClick={handleRunAiMatch}
                                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                        >
                                            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                            <span>Cek Kecocokan AI</span>
                                        </button>
                                    )}
                                </div>

                                {/* Job Facts List */}
                                <div className="space-y-3 border-t border-[#F1F5F9] dark:border-white/10 pt-3 text-xs">
                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Waktu Tayang
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                <TimeAgo
                                                    date={vacancy.created_at}
                                                    fallback={vacancy.time_ago}
                                                />
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tipe Pekerjaan
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.job_type}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Lokasi
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.location} (
                                                {vacancy.work_model})
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Batasan Lamaran
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.deadline
                                                    ? new Date(
                                                          vacancy.deadline,
                                                      ).toLocaleDateString('id-ID')
                                                    : '30 Desember 2026'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Gaji
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {vacancy.is_salary_public &&
                                                vacancy.salary_min
                                                    ? `Rp ${vacancy.salary_min.toLocaleString('id-ID')} - ${vacancy.salary_max?.toLocaleString('id-ID')} / bulan`
                                                    : 'Gaji Kompetitif'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-[#64748B] dark:text-slate-400">
                                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-[11px] text-slate-400">
                                                Tingkat Pengalaman
                                            </span>
                                            <strong className="text-slate-800 dark:text-slate-200 capitalize">
                                                {vacancy.experience_level}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Card: Kontak Tim Rekruter / Profil Perusahaan */}
                        {isOwnerOrAdmin ? (
                            <div className="flex items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123B5D] dark:bg-blue-600 text-sm font-bold text-white shadow-2xs">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'HR'}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#102B4B] dark:text-white sm:text-sm">
                                            {user?.name || 'Tim Rekruter'}
                                        </h4>
                                        <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                                            {vacancy.company_profile?.company_name || 'HR Specialist'}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/company/profile"
                                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 px-3.5 py-1.5 text-xs font-bold text-[#102B4B] dark:text-white transition hover:border-[#123B5D] dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                    <span>Profil Perusahaan</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-5 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#123B5D] dark:bg-blue-600 text-sm font-bold text-white">
                                        HR
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#102B4B] dark:text-white sm:text-sm">
                                            Tim Rekruter
                                        </h4>
                                        <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                                            {vacancy.company_profile?.company_name || 'HR Specialist'}
                                        </p>
                                    </div>
                                </div>

                                {isCompany ? (
                                    <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                        Mitra Rekruter
                                    </span>
                                ) : (
                                    <Link
                                        href="/app/applications"
                                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 px-3.5 py-2 text-xs font-bold text-[#102B4B] dark:text-white transition hover:border-[#123B5D] dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
                                    >
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>Kirim Pesan</span>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* 3. Card: Lowongan Lain dari Perusahaan ini */}
                        <div className="space-y-3.5 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-xs">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-extrabold text-[#102B4B] dark:text-white">
                                    Lowongan Lain dari Perusahaan ini
                                </h3>
                                {isCompany && (
                                    <Link
                                        href="/company/vacancies"
                                        className="text-[11px] font-bold text-[#1674D1] dark:text-[#38BDF8] hover:underline"
                                    >
                                        Kelola
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                {otherVacancies && otherVacancies.length > 0 ? (
                                    otherVacancies.map((other) => (
                                        <Link
                                            key={other.id}
                                            href={`/jobs/${other.slug}`}
                                            className="group flex items-center justify-between rounded-2xl border border-[#F1F5F9] dark:border-white/10 p-2.5 transition hover:bg-slate-50 dark:hover:bg-white/5"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/60 text-xs font-bold text-[#16A36B] dark:text-emerald-400">
                                                    {vacancy.company_profile?.company_name
                                                        ? vacancy.company_profile.company_name
                                                              .substring(0, 2)
                                                              .toUpperCase()
                                                        : 'PT'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-xs font-bold text-[#102B4B] dark:text-white group-hover:text-[#1674D1] dark:group-hover:text-[#38BDF8]">
                                                        {other.title}
                                                    </h4>
                                                    <p className="text-[10px] text-[#64748B] dark:text-slate-400 capitalize">
                                                        {other.job_type} • {other.work_model}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-4 text-center text-xs text-slate-400">
                                        Belum ada lowongan lain yang sedang tayang
                                    </div>
                                )}
                            </div>

                            {isCompany && (
                                <div className="border-t border-[#F1F5F9] dark:border-white/10 pt-2">
                                    <Link
                                        href="/company/vacancies"
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-white/20 py-2 text-xs font-bold text-[#1674D1] dark:text-[#38BDF8] transition hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                                    >
                                        <span>Buka Semua Lowongan Perusahaan</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Apply Modal */}
                {isApplyModalOpen && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-headline"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-2xl sm:p-8">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                                <h3
                                    id="modal-headline"
                                    className="text-lg font-bold text-slate-900 dark:text-white"
                                >
                                    Lamar: {vacancy.title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white"
                                    aria-label="Tutup form lamaran"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleApplySubmit}
                                className="mt-5 space-y-4"
                            >
                                <div>
                                    <Label
                                        htmlFor="cv-file"
                                        className="text-xs font-bold text-[#102B4B] dark:text-white"
                                    >
                                        Upload Curriculum Vitae (PDF / Word,
                                        Maks. 5MB)
                                    </Label>
                                    <Input
                                        id="cv-file"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) =>
                                            setData(
                                                'cv',
                                                e.target.files
                                                    ? e.target.files[0]
                                                    : null,
                                            )
                                        }
                                        className="mt-2 block min-h-[44px] w-full"
                                        required
                                    />
                                    {errors.cv && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            {errors.cv}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="cover_letter"
                                        className="text-xs font-bold text-[#102B4B] dark:text-white"
                                    >
                                        Surat Pengantar / Cover Letter
                                        (Opsional)
                                    </Label>
                                    <textarea
                                        id="cover_letter"
                                        rows={4}
                                        value={data.cover_letter}
                                        onChange={(e) =>
                                            setData(
                                                'cover_letter',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ceritakan secara singkat keahlian dan kebutuhan aksesibilitas Anda..."
                                        className="mt-2 block w-full rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#050E2E] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20"
                                    />
                                    {errors.cover_letter && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            {errors.cover_letter}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-white/10 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsApplyModalOpen(false)
                                        }
                                        className="min-h-[44px] text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="min-h-[44px] bg-[#123B5D] dark:bg-blue-600 px-6 text-xs font-bold text-white hover:bg-[#0C2742] dark:hover:bg-blue-500"
                                    >
                                        Kirim Lamaran Sekarang
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Match Modal */}
                {isMatchModalOpen && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ai-match-headline"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                    <h3
                                        id="ai-match-headline"
                                        className="text-base font-bold text-slate-900 dark:text-white"
                                    >
                                        Analisis Kecocokan AI: {vacancy.title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMatchModalOpen(false)}
                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                                    aria-label="Tutup modal analisis"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {isMatchingAi ? (
                                <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                    <Sparkles className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-700 dark:text-emerald-400" />
                                    <p>
                                        Sedang mengevaluasi kecocokan kompetensi
                                        dan aksesibilitas...
                                    </p>
                                </div>
                            ) : aiMatch ? (
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                                        <div>
                                            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                                                Skor Kecocokan
                                            </span>
                                            <p className="text-2xl font-black text-emerald-950 dark:text-emerald-200">
                                                {aiMatch.match_percentage}%
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="rounded-lg border border-emerald-100 dark:border-white/10 bg-white dark:bg-[#050E2E] px-2.5 py-1 text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Kompetensi
                                                </span>
                                                <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                    {aiMatch.competency_score}%
                                                </span>
                                            </div>
                                            <div className="rounded-lg border border-emerald-100 dark:border-white/10 bg-white dark:bg-[#050E2E] px-2.5 py-1 text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Aksesibilitas
                                                </span>
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                    {
                                                        aiMatch.accessibility_score
                                                    }
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                        {aiMatch.summary}
                                    </p>

                                    {aiMatch.matching_points?.length > 0 && (
                                        <div className="rounded-xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                                            <span className="mb-1 block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                Poin Kecocokan:
                                            </span>
                                            <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                                {aiMatch.matching_points.map(
                                                    (
                                                        p: string,
                                                        idx: number,
                                                    ) => (
                                                        <li key={idx}>{p}</li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-end border-t border-slate-100 dark:border-white/10 pt-3">
                                        <Button
                                            onClick={() =>
                                                setIsMatchModalOpen(false)
                                            }
                                            className="min-h-[44px] bg-[#123B5D] dark:bg-blue-600 text-xs font-bold text-white hover:bg-[#0C2742] dark:hover:bg-blue-500"
                                        >
                                            Mengerti
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Gagal memuat analisis. Silakan coba kembali.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Floating AI Career Assistant button; only for applicants / job seekers */}
                {!isCompany && (
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
                )}
            </div>
        </LayoutComponent>
    );
}
