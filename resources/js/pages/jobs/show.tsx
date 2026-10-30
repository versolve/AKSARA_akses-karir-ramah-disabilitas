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

export default function JobShow({ vacancy, alreadyApplied }: Props): ReactElement {
  const page = usePage();
  const userRole = (page.props.auth as any)?.user?.role;
  const isPelamar = userRole === 'pelamar';

  const [activeTab, setActiveTab] = useState<'deskripsi' | 'perusahaan' | 'aksesibilitas' | 'proses'>('deskripsi');
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
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

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
      navigator.share({
        title: vacancy.title,
        text: `Lowongan kerja ramah disabilitas: ${vacancy.title} di ${vacancy.company_profile.company_name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan lowongan telah disalin ke papan klip!');
    }
  };

  return (
    <AppLayout>
      <Head title={`${vacancy.title} - ${vacancy.company_profile.company_name}`} />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/jobs"
            className="text-xs sm:text-sm font-semibold text-[#1674D1] hover:underline flex items-center gap-1.5"
          >
            ← Kembali ke Daftar Lowongan
          </Link>
        </div>

        {/* Main Content Grid: Left Main Section (8 cols) & Right Sidebar Cards (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT COLUMN: DETAIL PEKERJAAN (8 COLS) ===================== */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
              {/* Header Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
                      {vacancy.title}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#DCFCE7] text-[#15803D] px-2.5 py-0.5 text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ramah Disabilitas
                    </span>
                  </div>

                  {/* Company Info Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-xs">
                        {vacancy.company_profile.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        {vacancy.company_profile.company_name}
                      </span>
                    </div>

                    <span className="hidden sm:inline">•</span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {vacancy.location}
                    </span>

                    <span className="hidden sm:inline">•</span>

                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span className="capitalize">{vacancy.job_type}</span>
                    </span>

                    <span className="hidden sm:inline">•</span>

                    <span className="font-semibold text-slate-700 uppercase text-[11px]">
                      ★ {vacancy.work_model}
                    </span>
                  </div>
                </div>

                {/* Bookmark & Share Icons */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    aria-label={isSpeaking ? 'Hentikan pembacaan' : 'Bacakan detail lowongan'}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      isSpeaking
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-[#E2E8F0] text-slate-500 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                    title={isSpeaking ? 'Hentikan suara' : 'Bacakan lowongan'}
                  >
                    {isSpeaking ? <VolumeX className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSaved(!isSaved)}
                    aria-label="Simpan lowongan"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      isSaved
                        ? 'border-[#123B5D] bg-[#123B5D] text-white'
                        : 'border-[#E2E8F0] text-slate-500 hover:text-[#123B5D] hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Bagikan lowongan"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-[#123B5D] hover:bg-slate-50 transition"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (Deskripsi, Perusahaan, Aksesibilitas, Proses Lamaran) */}
              <div className="flex items-center gap-8 border-b border-[#F1F5F9] text-xs sm:text-sm font-semibold text-[#64748B] pt-2">
                {[
                  { key: 'deskripsi', label: 'Deskripsi' },
                  { key: 'perusahaan', label: 'Perusahaan' },
                  { key: 'aksesibilitas', label: 'Aksesibilitas' },
                  { key: 'proses', label: 'Proses Lamaran' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`pb-3 pt-2 font-bold cursor-pointer transition select-none ${
                      activeTab === tab.key
                        ? 'text-[#123B5D] border-b-2 border-[#123B5D]'
                        : 'hover:text-[#102B4B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="py-6 space-y-6">
                {activeTab === 'deskripsi' && (
                  <>
                    {/* Deskripsi Pekerjaan */}
                    <div>
                      <h3 className="font-extrabold text-sm text-[#102B4B] mb-2">Deskripsi Pekerjaan</h3>
                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                        {vacancy.description}
                      </p>
                    </div>

                    {/* Tanggung Jawab */}
                    <div>
                      <h3 className="font-extrabold text-sm text-[#102B4B] mb-2">Tanggung Jawab</h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#475569] list-disc list-inside">
                        <li>Merancang user interface yang menarik, intuitif, dan mudah digunakan</li>
                        <li>Melakukan riset pengguna serta usability testing berkala</li>
                        <li>Berkolaborasi erat dengan tim produk dan developer</li>
                        <li>Memastikan seluruh aset desain memenuhi standar aksesibilitas inklusif (WCAG 2.1)</li>
                      </ul>
                    </div>

                    {/* Kualifikasi */}
                    {vacancy.requirements && vacancy.requirements.length > 0 && (
                      <div>
                        <h3 className="font-extrabold text-sm text-[#102B4B] mb-2">Kualifikasi</h3>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-[#475569] list-disc list-inside">
                          {vacancy.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'perusahaan' && (
                  <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
                    <h3 className="font-extrabold text-sm text-[#102B4B]">Tentang Perusahaan</h3>
                    <p className="leading-relaxed">
                      {vacancy.company_profile.description ?? 'Informasi tentang profil perusahaan belum dicantumkan secara lengkap.'}
                    </p>
                    <div className="pt-2">
                      <strong className="text-slate-800">Alamat Kantor:</strong> {vacancy.company_profile.address}
                    </div>
                  </div>
                )}

                {activeTab === 'aksesibilitas' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-[#102B4B]">Fasilitas Kerja Inklusif</h3>
                    <p className="text-xs text-[#64748B]">
                      Perusahaan ini menyediakan akomodasi berikut untuk memastikan kenyamanan kerja bagi penyandang disabilitas:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {vacancy.accessibilities.map((acc) => (
                        <div key={acc.id} className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {ACCESSIBILITY_LABELS[acc.accommodation_type] ?? acc.accommodation_type}
                            </div>
                            {acc.description && <p className="text-[11px] text-slate-600 mt-0.5">{acc.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'proses' && (
                  <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
                    <h3 className="font-extrabold text-sm text-[#102B4B]">Alur & Tahapan Rekrutmen</h3>
                    <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                      <li><strong>Pengiriman Berkas:</strong> Unggah CV dan surat pengantar melalui portal Profabel.</li>
                      <li><strong>Peninjauan Kualifikasi:</strong> Tim HR meninjau berkas dan kesesuaian fasilitas aksesibilitas (1-3 hari kerja).</li>
                      <li><strong>Sesi Wawancara:</strong> Wawancara kerja dengan akomodasi yang disesuaikan (Google Meet dengan teks otomatis / juru bahasa isyarat).</li>
                      <li><strong>Penerimaan / Offering:</strong> Pengumuman hasil seleksi disampaikan langsung melalui dashboard dan notifikasi.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Section: Informasi Perusahaan (matches Reference) */}
              <div className="border-t border-[#F1F5F9] pt-6 space-y-4">
                <h3 className="font-extrabold text-base text-[#102B4B]">Informasi Perusahaan</h3>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF5FA] text-[#123B5D] font-black text-lg shrink-0 border border-[#D0E5F0]">
                      {vacancy.company_profile.company_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-[#102B4B]">
                          {vacancy.company_profile.company_name}
                        </h4>
                        <CheckCircle2 className="h-4 w-4 text-[#1674D1]" />
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {vacancy.company_profile.industry ?? 'Teknologi Informasi'}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[#64748B] mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {vacancy.company_profile.address}
                      </p>
                    </div>
                  </div>

                  <a
                    href={vacancy.company_profile.website ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1674D1] bg-white px-4 py-2 text-xs font-bold text-[#1674D1] hover:bg-blue-50 transition min-h-[40px] shrink-0"
                  >
                    <span>Lihat Profil Perusahaan</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {vacancy.company_profile.description ??
                    `${vacancy.company_profile.company_name} adalah perusahaan yang berkomitmen menciptakan lingkungan kerja yang inklusif, setara, dan terbuka untuk semua talenta, termasuk penyandang disabilitas.`}
                </p>

                {/* Box: Aksesibilitas di Perusahaan */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-xs shrink-0">
                      A11y
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-emerald-950">Aksesibilitas di Perusahaan</h5>
                      <p className="text-[11px] text-emerald-800">
                        Kami menyediakan berbagai dukungan agar kamu dapat bekerja dengan nyaman dan produktif.
                      </p>
                    </div>
                  </div>

                  {/* Accessibility Pill Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Ruang kerja aksesibel
                    </span>
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Kerja remote (fleksibel)
                    </span>
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Screen reader friendly
                    </span>
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Pendamping kerja (jika diperlukan)
                    </span>
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Jadwal fleksibel
                    </span>
                    <span className="rounded-lg bg-emerald-100/80 text-emerald-900 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Teknologi asistif tersedia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN: SIDEBAR CARDS (4 COLS) ===================== */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* 1. Card: Lamar Pekerjaan Ini */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#102B4B]">Lamar Pekerjaan Ini</h3>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {alreadyApplied ? (
                  <div className="w-full rounded-2xl bg-[#DCFCE7] text-[#15803D] font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-2xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sudah Dilamar</span>
                  </div>
                ) : isPelamar ? (
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full rounded-2xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] cursor-pointer"
                  >
                    <Send className="h-4 w-4 rotate-45" />
                    <span>Lamar Sekarang</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full rounded-2xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] cursor-pointer"
                  >
                    <Send className="h-4 w-4 rotate-45" />
                    <span>Masuk untuk Melamar</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#102B4B] font-bold py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-2xs transition min-h-[44px] cursor-pointer"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-[#123B5D] text-[#123B5D]' : 'text-slate-500'}`} />
                  <span>{isSaved ? 'Tersimpan di Favorit' : 'Simpan Lowongan'}</span>
                </button>

                {isPelamar && (
                  <button
                    type="button"
                    onClick={handleRunAiMatch}
                    className="w-full rounded-2xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-bold py-2.5 px-4 flex items-center justify-center gap-2 text-xs transition min-h-[40px] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    <span>Cek Kecocokan AI</span>
                  </button>
                )}
              </div>

              {/* Job Facts List */}
              <div className="pt-3 border-t border-[#F1F5F9] space-y-3 text-xs">
                <div className="flex items-start gap-3 text-[#64748B]">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-slate-400">Tipe Pekerjaan</span>
                    <strong className="text-slate-800 capitalize">{vacancy.job_type}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#64748B]">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-slate-400">Lokasi</span>
                    <strong className="text-slate-800">{vacancy.location} ({vacancy.work_model})</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#64748B]">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-slate-400">Batasan Lamaran</span>
                    <strong className="text-slate-800">
                      {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString('id-ID') : '30 Desember 2026'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#64748B]">
                  <DollarSign className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-slate-400">Gaji</span>
                    <strong className="text-slate-800">
                      {vacancy.is_salary_public && vacancy.salary_min
                        ? `Rp ${vacancy.salary_min.toLocaleString('id-ID')} - ${vacancy.salary_max?.toLocaleString('id-ID')} / bulan`
                        : 'Gaji Kompetitif'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#64748B]">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-slate-400">Tingkat Pengalaman</span>
                    <strong className="text-slate-800 capitalize">{vacancy.experience_level}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Card: Kontak HR */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123B5D] text-white font-bold text-sm shrink-0">
                  HR
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#102B4B]">Tim Rekruter</h4>
                  <p className="text-[11px] text-[#64748B]">HR Specialist</p>
                </div>
              </div>

              <Link
                href="/app/applications"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#123B5D] px-3.5 py-2 text-xs font-bold text-[#102B4B] hover:bg-slate-50 transition min-h-[40px]"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Kirim Pesan</span>
              </Link>
            </div>

            {/* 3. Card: Lowongan Lain dari Perusahaan ini */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3.5">
              <h3 className="font-extrabold text-xs text-[#102B4B]">
                Lowongan Lain dari Perusahaan ini
              </h3>

              <div className="space-y-2.5">
                <Link
                  href="/jobs"
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-[#F1F5F9] group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A36B] font-bold text-xs shrink-0">
                      MB
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#102B4B] truncate group-hover:text-[#1674D1]">
                        Frontend Developer
                      </h4>
                      <p className="text-[10px] text-[#64748B]">Full Time • Hybrid</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
                </Link>

                <Link
                  href="/jobs"
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-[#F1F5F9] group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A36B] font-bold text-xs shrink-0">
                      MB
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#102B4B] truncate group-hover:text-[#1674D1]">
                        Product QA Manual
                      </h4>
                      <p className="text-[10px] text-[#64748B]">Full Time • Onsite</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
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
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 id="modal-headline" className="text-lg font-bold text-slate-900">
                  Lamar: {vacancy.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Tutup form lamaran"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="cv-file" className="text-xs font-bold text-[#102B4B]">
                    Upload Curriculum Vitae (PDF / Word, Maks. 5MB)
                  </Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setData('cv', e.target.files ? e.target.files[0] : null)}
                    className="mt-2 block w-full min-h-[44px]"
                    required
                  />
                  {errors.cv && <p className="mt-1 text-xs text-rose-600">{errors.cv}</p>}
                </div>

                <div>
                  <Label htmlFor="cover_letter" className="text-xs font-bold text-[#102B4B]">
                    Surat Pengantar / Cover Letter (Opsional)
                  </Label>
                  <textarea
                    id="cover_letter"
                    rows={4}
                    value={data.cover_letter}
                    onChange={(e) => setData('cover_letter', e.target.value)}
                    placeholder="Ceritakan secara singkat keahlian dan kebutuhan aksesibilitas Anda..."
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none"
                  />
                  {errors.cover_letter && (
                    <p className="mt-1 text-xs text-rose-600">{errors.cover_letter}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="min-h-[44px] text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold min-h-[44px] px-6 text-xs"
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                  <h3 id="ai-match-headline" className="text-base font-bold text-slate-900">
                    Analisis Kecocokan AI: {vacancy.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Tutup modal analisis"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isMatchingAi ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <Sparkles className="mx-auto h-8 w-8 text-emerald-700 animate-spin mb-3" />
                  <p>Sedang mengevaluasi kecocokan kompetensi dan aksesibilitas...</p>
                </div>
              ) : aiMatch ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800 uppercase">Skor Kecocokan</span>
                      <p className="text-2xl font-black text-emerald-950">{aiMatch.match_percentage}%</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-white px-2.5 py-1 text-center border border-emerald-100">
                        <span className="block text-[10px] text-slate-400">Kompetensi</span>
                        <span className="text-xs font-bold text-slate-800">{aiMatch.competency_score}%</span>
                      </div>
                      <div className="rounded-lg bg-white px-2.5 py-1 text-center border border-emerald-100">
                        <span className="block text-[10px] text-slate-400">Aksesibilitas</span>
                        <span className="text-xs font-bold text-emerald-700">{aiMatch.accessibility_score}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{aiMatch.summary}</p>

                  {aiMatch.matching_points?.length > 0 && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <span className="text-xs font-bold text-emerald-800 block mb-1">Poin Kecocokan:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {aiMatch.matching_points.map((p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => setIsMatchModalOpen(false)}
                      className="bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold text-xs min-h-[44px]"
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

        {/* Floating AI Career Assistant Pill */}
        <Link
          href="/app/ai-assistant"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#1674D1] hover:bg-[#123B5D] active:scale-95 text-white font-bold px-5 py-3 text-xs sm:text-sm shadow-xl transition-all duration-200 border-2 border-white min-h-[48px]"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1674D1]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>AI Career Assistant</span>
        </Link>
      </div>
    </AppLayout>
  );
}
