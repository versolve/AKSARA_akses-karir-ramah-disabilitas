import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSearch,
  FileText,
  Lightbulb,
  Percent,
  Search,
  Sparkles,
  Zap,
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
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  work_model: string;
  location: string;
  skills_required?: string[];
  company_profile: CompanyItem;
  accessibilities: AccessibilityItem[];
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
  user: {
    id: number;
    name: string;
    accessibility_profile?: {
      disability_types?: string[];
      accommodations_needed?: string[];
    };
  };
}

interface Props {
  seeker: SeekerProfile;
  savedMatches: SavedMatch[];
  activeVacancies: VacancyItem[];
}

export default function AiAssistantIndex({
  seeker,
  savedMatches,
  activeVacancies,
}: Props): ReactElement {
  const [activeTab, setActiveTab] = useState<'matches' | 'skillGap' | 'cvReview'>('matches');

  // Match state
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<any>(null);

  // Skill Gap state
  const [mySkillsInput, setMySkillsInput] = useState('');
  const [targetSkillsInput, setTargetSkillsInput] = useState('');
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [gapResult, setGapResult] = useState<any>(null);

  // CV Review state
  const [cvText, setCvText] = useState('');
  const [targetRoleSkills, setTargetRoleSkills] = useState('');
  const [isScanningCv, setIsScanningCv] = useState(false);
  const [cvResult, setCvResult] = useState<any>(null);

  const handleRunMatch = async (vacancyId: number): Promise<void> => {
    setIsMatching(true);
    try {
      const res = await fetch(`/app/ai/match/${vacancyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMatch(data);
      }
    } catch (e) {
      console.error('Match failed', e);
    } finally {
      setIsMatching(false);
    }
  };

  const handleAnalyzeSkillGap = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!mySkillsInput.trim() || !targetSkillsInput.trim()) return;

    setIsAnalyzingGap(true);
    try {
      const res = await fetch('/app/ai/skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          my_skills: mySkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
          target_skills: targetSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGapResult(data);
      }
    } catch (e) {
      console.error('Skill gap analysis failed', e);
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  const handleScanCv = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!cvText.trim()) return;

    setIsScanningCv(true);
    try {
      const res = await fetch('/app/ai/cv-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          cv_text: cvText,
          target_skills: targetRoleSkills ? targetRoleSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCvResult(data);
      }
    } catch (e) {
      console.error('CV review failed', e);
    } finally {
      setIsScanningCv(false);
    }
  };

  return (
    <AppLayout>
      <Head title="AI Career Assistant - Asisten Karier Cerdas Inklusif" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Career Assistant Powered by Gemini</span>
          </div>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Asisten Karier Ramah Disabilitas</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Kombinasi analisis kecerdasan buatan untuk mencocokkan keahlian Anda, mengevaluasi fasilitas aksesibilitas tempat kerja, dan meningkatkan kualitas CV Anda.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-emerald-800/50 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px] flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'bg-white text-slate-900 shadow'
                  : 'bg-emerald-900/60 text-white hover:bg-emerald-800'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              1. AI Job Matching ({savedMatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('skillGap')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px] flex items-center gap-2 ${
                activeTab === 'skillGap'
                  ? 'bg-white text-slate-900 shadow'
                  : 'bg-emerald-900/60 text-white hover:bg-emerald-800'
              }`}
            >
              <Zap className="h-4 w-4" />
              2. AI Skill Gap Analysis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cvReview')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px] flex items-center gap-2 ${
                activeTab === 'cvReview'
                  ? 'bg-white text-slate-900 shadow'
                  : 'bg-emerald-900/60 text-white hover:bg-emerald-800'
              }`}
            >
              <FileSearch className="h-4 w-4" />
              3. AI CV ATS Scanner
            </button>
          </div>
        </div>

        {/* TAB 1: AI JOB MATCHING */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Quick Match Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Uji Kecocokan dengan Lowongan Tertentu</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pilih salah satu lowongan aktif untuk melihat analisis kesesuaian kompetensi dan akomodasi tempat kerja Anda.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedVacancyId}
                  onChange={(e) => setSelectedVacancyId(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-sm min-h-[44px]"
                  aria-label="Pilih lowongan untuk dicocokkan"
                >
                  <option value="">-- Pilih Lowongan Pekerjaan --</option>
                  {activeVacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} ({v.company_profile.company_name}) - {v.work_model}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => selectedVacancyId && handleRunMatch(Number(selectedVacancyId))}
                  disabled={!selectedVacancyId || isMatching}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] px-6"
                >
                  {isMatching ? 'Menganalisis...' : 'Analisis Kecocokan'}
                </Button>
              </div>

              {currentMatch && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-4">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800 uppercase">Hasil Analisis AI</span>
                      <h3 className="text-xl font-extrabold text-emerald-950">
                        Skor Kecocokan: {currentMatch.match_percentage}%
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-xl bg-white px-3 py-1.5 text-center border border-emerald-100">
                        <span className="block text-[10px] text-slate-400">Kompetensi</span>
                        <span className="text-sm font-bold text-slate-800">{currentMatch.competency_score}%</span>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-1.5 text-center border border-emerald-100">
                        <span className="block text-[10px] text-slate-400">Aksesibilitas</span>
                        <span className="text-sm font-bold text-emerald-700">{currentMatch.accessibility_score}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">{currentMatch.summary}</p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-4 border border-emerald-100">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Poin Kesesuaian:
                      </h4>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {currentMatch.matching_points?.map((p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-emerald-100">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        Area Penyesuaian / Gap:
                      </h4>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {currentMatch.gaps?.length > 0 ? (
                          currentMatch.gaps.map((g: string, idx: number) => (
                            <li key={idx}>{g}</li>
                          ))
                        ) : (
                          <li>Tidak ada gap signifikan yang teridentifikasi.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Matches List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Rekomendasi Teratas Tersimpan ({savedMatches.length})</h2>

              {savedMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Belum ada riwayat pencocokan lowongan tersimpan. Gunakan dropdown di atas untuk memulai.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {savedMatches.map((m) => (
                    <div key={m.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                            {m.match_percentage}% Match
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{m.vacancy.title}</h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {m.vacancy.company_profile.company_name} • {m.vacancy.location} • {m.vacancy.work_model}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-1">{m.summary}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${m.vacancy.slug}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 min-h-[44px]"
                        >
                          Lihat Lowongan
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SKILL GAP ANALYSIS */}
        {activeTab === 'skillGap' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Analisis Kesenjangan Keterampilan (Skill Gap)</h2>
            <p className="text-xs text-slate-500">
              Masukkan keahlian yang Anda miliki dan bandingkan dengan kualifikasi pekerjaan yang ingin Anda tuju.
            </p>

            <form onSubmit={handleAnalyzeSkillGap} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="my-skills">Keahlian yang Anda Miliki (Pisahkan dengan koma)</Label>
                <Input
                  id="my-skills"
                  value={mySkillsInput}
                  onChange={(e) => setMySkillsInput(e.target.value)}
                  placeholder="Contoh: HTML, CSS, JavaScript, Screen Reader, Komunikasi Tertulis"
                  className="mt-2 min-h-[44px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="target-skills">Keahlian Target Lowongan (Pisahkan dengan koma)</Label>
                <Input
                  id="target-skills"
                  value={targetSkillsInput}
                  onChange={(e) => setTargetSkillsInput(e.target.value)}
                  placeholder="Contoh: JavaScript, React, TypeScript, Tailwind CSS, Git"
                  className="mt-2 min-h-[44px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isAnalyzingGap}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px]"
              >
                {isAnalyzingGap ? 'Menganalisis Gap...' : 'Analisis Kesenjangan Keterampilan'}
              </Button>
            </form>

            {gapResult && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Hasil Analisis Keterampilan</h3>
                  <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">
                    Skor: {gapResult.match_score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 block mb-2">Keterampilan yang Sudah Terpenuhi:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {gapResult.matched_skills?.map((s: string, i: number) => (
                        <span key={i} className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 block mb-2">Keterampilan yang Masih Kurang:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {gapResult.missing_skills?.map((s: string, i: number) => (
                        <span key={i} className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          - {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                    <Lightbulb className="h-4 w-4 text-emerald-700" />
                    Rekomendasi Langkah Belajar Ramah Aksesibilitas:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {gapResult.learning_recommendations?.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CV ATS SCANNER */}
        {activeTab === 'cvReview' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">AI CV & ATS Scanner</h2>
            <p className="text-xs text-slate-500">
              Periksa keramahan format CV Anda terhadap sistem pemindai ATS dan pembaca layar (screen reader).
            </p>

            <form onSubmit={handleScanCv} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="target-role-skills">Target Posisi / Kata Kunci Spesifik (Opsional)</Label>
                <Input
                  id="target-role-skills"
                  value={targetRoleSkills}
                  onChange={(e) => setTargetRoleSkills(e.target.value)}
                  placeholder="Contoh: Frontend, React, TypeScript"
                  className="mt-2 min-h-[44px]"
                />
              </div>

              <div>
                <Label htmlFor="cv-text-input">Tempel Teks Lengkap CV Anda di Sini</Label>
                <textarea
                  id="cv-text-input"
                  rows={8}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Tempelkan isi teks CV Anda (nama, keahlian, riwayat pendidikan, pengalaman kerja)..."
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3.5 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 leading-relaxed font-mono"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isScanningCv || cvText.length < 10}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px]"
              >
                {isScanningCv ? 'Memindai CV...' : 'Pindai Keterbacaan ATS & Aksesibilitas'}
              </Button>
            </form>

            {cvResult && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs text-slate-500">Kualitas Keterbacaan ATS</span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Nilai: {cvResult.formatting_grade} ({cvResult.ats_score}/100)
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 block mb-2">Kelebihan Format & Kata Kunci:</span>
                    <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                      {cvResult.strengths?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-white p-4 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 block mb-2">Saran Perbaikan Kata Kunci & Struktur:</span>
                    <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                      {cvResult.improvements?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    Tips Aksesibilitas & Keramahan Screen Reader:
                  </span>
                  <ul className="space-y-1.5 text-xs text-emerald-900 list-disc list-inside">
                    {cvResult.accessibility_tips?.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
