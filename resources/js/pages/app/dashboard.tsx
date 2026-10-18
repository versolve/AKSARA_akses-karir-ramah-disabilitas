import { Button } from '@/components/ui/button';
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
  Sparkles,
  Target,
  Trash2,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';

interface StatsData {
  total_applied: number;
  in_review: number;
  interview: number;
  hired: number;
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
  company_profile: {
    company_name: string;
    industry?: string;
  };
  accessibilities: Array<{
    id: number;
    accommodation_type: string;
  }>;
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
  stats: StatsData;
  recentApplications: ApplicationItem[];
  recommendedJobs: VacancyItem[];
  unreadNotificationsCount: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: 'Lamaran Dikirim', bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
  reviewed: { label: 'Ditinjau HR', bg: 'bg-[#EBF5FA]', text: 'text-[#1674D1]' },
  interview: { label: 'Interview', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
  hired: { label: 'Diterima', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
  rejected: { label: 'Ditolak', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
};

export default function SeekerDashboard({
  seeker,
  stats,
  recentApplications,
  recommendedJobs,
}: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as any).auth;
  const user = auth?.user;
  const userName = user?.name || 'Kawan Aksara';

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

  const completionPercent = seeker.profile_completed_percentage || 80;

  return (
    <AppLayout>
      <Head title="Beranda Pelamar - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Main Grid: Left Column (Hero + Recommendations + Tips) & Right Column (Profile + Activities + Notice) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Hero Greeting Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EBF5FA] via-[#E1EFF6] to-[#D5E9F4] p-6 sm:p-8 shadow-xs border border-[#D0E5F0]">
              <div className="max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
                  Halo, {userName}!
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Terus semangat dalam mencari peluang karier terbaik bersama AKSARA. Setiap langkahmu berarti.
                </p>

                {/* Search Bar */}
                <form
                  onSubmit={handleSearch}
                  className="mt-6 flex items-center rounded-2xl bg-[#0C2742] p-1.5 shadow-md"
                >
                  <Search className="ml-3.5 h-5 w-5 text-slate-300 shrink-0" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari lowongan pekerjaan, posisi atau perusahaan"
                    aria-label="Cari lowongan pekerjaan"
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-[#102B4B] hover:bg-slate-100 transition shrink-0 cursor-pointer"
                  >
                    Cari
                  </button>
                </form>

                {/* Carousel Dots */}
                <div className="mt-5 flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((dot) => (
                    <button
                      key={dot}
                      type="button"
                      onClick={() => setActiveDot(dot)}
                      className={`h-2 rounded-full transition-all ${
                        activeDot === dot ? 'w-5 bg-[#0C2742]' : 'w-2 bg-[#94A3B8]/50 hover:bg-[#94A3B8]'
                      }`}
                      aria-label={`Slide ${dot + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Lowongan Rekomendasi Untukmu Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#102B4B]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#102B4B]">
                    Lowongan Rekomendasi Untukmu
                  </h2>
                </div>
                <Link
                  href="/jobs"
                  className="text-xs font-semibold text-[#1674D1] hover:underline flex items-center gap-1"
                >
                  Lihat Semua Lowongan →
                </Link>
              </div>

              {/* Vacancy Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs hover:border-[#20B8C1] transition duration-200"
                  >
                    <div>
                      {/* Company Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-bold text-sm shrink-0">
                            {job.company_profile.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs text-[#102B4B] line-clamp-1">
                                {job.company_profile.company_name}
                              </span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1674D1] shrink-0" />
                            </div>
                            <span className="text-[10px] text-[#64748B] line-clamp-1">
                              {job.company_profile.industry ?? 'Teknologi Informasi'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-[#123B5D] p-1"
                          aria-label="Simpan lowongan"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Job Title */}
                      <h3 className="mt-3 font-bold text-sm text-[#102B4B] line-clamp-2">
                        <Link href={`/jobs/${job.slug}`} className="hover:text-[#007F96]">
                          {job.title}
                        </Link>
                      </h3>

                      {/* Location & Model */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </span>
                        <span className="font-semibold text-slate-700 uppercase text-[10px]">
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
                    <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                        <Clock className="h-3 w-3" />
                        2 hari yang lalu
                      </span>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="rounded-xl bg-[#123B5D] hover:bg-[#0C2742] px-3.5 py-1.5 text-xs font-bold text-white transition min-h-[36px] flex items-center justify-center cursor-pointer"
                      >
                        Lamar Sekarang
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Tips Karier Untukmu Section */}
            <div className="rounded-3xl border border-[#D0E5F0] bg-gradient-to-r from-[#EBF5FA] to-[#E1EFF6] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#007F96] shadow-xs border border-white shrink-0">
                  <Target className="h-9 w-9 text-[#007F96]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#102B4B]">
                      <span className="h-2 w-2 rounded-full bg-[#1674D1]" />
                      Tips Karier untukmu
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#102B4B]">
                    5 Tips Membuat CV yang Ramah Disabilitas
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Tunjukkan keahlian dan potensimu dengan cara yang tepat
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="rounded-lg bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#1674D1] shadow-2xs">
                      Karier
                    </span>
                    <span className="text-[11px] text-[#64748B]">5 menit baca</span>
                  </div>
                </div>
              </div>

              {/* Arrow navigation buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs hover:bg-slate-50 transition border border-[#E2E8F0]"
                  aria-label="Tips sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs hover:bg-slate-50 transition border border-[#E2E8F0]"
                  aria-label="Tips selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Profil Saya Card */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h2 className="font-bold text-sm text-[#102B4B]">Profil Saya</h2>
                <Link href="/app/profile" className="text-xs font-semibold text-[#1674D1] hover:underline">
                  Lihat profil →
                </Link>
              </div>

              {/* Avatar & User Details */}
              <div className="mt-4 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#123B5D] text-white font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                      userName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0C2742] hover:bg-[#1674D1] text-white border-2 border-white shadow-xs transition cursor-pointer disabled:opacity-50"
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
                  <span className="text-[10px] text-[#1674D1] font-semibold mt-1">Mengompres & mengunggah...</span>
                )}

                {user?.avatar && !isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    className="text-[10px] text-rose-600 hover:underline mt-1 flex items-center gap-0.5"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    Hapus foto
                  </button>
                )}

                <h3 className="mt-2 font-bold text-base text-[#102B4B]">{userName}</h3>
                <span className="text-xs text-[#64748B]">Pelamar</span>
              </div>

              {/* Profile Completeness Bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#102B4B]">Kelengkapan Profil</span>
                  <span className="text-[#102B4B]">{completionPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#123B5D] transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Profile Checklist */}
              <div className="mt-4 space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123B5D] text-white shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="font-medium">Data Diri</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123B5D] text-white shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="font-medium">Pendidikan</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123B5D] text-white shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="font-medium">Pengalaman Kerja</span>
                </div>

                <Link
                  href="/app/accessibility-profile"
                  className="flex items-center gap-2 text-[#64748B] hover:text-[#1674D1] group pt-0.5"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E2E8F0] text-slate-600 group-hover:bg-[#123B5D] group-hover:text-white transition shrink-0">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Kebutuhan Aksesibilitas</span>
                </Link>
              </div>
            </div>

            {/* 2. Aktivitas Lamaran Card */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#102B4B]" />
                  <h2 className="font-bold text-sm text-[#102B4B]">Aktivitas Lamaran</h2>
                </div>
                <Link href="/app/applications" className="text-xs font-semibold text-[#1674D1] hover:underline">
                  Lihat semua →
                </Link>
              </div>

              {/* Summary 3 Tiles */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#EBF5FA] p-2.5">
                  <div className="text-xl font-extrabold text-[#123B5D]">{stats.total_applied}</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 leading-tight">Lamaran diproses</div>
                </div>
                <div className="rounded-2xl bg-[#ECFDF5] p-2.5">
                  <div className="text-xl font-extrabold text-[#16A36B]">{stats.interview}</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 leading-tight">Interview terjadwal</div>
                </div>
                <div className="rounded-2xl bg-[#F3E8FF] p-2.5">
                  <div className="text-xl font-extrabold text-[#7E22CE]">{stats.in_review}</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 leading-tight">Perubahan status</div>
                </div>
              </div>

              {/* Lamaran Terbaru List */}
              <div className="mt-5">
                <h3 className="font-bold text-xs text-[#102B4B] mb-2.5">Lamaran Terbaru</h3>

                {recentApplications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada lamaran terkirim.</p>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">
                    {recentApplications.slice(0, 3).map((app) => {
                      const cfg = STATUS_CONFIG[app.status] || {
                        label: app.status,
                        bg: 'bg-slate-100',
                        text: 'text-slate-700',
                      };

                      return (
                        <Link
                          key={app.id}
                          href="/app/applications"
                          className="flex items-center justify-between py-2.5 hover:bg-slate-50 rounded-xl px-1.5 transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF5FA] text-[#123B5D] font-bold text-xs shrink-0">
                              {app.vacancy.company_profile.company_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-[#102B4B] truncate group-hover:text-[#1674D1]">
                                {app.vacancy.title}
                              </h4>
                              <p className="text-[10px] text-[#64748B] truncate">
                                {app.vacancy.company_profile.company_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${cfg.bg} ${cfg.text}`}>
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

            {/* 3. Informasi Penting Card */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
                <Bell className="h-4 w-4 text-[#102B4B]" />
                <h2 className="font-bold text-sm text-[#102B4B]">Informasi Penting</h2>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#123B5D] shadow-2xs border border-[#E2E8F0] shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#102B4B]">Maintenance Sistem</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5 leading-relaxed">
                    AKSARA akan melakukan pemeliharaan server berkala pada tanggal 25 Oktober 2026 pukul 22.00 - 23.00 WIB.
                  </p>
                  <span className="inline-block mt-2 rounded bg-amber-100 text-amber-800 font-bold px-2 py-0.5 text-[9px]">
                    Pemberitahuan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Career Assistant Pill (matches Reference) */}
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
