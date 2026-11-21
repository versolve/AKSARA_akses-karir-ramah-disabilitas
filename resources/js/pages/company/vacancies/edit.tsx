import { useState } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Code2,
    EyeOff,
    FileText,
    GripVertical,
    Home,
    Info,
    Layers,
    MapPin,
    Monitor,
    Plus,
    Sparkles,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface CompanyData {
    id: number;
    company_name: string;
    address: string;
}

interface AccessibilityItem {
    id: number;
    accommodation_type: string;
    description?: string;
}

interface VacancyData {
    id: number;
    title: string;
    slug: string;
    description: string;
    job_type: string;
    work_model: string;
    location: string;
    experience_level: string;
    salary_min: number | null;
    salary_max: number | null;
    is_salary_public: boolean;
    requirements: string[] | null;
    skills_required: any;
    status: 'draft' | 'active' | 'closed';
    deadline: string | null;
    accessibilities: AccessibilityItem[];
}

interface Props {
    vacancy: VacancyData;
    company: CompanyData;
}

const PHYSICAL_ACCESS_LIST = [
    'Akses kursi roda',
    'Ramp/lift',
    'Toilet aksesibel',
    'Area parkir khusus',
    'Jalur pemandu',
    'Ruang kerja tenang',
    'Meja kerja adjustable (tinggi dapat diatur)',
    'Lainnya (Fisik)',
];

const COMM_ACCESS_LIST = [
    'Penerjemah bahasa isyarat',
    'Caption untuk meeting online',
    'Materi dalam format aksesibel (screen reader friendly)',
    'Komunikasi tertulis',
    'Interpreter bahasa (lainnya)',
    'Lainnya (Komunikasi)',
];

const TECH_ACCESS_LIST = [
    'Kompatibel dengan screen reader (contoh: NVDA, JAWS)',
    'Mendukung software pembesar layar (magnifier)',
    'Mendukung perangkat input alternatif (switch, eye tracker)',
    'Kompatibel dengan text-to-speech (TTS)',
    'Kompatibel dengan speech-to-text (voice typing)',
    'Lainnya (Teknologi)',
];

const PREDEFINED_CATEGORIES = [
    'Teknologi Informasi & Software',
    'UI/UX & Desain Produk',
    'Desain Grafis & Multimedia',
    'Administrasi & Operasional Kantor',
    'Pemasaran & Digital Marketing',
    'Penjualan & Business Development',
    'Layanan Pelanggan (Customer Service)',
    'Keuangan, Akuntansi & Pajak',
    'Sumber Daya Manusia (HR)',
    'Data Science, AI & Analytics',
    'Penulisan Konten, Copywriting & Media',
    'Logistik, Gudang & Rantai Pasok',
    'Pendidikan, Pengajaran & Pelatihan',
    'Hukum & Kepatuhan Legal',
    'Kesehatan, Medis & Farmasi',
    'Teknik & Manufaktur Industri',
    'Perhotelan, Kuliner & Pariwisata',
    'Lainnya',
];

const CATEGORY_SUGGESTIONS: Record<string, { responsibilities: string[]; requirements: string[] }> = {
    'UI/UX & Desain Produk': {
        responsibilities: [
            'Merancang wireframe, user flow, user journey, dan prototipe interaktif untuk platform web dan mobile.',
            'Melakukan riset pengguna (user research), usability testing, dan wawancara kandidat pengguna.',
            'Berkolaborasi erat dengan Product Manager, Software Engineer, dan pemangku kepentingan.',
            'Mengembangkan serta memelihara sistem desain (design system) yang konsisten dan aksesibel (WCAG).',
        ],
        requirements: [
            'Pendidikan minimal D3/S1 Desain Komunikasi Visual, Ilmu Komputer, atau bidang terkait.',
            'Pengalaman minimal 1-2 tahun dalam bidang UI/UX Design atau Product Design.',
            'Menguasai tools desain antarmuka terkini seperti Figma, FigJam, atau Adobe XD.',
            'Memahami prinsip Human-Centered Design, arsitektur informasi, dan aksesibilitas digital.',
        ],
    },
    'Teknologi Informasi & Software': {
        responsibilities: [
            'Merancang, mengembangkan, menguji, dan memelihara fitur perangkat lunak yang scalable dan handal.',
            'Menganalisis kebutuhan teknis dan mengoptimalkan performa serta keamanan aplikasi.',
            'Menulis kode yang bersih (clean code), terstruktur, terdokumentasi, dan melengkapi automated testing.',
            'Berpartisipasi aktif dalam code review, sprint planning, dan daily standup tim engineering.',
        ],
        requirements: [
            'Pendidikan minimal D3/S1 Teknik Informatika, Ilmu Komputer, Sistem Informasi, atau bidang terkait.',
            'Memiliki pemahaman kuat mengenai framework pemrograman modern (React/Vue/Laravel/Node.js).',
            'Familiar dengan database SQL/NoSQL, version control (Git), dan arsitektur REST API.',
            'Mampu menganalisis masalah teknis secara kritis dan bekerja secara solutif dalam tim.',
        ],
    },
    'Administrasi & Operasional Kantor': {
        responsibilities: [
            'Mengelola pengarsipan dokumen, korespondensi surat masuk/keluar, dan database administrasi operasional.',
            'Menyusun laporan rekapitulasi data harian/mingguan/bulanan secara akurat dan tepat waktu.',
            'Mengatur jadwal pertemuan/rapat, notulensi hasil diskusi, serta pengadaan inventaris kantor.',
            'Berkoordinasi dengan seluruh divisi internal terkait alur persetujuan berkas dan reimbursement.',
        ],
        requirements: [
            'Pendidikan minimal SMA/SMK/D3/S1 semua jurusan (diutamakan Administrasi Perkantoran/Manajemen).',
            'Mahir mengoperasikan Microsoft Office (Word, Excel, PowerPoint) atau Google Workspace.',
            'Memiliki ketelitian tinggi, manajemen waktu yang baik, dan kemampuan komunikasi santun.',
            'Mampu bekerja secara mandiri maupun berkoordinasi dalam tim kerja dengan tenggat waktu.',
        ],
    },
    'Pemasaran & Digital Marketing': {
        responsibilities: [
            'Merancang, menjalankan, dan mengoptimalkan strategi kampanye pemasaran digital dan media sosial.',
            'Membuat konten promosi, copy iklan persuasif, serta berkolaborasi dengan tim visual/desain.',
            'Menganalisis performa analitik kampanye (engagement rate, click-through rate, konversi leads).',
            'Membangun relasi kemitraan strategis dan mengeksplorasi saluran distribusi pemasaran baru.',
        ],
        requirements: [
            'Pendidikan minimal D3/S1 Pemasaran, Ilmu Komunikasi, Manajemen, atau bidang terkait.',
            'Pengalaman minimal 1 tahun di bidang Digital Marketing, Social Media, atau Content Creation.',
            'Memahami penggunaan tools analitik media sosial, Google Ads/Analytics, atau Meta Business Suite.',
            'Kreatif, komunikatif, berorientasi target, dan up-to-date terhadap tren industri terkini.',
        ],
    },
    'Layanan Pelanggan (Customer Service)': {
        responsibilities: [
            'Menanggapi dan memberikan solusi cepat serta ramah terhadap pertanyaan kandidat/pelanggan via chat/email/telepon.',
            'Mendokumentasikan tiket kendala, keluhan, dan saran pengguna secara sistematis.',
            'Melakukan eskalasi kendala teknis kepada tim terkait dengan koordinasi yang jelas.',
            'Menjaga tingkat kepuasan pelanggan (CSAT) sesuai standar pelayanan prima perusahaan.',
        ],
        requirements: [
            'Pendidikan minimal SMA/SMK/D3/S1 semua jurusan.',
            'Memiliki kemampuan komunikasi empati yang tinggi, artikulatif, dan sabar.',
            'Mampu mengoperasikan sistem helpdesk/CRM dan mengetik cepat.',
            'Bersedia bekerja dalam pola shift atau fleksibel sesuai kebutuhan operasional.',
        ],
    },
    'Sumber Daya Manusia (HR)': {
        responsibilities: [
            'Mengelola siklus rekrutmen karyawan mulai dari screening berkas, wawancara, hingga onboarding.',
            'Membantu penyusunan kebijakan personalia, absensi, dan kesejahteraan karyawan.',
            'Memfasilitasi program pelatihan, pengembangan talenta, dan kegiatan engagement internal.',
            'Menjaga kerahasiaan data karyawan serta kepatuhan terhadap regulasi ketenagakerjaan.',
        ],
        requirements: [
            'Pendidikan minimal S1 Psikologi, Manajemen SDM, Hukum, atau bidang terkait.',
            'Memahami proses rekrutmen end-to-end dan alat tes psikologi/wawancara kerja.',
            'Memiliki kemampuan komunikasi interpersonal yang baik dan kepemimpinan suportif.',
            'Memahami dasar-dasar undang-undang ketenagakerjaan Indonesia.',
        ],
    },
    'Lainnya': {
        responsibilities: [
            'Melaksanakan tugas operasional harian sesuai target dan standar operasional prosedur (SOP).',
            'Berkoordinasi dengan tim kerja untuk memastikan efektivitas alur penyelesaian pekerjaan.',
            'Menjaga kualitas hasil pekerjaan dan melaporkan perkembangan berkala kepada atasan langsung.',
        ],
        requirements: [
            'Memiliki motivasi kerja tinggi, kedisiplinan, integritas, dan komitmen profesional.',
            'Mampu berkomunikasi dengan baik serta memiliki kemauan tinggi untuk belajar hal baru.',
            'Mampu bekerja sama dalam tim lintas divisi maupun menyelesaikan tugas secara mandiri.',
        ],
    },
};

const getSuggestionsForCategory = (cat: string) => {
    if (!cat) return CATEGORY_SUGGESTIONS['Lainnya'];
    if (CATEGORY_SUGGESTIONS[cat]) return CATEGORY_SUGGESTIONS[cat];
    const lower = cat.toLowerCase();
    if (lower.includes('desain') || lower.includes('ui') || lower.includes('ux') || lower.includes('grafis') || lower.includes('multimedia')) {
        return CATEGORY_SUGGESTIONS['UI/UX & Desain Produk'];
    }
    if (lower.includes('teknologi') || lower.includes('software') || lower.includes('data') || lower.includes('ai') || lower.includes('it') || lower.includes('engineer')) {
        return CATEGORY_SUGGESTIONS['Teknologi Informasi & Software'];
    }
    if (lower.includes('administrasi') || lower.includes('operasional') || lower.includes('keuangan') || lower.includes('pajak') || lower.includes('akuntansi') || lower.includes('legal') || lower.includes('hukum')) {
        return CATEGORY_SUGGESTIONS['Administrasi & Operasional Kantor'];
    }
    if (lower.includes('pemasaran') || lower.includes('marketing') || lower.includes('penjualan') || lower.includes('konten') || lower.includes('media') || lower.includes('copywriting')) {
        return CATEGORY_SUGGESTIONS['Pemasaran & Digital Marketing'];
    }
    if (lower.includes('pelanggan') || lower.includes('customer') || lower.includes('service')) {
        return CATEGORY_SUGGESTIONS['Layanan Pelanggan (Customer Service)'];
    }
    if (lower.includes('sumber daya') || lower.includes('hr')) {
        return CATEGORY_SUGGESTIONS['Sumber Daya Manusia (HR)'];
    }
    return CATEGORY_SUGGESTIONS['Lainnya'];
};

export default function VacancyEdit({ vacancy, company }: Props): ReactElement {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
    const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
    const [bannerError, setBannerError] = useState<string | null>(null);

    const skillsData = (vacancy.skills_required as any) ?? {};
    const rawCategory = (skillsData?.category as string) ?? '';
    const isPredefined = PREDEFINED_CATEGORIES.includes(rawCategory) && rawCategory !== 'Lainnya';
    const initialCategory = rawCategory
        ? (isPredefined ? rawCategory : 'Lainnya')
        : '';
    const initialCustomCategory = (!isPredefined && rawCategory) ? rawCategory : '';

    const initialResponsibilities = Array.isArray(skillsData?.responsibilities) && skillsData.responsibilities.length > 0
        ? skillsData.responsibilities
        : Array.isArray(skillsData) && skillsData.length > 0
        ? skillsData
        : [''];

    const initialRequirements = Array.isArray(vacancy.requirements) && vacancy.requirements.length > 0
        ? vacancy.requirements
        : [''];

    const initialAccessibilities = vacancy.accessibilities && vacancy.accessibilities.length > 0
        ? vacancy.accessibilities.map((a) => a.accommodation_type)
        : [];

    const findAccessDesc = (type: string) => {
        const item = vacancy.accessibilities?.find((a) => a.accommodation_type === type);
        return item?.description || '';
    };
    const initialCustomPhysical = (skillsData?.custom_physical_access as string) || findAccessDesc('Lainnya (Fisik)');
    const initialCustomComm = (skillsData?.custom_comm_access as string) || findAccessDesc('Lainnya (Komunikasi)');
    const initialCustomTech = (skillsData?.custom_tech_access as string) || findAccessDesc('Lainnya (Teknologi)');
    const initialCustomInterpreter = (skillsData?.custom_interpreter_access as string) || findAccessDesc('Interpreter bahasa (lainnya)');

    const { data, setData, put, processing, errors } = useForm({
        // Step 1: Informasi Umum
        title: vacancy.title ?? '',
        category: initialCategory,
        custom_category: initialCustomCategory,
        job_type: vacancy.job_type ?? '',
        work_model: vacancy.work_model ?? '',
        location: vacancy.location ?? '',
        experience_level: vacancy.experience_level ?? '',
        salary_min: vacancy.salary_min ? String(vacancy.salary_min) : '',
        salary_max: vacancy.salary_max ? String(vacancy.salary_max) : '',
        is_salary_public: vacancy.is_salary_public ?? true,
        quota: skillsData?.quota ? String(skillsData.quota) : '',
        deadline: vacancy.deadline ? vacancy.deadline.substring(0, 10) : '',

        // Step 2: Deskripsi & Persyaratan
        description: vacancy.description ?? '',
        responsibilities: initialResponsibilities as string[],
        requirements: initialRequirements as string[],

        // Step 3: Workplace Accessibility
        accessibility_enabled: skillsData?.accessibility_enabled ?? true,
        selected_accessibilities: initialAccessibilities as string[],
        custom_physical_access: initialCustomPhysical,
        custom_comm_access: initialCustomComm,
        custom_tech_access: initialCustomTech,
        custom_interpreter_access: initialCustomInterpreter,
        accessibility_notes: skillsData?.accessibility_notes ?? '',

        // Step 4: Publikasi
        publish_type: skillsData?.publish_type ?? 'immediate',
        scheduled_at: skillsData?.scheduled_at ?? '',
        show_accessibility: skillsData?.show_accessibility ?? true,
        is_featured: skillsData?.is_featured ?? false,
        status: vacancy.status ?? 'active',
    });

    const effectiveCategory = data.category === 'Lainnya'
        ? data.custom_category.trim()
        : data.category;

    const addResponsibility = (): void => {
        setData('responsibilities', [...data.responsibilities, '']);
    };

    const updateResponsibility = (idx: number, val: string): void => {
        const next = [...data.responsibilities];
        next[idx] = val;
        setData('responsibilities', next);
    };

    const removeResponsibility = (idx: number): void => {
        const next = data.responsibilities.filter((_, i) => i !== idx);
        setData('responsibilities', next.length > 0 ? next : ['']);
    };

    const addRequirement = (): void => {
        setData('requirements', [...data.requirements, '']);
    };

    const updateRequirement = (idx: number, val: string): void => {
        const next = [...data.requirements];
        next[idx] = val;
        setData('requirements', next);
    };

    const removeRequirement = (idx: number): void => {
        const next = data.requirements.filter((_, i) => i !== idx);
        setData('requirements', next.length > 0 ? next : ['']);
    };

    // Suggestion template loaders
    const applyResponsibilitySuggestions = (): void => {
        const suggestions = getSuggestionsForCategory(effectiveCategory).responsibilities;
        setData('responsibilities', [...suggestions]);
        setBannerError(null);
    };

    const applyRequirementSuggestions = (): void => {
        const suggestions = getSuggestionsForCategory(effectiveCategory).requirements;
        setData('requirements', [...suggestions]);
        setBannerError(null);
    };

    // Step Validation check functions
    const isStep1Valid = (): boolean => {
        const titleOk = Boolean(data.title && data.title.trim().length > 0);
        const categoryOk = Boolean(
            data.category &&
            data.category.trim().length > 0 &&
            (data.category !== 'Lainnya' || (data.custom_category && data.custom_category.trim().length > 0))
        );
        const jobTypeOk = Boolean(data.job_type && data.job_type.trim().length > 0);
        const workModelOk = Boolean(data.work_model && data.work_model.trim().length > 0);
        const locationOk = data.work_model === 'remote' || Boolean(data.location && data.location.trim().length > 0);
        const expOk = Boolean(data.experience_level && data.experience_level.trim().length > 0);
        const quotaOk = Boolean(data.quota && parseInt(String(data.quota), 10) >= 1);
        const deadlineOk = Boolean(data.deadline && data.deadline.trim().length > 0);

        return Boolean(titleOk && categoryOk && jobTypeOk && workModelOk && locationOk && expOk && quotaOk && deadlineOk);
    };

    const isStep2Valid = (): boolean => {
        const descOk = Boolean(data.description && data.description.trim().length > 0);
        const respOk = data.responsibilities.some((r) => r && r.trim().length > 0);
        const reqOk = data.requirements.some((r) => r && r.trim().length > 0);

        return Boolean(descOk && respOk && reqOk);
    };

    const isStep3Valid = (): boolean => {
        if (data.selected_accessibilities.includes('Lainnya (Fisik)') && !data.custom_physical_access.trim()) {
            return false;
        }
        if (data.selected_accessibilities.includes('Lainnya (Komunikasi)') && !data.custom_comm_access.trim()) {
            return false;
        }
        if (data.selected_accessibilities.includes('Lainnya (Teknologi)') && !data.custom_tech_access.trim()) {
            return false;
        }
        if (data.selected_accessibilities.includes('Interpreter bahasa (lainnya)') && !data.custom_interpreter_access.trim()) {
            return false;
        }
        return true;
    };

    const isStep4Valid = (): boolean => {
        return true;
    };

    const toggleAccessibilityItem = (item: string): void => {
        const exists = data.selected_accessibilities.includes(item);
        if (exists) {
            setData((prev) => ({
                ...prev,
                selected_accessibilities: prev.selected_accessibilities.filter((i) => i !== item),
                custom_physical_access: item === 'Lainnya (Fisik)' ? '' : prev.custom_physical_access,
                custom_comm_access: item === 'Lainnya (Komunikasi)' ? '' : prev.custom_comm_access,
                custom_tech_access: item === 'Lainnya (Teknologi)' ? '' : prev.custom_tech_access,
                custom_interpreter_access: item === 'Interpreter bahasa (lainnya)' ? '' : prev.custom_interpreter_access,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                selected_accessibilities: [...prev.selected_accessibilities, item],
            }));
        }
    };

    const goToStep = (stepNum: number): void => {
        setVisitedSteps((prev) => Array.from(new Set([...prev, currentStep, stepNum])));
        setCurrentStep(stepNum);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextStep = (): void => {
        if (currentStep === 3 && !isStep3Valid()) {
            setAttemptedSubmit(true);
            setBannerError('Harap lengkapi rincian box input untuk opsi Lainnya yang dipilih.');
            return;
        }
        setBannerError(null);
        setVisitedSteps((prev) => Array.from(new Set([...prev, currentStep, currentStep + 1])));
        setCurrentStep((prev) => Math.min(4, prev + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = (): void => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Form submit with automated redirection when mandatory fields are incomplete
    const handleSubmit = (finalStatus?: 'active' | 'draft' | 'closed'): void => {
        const targetStatus = finalStatus ?? data.status;

        if (targetStatus === 'active') {
            if (!isStep1Valid()) {
                setAttemptedSubmit(true);
                setVisitedSteps((prev) => Array.from(new Set([...prev, 1, 2, 3, 4])));
                setCurrentStep(1);
                setBannerError('Informasi Umum belum lengkap. Harap lengkapi semua kolom wajib bertanda bintang (*).');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            if (!isStep2Valid()) {
                setAttemptedSubmit(true);
                setVisitedSteps((prev) => Array.from(new Set([...prev, 1, 2, 3, 4])));
                setCurrentStep(2);
                setBannerError('Deskripsi & Persyaratan belum lengkap. Harap isi Deskripsi Pekerjaan, minimal 1 Tanggung Jawab Utama, dan minimal 1 Persyaratan Kandidat.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            if (!isStep3Valid()) {
                setAttemptedSubmit(true);
                setVisitedSteps((prev) => Array.from(new Set([...prev, 1, 2, 3, 4])));
                setCurrentStep(3);
                setBannerError('Workplace Accessibility belum lengkap. Harap isi rincian box input untuk opsi Lainnya yang dipilih.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Cek Jadwal Publikasi jika opsi Dijadwalkan dipilih
            if (data.publish_type === 'scheduled') {
                if (!data.scheduled_at) {
                    setBannerError('Harap tentukan tanggal dan waktu jadwal publikasi lowongan.');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                const scheduledDate = new Date(data.scheduled_at);
                if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
                    setBannerError('Waktu jadwal publikasi harus lebih besar dari waktu saat ini.');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }
        } else {
            if (!data.title.trim()) {
                setAttemptedSubmit(true);
                setVisitedSteps((prev) => Array.from(new Set([...prev, 1])));
                setCurrentStep(1);
                setBannerError('Harap isi Nama Lowongan.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        const accessibilitiesPayload = data.selected_accessibilities.map((type) => {
            let desc: string | null = null;
            if (type === 'Lainnya (Fisik)' && data.custom_physical_access.trim()) {
                desc = data.custom_physical_access.trim();
            } else if (type === 'Lainnya (Komunikasi)' && data.custom_comm_access.trim()) {
                desc = data.custom_comm_access.trim();
            } else if (type === 'Lainnya (Teknologi)' && data.custom_tech_access.trim()) {
                desc = data.custom_tech_access.trim();
            } else if (type === 'Interpreter bahasa (lainnya)' && data.custom_interpreter_access.trim()) {
                desc = data.custom_interpreter_access.trim();
            }
            return {
                accommodation_type: type,
                description: desc,
            };
        });

        const payload = {
            ...data,
            category: effectiveCategory,
            status: targetStatus,
            accessibilities: accessibilitiesPayload,
        };

        router.put(`/company/vacancies/${vacancy.id}`, payload);
    };

    const formatRupiah = (val: string): string => {
        if (!val) return '';
        const num = parseInt(val, 10);
        if (isNaN(num)) return '';
        return 'Rp' + num.toLocaleString('id-ID');
    };

    return (
        <CompanyLayout>
            <Head title={`Edit Lowongan: ${vacancy.title} - Profabel`} />

            <div className="mx-auto max-w-[1440px] px-4 pt-6 pb-16 sm:px-6 lg:px-8 space-y-8">
                {/* Header with Back Arrow */}
                <div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/company/vacancies"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                            title="Kembali ke Daftar Lowongan"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                                Edit Lowongan: {vacancy.title}
                            </h1>
                            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                                Perbarui informasi lowongan kerja untuk memastikan kandidat mendapatkan informasi yang akurat.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banner Peringatan jika belum lengkap saat submit */}
                {bannerError && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-pulse">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-amber-900">Perhatian: Formulir Belum Lengkap</h4>
                            <p className="text-xs text-amber-700 mt-0.5">{bannerError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setBannerError(null)}
                            className="rounded-lg p-1 text-amber-500 hover:bg-amber-100 hover:text-amber-800 text-xs font-bold"
                            title="Tutup pesan"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Progress Stepper (4 Steps) */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between max-w-4xl mx-auto relative">
                        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0" />
                        <div
                            className="absolute top-5 left-10 h-0.5 bg-[#1769E0] transition-all duration-300 -z-0"
                            style={{
                                width: `${((currentStep - 1) / 3) * 100}%`,
                            }}
                        />

                        {[
                            { num: 1, title: 'Informasi Umum', isValid: isStep1Valid() },
                            { num: 2, title: 'Deskripsi & Persyaratan', isValid: isStep2Valid() },
                            { num: 3, title: 'Workplace Accessibility', isValid: isStep3Valid() },
                            { num: 4, title: 'Pratinjau & Publikasi', isValid: isStep4Valid() },
                        ].map((s) => {
                            const isCurrent = currentStep === s.num;
                            const isEvaluated = currentStep > s.num || visitedSteps.includes(s.num) || attemptedSubmit;

                            let circleClass = '';
                            let iconContent = null;
                            let titleClass = '';
                            let badge = null;

                            if (isCurrent) {
                                circleClass = 'bg-[#1769E0] text-white ring-4 ring-blue-100 shadow-sm';
                                iconContent = <span>{s.num}</span>;
                                titleClass = 'text-[#1769E0] font-bold';
                            } else if (isEvaluated) {
                                if (s.isValid) {
                                    circleClass = 'bg-[#1769E0] text-white shadow-sm ring-2 ring-blue-100 hover:bg-[#1258c2]';
                                    iconContent = <Check className="h-4 w-4 stroke-[3]" />;
                                    titleClass = 'text-[#102B4B] font-semibold';
                                } else {
                                    circleClass = 'bg-amber-500 text-white shadow-sm ring-4 ring-amber-100 hover:bg-amber-600 animate-pulse';
                                    iconContent = <AlertCircle className="h-4 w-4 stroke-[2.5]" />;
                                    titleClass = 'text-amber-700 font-bold';
                                    badge = (
                                        <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-700">
                                            Belum Lengkap
                                        </span>
                                    );
                                }
                            } else {
                                circleClass = 'bg-white border-2 border-slate-300 text-slate-400 hover:border-slate-400';
                                iconContent = <span>{s.num}</span>;
                                titleClass = 'text-slate-500 font-medium';
                            }

                            return (
                                <div key={s.num} className="flex flex-col items-center relative z-10 text-center">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(s.num)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${circleClass}`}
                                        title={`Langkah ${s.num}: ${s.title}`}
                                    >
                                        {iconContent}
                                    </button>
                                    <span className={`mt-2 text-xs transition ${titleClass}`}>
                                        {s.title}
                                    </span>
                                    {badge}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* STEP 1: INFORMASI UMUM */}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-8 space-y-5">
                            <div>
                                <h2 className="text-base font-bold text-[#102B4B]">Informasi Umum Lowongan</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Lengkapi informasi dasar mengenai lowongan pekerjaan yang akan dibuka.
                                </p>
                            </div>

                            {/* Nama Lowongan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Nama Lowongan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: UI/UX Designer"
                                    className={`mt-1.5 h-11 w-full rounded-xl border px-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                        attemptedSubmit && !data.title.trim()
                                            ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                            : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                    }`}
                                    required
                                />
                                {attemptedSubmit && !data.title.trim() && (
                                    <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                        Nama lowongan wajib diisi.
                                    </p>
                                )}
                            </div>

                            {/* Row 2: Kategori & Tipe Pekerjaan */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Kategori Pekerjaan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData((prev) => ({
                                                ...prev,
                                                category: val,
                                                custom_category: val === 'Lainnya' ? prev.custom_category : '',
                                            }));
                                        }}
                                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium focus:outline-none ${
                                            attemptedSubmit && !data.category
                                                ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 text-slate-800'
                                                : 'border-slate-200 text-slate-800 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                        } ${!data.category ? 'text-slate-400' : 'text-slate-800'}`}
                                    >
                                        <option value="" disabled>
                                            -- Pilih Kategori Pekerjaan --
                                        </option>
                                        {PREDEFINED_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat} className="text-slate-800">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {attemptedSubmit && !data.category && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Kategori pekerjaan wajib dipilih.
                                        </p>
                                    )}

                                    {/* Input dinamis jika memilih opsi 'Lainnya' */}
                                    {data.category === 'Lainnya' && (
                                        <div className="mt-2.5 animate-in fade-in duration-200">
                                            <label className="block text-xs font-bold text-slate-700">
                                                Tuliskan Kategori Pekerjaan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.custom_category}
                                                onChange={(e) => setData('custom_category', e.target.value)}
                                                placeholder="Contoh: Pertanian, Fesyen, Barista, dll."
                                                className={`mt-1.5 h-11 w-full rounded-xl border px-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                    attemptedSubmit && !data.custom_category.trim()
                                                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                        : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                                }`}
                                                required
                                            />
                                            {attemptedSubmit && !data.custom_category.trim() && (
                                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                    Nama kategori pekerjaan wajib diisi jika memilih Lainnya.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Tipe Pekerjaan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.job_type}
                                        onChange={(e) => setData('job_type', e.target.value)}
                                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium focus:outline-none ${
                                            attemptedSubmit && !data.job_type
                                                ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 text-slate-800'
                                                : 'border-slate-200 text-slate-800 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                        } ${!data.job_type ? 'text-slate-400' : 'text-slate-800'}`}
                                    >
                                        <option value="" disabled>
                                            -- Pilih Tipe Pekerjaan --
                                        </option>
                                        <option value="full-time" className="text-slate-800">Full-time</option>
                                        <option value="part-time" className="text-slate-800">Part-time</option>
                                        <option value="contract" className="text-slate-800">Kontrak</option>
                                        <option value="internship" className="text-slate-800">Magang</option>
                                        <option value="freelance" className="text-slate-800">Freelance</option>
                                    </select>
                                    {attemptedSubmit && !data.job_type && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Tipe pekerjaan wajib dipilih.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Lokasi Kerja & Sistem Kerja */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Lokasi Kerja <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Contoh: Jakarta"
                                            className={`h-11 w-full rounded-xl border pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                attemptedSubmit && data.work_model !== 'remote' && !data.location.trim()
                                                    ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                    : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                            }`}
                                            required={data.work_model !== 'remote'}
                                        />
                                    </div>
                                    {attemptedSubmit && data.work_model !== 'remote' && !data.location.trim() && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Lokasi kerja wajib diisi (kecuali sistem kerja WFH).
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Sistem Kerja <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('work_model', 'onsite')}
                                            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                                                data.work_model === 'onsite'
                                                    ? 'border-[#1769E0] bg-blue-50/70 text-[#1769E0]'
                                                    : attemptedSubmit && !data.work_model
                                                    ? 'border-rose-300 bg-white text-slate-600 hover:bg-slate-50'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Monitor className="h-4 w-4" />
                                            <span>WFO</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setData('work_model', 'remote')}
                                            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                                                data.work_model === 'remote'
                                                    ? 'border-[#1769E0] bg-blue-50/70 text-[#1769E0]'
                                                    : attemptedSubmit && !data.work_model
                                                    ? 'border-rose-300 bg-white text-slate-600 hover:bg-slate-50'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Home className="h-4 w-4" />
                                            <span>WFH</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setData('work_model', 'hybrid')}
                                            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                                                data.work_model === 'hybrid'
                                                    ? 'border-[#1769E0] bg-blue-50/70 text-[#1769E0]'
                                                    : attemptedSubmit && !data.work_model
                                                    ? 'border-rose-300 bg-white text-slate-600 hover:bg-slate-50'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Layers className="h-4 w-4" />
                                            <span>Hybrid</span>
                                        </button>
                                    </div>
                                    {attemptedSubmit && !data.work_model && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Sistem kerja (WFO / WFH / Hybrid) wajib dipilih.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Tingkat Pengalaman & Rentang Gaji */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Tingkat Pengalaman <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.experience_level}
                                        onChange={(e) => setData('experience_level', e.target.value)}
                                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium focus:outline-none ${
                                            attemptedSubmit && !data.experience_level
                                                ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 text-slate-800'
                                                : 'border-slate-200 text-slate-800 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                        } ${!data.experience_level ? 'text-slate-400' : 'text-slate-800'}`}
                                    >
                                        <option value="" disabled>
                                            -- Pilih Tingkat Pengalaman --
                                        </option>
                                        <option value="junior" className="text-slate-800">Junior (0 - 2 tahun)</option>
                                        <option value="mid" className="text-slate-800">Mid-level (2 - 5 tahun)</option>
                                        <option value="senior" className="text-slate-800">Senior (5+ tahun)</option>
                                        <option value="lead" className="text-slate-800">Lead / Manager</option>
                                    </select>
                                    {attemptedSubmit && !data.experience_level && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Tingkat pengalaman wajib dipilih.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Rentang Gaji (Opsional)
                                    </label>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                value={data.salary_min}
                                                onChange={(e) => setData('salary_min', e.target.value)}
                                                placeholder="Minimal"
                                                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-slate-400 font-bold">–</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                value={data.salary_max}
                                                onChange={(e) => setData('salary_max', e.target.value)}
                                                placeholder="Maksimal"
                                                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 5: Jumlah Kebutuhan & Batas Akhir Lamaran */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Jumlah Kebutuhan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative mt-1.5">
                                        <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.quota}
                                            onChange={(e) => setData('quota', e.target.value)}
                                            placeholder="Contoh: 3"
                                            className={`h-11 w-full rounded-xl border pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                attemptedSubmit && (!data.quota || parseInt(String(data.quota), 10) < 1)
                                                    ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                    : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                            }`}
                                        />
                                    </div>
                                    {attemptedSubmit && (!data.quota || parseInt(String(data.quota), 10) < 1) && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Jumlah kebutuhan minimal 1 orang.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Batas Akhir Lamaran <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative mt-1.5">
                                        <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e) => setData('deadline', e.target.value)}
                                            className={`h-11 w-full rounded-xl border pl-10 pr-4 text-xs font-medium text-slate-800 focus:outline-none ${
                                                attemptedSubmit && !data.deadline.trim()
                                                    ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                    : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                            }`}
                                            required
                                        />
                                    </div>
                                    {attemptedSubmit && !data.deadline.trim() && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            Batas akhir lamaran wajib ditentukan.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tips Card (Right) */}
                        <div className="space-y-4 lg:col-span-4">
                            <div className="rounded-2xl border border-blue-100 dark:border-white/10 bg-[#F5F9FF] dark:bg-[#071336] p-5">
                                <div className="flex items-center gap-2 text-[#1769E0] dark:text-[#38BDF8]">
                                    <Info className="h-5 w-5 shrink-0" />
                                    <h3 className="text-sm font-bold text-[#102B4B] dark:text-white">Panduan Pengisian</h3>
                                </div>

                                <div className="mt-4 space-y-4 text-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#050E2E] dark:border dark:border-white/10 text-[#1769E0] dark:text-[#38BDF8] shadow-sm">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#102B4B] dark:text-white">Nama Lowongan</p>
                                            <p className="text-slate-500 dark:text-slate-300 mt-0.5">Gunakan nama posisi yang jelas dan spesifik.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#050E2E] dark:border dark:border-white/10 text-[#1769E0] dark:text-[#38BDF8] shadow-sm">
                                            <Code2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#102B4B] dark:text-white">Kategori & Tipe Pekerjaan</p>
                                            <p className="text-slate-500 dark:text-slate-300 mt-0.5">Pilih kategori dan jenis pekerjaan yang sesuai.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#050E2E] dark:border dark:border-white/10 text-[#1769E0] dark:text-[#38BDF8] shadow-sm">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#102B4B] dark:text-white">Lokasi & Sistem Kerja</p>
                                            <p className="text-slate-500 dark:text-slate-300 mt-0.5">Tentukan lokasi dan sistem kerja (WFO, WFH, atau Hybrid).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: DESKRIPSI & PERSYARATAN */}
                {currentStep === 2 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 pb-8 sm:p-7 sm:pb-10 shadow-sm lg:col-span-8 space-y-6">
                            <div>
                                <h2 className="text-base font-bold text-[#102B4B]">Deskripsi & Persyaratan</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Jelaskan detail pekerjaan dan kualifikasi yang dibutuhkan.
                                </p>
                            </div>

                            {/* Deskripsi Pekerjaan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Deskripsi Pekerjaan <span className="text-rose-500">*</span>
                                </label>
                                <div className={`mt-1.5 overflow-hidden rounded-xl border ${
                                    attemptedSubmit && !data.description.trim()
                                        ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20'
                                        : 'border-slate-200'
                                }`}>
                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Jelaskan secara ringkas deskripsi pekerjaan ini..."
                                        className="w-full p-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                                        required
                                    />
                                </div>
                                {attemptedSubmit && !data.description.trim() && (
                                    <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                        Deskripsi pekerjaan wajib diisi.
                                    </p>
                                )}
                            </div>

                            {/* Tanggung Jawab Utama */}
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Tanggung Jawab Utama <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={applyResponsibilitySuggestions}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-[11px] font-bold text-[#1769E0] transition hover:bg-blue-100 hover:text-blue-800"
                                        title={`Gunakan contoh rekomendasi tanggung jawab untuk ${effectiveCategory || 'kategori ini'}`}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-[#1769E0]" />
                                        <span>Gunakan Saran Tanggung Jawab ({effectiveCategory || 'Kategori'})</span>
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {data.responsibilities.map((resp, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="text-slate-300 cursor-grab">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                value={resp}
                                                onChange={(e) => updateResponsibility(idx, e.target.value)}
                                                placeholder={`Tanggung jawab ${idx + 1}`}
                                                className="h-10 flex-1 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                            />
                                            {data.responsibilities.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeResponsibility(idx)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {attemptedSubmit && !data.responsibilities.some((r) => r.trim().length > 0) && (
                                    <p className="mt-1.5 text-[11px] font-semibold text-rose-500">
                                        Minimal cantumkan 1 tanggung jawab utama. Klik tombol "Gunakan Saran Tanggung Jawab" di atas untuk mengisi rekomendasi cepat.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={addResponsibility}
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#1769E0] hover:underline"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Tambah Tanggung Jawab</span>
                                </button>
                            </div>

                            {/* Persyaratan Kandidat */}
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Persyaratan Kandidat <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={applyRequirementSuggestions}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-[11px] font-bold text-[#1769E0] transition hover:bg-blue-100 hover:text-blue-800"
                                        title={`Gunakan contoh rekomendasi persyaratan untuk ${effectiveCategory || 'kategori ini'}`}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-[#1769E0]" />
                                        <span>Gunakan Saran Persyaratan ({effectiveCategory || 'Kategori'})</span>
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {data.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="text-slate-300 cursor-grab">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                value={req}
                                                onChange={(e) => updateRequirement(idx, e.target.value)}
                                                placeholder={`Persyaratan ${idx + 1}`}
                                                className="h-10 flex-1 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                            />
                                            {data.requirements.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(idx)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {attemptedSubmit && !data.requirements.some((r) => r.trim().length > 0) && (
                                    <p className="mt-1.5 text-[11px] font-semibold text-rose-500">
                                        Minimal cantumkan 1 persyaratan kandidat. Klik tombol "Gunakan Saran Persyaratan" di atas untuk mengisi rekomendasi cepat.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={addRequirement}
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#1769E0] hover:underline"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Tambah Persyaratan</span>
                                </button>
                            </div>
                        </div>

                        {/* Tips Card (Right) */}
                        <div className="space-y-4 lg:col-span-4">
                            <div className="rounded-2xl border border-blue-100 dark:border-white/10 bg-[#F5F9FF] dark:bg-[#071336] p-5">
                                <div className="flex items-center gap-2 text-[#1769E0] dark:text-[#38BDF8]">
                                    <Info className="h-5 w-5 shrink-0" />
                                    <h3 className="text-sm font-bold text-[#102B4B] dark:text-white">Panduan Pengisian</h3>
                                </div>

                                <div className="mt-4 space-y-4 text-xs">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Perjelas kriteria dan tanggung jawab agar mempermudah kandidat yang cocok untuk melamar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: WORKPLACE ACCESSIBILITY */}
                {currentStep === 3 && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                            <div className="flex items-start gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#102B4B]">Workplace Accessibility</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Atur dukungan aksesibilitas di tempat kerja agar lowongan ini inklusif dan ramah bagi beragam kandidat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                                    Sediakan dukungan aksesibilitas untuk lowongan ini
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setData('accessibility_enabled', !data.accessibility_enabled)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        data.accessibility_enabled ? 'bg-[#1769E0]' : 'bg-slate-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            data.accessibility_enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {data.accessibility_enabled && (
                            <div className="space-y-6">
                                {/* Section 1: Pengaturan Kerja */}
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Monitor className="h-4 w-4 text-[#8B5CF6]" />
                                        <h3 className="text-xs font-bold text-[#102B4B]">
                                            Pengaturan Kerja (Work Arrangement)
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[
                                            { id: 'onsite', title: 'Onsite', desc: 'Bekerja di kantor.' },
                                            { id: 'hybrid', title: 'Hybrid', desc: 'Kombinasi kantor & jarak jauh.' },
                                            { id: 'remote', title: 'Remote', desc: 'Sepenuhnya jarak jauh.' },
                                        ].map((opt) => (
                                            <div
                                                key={opt.id}
                                                onClick={() => setData('work_model', opt.id as any)}
                                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                                                    data.work_model === opt.id
                                                        ? 'border-[#1769E0] bg-blue-50/50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={data.work_model === opt.id}
                                                    onChange={() => {}}
                                                    className="mt-0.5 text-[#1769E0]"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-[#102B4B]">{opt.title}</p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 2: Aksesibilitas Fisik */}
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 className="h-4 w-4 text-[#F59E0B]" />
                                        <h3 className="text-xs font-bold text-[#102B4B]">Aksesibilitas Fisik</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {PHYSICAL_ACCESS_LIST.map((item) => {
                                            const isChecked = data.selected_accessibilities.includes(item);
                                            return (
                                                <label
                                                    key={item}
                                                    title={item}
                                                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition min-h-[46px] ${
                                                        isChecked
                                                            ? 'border-blue-200 bg-blue-50/50 text-[#1769E0] font-semibold'
                                                            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleAccessibilityItem(item)}
                                                        className="mt-0.5 h-4 w-4 shrink-0 rounded text-[#1769E0] focus:ring-[#1769E0]"
                                                    />
                                                    <span className="leading-snug break-words">{item}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Input box jika opsi 'Lainnya (Fisik)' dicentang */}
                                    {data.selected_accessibilities.includes('Lainnya (Fisik)') && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Aksesibilitas Fisik Lainnya <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.custom_physical_access}
                                                onChange={(e) => setData('custom_physical_access', e.target.value)}
                                                placeholder="Contoh: Pintu sensor otomatis, handrail koridor, jalur evakuasi bertanda khusus, dll."
                                                className={`h-10 w-full rounded-xl border bg-white px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                    attemptedSubmit && !data.custom_physical_access.trim()
                                                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                        : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                                }`}
                                            />
                                            {attemptedSubmit && !data.custom_physical_access.trim() && (
                                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                    Harap sebutkan aksesibilitas fisik lainnya jika opsi ini dipilih.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Dukungan Komunikasi */}
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-4 w-4 text-[#1769E0]" />
                                        <h3 className="text-xs font-bold text-[#102B4B]">Dukungan Komunikasi</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                        {COMM_ACCESS_LIST.map((item) => {
                                            const isChecked = data.selected_accessibilities.includes(item);
                                            return (
                                                <label
                                                    key={item}
                                                    title={item}
                                                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition min-h-[46px] ${
                                                        isChecked
                                                            ? 'border-blue-200 bg-blue-50/50 text-[#1769E0] font-semibold'
                                                            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleAccessibilityItem(item)}
                                                        className="mt-0.5 h-4 w-4 shrink-0 rounded text-[#1769E0] focus:ring-[#1769E0]"
                                                    />
                                                    <span className="leading-snug break-words">{item}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Input box jika opsi 'Lainnya (Komunikasi)' dicentang */}
                                    {data.selected_accessibilities.includes('Lainnya (Komunikasi)') && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Dukungan Komunikasi Lainnya <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.custom_comm_access}
                                                onChange={(e) => setData('custom_comm_access', e.target.value)}
                                                placeholder="Contoh: Dokumen braille, notulensi rapat visual/audio, materi takarir khusus, dll."
                                                className={`h-10 w-full rounded-xl border bg-white px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                    attemptedSubmit && !data.custom_comm_access.trim()
                                                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                        : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                                }`}
                                            />
                                            {attemptedSubmit && !data.custom_comm_access.trim() && (
                                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                    Harap sebutkan dukungan komunikasi lainnya jika opsi ini dipilih.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Input box jika opsi 'Interpreter bahasa (lainnya)' dicentang */}
                                    {data.selected_accessibilities.includes('Interpreter bahasa (lainnya)') && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Jenis Interpreter Bahasa Lainnya <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.custom_interpreter_access}
                                                onChange={(e) => setData('custom_interpreter_access', e.target.value)}
                                                placeholder="Contoh: Bahasa Isyarat Internasional (ISL), Interpreter Bahasa Asing/Daerah, dll."
                                                className={`h-10 w-full rounded-xl border bg-white px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                    attemptedSubmit && !data.custom_interpreter_access.trim()
                                                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                        : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                                }`}
                                            />
                                            {attemptedSubmit && !data.custom_interpreter_access.trim() && (
                                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                    Harap sebutkan jenis interpreter bahasa lainnya jika opsi ini dipilih.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Kompatibilitas Teknologi Bantu */}
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Code2 className="h-4 w-4 text-[#10B981]" />
                                        <h3 className="text-xs font-bold text-[#102B4B]">
                                            Kompatibilitas Teknologi Bantu
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                        {TECH_ACCESS_LIST.map((item) => {
                                            const isChecked = data.selected_accessibilities.includes(item);
                                            return (
                                                <label
                                                    key={item}
                                                    title={item}
                                                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition min-h-[46px] ${
                                                        isChecked
                                                            ? 'border-blue-200 bg-blue-50/50 text-[#1769E0] font-semibold'
                                                            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleAccessibilityItem(item)}
                                                        className="mt-0.5 h-4 w-4 shrink-0 rounded text-[#1769E0] focus:ring-[#1769E0]"
                                                    />
                                                    <span className="leading-snug break-words">{item}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Input box jika opsi 'Lainnya (Teknologi)' dicentang */}
                                    {data.selected_accessibilities.includes('Lainnya (Teknologi)') && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Kompatibilitas Teknologi Bantu Lainnya <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.custom_tech_access}
                                                onChange={(e) => setData('custom_tech_access', e.target.value)}
                                                placeholder="Contoh: Foot pedals, keyboard kontras tinggi, perangkat navigasi gerakan kepala, dll."
                                                className={`h-10 w-full rounded-xl border bg-white px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none ${
                                                    attemptedSubmit && !data.custom_tech_access.trim()
                                                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                                                        : 'border-slate-200 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]'
                                                }`}
                                            />
                                            {attemptedSubmit && !data.custom_tech_access.trim() && (
                                                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                    Harap sebutkan teknologi bantu lainnya jika opsi ini dipilih.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Section 5: Catatan Tambahan */}
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-[#102B4B]">Catatan Tambahan</h3>
                                        <span className="text-[11px] text-slate-400">
                                            {data.accessibility_notes.length} / 500
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        value={data.accessibility_notes}
                                        onChange={(e) => setData('accessibility_notes', e.target.value)}
                                        placeholder="Contoh: Tersedia tim pendamping, fleksibilitas waktu istirahat..."
                                        className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1769E0] focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: PRATINJAU & PUBLIKASI */}
                {currentStep === 4 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 pb-8 sm:p-7 sm:pb-10 shadow-sm lg:col-span-8 space-y-6">
                            <div>
                                <h2 className="text-base font-bold text-[#102B4B]">Pratinjau Lowongan</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Periksa kembali semua informasi sebelum menyimpan perubahan.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-blue-50 bg-[#F8FBFE] p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100/70 text-[#1769E0]">
                                        <Code2 className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-extrabold text-[#102B4B]">
                                                    {data.title || 'Nama Lowongan'}
                                                </h3>
                                                {data.is_featured && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-700 shadow-2xs">
                                                        ⭐ Lowongan Unggulan
                                                    </span>
                                                )}
                                            </div>
                                            {data.status === 'active' && data.publish_type === 'scheduled' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                                    {data.scheduled_at
                                                        ? `Dijadwalkan: ${new Date(data.scheduled_at).toLocaleDateString('id-ID', {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })}`
                                                        : 'Dijadwalkan'}
                                                </span>
                                            ) : data.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : data.status === 'draft' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    Draft
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Ditutup
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                            <span>{company.company_name}</span>
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                                            <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1">
                                                {effectiveCategory || 'Kategori Belum Dipilih'}
                                            </span>
                                            <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 capitalize">
                                                {data.job_type || 'Tipe Pekerjaan'}
                                            </span>
                                            <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 capitalize">
                                                {data.work_model || 'Sistem Kerja'}
                                            </span>
                                            <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-slate-400" />
                                                {data.location || 'Lokasi'}
                                            </span>
                                            {(data.salary_min || data.salary_max) && (
                                                <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-emerald-700 font-bold">
                                                    {formatRupiah(data.salary_min)} – {formatRupiah(data.salary_max)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-[#1769E0]" />
                                    <span>Deskripsi Pekerjaan</span>
                                </h4>
                                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                    {data.description}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-[#1769E0]" />
                                    <span>Tanggung Jawab Utama</span>
                                </h4>
                                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                    {data.responsibilities.filter((r) => r.trim()).length > 0 ? (
                                        data.responsibilities.filter((r) => r.trim()).map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))
                                    ) : (
                                        <li className="text-slate-400 italic list-none">Belum ada tanggung jawab yang ditambahkan.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-[#1769E0]" />
                                        <span>Persyaratan Kandidat</span>
                                    </h4>
                                    <ul className="flex-1 space-y-1.5 text-xs text-slate-600 list-disc list-inside bg-slate-50/70 p-4 rounded-xl border border-slate-100 min-h-[90px]">
                                        {data.requirements.filter((r) => r.trim()).length > 0 ? (
                                            data.requirements.filter((r) => r.trim()).map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))
                                        ) : (
                                            <li className="text-slate-400 italic list-none">Belum ada persyaratan yang ditambahkan.</li>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        <span>Workplace Accessibility</span>
                                    </h4>
                                    <div className="flex-1 space-y-2 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 text-xs text-slate-700 min-h-[90px]">
                                        {!data.show_accessibility ? (
                                            <div className="flex flex-col items-center justify-center py-5 text-center text-slate-400">
                                                <EyeOff className="h-5 w-5 mb-1.5 text-slate-400" />
                                                <p className="text-xs font-medium text-slate-500">
                                                    Informasi Workplace Accessibility disembunyikan untuk pelamar
                                                </p>
                                            </div>
                                        ) : data.selected_accessibilities.length > 0 ? (
                                            <>
                                                {data.selected_accessibilities.slice(0, 6).map((acc, i) => {
                                                    let displayLabel = acc;
                                                    if (acc === 'Lainnya (Fisik)' && data.custom_physical_access.trim()) {
                                                        displayLabel = `Lainnya (Fisik): ${data.custom_physical_access.trim()}`;
                                                    } else if (acc === 'Lainnya (Komunikasi)' && data.custom_comm_access.trim()) {
                                                        displayLabel = `Lainnya (Komunikasi): ${data.custom_comm_access.trim()}`;
                                                    } else if (acc === 'Lainnya (Teknologi)' && data.custom_tech_access.trim()) {
                                                        displayLabel = `Lainnya (Teknologi): ${data.custom_tech_access.trim()}`;
                                                    } else if (acc === 'Interpreter bahasa (lainnya)' && data.custom_interpreter_access.trim()) {
                                                        displayLabel = `Interpreter bahasa (lainnya): ${data.custom_interpreter_access.trim()}`;
                                                    }
                                                    return (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                            <span className="leading-snug break-words">{displayLabel}</span>
                                                        </div>
                                                    );
                                                })}
                                                {data.selected_accessibilities.length > 6 && (
                                                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                                                        + {data.selected_accessibilities.length - 6} fasilitas aksesibilitas lainnya
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">
                                                Tidak ada fasilitas aksesibilitas khusus yang dipilih.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pengaturan Publikasi & Status (Right) */}
                        <div className="space-y-5 lg:col-span-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 text-[#1769E0]">
                                    <Info className="h-5 w-5 shrink-0" />
                                    <h3 className="text-sm font-bold text-[#102B4B]">Pengaturan Publikasi</h3>
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-xs font-bold text-slate-700">Status Lowongan</p>

                                    <div
                                        onClick={() => {
                                            setData((prev) => ({ ...prev, status: 'active', publish_type: 'immediate' }));
                                        }}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                                            data.status === 'active' && data.publish_type === 'immediate'
                                                ? 'border-[#1769E0] bg-blue-50/50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={data.status === 'active' && data.publish_type === 'immediate'}
                                            onChange={() => {}}
                                            className="mt-0.5 text-[#1769E0]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-[#102B4B]">Publikasikan Sekarang</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Lowongan langsung berstatus aktif dan tampil di pencarian kerja.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => {
                                            setData((prev) => ({ ...prev, status: 'active', publish_type: 'scheduled' }));
                                        }}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                                            data.status === 'active' && data.publish_type === 'scheduled'
                                                ? 'border-[#1769E0] bg-blue-50/50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={data.status === 'active' && data.publish_type === 'scheduled'}
                                            onChange={() => {}}
                                            className="mt-0.5 text-[#1769E0]"
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#102B4B]">Jadwalkan Publikasi</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Tentukan tanggal dan waktu tayang lowongan.
                                            </p>
                                        </div>
                                    </div>

                                    {data.status === 'active' && data.publish_type === 'scheduled' && (
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-2">
                                            <label className="block text-[11px] font-bold text-[#102B4B]">
                                                Waktu Mulai Tayang <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={data.scheduled_at}
                                                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0]"
                                                required
                                            />
                                            <p className="text-[10px] text-slate-500 leading-tight">
                                                Lowongan akan otomatis tayang dan berstatus aktif pada waktu yang ditentukan.
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        onClick={() => setData('status', 'draft')}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                                            data.status === 'draft'
                                                ? 'border-[#1769E0] bg-blue-50/50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={data.status === 'draft'}
                                            onChange={() => {}}
                                            className="mt-0.5 text-[#1769E0]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-[#102B4B]">Simpan sebagai Draft</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Simpan perubahan lowongan tanpa mempublikasikannya.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setData('status', 'closed')}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                                            data.status === 'closed'
                                                ? 'border-[#1769E0] bg-blue-50/50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={data.status === 'closed'}
                                            onChange={() => {}}
                                            className="mt-0.5 text-[#1769E0]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-[#102B4B]">Tutup Lowongan</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Hentikan penerimaan lamaran baru untuk posisi ini.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <p className="text-xs font-bold text-slate-700">Opsi Lainnya</p>

                                    <label className="flex cursor-pointer items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={data.show_accessibility}
                                            onChange={(e) => setData('show_accessibility', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded text-[#1769E0]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-[#102B4B]">
                                                Tampilkan informasi Workplace Accessibility
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Menampilkan fasilitas dan dukungan aksesibilitas di halaman lowongan.
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded text-[#1769E0]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-[#102B4B]">
                                                Jadikan sebagai Lowongan Unggulan
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Menampilkan lowongan di posisi teratas (premium).
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation Buttons Bar */}
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </button>
                    ) : (
                        <Link
                            href="/company/vacancies"
                            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <span>Batal</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-3">
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#1769E0] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#1258c2]"
                            >
                                <span>Lanjutkan</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => handleSubmit()}
                                className="flex h-11 items-center gap-2 rounded-xl bg-[#1769E0] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#1258c2]"
                            >
                                <span>Simpan Perubahan</span>
                                <Check className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
