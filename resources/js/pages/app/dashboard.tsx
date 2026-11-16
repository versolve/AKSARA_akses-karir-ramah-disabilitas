import { Button } from '@/components/ui/button';
import { DashboardBannerCarousel, type DashboardBannerItem } from '@/components/app/dashboard-banner-carousel';
import { TimeAgo } from '@/components/time-ago';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Bell,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Compass,
    FileText,
    MapPin,
    Plus,
    Search,
    Target,
    Trash2,
    Upload,
    User,
    Users,
} from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type ReactElement,
} from 'react';

interface StatsData {
    total_applied: number;
    in_review: number;
    interview: number;
    hired: number;
    total_favorites?: number;
}

interface ApplicationItem {
    id: number;
    status: string;
    applied_at: string;
    vacancy: {
        id: number;
        title: string;
        slug: string;
        location: string;
        work_model: string;
        company_profile: {
            company_name: string;
        };
    };
}

interface VacancyItem {
    id: number;
    title: string;
    slug: string;
    location: string;
    work_model: string;
    job_type: string;
    created_at: string;
    time_ago?: string;
    company_profile: {
        company_name: string;
        industry?: string;
        logo_url?: string | null;
    };
    accessibilities: Array<{
        id: number;
        accommodation_type: string;
    }>;
}

interface ProfileCompletenessItem {
    id: string;
    label: string;
    is_completed: boolean;
    link: string;
}

interface ProfileCompletenessData {
    percentage: number;
    items: ProfileCompletenessItem[];
}

interface SeekerProfile {
    id: number;
    profile_completed_percentage: number;
    current_job_title?: string;
    education?: string;
    experience?: string;
    bio?: string;
}

interface Props {
    seeker: SeekerProfile;
    profileCompleteness?: ProfileCompletenessData;
    stats: StatsData;
    recentApplications: ApplicationItem[];
    recommendedJobs: VacancyItem[];
    savedVacancyIds?: number[];
    unreadNotificationsCount: number;
    banners?: DashboardBannerItem[];
}

const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string }
> = {
    submitted: {
        label: 'Lamaran Dikirim',
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#7E22CE]',
    },
    reviewed: {
        label: 'Ditinjau HR',
        bg: 'bg-[#EBF5FA]',
        text: 'text-[#1674D1]',
    },
    interview: {
        label: 'Interview',
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#15803D]',
    },
    hired: { label: 'Diterima', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
    rejected: { label: 'Ditolak', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
};

export default function SeekerDashboard({
    seeker,
    profileCompleteness,
    stats,
    recentApplications,
    recommendedJobs,
    savedVacancyIds = [],
    banners = [],
}: Props): ReactElement {
    const page = usePage();
    const auth = (page.props as any).auth;
    const user = auth?.user;
    const userName = user?.name || 'Kawan Profabel';

    const [savedIds, setSavedIds] = useState<number[]>(savedVacancyIds);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (savedVacancyIds) setSavedIds(savedVacancyIds);
    }, [savedVacancyIds]);

    const handleToggleFavorite = (e: React.MouseEvent, vacancyId: number): void => {
        e.stopPropagation();
        e.preventDefault();
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

    const [keyword, setKeyword] = useState('');
    const [activeDot, setActiveDot] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/profile/avatar', formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsUploadingAvatar(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleAvatarDelete = (): void => {
        if (confirm('Yakin ingin menghapus foto profil?')) {
            router.delete('/profile/avatar', { preserveScroll: true });
        }
    };

    const handleSearch = (e: FormEvent): void => {
        e.preventDefault();
        router.get('/jobs', {
            search: keyword || undefined,
        });
    };

    const completionPercent = typeof profileCompleteness?.percentage === 'number'
        ? profileCompleteness.percentage
        : (typeof seeker?.profile_completed_percentage === 'number' ? seeker.profile_completed_percentage : 0);

    const checklistItems: ProfileCompletenessItem[] = profileCompleteness?.items || [
        { id: 'personal_data', label: 'Data Diri', is_completed: Boolean(seeker?.bio && seeker?.current_job_title), link: '/app/profile/edit' },
        { id: 'accessibility', label: 'Kebutuhan Aksesibilitas', is_completed: false, link: '/app/accessibility-profile' },
        { id: 'education', label: 'Pendidikan', is_completed: false, link: '/app/profile/edit' },
        { id: 'experience', label: 'Pengalaman Kerja', is_completed: false, link: '/app/profile/edit' },
        { id: 'resume_skills', label: 'Resume & Portofolio', is_completed: false, link: '/app/profile/edit' },
    ];

    return (
        <AppLayout>
            <Head title="Beranda Pelamar - Profabel" />

            <div className="space-y-6 py-6 sm:py-8">
                {/* Main Grid: Left Column (Hero + Recommendations + Tips) & Right Column (Profile + Activities + Notice) */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* 1. Dynamic Hero Greeting Banner Carousel (Dikelola oleh Admin) */}
                        <DashboardBannerCarousel
                            banners={banners}
                            userName={userName}
                        />

                        {/* 2. Lowongan Rekomendasi Untukmu Section */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-[#102B4B]" />
                                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg">
                                        Lowongan Rekomendasi Untukmu
                                    </h2>
                                </div>
                                <Link
                                    href="/jobs"
                                    className="flex items-center gap-1 text-xs font-semibold text-[#1674D1] hover:underline"
                                >
                                    Lihat Semua Lowongan →
                                </Link>
                            </div>

                            {/* Vacancy Cards Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {recommendedJobs.slice(0, 3).map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs transition duration-200 hover:border-[#20B8C1] sm:p-5"
                                    >
                                        <div>
                                            {/* Company Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] text-sm font-bold text-[#16A36B] overflow-hidden">
                                                        {job.company_profile?.logo_url ? (
                                                            <img
                                                                src={job.company_profile.logo_url}
                                                                alt={job.company_profile.company_name}
                                                                className="h-full w-full object-cover object-center"
                                                            />
                                                        ) : (
                                                            (job.company_profile?.company_name || 'Perusahaan')
                                                                .substring(0, 2)
                                                                .toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="line-clamp-1 text-xs font-bold text-[#102B4B]">
                                                                {
                                                                    job
                                                                        .company_profile
                                                                        ?.company_name || 'Perusahaan'
                                                                }
                                                            </span>
                                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#1674D1]" />
                                                        </div>
                                                        <span className="line-clamp-1 text-[10px] text-[#64748B]">
                                                            {job.company_profile
                                                                ?.industry ??
                                                                'Teknologi Informasi'}
                                                        </span>
                                                    </div>
                                                </div>
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

                                            {/* Job Title */}
                                            <h3 className="mt-3 line-clamp-2 text-sm font-bold text-[#102B4B]">
                                                <Link
                                                    href={`/jobs/${job.slug}`}
                                                    className="hover:text-[#007F96]"
                                                >
                                                    {job.title}
                                                </Link>
                                            </h3>

                                            {/* Location & Model */}
                                            <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B]">
                                                <span className="flex max-w-[130px] items-center gap-1 truncate">
                                                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                    <span className="truncate">
                                                        {job.location}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-700 uppercase">
                                                    {job.work_model}
                                                </span>
                                            </div>

                                            {/* Accessibility Tags */}
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                                    Remote Friendly
                                                </span>
                                                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                                    Aksesibel
                                                </span>
                                                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                                    Fleksibel
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                                            <span className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                                                <Clock className="h-3 w-3 shrink-0" />
                                                <TimeAgo
                                                    date={job.created_at}
                                                    fallback={job.time_ago}
                                                />
                                            </span>
                                            <Link
                                                href={`/jobs/${job.slug}`}
                                                className="flex min-h-[36px] cursor-pointer items-center justify-center rounded-xl bg-[#123B5D] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#0C2742]"
                                            >
                                                Lamar Sekarang
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Tips Karier Untukmu Section */}
                        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#D0E5F0] bg-gradient-to-r from-[#EBF5FA] to-[#E1EFF6] p-6 shadow-xs sm:flex-row">
                            <div className="flex items-center gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white bg-white text-[#007F96] shadow-xs">
                                    <Target className="h-9 w-9 text-[#007F96]" />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs font-bold text-[#102B4B]">
                                            <span className="h-2 w-2 rounded-full bg-[#1674D1]" />
                                            Tips Karier untukmu
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-[#102B4B] sm:text-lg">
                                        5 Tips Membuat CV yang Ramah Disabilitas
                                    </h3>
                                    <p className="mt-0.5 text-xs text-[#64748B]">
                                        Tunjukkan keahlian dan potensimu dengan
                                        cara yang tepat
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <span className="rounded-lg bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#1674D1] shadow-2xs">
                                            Karier
                                        </span>
                                        <span className="text-[11px] text-[#64748B]">
                                            5 menit baca
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Arrow navigation buttons */}
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-slate-700 shadow-xs transition hover:bg-slate-50"
                                    aria-label="Tips sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-slate-700 shadow-xs transition hover:bg-slate-50"
                                    aria-label="Tips selanjutnya"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* 1. Profil Saya Card */}
                        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                                <h2 className="text-sm font-bold text-[#102B4B]">
                                    Profil Saya
                                </h2>
                                <Link
                                    href="/app/profile"
                                    className="text-xs font-semibold text-[#1674D1] hover:underline"
                                >
                                    Lihat profil →
                                </Link>
                            </div>

                            {/* Avatar & User Details */}
                            <div className="mt-4 flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#123B5D] text-xl font-bold text-white shadow-sm">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={userName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            userName
                                                .substring(0, 2)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploadingAvatar}
                                        className="absolute -right-1 -bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0C2742] text-white shadow-xs transition hover:bg-[#1674D1] disabled:opacity-50"
                                        title="Unggah / ubah foto profil"
                                        aria-label="Unggah atau ubah foto profil"
                                    >
                                        <Camera className="h-3 w-3" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </div>

                                {isUploadingAvatar && (
                                    <span className="mt-1 text-[10px] font-semibold text-[#1674D1]">
                                        Mengompres & mengunggah...
                                    </span>
                                )}

                                {user?.avatar && !isUploadingAvatar && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarDelete}
                                        className="mt-1 flex items-center gap-0.5 text-[10px] text-rose-600 hover:underline"
                                    >
                                        <Trash2 className="h-2.5 w-2.5" />
                                        Hapus foto
                                    </button>
                                )}

                                <h3 className="mt-2 text-base font-bold text-[#102B4B]">
                                    {userName}
                                </h3>
                                <span className="text-xs text-[#64748B]">
                                    Pelamar
                                </span>
                            </div>

                            {/* Profile Completeness Bar */}
                            <div className="mt-5">
                                <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                                    <span className="text-[#102B4B]">
                                        Kelengkapan Profil
                                    </span>
                                    <span className="text-[#102B4B]">
                                        {completionPercent}%
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                                    <div
                                        className="h-full rounded-full bg-[#123B5D] transition-all duration-500"
                                        style={{
                                            width: `${completionPercent}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Profile Checklist (Dynamic based on real data) */}
                            <div className="mt-4 space-y-2.5 text-xs text-[#475569]">
                                {checklistItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-2">
                                        {item.is_completed ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123B5D] text-white">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                                <span className="font-semibold text-[#102B4B]">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.link}
                                                className="group flex items-center gap-2 text-[#64748B] hover:text-[#1674D1] transition"
                                            >
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-slate-500 transition group-hover:bg-[#123B5D] group-hover:text-white">
                                                    <Plus className="h-3 w-3" />
                                                </div>
                                                <span className="font-medium">
                                                    Lengkapi {item.label}
                                                </span>
                                            </Link>
                                        )}
                                        {item.is_completed && (
                                            <span className="text-[10px] font-bold text-emerald-600">Selesai</span>
                                        )}
                                    </div>
                                ))}

                                {completionPercent === 100 && (
                                    <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-center text-[11px] font-bold text-emerald-700">
                                        🎉 Profil Anda telah lengkap 100%!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Aktivitas Lamaran Card */}
                        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#102B4B]" />
                                    <h2 className="text-sm font-bold text-[#102B4B]">
                                        Aktivitas Lamaran
                                    </h2>
                                </div>
                                <Link
                                    href="/app/applications"
                                    className="text-xs font-semibold text-[#1674D1] hover:underline"
                                >
                                    Lihat semua →
                                </Link>
                            </div>

                            {/* Summary 3 Tiles */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-2xl bg-[#EBF5FA] p-2.5">
                                    <div className="text-xl font-extrabold text-[#123B5D]">
                                        {stats.total_applied}
                                    </div>
                                    <div className="mt-0.5 text-[10px] leading-tight text-[#64748B]">
                                        Lamaran diproses
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#ECFDF5] p-2.5">
                                    <div className="text-xl font-extrabold text-[#16A36B]">
                                        {stats.interview}
                                    </div>
                                    <div className="mt-0.5 text-[10px] leading-tight text-[#64748B]">
                                        Interview terjadwal
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#F3E8FF] p-2.5">
                                    <div className="text-xl font-extrabold text-[#7E22CE]">
                                        {stats.in_review}
                                    </div>
                                    <div className="mt-0.5 text-[10px] leading-tight text-[#64748B]">
                                        Perubahan status
                                    </div>
                                </div>
                            </div>

                            {/* Lamaran Terbaru List */}
                            <div className="mt-5">
                                <h3 className="mb-2.5 text-xs font-bold text-[#102B4B]">
                                    Lamaran Terbaru
                                </h3>

                                {recentApplications.length === 0 ? (
                                    <p className="py-3 text-center text-xs text-slate-400">
                                        Belum ada lamaran terkirim.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-[#F1F5F9]">
                                        {recentApplications
                                            .slice(0, 3)
                                            .map((app) => {
                                                const cfg = STATUS_CONFIG[
                                                    app.status
                                                ] || {
                                                    label: app.status,
                                                    bg: 'bg-slate-100',
                                                    text: 'text-slate-700',
                                                };

                                                return (
                                                    <Link
                                                        key={app.id}
                                                        href="/app/applications"
                                                        className="group flex items-center justify-between rounded-xl px-1.5 py-2.5 transition hover:bg-slate-50"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF5FA] text-xs font-bold text-[#123B5D] overflow-hidden">
                                                                {app.vacancy?.company_profile?.logo_url ? (
                                                                    <img
                                                                        src={app.vacancy.company_profile.logo_url}
                                                                        alt={app.vacancy.company_profile.company_name}
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                ) : (
                                                                    (app.vacancy?.company_profile?.company_name || 'Perusahaan')
                                                                        .substring(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="truncate text-xs font-bold text-[#102B4B] group-hover:text-[#1674D1]">
                                                                    {
                                                                        app
                                                                            .vacancy
                                                                            .title
                                                                    }
                                                                </h4>
                                                                <p className="truncate text-[10px] text-[#64748B]">
                                                                    {
                                                                        app
                                                                            .vacancy
                                                                            .company_profile
                                                                            .company_name
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="ml-2 flex shrink-0 items-center gap-2">
                                                            <span
                                                                className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${cfg.bg} ${cfg.text}`}
                                                            >
                                                                {cfg.label}
                                                            </span>
                                                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lowongan Favorit Card */}
                        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="h-4 w-4 text-[#1769E0] fill-[#1769E0]" />
                                    <h2 className="text-sm font-bold text-[#102B4B]">
                                        Lowongan Favorit
                                    </h2>
                                </div>
                                <Link
                                    href="/app/favorites"
                                    className="text-xs font-semibold text-[#1674D1] hover:underline"
                                >
                                    Lihat semua →
                                </Link>
                            </div>
                            <div className="mt-3.5 flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-lg font-black text-[#102B4B]">
                                        {stats.total_favorites ?? savedIds.length}
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">
                                        Lowongan tersimpan
                                    </p>
                                </div>
                                <Link
                                    href="/app/favorites"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#1769E0] hover:bg-blue-100 transition"
                                >
                                    <span>Buka Daftar</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 3. Informasi Penting Card */}
                        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
                                <Bell className="h-4 w-4 text-[#102B4B]" />
                                <h2 className="text-sm font-bold text-[#102B4B]">
                                    Informasi Penting
                                </h2>
                            </div>

                            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#123B5D] shadow-2xs">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-[#102B4B]">
                                        Maintenance Sistem
                                    </h4>
                                    <p className="mt-0.5 text-[10px] leading-relaxed text-[#64748B]">
                                        Profabel akan melakukan pemeliharaan
                                        server berkala pada tanggal 25 Oktober
                                        2026 pukul 22.00 - 23.00 WIB.
                                    </p>
                                    <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                                        Pemberitahuan
                                    </span>
                                </div>
                            </div>
                        </div>
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
