import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Accessibility,
    AlertCircle,
    ArrowRight,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    DollarSign,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Send,
    Share2,
    Sparkles,
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
    requirements?: string[];
    skills_required?: string[];
    status: string;
    deadline?: string;
    created_at: string;
    company_profile: CompanyItem;
    accessibilities: AccessibilityItem[];
}

interface Props {
    vacancy: VacancyDetail;
    alreadyApplied: boolean;
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
}: Props): ReactElement {
    const page = usePage();
    const userRole = (page.props.auth as any)?.user?.role;
    const isPelamar = userRole === 'pelamar';

    const [activeTab, setActiveTab] = useState<
        'deskripsi' | 'perusahaan' | 'aksesibilitas' | 'proses'
    >('deskripsi');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
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
        const textToRead = `${vacancy.title} di ${vacancy.company_profile.company_name}. Lokasi ${vacancy.location}. Model kerja ${vacancy.work_model}. Deskripsi pekerjaan: ${vacancy.description}. Fasilitas aksesibilitas meliputi: ${vacancy.accessibilities.map((a) => ACCESSIBILITY_LABELS[a.accommodation_type] || a.accommodation_type).join(', ')}`;
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

    const handleShare = (): void => {
        if (navigator.share) {
            navigator
                .share({
                    title: vacancy.title,
                    text: `Lowongan kerja ramah disabilitas: ${vacancy.title} di ${vacancy.company_profile.company_name}`,
                    url: window.location.href,
                })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Tautan lowongan telah disalin ke papan klip!');
        }
    };

    return (
        <AppLayout>
            <Head
                title={`${vacancy.title} - ${vacancy.company_profile.company_name}`}
            />

            <div className="space-y-6 py-6 sm:py-8">
                {/* Back Link */}
                <div>
                    <Link
                        href="/jobs"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#1674D1] hover:underline sm:text-sm"
                    >
                        ← Kembali ke Daftar Lowongan
                    </Link>
                </div>

                {/* Main Content Grid: Left Main Section (8 cols) & Right Sidebar Cards (4 cols) */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* ===================== LEFT COLUMN: DETAIL PEKERJAAN (8 COLS) ===================== */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
                            {/* Header Title Row */}
                            <div className="flex flex-col justify-between gap-4 border-b border-[#F1F5F9] pb-6 sm:flex-row sm:items-center">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-extrabold tracking-tight text-[#102B4B] sm:text-3xl">
                                            {vacancy.title}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-bold text-[#15803D]">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Ramah Disabilitas
                                        </span>
                                    </div>

                                    {/* Company Info Row */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] text-xs font-extrabold text-[#16A36B]">
                                                {vacancy.company_profile.company_name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">
                                                {
                                                    vacancy.company_profile
                                                        .company_name
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

                                        <span className="text-[11px] font-semibold text-slate-700 uppercase">
                                            ★ {vacancy.work_model}
                                        </span>
                                    </div>
                                </div>

                                {/* Bookmark & Share Icons */}
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
                                                ? 'border-rose-300 bg-rose-50 text-rose-700'
                                                : 'border-[#E2E8F0] text-slate-500 hover:bg-slate-50 hover:text-emerald-700'
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

                                    <button
                                        type="button"
                                        onClick={() => setIsSaved(!isSaved)}
                                        aria-label="Simpan lowongan"
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                                            isSaved
                                                ? 'border-[#123B5D] bg-[#123B5D] text-white'
                                                : 'border-[#E2E8F0] text-slate-500 hover:bg-slate-50 hover:text-[#123B5D]'
                                        }`}
                                    >
                                        <Bookmark className="h-5 w-5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        aria-label="Bagikan lowongan"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-500 transition hover:bg-slate-50 hover:text-[#123B5D]"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs (Deskripsi, Perusahaan, Aksesibilitas, Proses Lamaran) */}
                            <div className="flex items-center gap-8 border-b border-[#F1F5F9] pt-2 text-xs font-semibold text-[#64748B] sm:text-sm">
                                {[
                                    { key: 'deskripsi', label: 'Deskripsi' },
                                    { key: 'perusahaan', label: 'Perusahaan' },
                                    {
                                        key: 'aksesibilitas',
                                        label: 'Aksesibilitas',
                                    },
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
                                                ? 'border-b-2 border-[#123B5D] text-[#123B5D]'
                                                : 'hover:text-[#102B4B]'
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
                                            <h3 className="mb-2 text-sm font-extrabold text-[#102B4B]">
                                                Deskripsi Pekerjaan
                                            </h3>
                                            <p className="text-xs leading-relaxed whitespace-pre-line text-[#475569] sm:text-sm">
                                                {vacancy.description}
                                            </p>
                                        </div>

                                        {/* Tanggung Jawab */}
                                        <div>
                                            <h3 className="mb-2 text-sm font-extrabold text-[#102B4B]">
                                                Tanggung Jawab
                                            </h3>
                                            <ul className="list-inside list-disc space-y-1.5 text-xs text-[#475569] sm:text-sm">
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
                                        {vacancy.requirements &&
                                            vacancy.requirements.length > 0 && (
                                                <div>
                                                    <h3 className="mb-2 text-sm font-extrabold text-[#102B4B]">
                                                        Kualifikasi
                                                    </h3>
                                                    <ul className="list-inside list-disc space-y-1.5 text-xs text-[#475569] sm:text-sm">
                                                        {vacancy.requirements.map(
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
                                    <div className="space-y-4 text-xs text-[#475569] sm:text-sm">
                                        <h3 className="text-sm font-extrabold text-[#102B4B]">
                                            Tentang Perusahaan
                                        </h3>
                                        <p className="leading-relaxed">
                                            {vacancy.company_profile
                                                .description ??
                                                'Informasi tentang profil perusahaan belum dicantumkan secara lengkap.'}
                                        </p>
                                        <div className="pt-2">
                                            <strong className="text-slate-800">
                                                Alamat Kantor:
                                            </strong>{' '}
                                            {vacancy.company_profile.address}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'aksesibilitas' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-extrabold text-[#102B4B]">
                                            Fasilitas Kerja Inklusif
                                        </h3>
                                        <p className="text-xs text-[#64748B]">
                                            Perusahaan ini menyediakan akomodasi
                                            berikut untuk memastikan kenyamanan
                                            kerja bagi penyandang disabilitas:
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                            {vacancy.accessibilities.map(
                                                (acc) => (
                                                    <div
                                                        key={acc.id}
                                                        className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3"
                                                    >
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900">
                                                                {ACCESSIBILITY_LABELS[
                                                                    acc
                                                                        .accommodation_type
                                                                ] ??
                                                                    acc.accommodation_type}
                                                            </div>
                                                            {acc.description && (
                                                                <p className="mt-0.5 text-[11px] text-slate-600">
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
                                    </div>
                                )}

                                {activeTab === 'proses' && (
                                    <div className="space-y-4 text-xs text-[#475569] sm:text-sm">
                                        <h3 className="text-sm font-extrabold text-[#102B4B]">
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
                            <div className="space-y-4 border-t border-[#F1F5F9] pt-6">
                                <h3 className="text-base font-extrabold text-[#102B4B]">
                                    Informasi Perusahaan
                                </h3>

                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D0E5F0] bg-[#EBF5FA] text-lg font-black text-[#123B5D]">
                                            {vacancy.company_profile.company_name
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-base font-bold text-[#102B4B]">
                                                    {
                                                        vacancy.company_profile
                                                            .company_name
                                                    }
                                                </h4>
                                                <CheckCircle2 className="h-4 w-4 text-[#1674D1]" />
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#64748B]">
                                                {vacancy.company_profile
                                                    .industry ??
                                                    'Teknologi Informasi'}
                                            </p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
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
                                        className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-[#1674D1] bg-white px-4 py-2 text-xs font-bold text-[#1674D1] transition hover:bg-blue-50"
                                    >
                                        <span>Lihat Profil Perusahaan</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>

                                <p className="text-xs leading-relaxed text-[#475569]">
                                    {vacancy.company_profile.description ??
                                        `${vacancy.company_profile.company_name} adalah perusahaan yang berkomitmen menciptakan lingkungan kerja yang inklusif, setara, dan terbuka untuk semua talenta, termasuk penyandang disabilitas.`}
                                </p>

                                {/* Box: Aksesibilitas di Perusahaan */}
                                <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                                            A11y
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-emerald-950">
                                                Aksesibilitas di Perusahaan
                                            </h5>
                                            <p className="text-[11px] text-emerald-800">
                                                Kami menyediakan berbagai
                                                dukungan agar kamu dapat bekerja
                                                dengan nyaman dan produktif.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Accessibility Pill Badges */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Ruang kerja aksesibel
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Kerja remote (fleksibel)
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Screen reader friendly
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Pendamping kerja (jika diperlukan)
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Jadwal fleksibel
                                        </span>
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                            Teknologi asistif tersedia
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== RIGHT COLUMN: SIDEBAR CARDS (4 COLS) ===================== */}
                    <div className="sticky top-24 space-y-6 lg:col-span-4">
                        {/* 1. Card: Lamar Pekerjaan Ini */}
                        <div className="space-y-4 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                            <h3 className="text-sm font-extrabold text-[#102B4B]">
                                Lamar Pekerjaan Ini
                            </h3>

                            {/* Action Buttons */}
                            <div className="space-y-2.5">
                                {alreadyApplied ? (
                                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DCFCE7] px-4 py-3.5 text-sm font-bold text-[#15803D] shadow-2xs">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Sudah Dilamar</span>
                                    </div>
                                ) : isPelamar ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsApplyModalOpen(true)
                                        }
                                        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#0A2239]"
                                    >
                                        <Send className="h-4 w-4 rotate-45" />
                                        <span>Lamar Sekarang</span>
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#123B5D] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#0A2239]"
                                    >
                                        <Send className="h-4 w-4 rotate-45" />
                                        <span>Masuk untuk Melamar</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsSaved(!isSaved)}
                                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs font-bold text-[#102B4B] shadow-2xs transition hover:bg-slate-50 sm:text-sm"
                                >
                                    <Bookmark
                                        className={`h-4 w-4 ${isSaved ? 'fill-[#123B5D] text-[#123B5D]' : 'text-slate-500'}`}
                                    />
                                    <span>
                                        {isSaved
                                            ? 'Tersimpan di Favorit'
                                            : 'Simpan Lowongan'}
                                    </span>
                                </button>

                                {isPelamar && (
                                    <button
                                        type="button"
                                        onClick={handleRunAiMatch}
                                        className="flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/70 px-4 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
                                    >
                                        <Sparkles className="h-4 w-4 text-emerald-700" />
                                        <span>Cek Kecocokan AI</span>
                                    </button>
                                )}
                            </div>

                            {/* Job Facts List */}
                            <div className="space-y-3 border-t border-[#F1F5F9] pt-3 text-xs">
                                <div className="flex items-start gap-3 text-[#64748B]">
                                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <div>
                                        <span className="block text-[11px] text-slate-400">
                                            Tipe Pekerjaan
                                        </span>
                                        <strong className="text-slate-800 capitalize">
                                            {vacancy.job_type}
                                        </strong>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-[#64748B]">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <div>
                                        <span className="block text-[11px] text-slate-400">
                                            Lokasi
                                        </span>
                                        <strong className="text-slate-800">
                                            {vacancy.location} (
                                            {vacancy.work_model})
                                        </strong>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-[#64748B]">
                                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <div>
                                        <span className="block text-[11px] text-slate-400">
                                            Batasan Lamaran
                                        </span>
                                        <strong className="text-slate-800">
                                            {vacancy.deadline
                                                ? new Date(
                                                      vacancy.deadline,
                                                  ).toLocaleDateString('id-ID')
                                                : '30 Desember 2026'}
                                        </strong>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-[#64748B]">
                                    <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <div>
                                        <span className="block text-[11px] text-slate-400">
                                            Gaji
                                        </span>
                                        <strong className="text-slate-800">
                                            {vacancy.is_salary_public &&
                                            vacancy.salary_min
                                                ? `Rp ${vacancy.salary_min.toLocaleString('id-ID')} - ${vacancy.salary_max?.toLocaleString('id-ID')} / bulan`
                                                : 'Gaji Kompetitif'}
                                        </strong>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-[#64748B]">
                                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <div>
                                        <span className="block text-[11px] text-slate-400">
                                            Tingkat Pengalaman
                                        </span>
                                        <strong className="text-slate-800 capitalize">
                                            {vacancy.experience_level}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Card: Kontak HR */}
                        <div className="flex items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#123B5D] text-sm font-bold text-white">
                                    HR
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#102B4B] sm:text-sm">
                                        Tim Rekruter
                                    </h4>
                                    <p className="text-[11px] text-[#64748B]">
                                        HR Specialist
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/app/applications"
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3.5 py-2 text-xs font-bold text-[#102B4B] transition hover:border-[#123B5D] hover:bg-slate-50"
                            >
                                <Mail className="h-3.5 w-3.5" />
                                <span>Kirim Pesan</span>
                            </Link>
                        </div>

                        {/* 3. Card: Lowongan Lain dari Perusahaan ini */}
                        <div className="space-y-3.5 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                            <h3 className="text-xs font-extrabold text-[#102B4B]">
                                Lowongan Lain dari Perusahaan ini
                            </h3>

                            <div className="space-y-2.5">
                                <Link
                                    href="/jobs"
                                    className="group flex items-center justify-between rounded-2xl border border-[#F1F5F9] p-2.5 transition hover:bg-slate-50"
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0FDF4] text-xs font-bold text-[#16A36B]">
                                            MB
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate text-xs font-bold text-[#102B4B] group-hover:text-[#1674D1]">
                                                Frontend Developer
                                            </h4>
                                            <p className="text-[10px] text-[#64748B]">
                                                Full Time • Hybrid
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                                </Link>

                                <Link
                                    href="/jobs"
                                    className="group flex items-center justify-between rounded-2xl border border-[#F1F5F9] p-2.5 transition hover:bg-slate-50"
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0FDF4] text-xs font-bold text-[#16A36B]">
                                            MB
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate text-xs font-bold text-[#102B4B] group-hover:text-[#1674D1]">
                                                Product QA Manual
                                            </h4>
                                            <p className="text-[10px] text-[#64748B]">
                                                Full Time • Onsite
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                                </Link>
                            </div>
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
                        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3
                                    id="modal-headline"
                                    className="text-lg font-bold text-slate-900"
                                >
                                    Lamar: {vacancy.title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                                        className="text-xs font-bold text-[#102B4B]"
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
                                        className="text-xs font-bold text-[#102B4B]"
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
                                        className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20"
                                    />
                                    {errors.cover_letter && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            {errors.cover_letter}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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
                                        className="min-h-[44px] bg-[#123B5D] px-6 text-xs font-bold text-white hover:bg-[#0C2742]"
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
                        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-emerald-700" />
                                    <h3
                                        id="ai-match-headline"
                                        className="text-base font-bold text-slate-900"
                                    >
                                        Analisis Kecocokan AI: {vacancy.title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMatchModalOpen(false)}
                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-100"
                                    aria-label="Tutup modal analisis"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {isMatchingAi ? (
                                <div className="py-12 text-center text-sm text-slate-500">
                                    <Sparkles className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-700" />
                                    <p>
                                        Sedang mengevaluasi kecocokan kompetensi
                                        dan aksesibilitas...
                                    </p>
                                </div>
                            ) : aiMatch ? (
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div>
                                            <span className="text-xs font-semibold text-emerald-800 uppercase">
                                                Skor Kecocokan
                                            </span>
                                            <p className="text-2xl font-black text-emerald-950">
                                                {aiMatch.match_percentage}%
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="rounded-lg border border-emerald-100 bg-white px-2.5 py-1 text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Kompetensi
                                                </span>
                                                <span className="text-xs font-bold text-slate-800">
                                                    {aiMatch.competency_score}%
                                                </span>
                                            </div>
                                            <div className="rounded-lg border border-emerald-100 bg-white px-2.5 py-1 text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Aksesibilitas
                                                </span>
                                                <span className="text-xs font-bold text-emerald-700">
                                                    {
                                                        aiMatch.accessibility_score
                                                    }
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs leading-relaxed text-slate-700">
                                        {aiMatch.summary}
                                    </p>

                                    {aiMatch.matching_points?.length > 0 && (
                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                                            <span className="mb-1 block text-xs font-bold text-emerald-800">
                                                Poin Kecocokan:
                                            </span>
                                            <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
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

                                    <div className="flex justify-end border-t border-slate-100 pt-3">
                                        <Button
                                            onClick={() =>
                                                setIsMatchModalOpen(false)
                                            }
                                            className="min-h-[44px] bg-[#123B5D] text-xs font-bold text-white hover:bg-[#0C2742]"
                                        >
                                            Mengerti
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-500">
                                    Gagal memuat analisis. Silakan coba kembali.
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
