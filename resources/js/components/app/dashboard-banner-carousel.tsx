import { FormEvent, useEffect, useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';

export interface DashboardBannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  type: 'interactive' | 'image' | 'info';
  image_url: string | null;
  image_position?: string | null;
  image_scale?: number | null;
  link_url: string | null;
  link_target?: string;
  cta_text: string | null;
  search_placeholder: string | null;
  bg_gradient: string | null;
  text_color: 'dark' | 'light' | string;
  order: number;
}

interface DashboardBannerCarouselProps {
  banners?: DashboardBannerItem[];
  userName: string;
}

export function DashboardBannerCarousel({
  banners = [],
  userName,
}: DashboardBannerCarouselProps) {
  // Banner default jika tidak ada banner aktif dari database
  const defaultBanner: DashboardBannerItem = {
    id: 0,
    title: `Halo, ${userName || 'Sobat Profabel'}!`,
    subtitle: 'Terus semangat dalam mencari peluang karier terbaik bersama Profabel. Setiap langkahmu berarti.',
    type: 'interactive',
    image_url: null,
    link_url: null,
    cta_text: null,
    search_placeholder: 'Cari lowongan pekerjaan, posisi atau perusahaan',
    bg_gradient: 'blue',
    text_color: 'dark',
    order: 1,
  };

  const slides = banners && banners.length > 0 ? banners : [defaultBanner];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-play interval (5.5 detik) - berhenti saat kursor mouse di atas banner
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.get('/jobs', {
      search: keyword.trim() || undefined,
    });
  };

  // Helper gradient backgrounds
  const getGradientClass = (gradientName: string | null) => {
    switch (gradientName) {
      case 'indigo':
        return 'from-[#EEF2FF] via-[#E0E7FF] to-[#C7D2FE] border-[#C7D2FE]';
      case 'emerald':
        return 'from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0] border-[#A7F3D0]';
      case 'sunset':
        return 'from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] border-[#FED7AA]';
      case 'purple':
        return 'from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] border-[#E9D5FF]';
      case 'dark':
        return 'from-[#0B1E33] via-[#102B4B] to-[#1A3E66] border-[#102B4B] text-white';
      case 'blue':
      default:
        return 'from-[#EBF5FA] via-[#E1EFF6] to-[#D5E9F4] border-[#D0E5F0]';
    }
  };

  // Touch Swipe for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const activeSlide = slides[currentIndex] || slides[0];
  const isDarkSlide =
    activeSlide.type === 'image' ||
    activeSlide.bg_gradient === 'dark' ||
    activeSlide.text_color === 'light';

  return (
    <div
      className="relative group select-none w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container Banner Utama: Ukuran Tetap h-[240px], Tidak Berubah & Tidak Bergeser */}
      <div className="relative w-full h-[240px] overflow-hidden rounded-3xl border border-[#D0E5F0] shadow-xs bg-slate-900">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isActive
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* ==================== 1. TIPE GAMBAR / GIF ANIMASI (FULL BLEED COVER) ==================== */}
              {slide.type === 'image' ? (
                <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                  {slide.image_url ? (
                    slide.link_url ? (
                      <a
                        href={slide.link_url}
                        target={slide.link_target || '_self'}
                        rel={slide.link_target === '_blank' ? 'noopener noreferrer' : undefined}
                        className="block w-full h-full group/img cursor-pointer"
                      >
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          style={{
                            objectPosition: slide.image_position || '50% 50%',
                            transform: slide.image_scale && slide.image_scale > 100 ? `scale(${slide.image_scale / 100})` : undefined,
                            transformOrigin: slide.image_position || '50% 50%',
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                        {(slide.title || slide.subtitle) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col justify-end text-white">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                              {slide.title}
                            </h2>
                            {slide.subtitle && (
                              <p className="mt-1 text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl">
                                {slide.subtitle}
                              </p>
                            )}
                            {slide.cta_text && (
                              <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600/90 hover:bg-blue-600 px-3.5 py-1.5 rounded-xl w-fit shadow-xs">
                                <span>{slide.cta_text}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        )}
                      </a>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          style={{
                            objectPosition: slide.image_position || '50% 50%',
                            transform: slide.image_scale && slide.image_scale > 100 ? `scale(${slide.image_scale / 100})` : undefined,
                            transformOrigin: slide.image_position || '50% 50%',
                          }}
                          className="w-full h-full object-cover"
                        />
                        {(slide.title || slide.subtitle) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col justify-end text-white">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                              {slide.title}
                            </h2>
                            {slide.subtitle && (
                              <p className="mt-1 text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl">
                                {slide.subtitle}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                      Gambar banner tidak tersedia
                    </div>
                  )}
                </div>
              ) : (
                /* ==================== 2. TIPE INTERAKTIF & INFO DENGAN BACKGROUND GRADIEN ==================== */
                <div
                  className={`w-full h-full p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col justify-between bg-gradient-to-r ${getGradientClass(
                    slide.bg_gradient
                  )}`}
                >
                  {/* TIPE INTERAKTIF (SEARCH + GREETING) */}
                  {slide.type === 'interactive' && (
                    <div className="max-w-xl z-10">
                      <h1 className="text-2xl font-extrabold tracking-tight text-[#102B4B] sm:text-3xl line-clamp-1">
                        {slide.title || `Halo, ${userName}!`}
                      </h1>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#475569] sm:text-sm line-clamp-2">
                        {slide.subtitle ||
                          'Terus semangat dalam mencari peluang karier terbaik bersama Profabel. Setiap langkahmu berarti.'}
                      </p>

                      {/* Interactive Search Bar Form */}
                      <form
                        onSubmit={handleSearchSubmit}
                        className="mt-4 sm:mt-5 flex items-center rounded-2xl bg-[#0C2742] p-1.5 shadow-md transition-shadow hover:shadow-lg max-w-xl"
                      >
                        <Search className="ml-3.5 h-4 sm:h-5 w-4 sm:w-5 shrink-0 text-slate-300" />
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder={
                            slide.search_placeholder ||
                            'Cari lowongan pekerjaan, posisi atau perusahaan'
                          }
                          aria-label="Cari lowongan pekerjaan"
                          className="w-full bg-transparent px-3 py-1.5 sm:py-2 text-xs text-white placeholder:text-slate-300 focus:outline-none sm:text-sm"
                        />
                        <button
                          type="submit"
                          className="shrink-0 cursor-pointer rounded-xl bg-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-bold text-[#102B4B] transition hover:bg-slate-100 sm:text-sm shadow-xs"
                        >
                          Cari
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TIPE INFO / PENGUMUMAN DENGAN CTA */}
                  {slide.type === 'info' && (
                    <div className="max-w-xl z-10 space-y-2 sm:space-y-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#1769E0]/15 text-[#1769E0] border border-[#1769E0]/20 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Program & Rekomendasi</span>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#102B4B] leading-tight line-clamp-1">
                        {slide.title}
                      </h1>

                      {slide.subtitle && (
                        <p className="text-xs leading-relaxed text-[#475569] sm:text-sm line-clamp-2 max-w-lg">
                          {slide.subtitle}
                        </p>
                      )}

                      {/* Tombol CTA Aksi */}
                      {slide.link_url && (
                        <div className="pt-1">
                          {slide.link_url.startsWith('http') ? (
                            <a
                              href={slide.link_url}
                              target={slide.link_target || '_blank'}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-xl bg-[#0C2742] hover:bg-[#102B4B] text-white text-xs sm:text-sm font-bold shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>{slide.cta_text || 'Pelajari Lebih Lanjut'}</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <Link
                              href={slide.link_url}
                              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-xl bg-[#0C2742] hover:bg-[#102B4B] text-white text-xs sm:text-sm font-bold shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>{slide.cta_text || 'Pelajari Lebih Lanjut'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ==================== 3. KONTROL CAROUSEL (DOTS & COUNTER BADGE) PERSISTEN ==================== */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
            {/* Dots Pagination */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {slides.map((_, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setCurrentIndex(dot)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === dot
                      ? isDarkSlide
                        ? 'w-6 bg-white shadow-sm'
                        : 'w-6 bg-[#0C2742] shadow-xs'
                      : isDarkSlide
                      ? 'w-2 bg-white/40 hover:bg-white/75 backdrop-blur-xs'
                      : 'w-2 bg-[#94A3B8]/50 hover:bg-[#94A3B8]'
                  }`}
                  aria-label={`Slide ${dot + 1} dari ${slides.length}`}
                />
              ))}
            </div>

            {/* Slide Index Badge */}
            <div
              className={`pointer-events-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs transition-colors duration-300 ${
                isDarkSlide
                  ? 'bg-black/50 text-white/95 border-white/20 backdrop-blur-xs'
                  : 'bg-white/80 text-slate-600 border-slate-200/80 backdrop-blur-xs'
              }`}
            >
              {currentIndex + 1} / {slides.length}
            </div>
          </div>
        )}
      </div>

      {/* Navigasi Panah Kiri / Kanan (Hover di Desktop) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 ${
              isDarkSlide
                ? 'bg-black/50 hover:bg-black/75 text-white border border-white/25 backdrop-blur-xs'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-[#102B4B] border border-slate-200/90'
            }`}
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 ${
              isDarkSlide
                ? 'bg-black/50 hover:bg-black/75 text-white border border-white/25 backdrop-blur-xs'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-[#102B4B] border border-slate-200/90'
            }`}
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
