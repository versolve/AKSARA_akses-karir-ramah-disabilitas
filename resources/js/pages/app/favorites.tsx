import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';

interface CompanyProfile {
  id: number;
  company_name: string;
  logo_url?: string;
  is_approved?: boolean;
}

interface AccessibilityTag {
  id: number;
  accommodation_type: string;
  notes?: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  job_type: string;
  work_model: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  is_salary_public?: boolean;
  status: string;
  deadline?: string;
  created_at: string;
  company_profile?: CompanyProfile;
  accessibilities?: AccessibilityTag[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedFavorites {
  data: VacancyItem[];
  current_page: number;
  last_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props {
  favorites: PaginatedFavorites;
  filters: {
    search?: string;
    status?: string;
  };
  stats: {
    total: number;
    active: number;
    closing_soon: number;
  };
}

export default function SeekerFavorites({
  favorites,
  filters,
  stats,
}: Props): ReactElement {
  const [keyword, setKeyword] = useState(filters.search || '');
  const [activeStatus, setActiveStatus] = useState(filters.status || 'all');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleSearch = (e: FormEvent): void => {
    e.preventDefault();
    router.get(
      '/app/favorites',
      {
        search: keyword || undefined,
        status: activeStatus !== 'all' ? activeStatus : undefined,
      },
      { preserveState: true }
    );
  };

  const handleFilterStatus = (status: string): void => {
    setActiveStatus(status);
    router.get(
      '/app/favorites',
      {
        search: keyword || undefined,
        status: status !== 'all' ? status : undefined,
      },
      { preserveState: true }
    );
  };

  const handleRemoveFavorite = (e: React.MouseEvent, vacancyId: number): void => {
    e.stopPropagation();
    e.preventDefault();
    if (removingId === vacancyId) return;

    setRemovingId(vacancyId);
    router.delete(`/app/favorites/${vacancyId}`, {
      preserveScroll: true,
      onFinish: () => setRemovingId(null),
    });
  };

  const formatRupiah = (val?: number): string => {
    if (!val) return '0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isDeadlineNear = (deadlineStr?: string): boolean => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const isExpired = (deadlineStr?: string, status?: string): boolean => {
    if (status && status !== 'active') return true;
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    return deadline < now;
  };

  return (
    <AppLayout>
      <Head title="Lowongan Favorit - Profabel" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
              Lowongan Favorit Saya
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Simpan dan pantau lowongan kerja impian yang ramah disabilitas untuk dilamar kemudian.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#123B5D] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#0C2742] shrink-0"
          >
            <Compass className="h-4 w-4" />
            <span>Jelajahi Lowongan Lainnya</span>
          </Link>
        </div>

        {/* 3 Summary Stats Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#64748B]">Total Lowongan Disimpan</span>
              <div className="mt-1 text-2xl font-black text-[#102B4B]">{stats.total}</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF5FA] text-[#123B5D]">
              <Bookmark className="h-6 w-6 fill-[#123B5D]" />
            </div>
          </div>

          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#64748B]">Masih Terbuka</span>
              <div className="mt-1 text-2xl font-black text-[#16A36B]">{stats.active}</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#16A36B]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#64748B]">Segera Ditutup (≤ 7 Hari)</span>
              <div className="mt-1 text-2xl font-black text-[#D97706]">{stats.closing_soon}</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari lowongan favorit berdasarkan posisi, perusahaan, atau kota..."
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-2.5 text-xs sm:text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/20 outline-none transition min-h-[44px]"
              />
            </form>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-2xl bg-[#1769E0] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#1254B5] transition cursor-pointer min-h-[44px]"
            >
              Cari
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F1F5F9] text-xs">
            <span className="text-slate-400 font-semibold mr-1">Status:</span>
            {[
              { id: 'all', label: 'Semua Favorit' },
              { id: 'active', label: 'Masih Terbuka' },
              { id: 'closing_soon', label: 'Segera Berakhir' },
              { id: 'expired', label: 'Sudah Ditutup' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterStatus(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 font-bold transition cursor-pointer select-none ${
                  activeStatus === tab.id
                    ? 'bg-[#123B5D] text-white shadow-xs'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#102B4B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Favorite Vacancies Grid */}
        {favorites.data.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-[#1769E0] shadow-xs mb-4">
              <Bookmark className="h-10 w-10 text-[#1769E0]" />
            </div>
            <h3 className="text-lg font-extrabold text-[#102B4B]">
              Belum Ada Lowongan Favorit
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
              {filters.search || filters.status !== 'all'
                ? 'Tidak ada lowongan favorit yang sesuai dengan kriteria filter pencarian Anda.'
                : 'Tandai lowongan kerja yang Anda sukai dengan menekan ikon pita bookmark saat mencari pekerjaan.'}
            </p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#123B5D] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#0C2742]"
              >
                <Search className="h-4 w-4" />
                <span>Jelajahi Lowongan Pekerjaan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {favorites.data.map((job) => {
              const expired = isExpired(job.deadline, job.status);
              const closingSoon = !expired && isDeadlineNear(job.deadline);
              const companyName = job.company_profile?.company_name || 'Perusahaan Mitra';
              const companyInitial = companyName.substring(0, 2).toUpperCase();

              return (
                <div
                  key={job.id}
                  className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#1769E0]/40 hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Company Info + Remove Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EBF5FA] border border-blue-100 text-[#123B5D] font-extrabold text-xs shrink-0 shadow-xs">
                          {companyInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#64748B] truncate">
                            {companyName}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Terverifikasi
                          </span>
                        </div>
                      </div>

                      {/* Remove Bookmark Action */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFavorite(e, job.id)}
                        disabled={removingId === job.id}
                        title="Hapus dari daftar favorit"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition shrink-0 cursor-pointer disabled:opacity-50"
                        aria-label={`Hapus ${job.title} dari favorit`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Vacancy Title */}
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="mt-3 block group-hover:text-[#1769E0] transition"
                    >
                      <h2 className="text-base font-extrabold text-[#102B4B] leading-snug line-clamp-2">
                        {job.title}
                      </h2>
                    </Link>

                    {/* Metadata Tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        {job.work_model}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1">
                        {job.job_type}
                      </span>
                    </div>

                    {/* Salary */}
                    <div className="mt-3 text-xs font-bold text-[#102B4B]">
                      {job.is_salary_public && job.salary_min && job.salary_max ? (
                        <span>
                          {formatRupiah(job.salary_min)} - {formatRupiah(job.salary_max)}
                          <span className="text-[10px] font-normal text-[#64748B]"> / bln</span>
                        </span>
                      ) : (
                        <span className="text-[#64748B] font-semibold">Gaji Kompetitif</span>
                      )}
                    </div>

                    {/* Accessibility Badges */}
                    {job.accessibilities && job.accessibilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.accessibilities.slice(0, 3).map((acc) => (
                          <span
                            key={acc.id}
                            className="rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-[#1769E0]"
                          >
                            {acc.accommodation_type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Deadline + Apply Button */}
                  <div className="mt-5 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                    <div>
                      {expired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                          <AlertCircle className="h-3 w-3" />
                          Lowongan Ditutup
                        </span>
                      ) : closingSoon ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <Clock className="h-3 w-3" />
                          Segera Berakhir
                        </span>
                      ) : job.deadline ? (
                        <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Batas: {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Buka Rekrutmen
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/jobs/${job.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#123B5D] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0C2742] shrink-0"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Links */}
        {favorites.last_page > 1 && (
          <div className="flex items-center justify-center gap-1 pt-4">
            {favorites.links.map((link, idx) => {
              if (!link.url) {
                return (
                  <span
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400"
                  />
                );
              }
              return (
                <Link
                  key={idx}
                  href={link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition select-none ${
                    link.active
                      ? 'bg-[#123B5D] text-white shadow-xs'
                      : 'border border-[#E2E8F0] bg-white text-[#102B4B] hover:bg-slate-50'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
