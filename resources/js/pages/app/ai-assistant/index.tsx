import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Bookmark,
    BriefcaseBusiness,
    Building2,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileSearch,
    FileText,
    History,
    Lightbulb,
    MapPin,
    Minus,
    Search,
    Sparkles,
    Trash2,
    TrendingDown,
    TrendingUp,
    Upload,
    X,
    Zap,
} from 'lucide-react';
import {
    useState,
    type ChangeEvent,
    type FormEvent,
    type ReactElement,
} from 'react';

interface VacancyCompanyProfile {
    company_name: string;
    logo_url?: string | null;
}

interface VacancyItem {
    id: number;
    title: string;
    slug: string;
    work_model: string;
    location: string;
    skills_required?: any;
    company_profile: VacancyCompanyProfile;
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

interface SavedMatch {
    id: number;
    vacancy_id: number;
    match_percentage: number;
    competency_score: number;
    accessibility_score: number;
    matching_points: string[];
    gaps: string[];
    summary: string;
    vacancy: VacancyItem;
}

interface SeekerProfile {
    id: number;
    current_job_title?: string;
    education?: string;
    skills?: string[];
    work_experiences?: unknown[];
    projects?: unknown[];
    user: { id: number; name: string };
}

interface ProfileCvMeta {
    has_cv: boolean;
    name?: string | null;
    updated_at?: string | null;
}

interface AiHistory {
    id: number;
    type: 'cv_analysis' | 'job_match';
    payload: CvResult & MatchResult;
    metadata_source?: string | null;
    analyzed_at?: string | null;
}

interface Props {
    seeker: SeekerProfile;
    savedMatches: SavedMatch[];
    activeVacancies: VacancyItem[];
    favoriteVacancyIds?: number[];
    aiHistories?: AiHistory[];
    profileCv?: ProfileCvMeta;
}

type Tab = 'home' | 'matches' | 'skillGap' | 'cvReview' | 'history' | 'historyDetail';

type SkillGapResult = {
    match_score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    learning_recommendations?: string[];
};

type MatchResult = Partial<SavedMatch> & {
    experience_score?: number;
    project_score?: number;
    vacancy?: VacancyItem;
    skill_gap?: SkillGapResult;
};

type CvDetail = { title?: string; description?: string };

type CvCategoryScores = {
    ats_compatibility?: number;
    structure_format?: number;
    content_relevance?: number;
    keyword_usage?: number;
    experience_achievement?: number;
    project_portfolio?: number;
};

type CvResult = {
    ats_score?: number;
    formatting_grade?: string;
    summary?: string;
    category_scores?: CvCategoryScores;
    strengths?: string[];
    improvements?: string[];
    strengths_detailed?: CvDetail[];
    improvements_detailed?: CvDetail[];
    suggested_keywords?: string[];
    action_recommendations?: string[];
    accessibility_tips?: string[];
};

const clampScore = (value: unknown): number | null => {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    return Math.max(0, Math.min(100, Math.round(value)));
};

function ScoreRing({
    value,
    label = 'Kecocokan',
}: {
    value: number | null;
    label?: string;
}): ReactElement {
    const score = value ?? 0;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;

    return (
        <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center"
            aria-label={
                value === null
                    ? `${label} belum tersedia`
                    : `${label} ${score}%`
            }
        >
            <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#E2EDF3"
                    strokeWidth="8"
                />
                {value !== null && (
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={
                            score >= 80
                                ? '#12B981'
                                : score >= 60
                                  ? '#F59E0B'
                                  : '#EF4444'
                        }
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                    />
                )}
            </svg>
            <div className="absolute text-center">
                <strong className="block text-2xl font-extrabold text-[#102B4B]">
                    {value === null ? '—' : `${score}%`}
                </strong>
                <span className="text-[10px] font-semibold text-slate-500">
                    {label}
                </span>
            </div>
        </div>
    );
}

function MetricBar({
    label,
    value,
    color = '#1674D1',
}: {
    label: string;
    value: unknown;
    color?: string;
}): ReactElement | null {
    const score = clampScore(value);
    if (score === null) return null;

    return (
        <div className="rounded-xl border border-[#E2EDF3] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#102B4B]">{label}</span>
                <strong className="text-[#102B4B]">{score}%</strong>
            </div>
            <div
                className="h-2 overflow-hidden rounded-full bg-[#E7EEF3]"
                aria-hidden="true"
            >
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function BulletList({
    items,
    emptyText,
}: {
    items?: string[];
    emptyText: string;
}): ReactElement {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    return safeItems.length > 0 ? (
        <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
            {safeItems.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                    <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#12B981]"
                        aria-hidden="true"
                    />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
    );
}

function ProgressDelta({
    current,
    previous,
}: {
    current: unknown;
    previous: unknown;
}): ReactElement | null {
    const currentScore = clampScore(current);
    const previousScore = clampScore(previous);
    if (currentScore === null || previousScore === null) return null;
    const delta = currentScore - previousScore;
    const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
    const color =
        delta > 0
            ? 'text-[#087A5E]'
            : delta < 0
              ? 'text-[#C2410C]'
              : 'text-slate-500';
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${color}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {delta > 0 ? '+' : ''}
            {delta} poin
        </span>
    );
}

function FeatureCard({
    icon,
    title,
    eyebrow,
    description,
    bullets,
    tone,
    onClick,
}: {
    icon: ReactElement;
    title: string;
    eyebrow: string;
    description: string;
    bullets: string[];
    tone: 'purple' | 'blue';
    onClick: () => void;
}): ReactElement {
    const purple = tone === 'purple';
    return (
        <article
            className={`flex min-h-[330px] flex-col justify-between rounded-2xl border p-6 ${purple ? 'border-[#E6D4FA] bg-[#FCF8FF]' : 'border-[#CFE6F7] bg-[#F3FAFF]'}`}
        >
            <div>
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${purple ? 'bg-[#EEDFEC] text-[#6921B7]' : 'bg-[#DCEFFB] text-[#1674D1]'}`}
                    >
                        {icon}
                    </div>
                    <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${purple ? 'bg-[#EEDFEC] text-[#6921B7]' : 'bg-[#DCEFFB] text-[#15527E]'}`}
                    >
                        {eyebrow}
                    </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#102B4B]">
                    {title}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                    {description}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                            <Check
                                className={`mt-0.5 h-4 w-4 shrink-0 ${purple ? 'text-[#6921B7]' : 'text-[#1674D1]'}`}
                            />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
            <button
                type="button"
                onClick={onClick}
                className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1] ${purple ? 'bg-[#6921B7] hover:bg-[#541891]' : 'bg-[#15527E] hover:bg-[#123B5D]'}`}
            >
                {purple ? 'Mulai Analisis CV' : 'Mulai Job Matching'}{' '}
                <ArrowRight className="h-4 w-4" />
            </button>
        </article>
    );
}

export default function AiAssistantIndex({
    seeker,
    savedMatches,
    activeVacancies,
    favoriteVacancyIds = [],
    aiHistories = [],
    profileCv = { has_cv: false },
}: Props): ReactElement {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [selectedVacancyId, setSelectedVacancyId] = useState<string>('');
    const [vacancySearch, setVacancySearch] = useState<string>('');
    const [vacancyFilter, setVacancyFilter] = useState<'all' | 'favorites'>('all');
    const [favoriteIds, setFavoriteIds] = useState<number[]>(favoriteVacancyIds);
    const [vacancyPage, setVacancyPage] = useState<number>(1);
    const VACANCIES_PER_PAGE = 4;
    const [isMatching, setIsMatching] = useState(false);
    const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null);
    const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);
    const [cvSource, setCvSource] = useState<'profile' | 'upload'>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(
        null,
    );
    const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(
        null,
    );
    const [targetRoleSkills, setTargetRoleSkills] = useState('');
    const [isScanningCv, setIsScanningCv] = useState(false);
    const [cvResult, setCvResult] = useState<CvResult | null>(null);
    const [cvResultTab, setCvResultTab] = useState<
        'summary' | 'ats' | 'content' | 'keywords' | 'recommendations'
    >('summary');
    const [viewingHistory, setViewingHistory] = useState<AiHistory | null>(null);
    const [historyCvResultTab, setHistoryCvResultTab] = useState<
        'summary' | 'ats' | 'content' | 'keywords' | 'recommendations'
    >('summary');
    const [historyList, setHistoryList] = useState<AiHistory[]>(aiHistories);
    const [historyFilter, setHistoryFilter] =
        useState<AiHistory['type']>('cv_analysis');
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
        null,
    );
    const [compareHistoryIds, setCompareHistoryIds] = useState<number[]>([]);
    const [requestError, setRequestError] = useState('');

    const csrfToken = (): string =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content || '';

    const handleRunMatch = async (vacancyId: number): Promise<void> => {
        setIsMatching(true);
        setRequestError('');
        try {
            const response = await fetch(`/app/ai/match/${vacancyId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });
            if (!response.ok) throw new Error('match request failed');
            const match = (await response.json()) as MatchResult;
            setCurrentMatch(match);
            setGapResult(match.skill_gap ?? null);
            void refreshHistory();
        } catch {
            setRequestError(
                'Analisis belum berhasil dimuat. Coba lagi dalam beberapa saat.',
            );
        } finally {
            setIsMatching(false);
        }
    };

    const refreshHistory = async (): Promise<void> => {
        const response = await fetch('/app/ai/history', {
            headers: { Accept: 'application/json' },
        });
        if (response.ok) {
            const result = (await response.json()) as { data: AiHistory[] };
            setHistoryList(result.data);
        }
    };

    const deleteHistory = async (history: AiHistory): Promise<void> => {
        if (
            !window.confirm(
                'Hapus riwayat analisis ini? Hasil lengkap tidak dapat dipulihkan.',
            )
        )
            return;
        const response = await fetch(`/app/ai/history/${history.id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
        });
        if (!response.ok) {
            setRequestError('Riwayat belum berhasil dihapus. Coba lagi.');
            return;
        }
        setHistoryList((items) =>
            items.filter((item) => item.id !== history.id),
        );
        if (selectedHistoryId === history.id) setSelectedHistoryId(null);
        if (viewingHistory?.id === history.id) {
            setViewingHistory(null);
            setActiveTab('history');
        }
    };

    const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0] ?? null;
        setUploadedFile(file);
        setUploadedFileName(file?.name ?? null);
        setUploadedFileSize(file?.size ?? null);
        setRequestError('');
    };

    const handleScanCv = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        if (cvSource === 'profile' && !profileCv.has_cv) {
            setRequestError(
                'Belum ada CV di profil. Unggah CV baru untuk mulai analisis.',
            );
            return;
        }
        if (cvSource === 'upload' && !uploadedFile) {
            setRequestError(
                'Pilih file CV PDF, DOC, atau DOCX terlebih dahulu.',
            );
            return;
        }

        setIsScanningCv(true);
        setRequestError('');
        try {
            const formData = new FormData();
            formData.append('source', cvSource);
            if (cvSource === 'upload' && uploadedFile)
                formData.append('cv', uploadedFile);
            targetRoleSkills
                .split(',')
                .map((skill) => skill.trim())
                .filter(Boolean)
                .forEach((skill) => formData.append('target_skills[]', skill));

            const response = await fetch('/app/ai/cv-review', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: formData,
            });
            if (!response.ok) throw new Error('cv review request failed');
            setCvResult(await response.json());
            void refreshHistory();
        } catch {
            setRequestError(
                'Analisis CV belum berhasil dimuat. Coba lagi dalam beberapa saat.',
            );
        } finally {
            setIsScanningCv(false);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, vacancyId: number): Promise<void> => {
        e.stopPropagation();
        const isFav = favoriteIds.includes(vacancyId);
        setFavoriteIds((prev) =>
            isFav ? prev.filter((id) => id !== vacancyId) : [...prev, vacancyId],
        );
        try {
            const response = await fetch(`/vacancies/${vacancyId}/favorite`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.is_favorited) {
                    setFavoriteIds((prev) => Array.from(new Set([...prev, vacancyId])));
                } else {
                    setFavoriteIds((prev) => prev.filter((id) => id !== vacancyId));
                }
            }
        } catch {
            setFavoriteIds((prev) =>
                isFav ? [...prev, vacancyId] : prev.filter((id) => id !== vacancyId),
            );
        }
    };

    const selectedVacancy = activeVacancies.find(
        (vacancy) => vacancy.id === Number(selectedVacancyId),
    );

    const favoriteVacanciesCount = activeVacancies.filter((v) =>
        favoriteIds.includes(v.id),
    ).length;

    const filteredVacancies = activeVacancies.filter((vacancy) => {
        if (vacancyFilter === 'favorites' && !favoriteIds.includes(vacancy.id)) {
            return false;
        }
        if (!vacancySearch.trim()) return true;
        const query = vacancySearch.toLowerCase();
        const titleMatch = vacancy.title.toLowerCase().includes(query);
        const companyMatch = vacancy.company_profile?.company_name
            ?.toLowerCase()
            .includes(query);
        const locationMatch = vacancy.location?.toLowerCase().includes(query);
        const workModelMatch = vacancy.work_model?.toLowerCase().includes(query);
        return Boolean(titleMatch || companyMatch || locationMatch || workModelMatch);
    });

    const totalVacancyPages = Math.max(
        1,
        Math.ceil(filteredVacancies.length / VACANCIES_PER_PAGE),
    );
    const paginatedVacancies = filteredVacancies.slice(
        (vacancyPage - 1) * VACANCIES_PER_PAGE,
        vacancyPage * VACANCIES_PER_PAGE,
    );
    const recentJobMatches = historyList
        .filter((item) => item.type === 'job_match')
        .slice(0, 3);
    const getPreviousHistory = (history: AiHistory): AiHistory | null => {
        const candidates = historyList
            .filter(
                (item) => item.id !== history.id && item.type === history.type,
            )
            .filter(
                (item) =>
                    history.type !== 'job_match' ||
                    item.payload.vacancy?.id === history.payload.vacancy?.id,
            )
            .sort(
                (a, b) =>
                    new Date(b.analyzed_at ?? 0).getTime() -
                    new Date(a.analyzed_at ?? 0).getTime(),
            );
        return (
            candidates.find(
                (item) =>
                    new Date(item.analyzed_at ?? 0).getTime() <
                    new Date(history.analyzed_at ?? 0).getTime(),
            ) ?? null
        );
    };
    const resultVacancy = currentMatch?.vacancy ?? selectedVacancy;
    const visibleHistory = historyList.filter(
        (history) => history.type === historyFilter,
    );
    const compareHistory = compareHistoryIds
        .map((id) => historyList.find((history) => history.id === id))
        .filter((history): history is AiHistory => Boolean(history));
    const toggleHistoryComparison = (history: AiHistory): void => {
        if (compareHistoryIds.includes(history.id)) {
            setCompareHistoryIds((ids) =>
                ids.filter((id) => id !== history.id),
            );
            return;
        }

        const first = historyList.find(
            (item) => item.id === compareHistoryIds[0],
        );
        if (
            history.type === 'job_match' &&
            first?.payload.vacancy?.id !== history.payload.vacancy?.id
        ) {
            setRequestError(
                'Perbandingan Job Matching hanya tersedia untuk lowongan yang sama.',
            );
            return;
        }
        if (compareHistoryIds.length < 2) {
            setRequestError('');
            setCompareHistoryIds((ids) => [...ids, history.id]);
        }
    };
    const openHistory = (history: AiHistory): void => {
        setSelectedHistoryId(history.id);
        setViewingHistory(history);
        setHistoryCvResultTab('summary');
        setRequestError('');
        setActiveTab('historyDetail');
    };
    const openTab = (tab: Exclude<Tab, 'home' | 'historyDetail'>): void => {
        setRequestError('');
        setViewingHistory(null);
        setActiveTab(tab);
    };

    return (
        <AppLayout>
            <Head title="AI Career Assistant - Profabel" />
            <div className="min-h-screen bg-[#F5FAFD]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {activeTab === 'home' && (
                        <section>
                            <div className="max-w-3xl">
                                <p className="text-sm font-semibold text-[#1674D1]">
                                    Perjalanan kariermu, lebih terarah
                                </p>
                                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#102B4B] sm:text-5xl">
                                    AI Career Assistant
                                </h1>
                                <p className="mt-3 text-lg text-slate-600">
                                    Teman cerdas untuk perjalanan kariermu.
                                </p>
                                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
                                    Gunakan bantuan yang kamu perlukan: rapikan
                                    CV, temukan lowongan yang paling sesuai,
                                    lalu tahu langkah berikutnya untuk
                                    berkembang.
                                </p>
                            </div>

                            <div className="mt-10 rounded-3xl border border-white bg-white p-4 shadow-sm sm:p-6">
                                <h2 className="text-2xl font-extrabold text-[#102B4B]">
                                    Pilih fitur AI
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Mulai dari kebutuhanmu saat ini. Hasil
                                    analisis tetap bisa kamu tinjau ulang.
                                </p>
                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                    <FeatureCard
                                        tone="purple"
                                        icon={<FileText className="h-7 w-7" />}
                                        title="AI CV Analysis"
                                        eyebrow="Persiapkan lamaran terbaik"
                                        description="Analisis struktur, keterbacaan ATS, dan isi CV agar lebih mudah dipahami perekrut."
                                        bullets={[
                                            'Analisis kesesuaian CV',
                                            'Rekomendasi perbaikan',
                                            'Tips penulisan yang lebih efektif',
                                        ]}
                                        onClick={() => openTab('cvReview')}
                                    />
                                    <FeatureCard
                                        tone="blue"
                                        icon={
                                            <BriefcaseBusiness className="h-7 w-7" />
                                        }
                                        title="AI Job Matching"
                                        eyebrow="Temukan pekerjaan yang tepat"
                                        description="Bandingkan profil, kompetensi, pengalaman, dan kebutuhan aksesibilitas dengan lowongan yang tersedia."
                                        bullets={[
                                            'Rekomendasi lowongan personal',
                                            'Pertimbangan aksesibilitas',
                                            'Tingkat kesesuaian profil',
                                        ]}
                                        onClick={() => openTab('matches')}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openTab('history')}
                                    className="mt-5 flex w-full items-center justify-between rounded-xl border border-[#DCEAF2] bg-[#F5FAFD] px-5 py-4 text-left transition hover:border-[#9CCAE2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1]"
                                >
                                    <span className="flex items-center gap-3">
                                        <History className="h-5 w-5 text-[#1674D1]" />
                                        <span>
                                            <strong className="block text-sm text-[#102B4B]">
                                                Riwayat Analisis
                                            </strong>
                                            <span className="text-xs text-slate-500">
                                                {historyList.length} hasil
                                                tersimpan · maksimal 20 per
                                                jenis
                                            </span>
                                        </span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-[#1674D1]" />
                                </button>
                            </div>
                        </section>
                    )}

                    {activeTab !== 'home' && (
                        <>
                            {activeTab === 'historyDetail' && viewingHistory ? (
                                <div className="mb-8 flex flex-col gap-4 border-b border-[#DCEAF2] pb-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveTab('history');
                                                setViewingHistory(null);
                                            }}
                                            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1674D1] hover:underline"
                                        >
                                            <ArrowLeft className="h-4 w-4" />{' '}
                                            Kembali ke Riwayat AI
                                        </button>
                                        <div className="flex items-start sm:items-center gap-3">
                                            <div
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                                    viewingHistory.type === 'cv_analysis'
                                                        ? 'bg-[#F2E7FE] text-[#6921B7]'
                                                        : 'bg-[#EAF4FF] text-[#1674D1]'
                                                }`}
                                            >
                                                {viewingHistory.type === 'cv_analysis' ? (
                                                    <FileSearch className="h-6 w-6" />
                                                ) : (
                                                    <BriefcaseBusiness className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                                        <History className="h-3 w-3" /> Arsip Riwayat
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Dianalisis pada{' '}
                                                        {new Date(
                                                            viewingHistory.analyzed_at ?? Date.now(),
                                                        ).toLocaleString('id-ID', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })}
                                                    </span>
                                                </div>
                                                <h1 className="mt-1 text-xl font-extrabold text-[#102B4B] sm:text-2xl lg:text-3xl leading-snug">
                                                    {viewingHistory.type === 'cv_analysis'
                                                        ? `Hasil Analisis CV: ${viewingHistory.metadata_source || 'Profil'}`
                                                        : `Hasil Job Matching: ${viewingHistory.payload.vacancy?.title || 'Lowongan'}`}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2.5 self-start lg:self-center">
                                        <button
                                            type="button"
                                            onClick={() => void deleteHistory(viewingHistory)}
                                            className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-50 hover:border-rose-300 transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus Riwayat
                                        </button>
                                        {viewingHistory.type === 'cv_analysis' ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCvResult(null);
                                                    setViewingHistory(null);
                                                    openTab('cvReview');
                                                }}
                                                className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#6921B7] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#581b9b] transition"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                Analisis CV Baru
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentMatch(null);
                                                    setViewingHistory(null);
                                                    openTab('matches');
                                                }}
                                                className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#15527E] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#123B5D] transition"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                Pencocokan Lowongan Baru
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 flex flex-col gap-4 border-b border-[#DCEAF2] pb-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeTab === 'skillGap' && viewingHistory) {
                                                    setActiveTab('historyDetail');
                                                } else {
                                                    setActiveTab('home');
                                                }
                                            }}
                                            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1674D1] hover:underline"
                                        >
                                            <ArrowLeft className="h-4 w-4" />{' '}
                                            {activeTab === 'skillGap' && viewingHistory
                                                ? 'Kembali ke Detail Riwayat'
                                                : 'Kembali ke AI Career Assistant'}
                                        </button>
                                        <div className="flex items-center gap-3">
                                            {activeTab === 'matches' ? (
                                                <BriefcaseBusiness className="h-8 w-8 text-[#1674D1]" />
                                            ) : activeTab === 'cvReview' ? (
                                                <FileSearch className="h-8 w-8 text-[#6921B7]" />
                                            ) : activeTab === 'history' ? (
                                                <History className="h-8 w-8 text-[#1674D1]" />
                                            ) : (
                                                <Zap className="h-8 w-8 text-[#12B981]" />
                                            )}
                                            <div>
                                                <h1 className="text-3xl font-extrabold text-[#102B4B]">
                                                    {activeTab === 'matches'
                                                        ? 'AI Job Matching'
                                                        : activeTab === 'cvReview'
                                                          ? 'Analisis CV dengan AI'
                                                          : activeTab === 'history'
                                                            ? 'Riwayat Analisis'
                                                            : 'Analisis Skill Gap'}
                                                </h1>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {activeTab === 'matches'
                                                        ? 'Temukan seberapa cocok profilmu dengan lowongan yang kamu inginkan.'
                                                        : activeTab === 'cvReview'
                                                          ? 'Dapatkan insight agar CV lebih jelas, relevan, dan ramah ATS.'
                                                          : activeTab === 'history'
                                                            ? 'Buka kembali hasil analisis lengkap dan bandingkan progresmu.'
                                                            : 'Kenali kemampuan yang sudah kuat dan langkah yang bisa kamu kembangkan.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <nav
                                        className="flex flex-wrap gap-2"
                                        aria-label="Fitur AI"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => openTab('cvReview')}
                                            className={`rounded-full px-3 py-2 text-xs font-bold ${activeTab === 'cvReview' ? 'bg-[#6921B7] text-white' : 'bg-white text-slate-600 ring-1 ring-[#DCEAF2]'}`}
                                        >
                                            Analisis CV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openTab('matches')}
                                            className={`rounded-full px-3 py-2 text-xs font-bold ${activeTab === 'matches' ? 'bg-[#15527E] text-white' : 'bg-white text-slate-600 ring-1 ring-[#DCEAF2]'}`}
                                        >
                                            Job Matching
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openTab('history')}
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${activeTab === 'history' ? 'bg-[#1674D1] text-white' : 'bg-white text-slate-600 ring-1 ring-[#DCEAF2]'}`}
                                        >
                                            <History className="h-3.5 w-3.5" />{' '}
                                            Riwayat
                                        </button>
                                    </nav>
                                </div>
                            )}

                            {requestError && (
                                <div
                                    role="alert"
                                    className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {requestError}
                                </div>
                            )}

                            {activeTab === 'matches' && (
                                <div className="space-y-6">
                                    <section className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                    Pilih lowongan yang ingin dicocokkan
                                                </h2>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Pilih lowongan dari daftar di bawah untuk dianalisis kecocokannya dengan profil keahlian Anda.
                                                </p>
                                            </div>
                                            {filteredVacancies.length > 0 && (
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1674D1] self-start sm:self-center">
                                                    {filteredVacancies.length} Lowongan Tersedia
                                                </span>
                                            )}
                                        </div>

                                        {/* Filter Tabs: Semua Lowongan vs Lowongan Favorit */}
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVacancyFilter('all');
                                                    setVacancyPage(1);
                                                }}
                                                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                    vacancyFilter === 'all'
                                                        ? 'bg-[#15527E] text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                Semua Lowongan ({activeVacancies.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVacancyFilter('favorites');
                                                    setVacancyPage(1);
                                                }}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                    vacancyFilter === 'favorites'
                                                        ? 'bg-amber-500 text-white shadow-xs'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                }`}
                                            >
                                                <Bookmark
                                                    className={`h-3.5 w-3.5 ${vacancyFilter === 'favorites' ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`}
                                                />
                                                Lowongan Favorit ({favoriteVacanciesCount})
                                            </button>
                                        </div>

                                        {/* Search Bar */}
                                        <div className="relative mt-3">
                                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={vacancySearch}
                                                onChange={(e) => {
                                                    setVacancySearch(e.target.value);
                                                    setVacancyPage(1);
                                                }}
                                                placeholder={
                                                    vacancyFilter === 'favorites'
                                                        ? 'Cari di antara lowongan favorit Anda...'
                                                        : 'Cari lowongan berdasarkan posisi, perusahaan, atau lokasi...'
                                                }
                                                className="w-full rounded-xl border border-[#E2EDF3] bg-white pl-10 pr-10 py-2.5 text-xs text-[#102B4B] placeholder:text-slate-400 focus:border-[#1674D1] focus:ring-2 focus:ring-[#1674D1]/20 outline-none transition"
                                            />
                                            {vacancySearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVacancySearch('');
                                                        setVacancyPage(1);
                                                    }}
                                                    className="absolute right-3 top-2.5 rounded-lg p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                                    aria-label="Hapus pencarian"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* List Kebawah (Vertical List) */}
                                        <div className="mt-4 space-y-3">
                                            {paginatedVacancies.map((vacancy) => {
                                                const isSelected = selectedVacancyId === String(vacancy.id);
                                                const isFavorited = favoriteIds.includes(vacancy.id);
                                                const companyName = vacancy.company_profile?.company_name || 'Perusahaan';
                                                const companyLogo = vacancy.company_profile?.logo_url;
                                                const companyInitial = companyName
                                                    .replace(/^PT\.?\s+/i, '')
                                                    .substring(0, 2)
                                                    .toUpperCase();
                                                const workModelBadge =
                                                    vacancy.work_model === 'remote'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : vacancy.work_model === 'hybrid'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200';

                                                return (
                                                    <div
                                                        key={vacancy.id}
                                                        onClick={() => setSelectedVacancyId(String(vacancy.id))}
                                                        className={`group flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 sm:p-5 transition sm:flex-row sm:items-center ${
                                                            isSelected
                                                                ? 'border-[#1674D1] bg-[#F0F8FD] ring-2 ring-[#B8D6E5] shadow-xs'
                                                                : 'border-[#E2EDF3] bg-white hover:border-[#9CCAE2] hover:bg-[#F9FCFE]'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3.5 min-w-0">
                                                            {companyLogo ? (
                                                                <img
                                                                    src={companyLogo}
                                                                    alt={companyName}
                                                                    className="h-12 w-12 shrink-0 rounded-2xl object-cover border border-[#E2EDF3] bg-white shadow-xs"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-black text-xs tracking-wider transition ${
                                                                        isSelected
                                                                            ? 'bg-white text-[#1674D1] border-blue-200 shadow-xs'
                                                                            : 'bg-[#EBF5FA] text-[#123B5D] border-blue-100/70'
                                                                    }`}
                                                                >
                                                                    {companyInitial}
                                                                </div>
                                                            )}

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="font-bold text-sm sm:text-base text-[#102B4B] group-hover:text-[#1674D1] transition">
                                                                        {vacancy.title}
                                                                    </h3>
                                                                    <span
                                                                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${workModelBadge}`}
                                                                    >
                                                                        {vacancy.work_model}
                                                                    </span>
                                                                    {isFavorited && (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                                            <Bookmark className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                                                            Favorit
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                                                    <span className="font-semibold text-slate-700">
                                                                        {companyName}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                                        {vacancy.location}
                                                                    </span>
                                                                </div>

                                                                {parseSkillList(vacancy.skills_required).length > 0 && (
                                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                                        {parseSkillList(vacancy.skills_required).slice(0, 4).map((skill) => (
                                                                            <span
                                                                                key={skill}
                                                                                className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                                                                            >
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                        {parseSkillList(vacancy.skills_required).length > 4 && (
                                                                            <span className="text-[10px] text-slate-400 self-center">
                                                                                +{parseSkillList(vacancy.skills_required).length - 4} lainnya
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Selection & Favorite Actions */}
                                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => void toggleFavorite(e, vacancy.id)}
                                                                title={isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                                                                className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
                                                                    isFavorited
                                                                        ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                                                                        : 'bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-slate-200'
                                                                }`}
                                                                aria-label={`Favoritkan ${vacancy.title}`}
                                                            >
                                                                <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-amber-500' : ''}`} />
                                                            </button>
                                                            {isSelected ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1674D1] px-4 py-1.5 text-xs font-bold text-white shadow-xs">
                                                                    <Check className="h-4 w-4" />
                                                                    Terpilih
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 group-hover:border-[#1674D1] group-hover:bg-blue-50 group-hover:text-[#1674D1] transition">
                                                                    Pilih Lowongan
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Empty State */}
                                        {filteredVacancies.length === 0 && (
                                            <div className="mt-4 rounded-2xl border border-dashed border-[#CFE6F7] bg-white p-8 text-center">
                                                {vacancyFilter === 'favorites' ? (
                                                    <div>
                                                        <Bookmark className="mx-auto h-8 w-8 text-amber-500" />
                                                        <h3 className="mt-3 text-sm font-bold text-[#102B4B]">
                                                            Belum ada lowongan favorit yang sesuai
                                                        </h3>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {vacancySearch
                                                                ? `Tidak ada lowongan favorit dengan kata kunci "${vacancySearch}".`
                                                                : 'Simpan lowongan di halaman Cari Kerja untuk memilihnya dengan cepat di sini.'}
                                                        </p>
                                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setVacancyFilter('all');
                                                                    setVacancySearch('');
                                                                    setVacancyPage(1);
                                                                }}
                                                                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                Tampilkan Semua Lowongan
                                                            </button>
                                                            <Link
                                                                href="/jobs"
                                                                className="rounded-xl bg-[#1674D1] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#125CB3]"
                                                            >
                                                                Cari Lowongan
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {vacancySearch ? (
                                                            <div>
                                                                <p className="font-semibold text-slate-700 text-xs">
                                                                    Tidak ada lowongan yang sesuai dengan kata kunci &quot;{vacancySearch}&quot;
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setVacancySearch('');
                                                                        setVacancyPage(1);
                                                                    }}
                                                                    className="mt-2 text-xs font-bold text-[#1674D1] hover:underline cursor-pointer"
                                                                >
                                                                    Reset Pencarian
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-500">Belum ada lowongan aktif untuk dianalisis.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Pagination Bar */}
                                        {filteredVacancies.length > 0 && (
                                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EDF3F7] pt-4 text-xs text-slate-500">
                                                <div>
                                                    Menampilkan{' '}
                                                    <span className="font-bold text-[#102B4B]">
                                                        {(vacancyPage - 1) * VACANCIES_PER_PAGE + 1}
                                                    </span>{' '}
                                                    -{' '}
                                                    <span className="font-bold text-[#102B4B]">
                                                        {Math.min(
                                                            filteredVacancies.length,
                                                            vacancyPage * VACANCIES_PER_PAGE,
                                                        )}
                                                    </span>{' '}
                                                    dari{' '}
                                                    <span className="font-bold text-[#102B4B]">
                                                        {filteredVacancies.length}
                                                    </span>{' '}
                                                    lowongan
                                                </div>

                                                {totalVacancyPages > 1 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setVacancyPage((p) => Math.max(1, p - 1))
                                                            }
                                                            disabled={vacancyPage === 1}
                                                            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                        >
                                                            <ChevronLeft className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Sebelumnya</span>
                                                        </button>

                                                        {Array.from(
                                                            { length: totalVacancyPages },
                                                            (_, i) => i + 1,
                                                        ).map((pageNum) => (
                                                            <button
                                                                key={pageNum}
                                                                type="button"
                                                                onClick={() => setVacancyPage(pageNum)}
                                                                className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-bold transition ${
                                                                    vacancyPage === pageNum
                                                                        ? 'bg-[#1674D1] text-white shadow-xs'
                                                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        ))}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setVacancyPage((p) =>
                                                                    Math.min(totalVacancyPages, p + 1),
                                                                )
                                                            }
                                                            disabled={vacancyPage === totalVacancyPages}
                                                            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                        >
                                                            <span className="hidden sm:inline">Selanjutnya</span>
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF3F7] pt-5">
                                            <div className="space-y-0.5">
                                                <span className="text-xs text-slate-500 block">
                                                    Profil:{' '}
                                                    <strong className="text-slate-700">
                                                        {seeker.user.name}
                                                    </strong>
                                                    {seeker.current_job_title
                                                        ? ` · ${seeker.current_job_title}`
                                                        : ''}
                                                </span>
                                                {selectedVacancy ? (
                                                    <span className="text-xs text-[#1674D1] font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Lowongan dipilih: {selectedVacancy.title} ({selectedVacancy.company_profile.company_name})
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-amber-600 font-medium">
                                                        Pilih salah satu lowongan di atas untuk memulai analisis
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectedVacancyId &&
                                                    void handleRunMatch(
                                                        Number(selectedVacancyId),
                                                    )
                                                }
                                                disabled={
                                                    !selectedVacancyId ||
                                                    isMatching
                                                }
                                                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#15527E] px-6 text-sm font-bold text-white transition hover:bg-[#123B5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                {isMatching
                                                    ? 'Menganalisis...'
                                                    : 'Analisis Kecocokan'}
                                            </button>
                                        </div>
                                    </section>

                                    {currentMatch && (
                                        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
                                            <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                                <div className="flex flex-col gap-5 border-b border-[#EDF3F7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-[#1674D1]">
                                                            Hasil analisis
                                                            profil
                                                        </p>
                                                        <h2 className="mt-1 text-2xl font-extrabold text-[#102B4B]">
                                                            {resultVacancy?.title ??
                                                                'Lowongan terpilih'}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {
                                                                resultVacancy
                                                                    ?.company_profile
                                                                    .company_name
                                                            }{' '}
                                                            ·{' '}
                                                            {
                                                                resultVacancy?.location
                                                            }{' '}
                                                            ·{' '}
                                                            {
                                                                resultVacancy?.work_model
                                                            }
                                                        </p>
                                                    </div>
                                                    <ScoreRing
                                                        value={clampScore(
                                                            currentMatch.match_percentage,
                                                        )}
                                                    />
                                                </div>
                                                <p className="mt-5 text-sm leading-relaxed text-slate-600">
                                                    {currentMatch.summary ||
                                                        'Profilmu sudah dibandingkan dengan kebutuhan lowongan ini.'}
                                                </p>
                                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <MetricBar
                                                        label="Skill"
                                                        value={
                                                            currentMatch.competency_score
                                                        }
                                                    />
                                                    <MetricBar
                                                        label="Pengalaman"
                                                        value={
                                                            currentMatch.experience_score
                                                        }
                                                        color="#6D4AE8"
                                                    />
                                                    <MetricBar
                                                        label="Proyek"
                                                        value={
                                                            currentMatch.project_score
                                                        }
                                                        color="#8B5CF6"
                                                    />
                                                    <MetricBar
                                                        label="Aksesibilitas"
                                                        value={
                                                            currentMatch.accessibility_score
                                                        }
                                                        color="#12B981"
                                                    />
                                                </div>
                                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                                    <div>
                                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                            <CheckCircle2 className="h-4 w-4 text-[#12B981]" />
                                                            Yang sesuai
                                                        </h3>
                                                        <BulletList
                                                            items={
                                                                currentMatch.matching_points
                                                            }
                                                            emptyText="Belum ada poin kecocokan yang tersedia."
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                            <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                                                            Area yang perlu
                                                            diperhatikan
                                                        </h3>
                                                        <BulletList
                                                            items={
                                                                currentMatch.gaps
                                                            }
                                                            emptyText="Tidak ada gap signifikan yang teridentifikasi."
                                                        />
                                                    </div>
                                                </div>
                                                {resultVacancy && (
                                                    <Link
                                                        href={`/jobs/${resultVacancy.slug}`}
                                                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1674D1] px-4 text-sm font-bold text-[#1674D1] hover:bg-[#F0F8FD]"
                                                    >
                                                        Lihat Detail Lowongan{' '}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>
                                            <aside className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                    Alasan kecocokan
                                                </h2>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                    Analisis mempertimbangkan
                                                    kompetensi dan kebutuhan
                                                    aksesibilitas yang tersedia
                                                    pada profilmu.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGapResult(
                                                            currentMatch.skill_gap ??
                                                                null,
                                                        );
                                                        openTab('skillGap');
                                                    }}
                                                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#15527E] px-4 text-sm font-bold text-white hover:bg-[#123B5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1]"
                                                >
                                                    Lihat Analisis Skill Gap{' '}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </button>
                                            </aside>
                                        </section>
                                    )}

                                    <section className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                    Riwayat pencocokan
                                                </h2>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    3 riwayat pencocokan terakhir (real-time).
                                                </p>
                                            </div>
                                            {historyList.filter((item) => item.type === 'job_match').length > 3 && (
                                                <button
                                                    type="button"
                                                    onClick={() => openTab('history')}
                                                    className="self-start sm:self-center text-xs font-bold text-[#1674D1] hover:underline cursor-pointer"
                                                >
                                                    Lihat Semua ({historyList.filter((item) => item.type === 'job_match').length}) →
                                                </button>
                                            )}
                                        </div>
                                        {recentJobMatches.length === 0 ? (
                                            <p className="mt-4 text-sm text-slate-500">
                                                Belum ada riwayat pencocokan. Pilih lowongan di atas untuk memulai.
                                            </p>
                                        ) : (
                                            <div className="mt-4 divide-y divide-[#EDF3F7]">
                                                {recentJobMatches.map((historyItem) => {
                                                    const score = clampScore(
                                                        historyItem.payload.match_percentage,
                                                    );
                                                    const vacancy = historyItem.payload.vacancy;
                                                    return (
                                                        <div
                                                            key={historyItem.id}
                                                            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div className="min-w-0 flex-1 pr-3">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-[#E2F7EF] px-2.5 py-1 text-xs font-bold text-[#087A5E]">
                                                                        {score ?? 0}% cocok
                                                                    </span>
                                                                    <h3 className="font-bold text-[#102B4B] truncate">
                                                                        {vacancy?.title ?? 'Pencocokan Lowongan'}
                                                                    </h3>
                                                                </div>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {vacancy?.company_profile?.company_name || 'Perusahaan'}
                                                                    {vacancy?.location ? ` · ${vacancy.location}` : ''}
                                                                    {historyItem.analyzed_at && (
                                                                        <span className="text-slate-400">
                                                                            {' '}•{' '}
                                                                            {new Date(historyItem.analyzed_at).toLocaleString('id-ID', {
                                                                                dateStyle: 'medium',
                                                                                timeStyle: 'short',
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => openHistory(historyItem)}
                                                                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#1674D1] bg-white px-3.5 text-xs font-bold text-[#1674D1] shadow-xs hover:bg-[#F0F8FD] transition cursor-pointer"
                                                            >
                                                                Lihat Detail Riwayat
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}

                            {activeTab === 'skillGap' && (
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)]">
                                    <section className="space-y-5">
                                        {gapResult ? (
                                            <>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm text-slate-500">
                                                                AI Job Matching
                                                                &gt; Analisis
                                                                Skill Gap
                                                            </p>
                                                            <h2 className="mt-2 text-3xl font-extrabold text-[#102B4B]">
                                                                Analisis Skill
                                                                Gap
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-600">
                                                                Analisis detail
                                                                kesesuaian
                                                                profilmu dengan{' '}
                                                                {resultVacancy?.title ??
                                                                    'lowongan terpilih'}
                                                                .
                                                            </p>
                                                        </div>
                                                        <ScoreRing
                                                            value={clampScore(
                                                                gapResult.match_score,
                                                            )}
                                                            label="Kecocokan"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                                    <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#102B4B]">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12B981] text-sm text-white">
                                                            1
                                                        </span>
                                                        Kekuatan Utama
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Skill yang sudah sesuai
                                                        dengan kebutuhan posisi
                                                        ini.
                                                    </p>
                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                        <div className="rounded-xl border border-[#BDEAD9] bg-[#F4FFFA] p-4">
                                                            <h4 className="text-sm font-bold text-[#087A5E]">
                                                                Skill yang cocok
                                                            </h4>
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {(
                                                                    gapResult.matched_skills ??
                                                                    []
                                                                ).map(
                                                                    (skill) => (
                                                                        <span
                                                                            key={
                                                                                skill
                                                                            }
                                                                            className="rounded-full bg-[#DDF7EA] px-3 py-1.5 text-xs font-semibold text-[#087A5E]"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                            {(
                                                                gapResult.matched_skills ??
                                                                []
                                                            ).length === 0 && (
                                                                <p className="mt-2 text-sm text-slate-500">
                                                                    Belum ada
                                                                    skill yang
                                                                    cocok.
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="rounded-xl border border-[#BDEAD9] bg-[#F4FFFA] p-4">
                                                            <h4 className="text-sm font-bold text-[#087A5E]">
                                                                Kesiapan profil
                                                            </h4>
                                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                Skill cocok
                                                                membantu kamu
                                                                memahami bagian
                                                                profil yang
                                                                sudah kuat.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                                    <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#102B4B]">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] text-sm text-white">
                                                            2
                                                        </span>
                                                        Area Perbaikan
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Skill yang masih kurang
                                                        dan dapat kamu
                                                        kembangkan.
                                                    </p>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {(
                                                            gapResult.missing_skills ??
                                                            []
                                                        ).map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="rounded-lg bg-[#FFF0F0] px-3 py-2 text-sm font-semibold text-[#D53939]"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {(
                                                        gapResult.missing_skills ??
                                                        []
                                                    ).length === 0 && (
                                                        <p className="mt-3 text-sm text-slate-500">
                                                            Tidak ada skill yang
                                                            tertinggal.
                                                        </p>
                                                    )}
                                                    <div className="mt-4 rounded-xl border border-[#F5DEAA] bg-[#FFFCF3] p-4">
                                                        <p className="text-sm leading-relaxed text-[#9A6700]">
                                                            Kembangkan skill
                                                            yang hilang melalui
                                                            kursus, proyek
                                                            nyata, atau latihan
                                                            yang ramah
                                                            aksesibilitas.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-2xl border border-[#DCEAF2] bg-white p-6 shadow-sm">
                                                <h2 className="text-xl font-extrabold text-[#102B4B]">
                                                    Pilih lowongan terlebih
                                                    dahulu
                                                </h2>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                    Analisis Skill Gap muncul
                                                    setelah AI Job Matching
                                                    selesai. Tidak perlu
                                                    memasukkan skill atau
                                                    melakukan matching ulang.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openTab('matches')
                                                    }
                                                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#15527E] px-5 text-sm font-bold text-white"
                                                >
                                                    Kembali ke AI Job Matching{' '}
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </section>
                                    <aside className="h-fit space-y-4">
                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                Ringkasan Analisis
                                            </h2>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                Hasil berikut memakai lowongan
                                                yang sama dari AI Job Matching.
                                            </p>
                                            <div className="mt-5 space-y-3">
                                                <MetricBar
                                                    label="Kesesuaian skill"
                                                    value={
                                                        gapResult?.match_score
                                                    }
                                                    color="#12B981"
                                                />
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                Rekomendasi Pengembangan
                                            </h2>
                                            <ol className="mt-4 space-y-3">
                                                {(
                                                    gapResult?.learning_recommendations ??
                                                    []
                                                ).map(
                                                    (recommendation, index) => (
                                                        <li
                                                            key={`${recommendation}-${index}`}
                                                            className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                                                        >
                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1674D1] text-xs font-bold text-white">
                                                                {index + 1}
                                                            </span>
                                                            <span>
                                                                {recommendation}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ol>
                                            {(
                                                gapResult?.learning_recommendations ??
                                                []
                                            ).length === 0 && (
                                                <p className="mt-3 text-sm text-slate-500">
                                                    Belum ada rekomendasi.
                                                </p>
                                            )}
                                        </div>
                                        {resultVacancy && (
                                            <Link
                                                href={`/jobs/${resultVacancy.slug}`}
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1674D1] bg-white px-4 text-sm font-bold text-[#1674D1]"
                                            >
                                                Lihat Detail Lowongan{' '}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </aside>
                                </div>
                            )}

                            {activeTab === 'cvReview' && (
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.65fr)]">
                                    <section className="space-y-6">
                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl font-extrabold text-[#102B4B]">
                                                        Analisis CV
                                                    </h2>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Pilih CV profil atau
                                                        unggah file baru untuk
                                                        analisis ATS sementara.
                                                    </p>
                                                </div>
                                                <FileSearch className="h-7 w-7 text-[#6921B7]" />
                                            </div>
                                            <form
                                                onSubmit={handleScanCv}
                                                className="mt-6 space-y-4"
                                            >
                                                <fieldset>
                                                    <legend className="text-sm font-bold text-[#102B4B]">
                                                        Sumber CV
                                                    </legend>
                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                        <label
                                                            className={`cursor-pointer rounded-xl border p-4 ${cvSource === 'profile' ? 'border-[#6921B7] bg-[#FCF8FF] ring-2 ring-[#EEDFEC]' : 'border-[#DCEAF2] bg-white'}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="cv-source"
                                                                value="profile"
                                                                checked={
                                                                    cvSource ===
                                                                    'profile'
                                                                }
                                                                onChange={() =>
                                                                    setCvSource(
                                                                        'profile',
                                                                    )
                                                                }
                                                                className="sr-only"
                                                            />
                                                            <span className="flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                                <FileText className="h-4 w-4 text-[#6921B7]" />
                                                                Gunakan CV dari
                                                                profil
                                                            </span>
                                                            <span className="mt-1 block text-xs text-slate-500">
                                                                {profileCv.has_cv
                                                                    ? profileCv.name
                                                                    : 'Belum ada CV di profil'}
                                                            </span>
                                                        </label>
                                                        <label
                                                            className={`cursor-pointer rounded-xl border p-4 ${cvSource === 'upload' ? 'border-[#6921B7] bg-[#FCF8FF] ring-2 ring-[#EEDFEC]' : 'border-[#DCEAF2] bg-white'}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="cv-source"
                                                                value="upload"
                                                                checked={
                                                                    cvSource ===
                                                                    'upload'
                                                                }
                                                                onChange={() =>
                                                                    setCvSource(
                                                                        'upload',
                                                                    )
                                                                }
                                                                className="sr-only"
                                                            />
                                                            <span className="flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                                <Upload className="h-4 w-4 text-[#6921B7]" />
                                                                Unggah CV baru
                                                            </span>
                                                            <span className="mt-1 block text-xs text-slate-500">
                                                                Hanya dipakai
                                                                untuk analisis
                                                                ini
                                                            </span>
                                                        </label>
                                                    </div>
                                                </fieldset>
                                                {cvSource === 'upload' && (
                                                    <label
                                                        className="block text-sm font-bold text-[#102B4B]"
                                                        htmlFor="cv-file-input"
                                                    >
                                                        File CV
                                                        <input
                                                            id="cv-file-input"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                            onChange={
                                                                handleCvFileChange
                                                            }
                                                            className="mt-2 block min-h-11 w-full rounded-xl border border-[#CFE1EA] p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#F0E5F8] file:px-3 file:py-2 file:font-semibold file:text-[#6921B7]"
                                                        />
                                                        {uploadedFileName && (
                                                            <span className="mt-1 block text-xs font-normal text-slate-500">
                                                                {
                                                                    uploadedFileName
                                                                }{' '}
                                                                ·{' '}
                                                                {Math.ceil(
                                                                    (uploadedFileSize ??
                                                                        0) /
                                                                        1024,
                                                                )}{' '}
                                                                KB
                                                            </span>
                                                        )}
                                                    </label>
                                                )}
                                                <label
                                                    className="block text-sm font-bold text-[#102B4B]"
                                                    htmlFor="target-role-skills"
                                                >
                                                    Skill atau posisi target{' '}
                                                    <span className="font-normal text-slate-500">
                                                        (opsional)
                                                    </span>
                                                    <input
                                                        id="target-role-skills"
                                                        value={targetRoleSkills}
                                                        onChange={(event) =>
                                                            setTargetRoleSkills(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Contoh: Frontend, React, TypeScript"
                                                        className="mt-2 min-h-11 w-full rounded-xl border border-[#CFE1EA] px-3 text-sm outline-none focus:border-[#6921B7] focus:ring-2 focus:ring-[#20B8C1]/30"
                                                    />
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isScanningCv ||
                                                        (cvSource === 'profile'
                                                            ? !profileCv.has_cv
                                                            : !uploadedFile)
                                                    }
                                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6921B7] px-5 text-sm font-bold text-white hover:bg-[#541891] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1] disabled:opacity-50"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {isScanningCv
                                                        ? 'Menganalisis CV...'
                                                        : 'Mulai Analisis CV'}
                                                </button>
                                            </form>
                                        </div>
                                        {cvResult &&
                                            (() => {
                                                const categoryLabels: Array<
                                                    [
                                                        keyof CvCategoryScores,
                                                        string,
                                                    ]
                                                > = [
                                                    [
                                                        'ats_compatibility',
                                                        'ATS Compatibility',
                                                    ],
                                                    [
                                                        'structure_format',
                                                        'Struktur & Format',
                                                    ],
                                                    [
                                                        'content_relevance',
                                                        'Konten & Relevansi',
                                                    ],
                                                    [
                                                        'keyword_usage',
                                                        'Penggunaan Kata Kunci',
                                                    ],
                                                    [
                                                        'experience_achievement',
                                                        'Pengalaman & Pencapaian',
                                                    ],
                                                    [
                                                        'project_portfolio',
                                                        'Proyek & Portofolio',
                                                    ],
                                                ];
                                                const strengths: CvDetail[] =
                                                    cvResult.strengths_detailed
                                                        ?.length
                                                        ? cvResult.strengths_detailed
                                                        : (
                                                              cvResult.strengths ??
                                                              []
                                                          ).map((title) => ({
                                                              title,
                                                          }));
                                                const improvements: CvDetail[] =
                                                    cvResult
                                                        .improvements_detailed
                                                        ?.length
                                                        ? cvResult.improvements_detailed
                                                        : (
                                                              cvResult.improvements ??
                                                              []
                                                          ).map((title) => ({
                                                              title,
                                                          }));
                                                const fileName =
                                                    cvSource === 'upload'
                                                        ? uploadedFileName
                                                        : profileCv.name;
                                                const analyzedAt =
                                                    cvSource === 'profile' &&
                                                    profileCv.updated_at
                                                        ? new Date(
                                                              profileCv.updated_at,
                                                          ).toLocaleString(
                                                              'id-ID',
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                                  timeStyle:
                                                                      'short',
                                                              },
                                                          )
                                                        : 'Baru saja dianalisis';
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between rounded-xl border border-[#DCEAF2] bg-white px-4 py-3 shadow-sm">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1674D1]">
                                                                    <FileText className="h-6 w-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-bold text-[#102B4B]">
                                                                        {fileName ||
                                                                            'CV yang dianalisis'}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        Terakhir
                                                                        dianalisis{' '}
                                                                        {
                                                                            analyzedAt
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCvResult(
                                                                        null,
                                                                    );
                                                                    setCvSource(
                                                                        'upload',
                                                                    );
                                                                }}
                                                                className="hidden min-h-10 shrink-0 items-center gap-2 rounded-lg border border-[#1674D1] px-3 text-sm font-bold text-[#1674D1] hover:bg-[#F2F8FF] sm:inline-flex"
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                                Unggah CV baru
                                                            </button>
                                                        </div>

                                                        <div className="rounded-xl border border-[#DCEAF2] bg-[#F1F8FF] p-4 sm:p-5">
                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                                <FileText className="h-8 w-8 shrink-0 text-[#1674D1]" />
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="text-base font-extrabold text-[#102B4B]">
                                                                        Gunakan
                                                                        Template
                                                                        CV ATS
                                                                    </h3>
                                                                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                                                                        Belum
                                                                        punya CV
                                                                        yang
                                                                        ATS-friendly?
                                                                        Gunakan
                                                                        struktur
                                                                        sederhana
                                                                        yang
                                                                        mudah
                                                                        dibaca
                                                                        sistem
                                                                        ATS dan
                                                                        sesuai
                                                                        standar
                                                                        industri.
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="min-h-10 shrink-0 rounded-lg border border-[#1674D1] px-3 text-sm font-bold text-[#1674D1] hover:bg-white"
                                                                >
                                                                    Unduh
                                                                    Template CV
                                                                    ATS
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto rounded-xl border border-[#DCEAF2] bg-white shadow-sm">
                                                            <div className="flex min-w-[600px] border-b border-[#EDF3F7] px-2 sm:px-4">
                                                                {(
                                                                    [
                                                                        [
                                                                            'summary',
                                                                            'Ringkasan',
                                                                        ],
                                                                        [
                                                                            'ats',
                                                                            'ATS & Struktur CV',
                                                                        ],
                                                                        [
                                                                            'content',
                                                                            'Konten',
                                                                        ],
                                                                        [
                                                                            'keywords',
                                                                            'Kata Kunci',
                                                                        ],
                                                                        [
                                                                            'recommendations',
                                                                            'Rekomendasi',
                                                                        ],
                                                                    ] as const
                                                                ).map(
                                                                    ([
                                                                        tab,
                                                                        label,
                                                                    ]) => (
                                                                        <button
                                                                            key={
                                                                                tab
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setCvResultTab(
                                                                                    tab,
                                                                                )
                                                                            }
                                                                            className={`min-h-12 flex-1 border-b-2 px-2 text-xs font-bold transition sm:text-sm ${cvResultTab === tab ? 'border-[#1674D1] text-[#1674D1]' : 'border-transparent text-slate-600 hover:text-[#1674D1]'}`}
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl border border-[#DCEAF2] bg-white p-4 shadow-sm sm:p-5">
                                                            {cvResultTab ===
                                                                'summary' && (
                                                                <>
                                                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                        <FileText className="h-5 w-5 text-[#1674D1]" />
                                                                        Ringkasan
                                                                        Analisis
                                                                    </h3>
                                                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                                        {cvResult.summary ||
                                                                            'Ringkasan analisis belum tersedia.'}
                                                                    </p>
                                                                    <div className="mt-6">
                                                                        <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                            <CheckCircle2 className="h-5 w-5 text-[#12B981]" />
                                                                            Kekuatan
                                                                            Utama
                                                                        </h3>
                                                                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                                            {strengths.map(
                                                                                (
                                                                                    item,
                                                                                    index,
                                                                                ) => (
                                                                                    <div
                                                                                        key={`${item.title}-${index}`}
                                                                                        className="rounded-xl border border-[#D8F0E8] bg-[#F5FFFB] p-4"
                                                                                    >
                                                                                        <p className="text-sm font-bold text-[#102B4B]">
                                                                                            {item.title ||
                                                                                                'Kekuatan CV'}
                                                                                        </p>
                                                                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                                            {item.description ||
                                                                                                'Kekuatan ini terdeteksi dari isi CV.'}
                                                                                        </p>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        {strengths.length ===
                                                                            0 && (
                                                                            <p className="mt-3 text-sm text-slate-500">
                                                                                Belum
                                                                                ada
                                                                                kekuatan
                                                                                yang
                                                                                terdeteksi.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-6">
                                                                        <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                                                                            Area
                                                                            yang
                                                                            Perlu
                                                                            Ditingkatkan
                                                                        </h3>
                                                                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                                            {improvements.map(
                                                                                (
                                                                                    item,
                                                                                    index,
                                                                                ) => (
                                                                                    <div
                                                                                        key={`${item.title}-${index}`}
                                                                                        className="rounded-xl border border-[#F3D8D8] bg-[#FFF8F8] p-4"
                                                                                    >
                                                                                        <p className="text-sm font-bold text-[#102B4B]">
                                                                                            {item.title ||
                                                                                                'Area perbaikan'}
                                                                                        </p>
                                                                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                                            {item.description ||
                                                                                                'Perlu ditinjau lebih lanjut berdasarkan isi CV.'}
                                                                                        </p>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        {improvements.length ===
                                                                            0 && (
                                                                            <p className="mt-3 text-sm text-slate-500">
                                                                                Belum
                                                                                ada
                                                                                saran
                                                                                perbaikan.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                            {cvResultTab ===
                                                                'ats' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        ATS &
                                                                        Struktur
                                                                        CV
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-slate-600">
                                                                        Nilai
                                                                        berdasarkan
                                                                        data
                                                                        analisis
                                                                        CV.
                                                                    </p>
                                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                                        {categoryLabels
                                                                            .slice(
                                                                                0,
                                                                                2,
                                                                            )
                                                                            .map(
                                                                                ([
                                                                                    key,
                                                                                    label,
                                                                                ]) => (
                                                                                    <MetricBar
                                                                                        key={
                                                                                            key
                                                                                        }
                                                                                        label={
                                                                                            label
                                                                                        }
                                                                                        value={
                                                                                            cvResult
                                                                                                .category_scores?.[
                                                                                                key
                                                                                            ]
                                                                                        }
                                                                                    />
                                                                                ),
                                                                            )}
                                                                    </div>
                                                                    <p className="mt-4 text-sm text-slate-600">
                                                                        Status
                                                                        format:{' '}
                                                                        <strong className="text-[#102B4B]">
                                                                            {cvResult.formatting_grade ||
                                                                                'Belum tersedia'}
                                                                        </strong>
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {cvResultTab ===
                                                                'content' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        Konten
                                                                        CV
                                                                    </h3>
                                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                        {cvResult.summary ||
                                                                            'Analisis konten belum tersedia.'}
                                                                    </p>
                                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                                        {categoryLabels
                                                                            .slice(
                                                                                2,
                                                                                4,
                                                                            )
                                                                            .map(
                                                                                ([
                                                                                    key,
                                                                                    label,
                                                                                ]) => (
                                                                                    <MetricBar
                                                                                        key={
                                                                                            key
                                                                                        }
                                                                                        label={
                                                                                            label
                                                                                        }
                                                                                        value={
                                                                                            cvResult
                                                                                                .category_scores?.[
                                                                                                key
                                                                                            ]
                                                                                        }
                                                                                        color="#6921B7"
                                                                                    />
                                                                                ),
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {cvResultTab ===
                                                                'keywords' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        Kata
                                                                        Kunci
                                                                        yang
                                                                        Disarankan
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-slate-600">
                                                                        Tambahkan
                                                                        kata
                                                                        kunci
                                                                        yang
                                                                        relevan
                                                                        dengan
                                                                        posisi
                                                                        target.
                                                                    </p>
                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                        {(
                                                                            cvResult.suggested_keywords ??
                                                                            []
                                                                        ).map(
                                                                            (
                                                                                keyword,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        keyword
                                                                                    }
                                                                                    className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-sm font-semibold text-[#15527E]"
                                                                                >
                                                                                    {
                                                                                        keyword
                                                                                    }
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    {(
                                                                        cvResult.suggested_keywords ??
                                                                        []
                                                                    ).length ===
                                                                        0 && (
                                                                        <p className="mt-4 text-sm text-slate-500">
                                                                            Belum
                                                                            ada
                                                                            kata
                                                                            kunci
                                                                            yang
                                                                            disarankan.
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-4">
                                                                        <MetricBar
                                                                            label="Penggunaan Kata Kunci"
                                                                            value={
                                                                                cvResult
                                                                                    .category_scores
                                                                                    ?.keyword_usage
                                                                            }
                                                                            color="#12B981"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {cvResultTab ===
                                                                'recommendations' && (
                                                                <div>
                                                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                        <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
                                                                        Rekomendasi
                                                                        Tindak
                                                                        Lanjut
                                                                    </h3>
                                                                    <ol className="mt-4 space-y-3">
                                                                        {(
                                                                            cvResult.action_recommendations ??
                                                                            []
                                                                        ).map(
                                                                            (
                                                                                item,
                                                                                index,
                                                                            ) => (
                                                                                <li
                                                                                    key={`${item}-${index}`}
                                                                                    className="flex items-start gap-3 text-sm leading-relaxed text-slate-600"
                                                                                >
                                                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1674D1] text-xs font-bold text-white">
                                                                                        {index +
                                                                                            1}
                                                                                    </span>
                                                                                    <span>
                                                                                        {
                                                                                            item
                                                                                        }
                                                                                    </span>
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ol>
                                                                    {(
                                                                        cvResult.action_recommendations ??
                                                                        []
                                                                    ).length ===
                                                                        0 && (
                                                                        <p className="mt-3 text-sm text-slate-500">
                                                                            Belum
                                                                            ada
                                                                            rekomendasi
                                                                            tindak
                                                                            lanjut.
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-5 rounded-xl border border-[#DCEAF2] bg-[#F7FBFD] p-4">
                                                                        <p className="text-sm font-bold text-[#102B4B]">
                                                                            Tips
                                                                            aksesibilitas
                                                                        </p>
                                                                        <BulletList
                                                                            items={
                                                                                cvResult.accessibility_tips
                                                                            }
                                                                            emptyText="Belum ada tips aksesibilitas."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                    </section>
                                    <aside className="h-fit space-y-4">
                                        {cvResult ? (
                                            <>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                        Skor CV kamu
                                                    </h2>
                                                    <div className="mt-4 flex items-center gap-4">
                                                        <ScoreRing
                                                            value={clampScore(
                                                                cvResult.ats_score,
                                                            )}
                                                            label="Skor"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[#079669]">
                                                                {(() => {
                                                                    const score =
                                                                        clampScore(
                                                                            cvResult.ats_score,
                                                                        );
                                                                    return score ===
                                                                        null
                                                                        ? 'Skor belum tersedia'
                                                                        : score >=
                                                                            80
                                                                          ? 'CV kamu sudah baik!'
                                                                          : score >=
                                                                              60
                                                                            ? 'CV kamu cukup baik'
                                                                            : 'CV perlu ditingkatkan';
                                                                })()}
                                                            </p>
                                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                {cvResult.summary ||
                                                                    'Ringkasan analisis belum tersedia.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                        Penilaian per Kategori
                                                    </h2>
                                                    <div className="mt-4 space-y-3">
                                                        {(
                                                            [
                                                                [
                                                                    'ats_compatibility',
                                                                    'ATS Compatibility',
                                                                ],
                                                                [
                                                                    'structure_format',
                                                                    'Struktur & Format',
                                                                ],
                                                                [
                                                                    'content_relevance',
                                                                    'Konten & Relevansi',
                                                                ],
                                                                [
                                                                    'keyword_usage',
                                                                    'Penggunaan Kata Kunci',
                                                                ],
                                                                [
                                                                    'experience_achievement',
                                                                    'Pengalaman & Pencapaian',
                                                                ],
                                                                [
                                                                    'project_portfolio',
                                                                    'Proyek & Portofolio',
                                                                ],
                                                            ] as Array<
                                                                [
                                                                    keyof CvCategoryScores,
                                                                    string,
                                                                ]
                                                            >
                                                        ).map(
                                                            ([key, label]) => (
                                                                <MetricBar
                                                                    key={key}
                                                                    label={
                                                                        label
                                                                    }
                                                                    value={
                                                                        cvResult
                                                                            .category_scores?.[
                                                                            key
                                                                        ]
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                        Kata Kunci yang
                                                        Disarankan
                                                    </h2>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {(
                                                            cvResult.suggested_keywords ??
                                                            []
                                                        ).map((keyword) => (
                                                            <span
                                                                key={keyword}
                                                                className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-xs font-semibold text-[#15527E]"
                                                            >
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {(
                                                        cvResult.suggested_keywords ??
                                                        []
                                                    ).length === 0 && (
                                                        <p className="mt-3 text-sm text-slate-500">
                                                            Belum ada kata kunci
                                                            yang disarankan.
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                        Rekomendasi Tindak
                                                        Lanjut
                                                    </h2>
                                                    <ol className="mt-4 space-y-3">
                                                        {(
                                                            cvResult.action_recommendations ??
                                                            []
                                                        ).map((item, index) => (
                                                            <li
                                                                key={`${item}-${index}`}
                                                                className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                                                            >
                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1674D1] text-xs font-bold text-white">
                                                                    {index + 1}
                                                                </span>
                                                                <span>
                                                                    {item}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                    Sebelum mulai
                                                </h2>
                                                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                                                    <li className="flex gap-2">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12B981]" />
                                                        Gunakan teks CV terbaru.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12B981]" />
                                                        Tambahkan pencapaian
                                                        yang terukur.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#12B981]" />
                                                        Masukkan skill yang
                                                        relevan dengan posisi
                                                        target.
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </aside>
                                </div>
                            )}
                            {activeTab === 'history' && (
                                <section className="space-y-6">
                                    <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-xl font-extrabold text-[#102B4B]">
                                                    Riwayat Analisis AI
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Snapshot tetap tersedia
                                                    untuk dibuka kembali atau
                                                    dibandingkan.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(
                                                    [
                                                        'cv_analysis',
                                                        'job_match',
                                                    ] as const
                                                ).map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setHistoryFilter(
                                                                type,
                                                            );
                                                            setCompareHistoryIds(
                                                                [],
                                                            );
                                                        }}
                                                        className={`rounded-full px-4 py-2 text-xs font-bold ${historyFilter === type ? (type === 'cv_analysis' ? 'bg-[#6921B7] text-white' : 'bg-[#15527E] text-white') : 'bg-white text-slate-600 ring-1 ring-[#DCEAF2]'}`}
                                                    >
                                                        {type === 'cv_analysis'
                                                            ? 'Analisis CV'
                                                            : 'Job Matching'}{' '}
                                                        (
                                                        {
                                                            historyList.filter(
                                                                (item) =>
                                                                    item.type ===
                                                                    type,
                                                            ).length
                                                        }
                                                        /20)
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {compareHistory.length === 2 && (
                                            <div className="mt-6 rounded-2xl border border-[#CFE6F7] bg-[#F4F9FD] p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-sm font-extrabold text-[#102B4B]">
                                                            Perbandingan
                                                            Snapshot
                                                        </h3>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Perubahan skor
                                                            membantu melihat
                                                            progres analisis.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCompareHistoryIds(
                                                                [],
                                                            )
                                                        }
                                                        className="text-xs font-bold text-[#1674D1] hover:underline"
                                                    >
                                                        Tutup
                                                    </button>
                                                </div>
                                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                    {compareHistory.map(
                                                        (item, index) => {
                                                            const other =
                                                                compareHistory[
                                                                    index === 0
                                                                        ? 1
                                                                        : 0
                                                                ];
                                                            const score =
                                                                clampScore(
                                                                    item.payload
                                                                        .ats_score ??
                                                                        item
                                                                            .payload
                                                                            .match_percentage,
                                                                );
                                                            const otherScore =
                                                                clampScore(
                                                                    other
                                                                        ?.payload
                                                                        .ats_score ??
                                                                        other
                                                                            ?.payload
                                                                            .match_percentage,
                                                                );
                                                            const delta =
                                                                score !==
                                                                    null &&
                                                                otherScore !==
                                                                    null
                                                                    ? score -
                                                                      otherScore
                                                                    : null;
                                                            return (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="rounded-xl border border-white bg-white p-4 shadow-sm"
                                                                >
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <span className="text-xs font-bold text-slate-400">
                                                                            Snapshot{' '}
                                                                            {index ===
                                                                            0
                                                                                ? 'A'
                                                                                : 'B'}
                                                                        </span>
                                                                        <span className="text-xs text-slate-500">
                                                                            {new Date(
                                                                                item.analyzed_at ??
                                                                                    Date.now(),
                                                                            ).toLocaleDateString(
                                                                                'id-ID',
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 truncate text-sm font-bold text-[#102B4B]">
                                                                        {item.type ===
                                                                        'cv_analysis'
                                                                            ? `CV: ${item.metadata_source ?? 'Profil'}`
                                                                            : (item
                                                                                  .payload
                                                                                  .vacancy
                                                                                  ?.title ??
                                                                              'Lowongan')}
                                                                    </p>
                                                                    <div className="mt-3 flex items-baseline gap-2">
                                                                        <strong className="text-2xl font-black text-[#102B4B]">
                                                                            {score ??
                                                                                '—'}
                                                                            %
                                                                        </strong>
                                                                        {index ===
                                                                            0 &&
                                                                            delta !==
                                                                                null && (
                                                                                <span
                                                                                    className={`text-xs font-bold ${delta > 0 ? 'text-[#087A5E]' : delta < 0 ? 'text-[#C2410C]' : 'text-slate-500'}`}
                                                                                >
                                                                                    {delta >
                                                                                    0
                                                                                        ? '+'
                                                                                        : ''}
                                                                                    {
                                                                                        delta
                                                                                    }{' '}
                                                                                    poin
                                                                                    dari
                                                                                    B
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openHistory(
                                                                                item,
                                                                            )
                                                                        }
                                                                        className="mt-4 w-full rounded-lg bg-[#1674D1] py-2 text-xs font-bold text-white hover:bg-[#125CB3]"
                                                                    >
                                                                        Buka
                                                                        hasil
                                                                        lengkap
                                                                    </button>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {visibleHistory.length === 0 ? (
                                            <div className="mt-8 rounded-2xl border border-dashed border-[#CFE6F7] p-8 text-center">
                                                <History className="mx-auto h-8 w-8 text-slate-400" />
                                                <p className="mt-3 text-sm font-bold text-[#102B4B]">
                                                    Belum ada riwayat analisis.
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Hasil baru akan tersimpan
                                                    setelah analisis selesai.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-5 divide-y divide-[#EDF3F7]">
                                                {visibleHistory.map((item) => {
                                                    const score = clampScore(
                                                        item.payload
                                                            .ats_score ??
                                                            item.payload
                                                                .match_percentage,
                                                    );
                                                    const previous =
                                                        getPreviousHistory(
                                                            item,
                                                        );
                                                    const selected =
                                                        compareHistoryIds.includes(
                                                            item.id,
                                                        );
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${selected ? 'rounded-xl bg-[#F4F9FD] px-3' : ''}`}
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-[#E2F7EF] px-2.5 py-1 text-xs font-bold text-[#087A5E]">
                                                                        {score ??
                                                                            0}
                                                                        %
                                                                    </span>
                                                                    <h3 className="truncate text-sm font-bold text-[#102B4B]">
                                                                        {item.type ===
                                                                        'cv_analysis'
                                                                            ? `CV: ${item.metadata_source ?? 'Profil'}`
                                                                            : (item
                                                                                  .payload
                                                                                  .vacancy
                                                                                  ?.title ??
                                                                              'Pencocokan Lowongan')}
                                                                    </h3>
                                                                    {previous && (
                                                                        <ProgressDelta
                                                                            current={
                                                                                score
                                                                            }
                                                                            previous={clampScore(
                                                                                previous
                                                                                    .payload
                                                                                    .ats_score ??
                                                                                    previous
                                                                                        .payload
                                                                                        .match_percentage,
                                                                            )}
                                                                        />
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {new Date(
                                                                        item.analyzed_at ??
                                                                            Date.now(),
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                        {
                                                                            dateStyle:
                                                                                'medium',
                                                                            timeStyle:
                                                                                'short',
                                                                        },
                                                                    )}
                                                                    {item.type ===
                                                                        'job_match' &&
                                                                    item.payload
                                                                        .vacancy
                                                                        ?.company_profile
                                                                        ?.company_name
                                                                        ? ` · ${item.payload.vacancy.company_profile.company_name}`
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleHistoryComparison(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${selected ? 'border-[#1674D1] bg-[#1674D1] text-white' : 'border-[#CFE6F7] bg-white text-[#15527E]'}`}
                                                                >
                                                                    {selected
                                                                        ? 'Terpilih'
                                                                        : 'Bandingkan'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openHistory(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-[#15527E] px-3 py-1.5 text-xs font-bold text-white"
                                                                >
                                                                    Buka hasil
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        void deleteHistory(
                                                                            item,
                                                                        )
                                                                    }
                                                                    title="Hapus riwayat"
                                                                    className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {activeTab === 'historyDetail' && viewingHistory && (
                                <div className="space-y-6">
                                    {viewingHistory.type === 'job_match' ? (
                                        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
                                            <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm sm:p-6">
                                                <div className="flex flex-col gap-5 border-b border-[#EDF3F7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-[#1674D1]">
                                                            Hasil evaluasi kecocokan profil tersimpan
                                                        </p>
                                                        <h2 className="mt-1 text-2xl font-extrabold text-[#102B4B]">
                                                            {viewingHistory.payload.vacancy?.title ?? 'Lowongan terpilih'}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {viewingHistory.payload.vacancy?.company_profile?.company_name || 'Perusahaan'}
                                                            {viewingHistory.payload.vacancy?.location ? ` · ${viewingHistory.payload.vacancy.location}` : ''}
                                                            {viewingHistory.payload.vacancy?.work_model ? ` · ${viewingHistory.payload.vacancy.work_model}` : ''}
                                                        </p>
                                                    </div>
                                                    <ScoreRing
                                                        value={clampScore(
                                                            viewingHistory.payload.match_percentage,
                                                        )}
                                                    />
                                                </div>
                                                <p className="mt-5 text-sm leading-relaxed text-slate-600">
                                                    {viewingHistory.payload.summary ||
                                                        'Profilmu sudah dibandingkan dengan kebutuhan lowongan ini.'}
                                                </p>
                                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <MetricBar
                                                        label="Skill"
                                                        value={viewingHistory.payload.competency_score}
                                                    />
                                                    <MetricBar
                                                        label="Pengalaman"
                                                        value={viewingHistory.payload.experience_score}
                                                        color="#6D4AE8"
                                                    />
                                                    <MetricBar
                                                        label="Proyek"
                                                        value={viewingHistory.payload.project_score}
                                                        color="#8B5CF6"
                                                    />
                                                    <MetricBar
                                                        label="Aksesibilitas"
                                                        value={viewingHistory.payload.accessibility_score}
                                                        color="#12B981"
                                                    />
                                                </div>
                                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                                    <div>
                                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                            <CheckCircle2 className="h-4 w-4 text-[#12B981]" />
                                                            Yang sesuai
                                                        </h3>
                                                        <BulletList
                                                            items={viewingHistory.payload.matching_points}
                                                            emptyText="Belum ada poin kecocokan yang tersedia."
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#102B4B]">
                                                            <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                                                            Area yang perlu diperhatikan
                                                        </h3>
                                                        <BulletList
                                                            items={viewingHistory.payload.gaps}
                                                            emptyText="Tidak ada gap signifikan yang teridentifikasi."
                                                        />
                                                    </div>
                                                </div>
                                                {viewingHistory.payload.vacancy?.slug && (
                                                    <div className="mt-6">
                                                        <Link
                                                            href={`/jobs/${viewingHistory.payload.vacancy.slug}`}
                                                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1674D1] px-4 text-sm font-bold text-[#1674D1] hover:bg-[#F0F8FD]"
                                                        >
                                                            Lihat Detail Lowongan{' '}
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                            <aside className="space-y-4">
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                        Alasan kecocokan
                                                    </h2>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                        Analisis ini memperhitungkan kompetensi dan kebutuhan aksesibilitas yang tersedia pada profilmu saat pengujian dijalankan.
                                                    </p>
                                                    {viewingHistory.payload.skill_gap && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setGapResult(
                                                                    viewingHistory.payload.skill_gap ?? null,
                                                                );
                                                                openTab('skillGap');
                                                            }}
                                                            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#15527E] px-4 text-sm font-bold text-white hover:bg-[#123B5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1]"
                                                        >
                                                            Lihat Analisis Skill Gap{' '}
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                    <h3 className="text-sm font-extrabold text-[#102B4B]">
                                                        Informasi Snapshot
                                                    </h3>
                                                    <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                            <span className="text-slate-400">Waktu Analisis</span>
                                                            <span className="font-semibold text-slate-700">
                                                                {new Date(
                                                                    viewingHistory.analyzed_at ?? Date.now(),
                                                                ).toLocaleString('id-ID', {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                            <span className="text-slate-400">Skor Kecocokan</span>
                                                            <span className="font-bold text-[#087A5E]">
                                                                {clampScore(viewingHistory.payload.match_percentage) ?? 0}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-400">Perusahaan</span>
                                                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                                                                {viewingHistory.payload.vacancy?.company_profile?.company_name || '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCurrentMatch(null);
                                                            setViewingHistory(null);
                                                            openTab('matches');
                                                        }}
                                                        className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#15527E] px-3 text-xs font-bold text-[#15527E] hover:bg-slate-50 transition"
                                                    >
                                                        Cocokkan Lowongan Baru
                                                    </button>
                                                </div>
                                            </aside>
                                        </section>
                                    ) : (
                                        (() => {
                                            const categoryLabels: Array<
                                                [keyof CvCategoryScores, string]
                                            > = [
                                                ['ats_compatibility', 'ATS Compatibility'],
                                                ['structure_format', 'Struktur & Format'],
                                                ['content_relevance', 'Konten & Relevansi'],
                                                ['keyword_usage', 'Penggunaan Kata Kunci'],
                                                ['experience_achievement', 'Pengalaman & Pencapaian'],
                                                ['project_portfolio', 'Proyek & Portofolio'],
                                            ];
                                            const strengths: CvDetail[] =
                                                viewingHistory.payload.strengths_detailed?.length
                                                    ? viewingHistory.payload.strengths_detailed
                                                    : (viewingHistory.payload.strengths ?? []).map((title) => ({ title }));
                                            const improvements: CvDetail[] =
                                                viewingHistory.payload.improvements_detailed?.length
                                                    ? viewingHistory.payload.improvements_detailed
                                                    : (viewingHistory.payload.improvements ?? []).map((title) => ({ title }));
                                            const fileName = viewingHistory.metadata_source || 'CV Profil';
                                            const analyzedAt = new Date(
                                                viewingHistory.analyzed_at ?? Date.now(),
                                            ).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            });

                                            return (
                                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.65fr)]">
                                                    <section className="space-y-4">
                                                        <div className="flex items-center justify-between rounded-xl border border-[#DCEAF2] bg-white px-4 py-3 shadow-sm">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F2E7FE] text-[#6921B7]">
                                                                    <FileText className="h-6 w-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-bold text-[#102B4B]">
                                                                        {fileName}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        Dianalisis pada {analyzedAt}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="rounded-full bg-[#E2F7EF] px-3 py-1 text-xs font-bold text-[#087A5E]">
                                                                Tersimpan di Riwayat
                                                            </span>
                                                        </div>

                                                        <div className="rounded-xl border border-[#DCEAF2] bg-[#F1F8FF] p-4 sm:p-5">
                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                                <FileText className="h-8 w-8 shrink-0 text-[#1674D1]" />
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="text-base font-extrabold text-[#102B4B]">
                                                                        Gunakan Template CV ATS
                                                                    </h3>
                                                                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                                                                        Belum punya CV yang ATS-friendly? Gunakan struktur sederhana yang mudah dibaca sistem ATS dan sesuai standar industri.
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="min-h-10 shrink-0 rounded-lg border border-[#1674D1] px-3 text-sm font-bold text-[#1674D1] hover:bg-white"
                                                                >
                                                                    Unduh Template CV ATS
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto rounded-xl border border-[#DCEAF2] bg-white shadow-sm">
                                                            <div className="flex min-w-[600px] border-b border-[#EDF3F7] px-2 sm:px-4">
                                                                {(
                                                                    [
                                                                        ['summary', 'Ringkasan'],
                                                                        ['ats', 'ATS & Struktur CV'],
                                                                        ['content', 'Konten'],
                                                                        ['keywords', 'Kata Kunci'],
                                                                        ['recommendations', 'Rekomendasi'],
                                                                    ] as const
                                                                ).map(([tab, label]) => (
                                                                    <button
                                                                        key={tab}
                                                                        type="button"
                                                                        onClick={() => setHistoryCvResultTab(tab)}
                                                                        className={`min-h-12 flex-1 border-b-2 px-2 text-xs font-bold transition sm:text-sm ${
                                                                            historyCvResultTab === tab
                                                                                ? 'border-[#6921B7] text-[#6921B7]'
                                                                                : 'border-transparent text-slate-600 hover:text-[#6921B7]'
                                                                        }`}
                                                                    >
                                                                        {label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl border border-[#DCEAF2] bg-white p-4 shadow-sm sm:p-5">
                                                            {historyCvResultTab === 'summary' && (
                                                                <>
                                                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                        <FileText className="h-5 w-5 text-[#6921B7]" />
                                                                        Ringkasan Analisis
                                                                    </h3>
                                                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                                        {viewingHistory.payload.summary ||
                                                                            'Ringkasan analisis belum tersedia.'}
                                                                    </p>
                                                                    <div className="mt-6">
                                                                        <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                            <CheckCircle2 className="h-5 w-5 text-[#12B981]" />
                                                                            Kekuatan Utama
                                                                        </h3>
                                                                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                                            {strengths.map((item, index) => (
                                                                                <div
                                                                                    key={`${item.title}-${index}`}
                                                                                    className="rounded-xl border border-[#D8F0E8] bg-[#F5FFFB] p-4"
                                                                                >
                                                                                    <p className="text-sm font-bold text-[#102B4B]">
                                                                                        {item.title || 'Kekuatan CV'}
                                                                                    </p>
                                                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                                        {item.description || 'Kekuatan ini terdeteksi dari isi CV.'}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {strengths.length === 0 && (
                                                                            <p className="mt-3 text-sm text-slate-500">
                                                                                Belum ada kekuatan yang terdeteksi.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-6">
                                                                        <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                                                                            Area yang Perlu Ditingkatkan
                                                                        </h3>
                                                                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                                            {improvements.map((item, index) => (
                                                                                <div
                                                                                    key={`${item.title}-${index}`}
                                                                                    className="rounded-xl border border-[#F3D8D8] bg-[#FFF8F8] p-4"
                                                                                >
                                                                                    <p className="text-sm font-bold text-[#102B4B]">
                                                                                        {item.title || 'Area perbaikan'}
                                                                                    </p>
                                                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                                        {item.description || 'Perlu ditinjau lebih lanjut berdasarkan isi CV.'}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {improvements.length === 0 && (
                                                                            <p className="mt-3 text-sm text-slate-500">
                                                                                Belum ada saran perbaikan.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                            {historyCvResultTab === 'ats' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        ATS & Struktur CV
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-slate-600">
                                                                        Nilai berdasarkan data analisis CV.
                                                                    </p>
                                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                                        {categoryLabels.slice(0, 2).map(([key, label]) => (
                                                                            <MetricBar
                                                                                key={key}
                                                                                label={label}
                                                                                value={viewingHistory.payload.category_scores?.[key]}
                                                                                color="#6921B7"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <p className="mt-4 text-sm text-slate-600">
                                                                        Status format:{' '}
                                                                        <strong className="text-[#102B4B]">
                                                                            {viewingHistory.payload.formatting_grade || 'Belum tersedia'}
                                                                        </strong>
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {historyCvResultTab === 'content' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        Konten CV
                                                                    </h3>
                                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                        {viewingHistory.payload.summary || 'Analisis konten belum tersedia.'}
                                                                    </p>
                                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                                        {categoryLabels.slice(2, 4).map(([key, label]) => (
                                                                            <MetricBar
                                                                                key={key}
                                                                                label={label}
                                                                                value={viewingHistory.payload.category_scores?.[key]}
                                                                                color="#6921B7"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {historyCvResultTab === 'keywords' && (
                                                                <div>
                                                                    <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                                        Kata Kunci yang Disarankan
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-slate-600">
                                                                        Kata kunci yang terdeteksi relevan untuk posisi target.
                                                                    </p>
                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                        {(viewingHistory.payload.suggested_keywords ?? []).map((keyword) => (
                                                                            <span
                                                                                key={keyword}
                                                                                className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-sm font-semibold text-[#15527E]"
                                                                            >
                                                                                {keyword}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    {(viewingHistory.payload.suggested_keywords ?? []).length === 0 && (
                                                                        <p className="mt-4 text-sm text-slate-500">
                                                                            Belum ada kata kunci yang disarankan.
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-4">
                                                                        <MetricBar
                                                                            label="Penggunaan Kata Kunci"
                                                                            value={viewingHistory.payload.category_scores?.keyword_usage}
                                                                            color="#12B981"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {historyCvResultTab === 'recommendations' && (
                                                                <div>
                                                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#102B4B]">
                                                                        <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
                                                                        Rekomendasi Tindak Lanjut
                                                                    </h3>
                                                                    <ol className="mt-4 space-y-3">
                                                                        {(viewingHistory.payload.action_recommendations ?? []).map((item, index) => (
                                                                            <li
                                                                                key={`${item}-${index}`}
                                                                                className="flex items-start gap-3 text-sm leading-relaxed text-slate-600"
                                                                            >
                                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6921B7] text-xs font-bold text-white">
                                                                                    {index + 1}
                                                                                </span>
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                    {(viewingHistory.payload.action_recommendations ?? []).length === 0 && (
                                                                        <p className="mt-3 text-sm text-slate-500">
                                                                            Belum ada rekomendasi tindak lanjut.
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-5 rounded-xl border border-[#DCEAF2] bg-[#F7FBFD] p-4">
                                                                        <p className="text-sm font-bold text-[#102B4B]">
                                                                            Tips aksesibilitas
                                                                        </p>
                                                                        <BulletList
                                                                            items={viewingHistory.payload.accessibility_tips}
                                                                            emptyText="Belum ada tips aksesibilitas."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </section>

                                                    <aside className="h-fit space-y-4">
                                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                                Skor CV Snapshot
                                                            </h2>
                                                            <div className="mt-4 flex items-center gap-4">
                                                                <ScoreRing
                                                                    value={clampScore(viewingHistory.payload.ats_score)}
                                                                    label="Skor"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-[#079669]">
                                                                        {(() => {
                                                                            const score = clampScore(viewingHistory.payload.ats_score);
                                                                            return score === null
                                                                                ? 'Skor belum tersedia'
                                                                                : score >= 80
                                                                                  ? 'CV kamu sudah baik!'
                                                                                  : score >= 60
                                                                                    ? 'CV kamu cukup baik'
                                                                                    : 'CV perlu ditingkatkan';
                                                                        })()}
                                                                    </p>
                                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                                        {viewingHistory.payload.summary ||
                                                                            'Ringkasan analisis belum tersedia.'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                                Penilaian per Kategori
                                                            </h2>
                                                            <div className="mt-4 space-y-3">
                                                                {categoryLabels.map(([key, label]) => (
                                                                    <MetricBar
                                                                        key={key}
                                                                        label={label}
                                                                        value={viewingHistory.payload.category_scores?.[key]}
                                                                        color="#6921B7"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                                Kata Kunci yang Disarankan
                                                            </h2>
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {(viewingHistory.payload.suggested_keywords ?? []).map((keyword) => (
                                                                    <span
                                                                        key={keyword}
                                                                        className="rounded-lg bg-[#EAF4FF] px-3 py-2 text-xs font-semibold text-[#15527E]"
                                                                    >
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {(viewingHistory.payload.suggested_keywords ?? []).length === 0 && (
                                                                <p className="mt-3 text-sm text-slate-500">
                                                                    Belum ada kata kunci yang disarankan.
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm">
                                                            <h2 className="text-lg font-extrabold text-[#102B4B]">
                                                                Rekomendasi Tindak Lanjut
                                                            </h2>
                                                            <ol className="mt-4 space-y-3">
                                                                {(viewingHistory.payload.action_recommendations ?? []).map((item, index) => (
                                                                    <li
                                                                        key={`${item}-${index}`}
                                                                        className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                                                                    >
                                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6921B7] text-xs font-bold text-white">
                                                                            {index + 1}
                                                                        </span>
                                                                        <span>{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    </aside>
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
