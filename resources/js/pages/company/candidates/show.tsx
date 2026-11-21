import { useState, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Accessibility,
    ArrowLeft,
    ArrowRight,
    Award,
    Brain,
    Briefcase,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Ear,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    HeartHandshake,
    Home,
    Layers,
    Mail,
    MapPin,
    Monitor,
    Phone,
    Plus,
    Printer,
    Sparkles,
    Trash2,
    User,
    UserCheck,
    Users,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

interface EducationItem {
    degree: string;
    institution: string;
    period: string;
    status: string;
    gpa?: string | null;
}

interface ExperienceItem {
    title: string;
    company: string;
    period: string;
    points: string[];
}

interface CertificationItem {
    title: string;
    issuer: string;
    date: string;
}

interface AccessibilityData {
    disability_type: string;
    accommodations: string[];
    work_model_preference: 'wfo' | 'wfh' | 'hybrid';
    notes: string;
}

interface CandidateDetailData {
    id: number;
    name: string;
    avatar: string | null;
    initials: string;
    email: string;
    phone: string;
    birth_date: string;
    age: number | null;
    gender: string;
    domicile: string;
    education_title: string;
    bio?: string;
    current_job_title?: string;
    general_experience?: string;
    applied_position: string;
    vacancy_id: number;
    applied_at: string;
    applied_time_ago: string;
    source: string;
    status: string;
    status_label: string;
    hr_notes: string;
    educations: EducationItem[];
    skills: string[];
    certifications: CertificationItem[];
    work_experiences: ExperienceItem[];
    accessibility: AccessibilityData;
    cv: {
        filename: string;
        size: string;
        url: string | null;
    };
}

interface Props {
    candidate: CandidateDetailData;
    navigation: {
        prev_id: number | null;
        next_id: number | null;
    };
}

export default function CandidateShow({ candidate, navigation }: Props): ReactElement {
    const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'skills' | 'accessibility' | 'cv'>('profile');
    const [avatarError, setAvatarError] = useState<boolean>(false);
    const [hrNotes, setHrNotes] = useState<string>(candidate.hr_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
    const [actionStatus, setActionStatus] = useState<string | null>(null);

    const handleSaveNotes = (): void => {
        setIsSavingNotes(true);
        router.post(
            `/company/candidates/${candidate.id}/notes`,
            { notes: hrNotes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingNotes(false);
                    setActionStatus('Catatan HR berhasil disimpan.');
                    setTimeout(() => setActionStatus(null), 3500);
                },
                onError: () => {
                    setIsSavingNotes(false);
                },
            }
        );
    };

    const handleUpdateStatus = (newStatus: 'interview' | 'hired' | 'rejected'): void => {
        router.patch(
            `/company/candidates/${candidate.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const label = newStatus === 'hired'
                        ? 'Lulus Seleksi'
                        : (newStatus === 'interview' ? 'Interview' : 'Ditolak');
                    setActionStatus(`Status kandidat berhasil diubah menjadi: ${label}`);
                    setTimeout(() => setActionStatus(null), 3500);
                },
            }
        );
    };

    return (
        <CompanyLayout>
            <Head title={`Detail Kandidat: ${candidate.name} - Profabel`} />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header with Navigation Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/company/candidates"
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                                title="Kembali ke Daftar Kandidat"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#102B4B]">
                                Detail Kandidat
                            </h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Lihat informasi lengkap kandidat, riwayat pendidikan, pengalaman, dan kebutuhan aksesibilitas.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/company/candidates"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>

                        {/* Prev Candidate Button */}
                        {navigation.prev_id ? (
                            <Link
                                href={`/company/candidates/${navigation.prev_id}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kandidat Sebelumnya</span>
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kandidat Sebelumnya</span>
                            </span>
                        )}

                        {/* Next Candidate Button */}
                        {navigation.next_id ? (
                            <Link
                                href={`/company/candidates/${navigation.next_id}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                            >
                                <span>Kandidat Berikutnya</span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
                                <span>Kandidat Berikutnya</span>
                                <ChevronRight className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Feedback Banner */}
                {actionStatus && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>{actionStatus}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActionStatus(null)}
                            className="text-emerald-700 hover:text-emerald-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Candidate Overview Card with Real Photo */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {/* Profile Picture (Real Avatar from backend) */}
                            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-4 ring-blue-50 overflow-hidden shadow-sm">
                                {candidate.avatar && !avatarError ? (
                                    <img
                                        src={candidate.avatar}
                                        alt={candidate.name}
                                        className="h-full w-full object-cover"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-blue-100 text-xl font-black text-[#1769E0]">
                                        {candidate.initials}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-[#102B4B]">
                                        {candidate.name}
                                    </h2>
                                    {candidate.current_job_title && (
                                        <span className="hidden sm:inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1769E0] border border-blue-100">
                                            {candidate.current_job_title}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                    <span>{candidate.education_title}</span>
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{candidate.email}</span>
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{candidate.phone}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Column (Right) */}
                        <div className="sm:text-right">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Status Lamaran
                            </p>
                            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span>{candidate.status_label}</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500 font-medium">
                                Melamar pada {candidate.applied_at} ({candidate.applied_time_ago})
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5 Tab Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'profile', label: 'Profil', icon: User },
                            { id: 'education', label: 'Pendidikan', icon: GraduationCap },
                            { id: 'skills', label: 'Skill & Pengalaman', icon: Layers },
                            { id: 'accessibility', label: 'Accessibility Profile', icon: Sparkles },
                            { id: 'cv', label: 'CV', icon: FileText },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition ${
                                        isActive
                                            ? 'border-[#1769E0] text-[#1769E0]'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* TAB 1: PROFIL */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Left Column: Informasi Pribadi (7 cols) */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-7 space-y-5">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#1769E0]" />
                                    <h3 className="text-sm font-bold text-[#102B4B]">Informasi Pribadi</h3>
                                </div>

                                <div className="divide-y divide-slate-100 text-xs">
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">Nama Lengkap</span>
                                        <span className="font-bold text-slate-800 flex-1">: {candidate.name}</span>
                                    </div>
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">Tanggal Lahir</span>
                                        <span className="font-bold text-slate-800 flex-1">
                                            : {candidate.birth_date} {candidate.age ? `(${candidate.age} tahun)` : ''}
                                        </span>
                                    </div>
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">Jenis Kelamin</span>
                                        <span className="font-bold text-slate-800 flex-1">: {candidate.gender}</span>
                                    </div>
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">Domisili</span>
                                        <span className="font-bold text-slate-800 flex-1">: {candidate.domicile}</span>
                                    </div>
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">Email</span>
                                        <span className="font-bold text-[#1769E0] flex-1">: {candidate.email}</span>
                                    </div>
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="font-semibold text-slate-500 w-36">No. Telepon</span>
                                        <span className="font-bold text-slate-800 flex-1">: {candidate.phone}</span>
                                    </div>
                                </div>

                                {/* Tentang Kandidat / Bio */}
                                {candidate.bio && (
                                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                                        <span className="block text-xs font-bold text-[#102B4B] mb-1">
                                            Tentang Kandidat:
                                        </span>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">
                                            "{candidate.bio}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Informasi Lamaran & Catatan HR (5 cols) */}
                            <div className="space-y-6 lg:col-span-5">
                                {/* Card: Informasi Lamaran */}
                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-[#1769E0]" />
                                        <h3 className="text-sm font-bold text-[#102B4B]">Informasi Lamaran</h3>
                                    </div>

                                    <div className="space-y-3 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-500">Posisi Dilamar</span>
                                            <span className="font-bold text-slate-800">: {candidate.applied_position}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-500">Lowongan</span>
                                            <span className="flex items-center gap-1 font-bold text-[#1769E0]">
                                                : {candidate.applied_position}
                                                <Link
                                                    href={`/company/vacancies/${candidate.vacancy_id}`}
                                                    className="inline-flex items-center gap-0.5 text-[#1769E0] hover:underline"
                                                    title="Lihat Lowongan"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                                </Link>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-500">Tanggal Melamar</span>
                                            <span className="font-bold text-slate-800">: {candidate.applied_at}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-500">Sumber Lamaran</span>
                                            <span className="font-bold text-slate-800">: {candidate.source}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-500">Status Saat Ini</span>
                                            <span className="font-bold">: <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600">{candidate.status_label}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card: Catatan HR */}
                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-[#1769E0]" />
                                            <h3 className="text-sm font-bold text-[#102B4B]">Catatan HR</h3>
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {hrNotes.length}/500
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        value={hrNotes}
                                        onChange={(e) => setHrNotes(e.target.value)}
                                        placeholder="Tulis catatan mengenai kandidat ini..."
                                        className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <button
                                type="button"
                                onClick={() => handleUpdateStatus('rejected')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                            >
                                <X className="h-4 w-4" />
                                <span>Tolak</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 px-4 py-2.5 text-xs font-bold text-[#1769E0] hover:bg-blue-50 transition disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4" />
                                <span>{isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleUpdateStatus('interview')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769E0] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                            >
                                <span>Lanjutkan ke Seleksi</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PENDIDIKAN (Realtime Data) */}
                {activeTab === 'education' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-[#1769E0]" />
                                <h3 className="text-base font-bold text-[#102B4B]">Riwayat Pendidikan</h3>
                            </div>
                        </div>

                        {candidate.educations.length > 0 ? (
                            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                                {candidate.educations.map((edu, idx) => (
                                    <div key={idx} className="relative">
                                        <span
                                            className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                                                idx === 0 ? 'bg-[#1769E0]' : 'bg-slate-300'
                                            }`}
                                        />

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <h4 className="text-sm font-extrabold text-[#102B4B]">
                                                        {edu.degree}
                                                    </h4>
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                                                        {edu.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs font-semibold text-slate-600">
                                                    {edu.institution}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400 font-medium">
                                                    {edu.period}
                                                </p>
                                            </div>

                                            {edu.gpa && (
                                                <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#1769E0]">
                                                    IPK: {edu.gpa}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-xs font-semibold text-slate-400">
                                Kandidat belum menambahkan riwayat pendidikan rinci.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: SKILL & PENGALAMAN (Realtime Data) */}
                {activeTab === 'skills' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left Column: Keahlian & Sertifikasi (6 cols) */}
                        <div className="space-y-6 lg:col-span-6">
                            {/* Card: Keahlian (Skill) */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-[#1769E0]" />
                                    <h3 className="text-sm font-bold text-[#102B4B]">Keahlian (Skill)</h3>
                                </div>
                                {candidate.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.map((skill, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="rounded-xl bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-[#1769E0] border border-blue-100/60"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">
                                        Kandidat belum mencantumkan daftar keahlian.
                                    </p>
                                )}
                            </div>

                            {/* Card: Sertifikasi */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-[#1769E0]" />
                                    <h3 className="text-sm font-bold text-[#102B4B]">Sertifikasi</h3>
                                </div>
                                {candidate.certifications.length > 0 ? (
                                    <div className="space-y-3">
                                        {candidate.certifications.map((cert, cIdx) => (
                                            <div
                                                key={cIdx}
                                                className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100/80 text-[#1769E0]">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-800">
                                                        {cert.title}
                                                    </h4>
                                                    <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                                                        {cert.issuer} • {cert.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">
                                        Kandidat belum mencantumkan sertifikasi.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Pengalaman Kerja (6 cols) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-6 space-y-5">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-[#1769E0]" />
                                <h3 className="text-sm font-bold text-[#102B4B]">Pengalaman Kerja</h3>
                            </div>

                            {candidate.work_experiences.length > 0 ? (
                                <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
                                    {candidate.work_experiences.map((exp, expIdx) => (
                                        <div key={expIdx} className="relative">
                                            <span
                                                className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                                                    expIdx === 0 ? 'bg-[#1769E0]' : 'bg-slate-300'
                                                }`}
                                            />

                                            <div>
                                                <h4 className="text-sm font-extrabold text-[#102B4B]">
                                                    {exp.title}
                                                </h4>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-600">
                                                    {exp.company}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                                                    {exp.period}
                                                </p>

                                                <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                                                    {exp.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="flex items-start gap-1.5">
                                                            <span className="text-slate-400">•</span>
                                                            <span>{pt.replace(/^•\s*/, '')}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-xs font-semibold text-slate-400">
                                    Kandidat belum mencantumkan riwayat pengalaman kerja formal.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: ACCESSIBILITY PROFILE (Realtime Data) */}
                {activeTab === 'accessibility' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-[#1769E0]">
                                <Sparkles className="h-5 w-5" />
                                <h3 className="text-base font-bold text-[#102B4B]">Accessibility Profile</h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 font-medium">
                                Informasi ini membantu perusahaan memahami kebutuhan dukungan kerja yang diperlukan kandidat.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Left Side: Jenis Disabilitas & Kebutuhan Dukungan */}
                            <div className="space-y-5">
                                {/* Jenis Disabilitas */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Accessibility className="h-4 w-4 text-[#102B4B]" />
                                        <h4 className="text-xs font-bold text-[#102B4B]">Jenis Disabilitas</h4>
                                    </div>
                                    <div className="rounded-xl bg-blue-50/50 border border-blue-100/70 p-3.5 text-xs font-bold text-slate-800">
                                        {candidate.accessibility.disability_type}
                                    </div>
                                </div>

                                {/* Kebutuhan Dukungan di Tempat Kerja */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <HeartHandshake className="h-4 w-4 text-[#102B4B]" />
                                        <h4 className="text-xs font-bold text-[#102B4B]">
                                            Kebutuhan Dukungan di Tempat Kerja
                                        </h4>
                                    </div>
                                    <div className="space-y-2.5">
                                        {candidate.accessibility.accommodations.map((acc, aIdx) => (
                                            <div
                                                key={aIdx}
                                                className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 text-xs font-semibold text-slate-700"
                                            >
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                    <Check className="h-3 w-3" />
                                                </span>
                                                <span>{acc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Preferensi Pengaturan Kerja & Catatan Tambahan */}
                            <div className="space-y-5">
                                {/* Preferensi Pengaturan Kerja */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Monitor className="h-4 w-4 text-[#102B4B]" />
                                        <h4 className="text-xs font-bold text-[#102B4B]">
                                            Preferensi Pengaturan Kerja
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {/* WFO */}
                                        <div
                                            className={`rounded-xl border p-3 text-center transition ${
                                                candidate.accessibility.work_model_preference === 'wfo'
                                                    ? 'border-blue-300 bg-blue-50/70 text-[#1769E0]'
                                                    : 'border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                                                {candidate.accessibility.work_model_preference === 'wfo' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[#1769E0]" />
                                                ) : (
                                                    <span className="h-4 w-4 rounded-full border border-slate-300" />
                                                )}
                                                <span>WFO</span>
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                                                (Work From Office)
                                            </p>
                                        </div>

                                        {/* WFH */}
                                        <div
                                            className={`rounded-xl border p-3 text-center transition ${
                                                candidate.accessibility.work_model_preference === 'wfh'
                                                    ? 'border-blue-300 bg-blue-50/70 text-[#1769E0]'
                                                    : 'border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                                                {candidate.accessibility.work_model_preference === 'wfh' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[#1769E0]" />
                                                ) : (
                                                    <span className="h-4 w-4 rounded-full border border-slate-300" />
                                                )}
                                                <span>WFH</span>
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                                                (Work From Home)
                                            </p>
                                        </div>

                                        {/* Hybrid */}
                                        <div
                                            className={`rounded-xl border p-3 text-center transition ${
                                                candidate.accessibility.work_model_preference === 'hybrid'
                                                    ? 'border-blue-300 bg-blue-50/70 text-[#1769E0]'
                                                    : 'border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                                                {candidate.accessibility.work_model_preference === 'hybrid' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[#1769E0]" />
                                                ) : (
                                                    <span className="h-4 w-4 rounded-full border border-slate-300" />
                                                )}
                                                <span>Hybrid</span>
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                                                (WFO & WFH)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan Tambahan dari Kandidat */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-[#102B4B]" />
                                        <h4 className="text-xs font-bold text-[#102B4B]">
                                            Catatan Tambahan dari Kandidat
                                        </h4>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                                        {candidate.accessibility.notes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: CV (Realtime CV Viewer & Download) */}
                {activeTab === 'cv' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left Column: CV Viewer (8 cols) */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-8 overflow-hidden flex flex-col">
                            {/* Viewer Toolbar */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-4 py-2.5 text-white">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold">Berkas CV Pelamar</span>
                                    {candidate.cv.url && (
                                        <>
                                            <span className="text-slate-400">|</span>
                                            <span className="text-xs font-medium text-slate-300">
                                                {candidate.cv.filename && !/^[a-zA-Z0-9_-]{16,}\.[a-zA-Z0-9]+$/.test(candidate.cv.filename.trim())
                                                    ? candidate.cv.filename
                                                    : `Curriculum_Vitae_${candidate.name.replace(/\s+/g, '_')}.pdf`}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {candidate.cv.url && (
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <a
                                            href={candidate.cv.url}
                                            download={candidate.cv.filename && !/^[a-zA-Z0-9_-]{16,}\.[a-zA-Z0-9]+$/.test(candidate.cv.filename.trim())
                                                ? candidate.cv.filename
                                                : `Curriculum_Vitae_${candidate.name.replace(/\s+/g, '_')}.pdf`}
                                            className="p-1 hover:text-white transition"
                                            title="Unduh Berkas"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                        <a
                                            href={candidate.cv.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:text-white transition"
                                            title="Buka Tab Baru"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Viewer Surface */}
                            <div className="flex-1 bg-slate-100 p-4 sm:p-6 flex justify-center items-center overflow-auto min-h-[500px]">
                                {candidate.cv.url ? (
                                    <iframe
                                        src={candidate.cv.url}
                                        className="w-full h-[650px] rounded-xl border border-slate-200 bg-white shadow-sm"
                                        title={`CV ${candidate.name}`}
                                    />
                                ) : (
                                    <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-sm text-center space-y-3">
                                        <FileText className="mx-auto h-12 w-12 text-slate-300" />
                                        <h4 className="text-sm font-bold text-slate-700">Berkas CV Belum Diunggah</h4>
                                        <p className="text-xs text-slate-400">
                                            Kandidat belum mengunggah file CV atau lampiran dokumen tambahan.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Dokumen CV Card (4 cols) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4 space-y-5 h-fit">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#1769E0]" />
                                <h3 className="text-sm font-bold text-[#102B4B]">Dokumen CV</h3>
                            </div>

                            {/* CV File Tile */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-extrabold text-xs">
                                        PDF
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                                            {candidate.cv.filename && !/^[a-zA-Z0-9_-]{16,}\.[a-zA-Z0-9]+$/.test(candidate.cv.filename.trim())
                                                ? candidate.cv.filename
                                                : `Curriculum_Vitae_${candidate.name.replace(/\s+/g, '_')}.pdf`}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            {candidate.cv.size}
                                        </p>
                                    </div>
                                </div>

                                {candidate.cv.url && (
                                    <a
                                        href={candidate.cv.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                                        title="Buka Pratinjau"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            {/* Download Button */}
                            {candidate.cv.url ? (
                                <a
                                    href={candidate.cv.url}
                                    download={candidate.cv.filename && !/^[a-zA-Z0-9_-]{16,}\.[a-zA-Z0-9]+$/.test(candidate.cv.filename.trim())
                                        ? candidate.cv.filename
                                        : `Curriculum_Vitae_${candidate.name.replace(/\s+/g, '_')}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1769E0] py-3 text-xs font-bold text-[#1769E0] hover:bg-blue-50 transition"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Unduh CV</span>
                                </a>
                            ) : (
                                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-semibold text-slate-400">
                                    <span>CV belum diunggah</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
