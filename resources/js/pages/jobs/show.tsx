import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';

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
  screen_reader_software: 'Dukungan Software Screen Reader',
  sign_language_interpreter: 'Juru Bahasa Isyarat',
  written_communication: 'Komunikasi Kerja Tertulis (Text-Only)',
  flexible_hours: 'Jam Kerja Fleksibel',
  remote_option: 'Opsi Kerja Jarak Jauh (Remote)',
  ergonomic_workspace: 'Ruang Kerja Ergonomis',
  quiet_space: 'Ruang Tenang / Ramah Sensorik',
};

export default function JobShow({ vacancy, alreadyApplied }: Props): ReactElement {
  const page = usePage();
  const userRole = (page.props.auth as any)?.user?.role;
  const isPelamar = userRole === 'pelamar';

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [aiMatch, setAiMatch] = useState<any>(null);
  const [isMatchingAi, setIsMatchingAi] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

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
        const data = await res.json();
        setAiMatch(data);
      }
    } catch (e) {
      console.error('AI Match error', e);
    } finally {
      setIsMatchingAi(false);
    }
  };

  const handleSpeak = (): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${vacancy.title} di ${vacancy.company_profile.company_name}. Lokasi ${vacancy.location}. Model kerja ${vacancy.work_model}. Deskripsi pekerjaan: ${vacancy.description}. Fasilitas aksesibilitas tempat kerja meliputi: ${vacancy.accessibilities.map((a) => ACCESSIBILITY_LABELS[a.accommodation_type] || a.accommodation_type).join(', ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
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

  return (
    <AppLayout>
      <Head title={`${vacancy.title} - ${vacancy.company_profile.company_name}`} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/jobs" className="text-sm font-medium text-teal-600 hover:underline">
            ← Kembali ke Katalog Lowongan
          </Link>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {vacancy.work_model.toUpperCase()}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {vacancy.job_type.toUpperCase()}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {vacancy.title}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-base font-medium text-slate-700">
                <Building2 className="h-5 w-5 text-slate-400" />
                {vacancy.company_profile.company_name}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                {vacancy.location}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSpeak}
                  className="flex items-center gap-2 min-h-[44px]"
                  aria-label="Bacakan seluruh detail lowongan"
                >
                  <Volume2 className="h-4 w-4 text-teal-600" />
                  Bacakan Lowongan
                </Button>

                {isPelamar && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRunAiMatch}
                    className="flex items-center gap-2 border-teal-300 bg-teal-50/50 text-teal-800 hover:bg-teal-100 min-h-[44px]"
                  >
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    Cek Kecocokan AI
                  </Button>
                )}
              </div>

              {alreadyApplied ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Sudah Dilamar
                </div>
              ) : (
                <Button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 min-h-[44px]"
                >
                  Lamar Sekarang
                </Button>
              )}
            </div>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 border-b border-slate-100 text-sm">
            <div>
              <span className="text-slate-500 block">Kisaran Gaji</span>
              <span className="font-semibold text-slate-800">
                {vacancy.is_salary_public && vacancy.salary_min
                  ? `Rp ${(vacancy.salary_min / 1000000).toFixed(1)}jt - ${(vacancy.salary_max ?? 0) / 1000000}jt`
                  : 'Gaji Kompetitif'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Tingkat Pengalaman</span>
              <span className="font-semibold text-slate-800 capitalize">
                {vacancy.experience_level}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Batas Lamaran</span>
              <span className="font-semibold text-slate-800">
                {vacancy.deadline ?? 'Terbuka'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Fasilitas Aksesibilitas</span>
              <span className="font-semibold text-teal-700">
                {vacancy.accessibilities.length} Fasilitas Tersedia
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Deskripsi Pekerjaan</h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {vacancy.description}
            </div>
          </div>

          {/* Requirements & Skills */}
          {((vacancy.requirements && vacancy.requirements.length > 0) ||
            (vacancy.skills_required && vacancy.skills_required.length > 0)) && (
            <div className="py-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Persyaratan & Keterampilan</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {vacancy.requirements && vacancy.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm">Persyaratan Umum</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {vacancy.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {vacancy.skills_required && vacancy.skills_required.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm">Keterampilan yang Dibutuhkan</h3>
                    <div className="flex flex-wrap gap-2">
                      {vacancy.skills_required.map((skill, i) => (
                        <span key={i} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workplace Accessibility Facilities (Core Feature) */}
          <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/40 p-6">
            <h2 className="text-lg font-bold text-teal-950 mb-2">
              Fasilitas & Dukungan Aksesibilitas Tempat Kerja
            </h2>
            <p className="text-xs text-teal-800 mb-4">
              Perusahaan ini telah menyatakan komitmen dan kesiapan infrastruktur untuk akomodasi berikut:
            </p>

            {vacancy.accessibilities.length === 0 ? (
              <p className="text-sm text-slate-500">
                Informasi fasilitas spesifik belum dicantumkan. Pelamar dapat menanyakan langsung saat proses wawancara.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {vacancy.accessibilities.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-start gap-3 rounded-xl border border-teal-200 bg-white p-3.5 shadow-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {ACCESSIBILITY_LABELS[acc.accommodation_type] ?? acc.accommodation_type}
                      </h3>
                      {acc.description && (
                        <p className="mt-0.5 text-xs text-slate-600">{acc.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Apply Modal */}
        {isApplyModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
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

              <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="cv-file">Upload Curriculum Vitae (PDF / Word, Maks. 5MB)</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setData('cv', e.target.files ? e.target.files[0] : null)}
                    className="mt-2 block w-full min-h-[44px]"
                    required
                  />
                  {errors.cv && <p className="mt-1 text-sm text-red-600">{errors.cv}</p>}
                </div>

                <div>
                  <Label htmlFor="cover_letter">Surat Pengantar / Cover Letter (Opsional)</Label>
                  <textarea
                    id="cover_letter"
                    rows={4}
                    value={data.cover_letter}
                    onChange={(e) => setData('cover_letter', e.target.value)}
                    placeholder="Ceritakan secara singkat keahlian dan kebutuhan aksesibilitas Anda..."
                    className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  {errors.cover_letter && (
                    <p className="mt-1 text-sm text-red-600">{errors.cover_letter}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="min-h-[44px]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="bg-teal-600 hover:bg-teal-700 min-h-[44px]"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
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
                  <Sparkles className="mx-auto h-8 w-8 text-teal-600 animate-spin mb-3" />
                  <p>Sedang mengevaluasi kecocokan kompetensi dan aksesibilitas...</p>
                </div>
              ) : aiMatch ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-teal-50 p-4 border border-teal-200">
                    <div>
                      <span className="text-xs font-semibold text-teal-700 uppercase">Skor Kecocokan</span>
                      <p className="text-2xl font-black text-teal-950">{aiMatch.match_percentage}%</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-white px-2.5 py-1 text-center border border-teal-100">
                        <span className="block text-[10px] text-slate-400">Kompetensi</span>
                        <span className="text-xs font-bold text-slate-800">{aiMatch.competency_score}%</span>
                      </div>
                      <div className="rounded-lg bg-white px-2.5 py-1 text-center border border-teal-100">
                        <span className="block text-[10px] text-slate-400">Aksesibilitas</span>
                        <span className="text-xs font-bold text-teal-700">{aiMatch.accessibility_score}%</span>
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

                  {aiMatch.gaps?.length > 0 && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                      <span className="text-xs font-bold text-amber-800 block mb-1">Area Pengembangan:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {aiMatch.gaps.map((g: string, idx: number) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => setIsMatchModalOpen(false)}
                      className="bg-teal-600 hover:bg-teal-700 text-xs min-h-[44px]"
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
      </div>
    </AppLayout>
  );
}
