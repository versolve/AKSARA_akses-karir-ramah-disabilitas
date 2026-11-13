import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import {
  Accessibility,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';

const ACCESSIBILITY_CATEGORIES = [
  {
    key: 'remote_option',
    label: 'Kerja Remote (100% WFH)',
    count: 'Lowongan Fleksibel',
    description: 'Bekerja penuh dari rumah tanpa kendala mobilitas fisik.',
  },
  {
    key: 'screen_reader_software',
    label: 'Ramah Screen Reader',
    count: 'Disabilitas Netra',
    description: 'Dokumen & alur kerja teruji ramah software NVDA/JAWS.',
  },
  {
    key: 'ramp_access',
    label: 'Ram & Akses Kursi Roda',
    count: 'Disabilitas Fisik',
    description: 'Kantor dengan ram landai, lift prioritas, dan toilet khusus.',
  },
  {
    key: 'written_communication',
    label: 'Komunikasi Kerja Tertulis',
    count: 'Disabilitas Rungu / Wicara',
    description: 'Koordinasi kerja berbasis chat, email, dan teks tanpa telepon.',
  },
];

export default function Welcome(): ReactElement {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: FormEvent): void => {
    e.preventDefault();
    router.get('/jobs', {
      search: keyword || undefined,
    });
  };

  return (
    <>
      <Head title="Profabel - Portal Akses Karier Ramah Disabilitas" />
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#EBF2FF] selection:text-[#1D4ED8]">
        {/* Header Konsisten Pelamar / Platform */}
        <AppHeader />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-white via-[#FAFDFE] to-white">
            {/* Ambient Background Gradient Glows */}
            <div className="pointer-events-none absolute -top-24 right-0 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-blue-100/60 via-sky-50/40 to-transparent blur-3xl -z-10" />
            <div className="pointer-events-none absolute top-1/2 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-blue-50/50 to-transparent blur-3xl -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
                {/* Left Column: Hero Copy + CTA Buttons */}
                <div className="lg:col-span-7">
                  {/* Pill Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF2FF] px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8]">
                    <Users className="h-3.5 w-3.5" />
                    <span>Platform Rekrutmen Inklusif</span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="mt-5 text-4xl font-black tracking-tight text-[#0B1528] sm:text-5xl lg:text-[56px] leading-[1.12]">
                    Kesempatan Kerja Setara <br className="hidden sm:inline" />
                    untuk <span className="text-[#1D64EC]">Semua Talenta</span>
                  </h1>

                  {/* Subtitle Description */}
                  <p className="mt-6 max-w-xl text-base text-[#475569] sm:text-lg leading-relaxed">
                    Profabel menghubungkan perusahaan dengan talenta terbaik, termasuk penyandang disabilitas, melalui proses rekrutmen yang inklusif, adil, dan mudah diakses.
                  </p>

                  {/* Hero CTA Buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B1528] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#15233D] transition min-h-[44px]"
                    >
                      <Search className="h-4 w-4" />
                      <span>Cari Lowongan</span>
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2.5 rounded-xl border border-[#0B1528] bg-white px-7 py-3.5 text-sm font-bold text-[#0B1528] hover:bg-slate-50 transition min-h-[44px]"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Daftarkan Perusahaan</span>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Hero 3D Graphic */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-[460px] lg:max-w-[540px]">
                    <img
                      src="/images/hero-illustration.png"
                      alt="Ilustrasi Profabel - Kesempatan Kerja Setara untuk Semua Talenta"
                      className="w-full h-auto object-contain select-none drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Floating 3-Features Banner Card */}
              <div className="mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl border border-slate-100/90 bg-white p-6 sm:p-8 shadow-[0_15px_50px_-10px_rgba(20,50,90,0.07)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Item 1: Inklusif */}
                  <div className="flex items-center gap-4.5 pt-4 md:pt-0">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B1B4A]">
                      <Accessibility className="size-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[#0B1528]">
                        Inklusif
                      </h2>
                      <p className="mt-1 text-sm font-medium text-[#475569] leading-snug">
                        Kesempatan kerja tanpa diskriminasi.
                      </p>
                    </div>
                  </div>

                  {/* Item 2: Terpercaya */}
                  <div className="flex items-center gap-4.5 pt-4 md:pt-0 md:pl-8">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B1B4A]">
                      <ShieldCheck className="size-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[#0B1528]">
                        Terpercaya
                      </h2>
                      <p className="mt-1 text-sm font-medium text-[#475569] leading-snug">
                        Proses rekrutmen yang aman dan transparan.
                      </p>
                    </div>
                  </div>

                  {/* Item 3: Mudah Digunakan */}
                  <div className="flex items-center gap-4.5 pt-4 md:pt-0 md:pl-8">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B1B4A]">
                      <Zap className="size-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[#0B1528]">
                        Mudah Digunakan
                      </h2>
                      <p className="mt-1 text-sm font-medium text-[#475569] leading-snug">
                        Akses praktis untuk pelamar dan perusahaan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Search & Filter Section */}
          <section className="border-y border-slate-100 bg-[#F8FAFD] py-14 sm:py-18">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
              {/* SDG & WCAG Badges */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-[#1D4ED8]">
                  <Globe className="h-3.5 w-3.5" />
                  Mendukung SDG 8 (Pekerjaan Layak) & SDG 10 (Pengurangan Kesenjangan)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1D64EC]" />
                  Standar Aksesibilitas WCAG 2.1
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1528] tracking-tight">
                Temukan Peluang yang Sesuai dengan Kebutuhan Anda
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
                Cari lowongan dengan akomodasi tempat kerja spesifik untuk mendukung produktivitas maksimal Anda.
              </p>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleSearch}
                className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-md sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari keahlian, posisi, atau lokasi (contoh: React, Bandung, Remote)..."
                    aria-label="Cari lowongan pekerjaan"
                    className="border-none pl-10 text-sm shadow-none focus-visible:ring-0 min-h-[44px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#0B1528] hover:bg-[#15233D] text-white font-bold px-6 min-h-[44px] rounded-xl"
                >
                  Cari Lowongan
                </Button>
              </form>

              {/* Quick Navigation Pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="font-medium">Pencarian Cepat:</span>
                <Link
                  href="/jobs?work_model=remote"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:border-[#1D64EC] hover:text-[#1D64EC] transition"
                >
                  Kerja Remote
                </Link>
                <Link
                  href="/jobs?accessibility=screen_reader_software"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:border-[#1D64EC] hover:text-[#1D64EC] transition"
                >
                  Ramah Netra
                </Link>
                <Link
                  href="/jobs?accessibility=ramp_access"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:border-[#1D64EC] hover:text-[#1D64EC] transition"
                >
                  Akses Kursi Roda
                </Link>
                <Link
                  href="/jobs?accessibility=written_communication"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:border-[#1D64EC] hover:text-[#1D64EC] transition"
                >
                  Komunikasi Tertulis
                </Link>
              </div>
            </div>
          </section>

          {/* Accessibility Categories Grid */}
          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 mb-10 sm:flex-row sm:items-end">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                    Jelajahi Berdasarkan Kebutuhan
                  </span>
                  <h2 className="mt-1 text-2xl font-black text-[#0B1528] sm:text-3xl">
                    Kategori Akomodasi Tempat Kerja
                  </h2>
                </div>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1D64EC] hover:underline min-h-[44px]"
                >
                  <span>Lihat Seluruh Lowongan</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {ACCESSIBILITY_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.key}
                    href={`/jobs?accessibility=${cat.key}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-[#1D64EC] hover:shadow-md"
                  >
                    <div>
                      <span className="rounded-full bg-[#EBF2FF] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8] inline-block mb-3.5">
                        {cat.count}
                      </span>
                      <h3 className="text-base font-bold text-[#0B1528] group-hover:text-[#1D64EC] transition">
                        {cat.label}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <span className="mt-5 text-xs font-bold text-[#1D64EC] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Buka Lowongan <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* AI Career Assistant Feature Spotlight */}
          <section className="border-t border-slate-100 bg-[#FAFDFE] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 p-8 sm:p-12 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/70 px-3.5 py-1.5 text-xs font-bold text-[#1D4ED8] mb-4">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Bertenaga Google Gemini AI</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0B1528] tracking-tight">
                      AI Career Assistant: Panduan Karier Inklusif Anda
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      Optimalkan perjalanan karier Anda dengan analisis otomatis kecocokan kompetensi, pemetaan kesenjangan keahlian, dan audit keramahan CV ATS ramah disabilitas.
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <div className="font-bold text-[#0B1528] text-sm">Job Matching</div>
                        <p className="text-xs text-slate-500 mt-1">Skor kompetensi dan akomodasi kerja.</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <div className="font-bold text-[#0B1528] text-sm">Skill Gap Analysis</div>
                        <p className="text-xs text-slate-500 mt-1">Rekomendasi belajar terarah.</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <div className="font-bold text-[#0B1528] text-sm">CV ATS Review</div>
                        <p className="text-xs text-slate-500 mt-1">Audit keyword & keramahan ATS.</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Link
                        href="/app/ai-assistant"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#15233D] transition min-h-[44px]"
                      >
                        <Bot className="h-4 w-4" />
                        <span>Coba AI Career Assistant</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#1D64EC]">
                            <Sparkles className="size-4" />
                          </div>
                          <span className="font-bold text-xs text-slate-800">Skor Kecocokan AI</span>
                        </div>
                        <span className="text-xs font-black text-[#1D64EC] bg-blue-50 px-2 py-0.5 rounded-full">92% Cocok</span>
                      </div>
                      <div className="mt-4 space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Kecocokan Kompetensi</span>
                            <span className="font-bold text-slate-800">95%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1D64EC] rounded-full" style={{ width: '95%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Kesesuaian Akomodasi</span>
                            <span className="font-bold text-slate-800">90%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '90%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Join CTA Section */}
          <section className="bg-[#0B1528] py-16 sm:py-20 text-white">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-black sm:text-4xl tracking-tight">
                Buka Peluang Kerja Tanpa Batas Hari Ini
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Apakah Anda pencari kerja penyandang disabilitas atau perusahaan yang siap membuka kesempatan inklusif, Profabel hadir mendampingi setiap langkah Anda.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#1D64EC] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition min-h-[44px] flex items-center"
                >
                  Daftar sebagai Pencari Kerja
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-7 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 transition min-h-[44px] flex items-center"
                >
                  Daftar sebagai Mitra Perusahaan
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Minimalist Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">Profabel</span>
              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-600">Portal Akses Karier Ramah Disabilitas</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <Link href="/jobs" className="hover:text-slate-900 transition">
                Katalog Lowongan
              </Link>
              <Link href="/app/ai-assistant" className="hover:text-slate-900 transition">
                AI Career Assistant
              </Link>
              <Link href="/login" className="hover:text-slate-900 transition">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-slate-900 transition">
                Daftar
              </Link>
            </div>

            <p>© 2026 Profabel. Pemrograman Web Enterprise.</p>
          </div>
        </footer>

        {/* Global Accessibility Toolbar */}
        <AccessibilityToolbar />
      </div>
    </>
  );
}
