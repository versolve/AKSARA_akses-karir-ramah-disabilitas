import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck,
  Globe,
  HeartHandshake,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
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
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: FormEvent): void => {
    e.preventDefault();
    router.get('/jobs', {
      search: keyword || undefined,
    });
  };

  const getUserDashboardUrl = (): string => {
    if (!user) return '/login';
    if (user.role === 'pelamar') return '/app/dashboard';
    if (user.role === 'perusahaan') return '/company/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <>
      <Head title="AKSARA - Portal Akses Karier Ramah Disabilitas" />
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <AppLogo />
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/jobs"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-slate-100 min-h-[44px]"
              >
                <Search className="h-4 w-4" />
                Katalog Lowongan
              </Link>

              {user ? (
                <Link
                  href={getUserDashboardUrl()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 min-h-[44px]"
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 min-h-[44px]"
                  >
                    Daftar Sekarang
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
              {/* SDG Badges */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <Globe className="h-3.5 w-3.5" />
                  Mendukung SDG 8 (Pekerjaan Layak) & SDG 10 (Pengurangan Kesenjangan)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Standar Aksesibilitas WCAG 2.1
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Karier Inklusif Dimulai dari Sini.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                AKSARA mempertemukan pencari kerja penyandang disabilitas dengan mitra perusahaan yang telah menyediakan akomodasi dan fasilitas kerja aksesibel.
              </p>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleSearch}
                className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-300 bg-white p-2.5 shadow-md sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari keahlian, posisi kerja, atau lokasi (contoh: React, Bandung, Remote)..."
                    aria-label="Cari lowongan pekerjaan"
                    className="border-none pl-10 text-sm shadow-none focus-visible:ring-0 min-h-[44px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 min-h-[44px]"
                >
                  Cari Lowongan
                </Button>
              </form>

              {/* Quick Navigation Pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span>Pencarian Cepat:</span>
                <Link
                  href="/jobs?work_model=remote"
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                >
                  Kerja Remote
                </Link>
                <Link
                  href="/jobs?accessibility=screen_reader_software"
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                >
                  Ramah Netra
                </Link>
                <Link
                  href="/jobs?accessibility=ramp_access"
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                >
                  Akses Kursi Roda
                </Link>
                <Link
                  href="/jobs?accessibility=written_communication"
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                >
                  Komunikasi Tertulis
                </Link>
              </div>
            </div>
          </section>

          {/* 3 Core Pillars Section */}
          <section className="border-b border-slate-200 bg-slate-50 py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Prinsip Desain Inklusif
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Tiga Pilar Ekosistem AKSARA
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                  Dirancang dari awal untuk menghilangkan hambatan pencarian kerja bagi kawan disabilitas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Pillar 1 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 mb-4">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Akomodasi Tempat Kerja Nyata
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Setiap lowongan memuat rincian fasilitas aksesibilitas (ram, lift, toilet difabel, software pembaca layar, interpreter BISINDO) yang telah terverifikasi.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Career Assistant Cerdas
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Kecerdasan buatan bertenaga Google Gemini mengevaluasi kecocokan kompetensi dan akomodasi, memetakan kesenjangan skill, dan menguji keramahan CV ATS.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Transparansi Seleksi & Pesan HR
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Pantau tahapan lamaran dengan visual stepper status yang jelas dan jalin koordinasi langsung dengan HR melalui percakapan pesan in-app.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility Categories Grid */}
          <section className="border-b border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-end">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Jelajahi Berdasarkan Kebutuhan
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Kategori Akomodasi Tempat Kerja
                  </h2>
                </div>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline min-h-[44px]"
                >
                  Lihat Seluruh Lowongan →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ACCESSIBILITY_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.key}
                    href={`/jobs?accessibility=${cat.key}`}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/40"
                  >
                    <div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-slate-200 inline-block mb-3">
                        {cat.count}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{cat.label}</h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      Buka Lowongan <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Join CTA Section */}
          <section className="bg-slate-900 py-16 text-white">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Buka Peluang Kerja Tanpa Batas Hari Ini
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
                Apakah Anda pencari kerja penyandang disabilitas atau perusahaan yang siap membuka kesempatan inklusif, AKSARA siap mendampingi setiap langkah Anda.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-emerald-500 min-h-[44px] flex items-center"
                >
                  Daftar sebagai Pencari Kerja
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700 min-h-[44px] flex items-center"
                >
                  Daftar sebagai Mitra Perusahaan
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Minimalist Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">AKSARA</span>
              <span>• Akses Karier Ramah Disabilitas</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/jobs" className="hover:text-slate-900">
                Katalog Lowongan
              </Link>
              <Link href="/login" className="hover:text-slate-900">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-slate-900">
                Daftar
              </Link>
            </div>

            <p>© 2026 AKSARA. Pemrograman Web Enterprise.</p>
          </div>
        </footer>

        {/* Global Accessibility Toolbar */}
        <AccessibilityToolbar />
      </div>
    </>
  );
}
