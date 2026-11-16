import { FormEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crop,
  Crosshair,
  Eye,
  ExternalLink,
  Film,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Link2,
  Maximize2,
  MousePointerClick,
  Move,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react';

interface BannerData {
  id: number;
  title: string;
  subtitle: string | null;
  type: 'interactive' | 'image' | 'info';
  image_path: string | null;
  image_url: string | null;
  display_image_url: string | null;
  image_position?: string | null;
  image_scale?: number | null;
  link_url: string | null;
  link_target: string;
  cta_text: string | null;
  search_placeholder: string | null;
  bg_gradient: string | null;
  text_color: 'dark' | 'light';
  target_role: string;
  order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface BannerStats {
  total: number;
  active: number;
  image_gif: number;
  interactive: number;
  info: number;
}

interface GradientOption {
  id: string;
  label: string;
  class: string;
}

interface AdminBannersPageProps {
  banners: {
    data: BannerData[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  stats: BannerStats;
  filters: {
    search?: string;
    type?: string;
    status?: string;
  };
  availableGradients: GradientOption[];
}

export default function AdminBannersIndex({
  banners,
  stats,
  filters,
  availableGradients = [],
}: AdminBannersPageProps) {
  const pageProps = usePage<{ flash?: { success?: string | null; error?: string | null } }>().props;
  const flash = pageProps?.flash || {};

  // Filter States
  const [search, setSearch] = useState(filters?.search || '');
  const [selectedType, setSelectedType] = useState(filters?.type || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'interactive' as 'interactive' | 'image' | 'info',
    image: null as File | null,
    image_url: '',
    image_position: '50% 50%',
    image_scale: 100,
    link_url: '',
    link_target: '_self',
    cta_text: '',
    search_placeholder: 'Cari lowongan pekerjaan, posisi atau perusahaan',
    bg_gradient: 'blue',
    text_color: 'dark' as 'dark' | 'light',
    order: 0,
    is_active: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Carousel Preview index
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Crop / Focal Adjustment States
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const [showOverlaySim, setShowOverlaySim] = useState(true);
  const [isCroppingCanvas, setIsCroppingCanvas] = useState(false);

  // Helper Parse Posisi "X% Y%"
  const parsePosition = (posStr: string | null | undefined): [number, number] => {
    if (!posStr) return [50, 50];
    const parts = posStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      return [
        isNaN(x) ? 50 : Math.max(0, Math.min(100, Math.round(x))),
        isNaN(y) ? 50 : Math.max(0, Math.min(100, Math.round(y))),
      ];
    }
    return [50, 50];
  };

  const [cropX, cropY] = parsePosition(formData.image_position);
  const cropScale = formData.image_scale || 100;

  const setFocalPosition = (x: number, y: number) => {
    const safeX = Math.max(0, Math.min(100, Math.round(x)));
    const safeY = Math.max(0, Math.min(100, Math.round(y)));
    setFormData((prev) => ({
      ...prev,
      image_position: `${safeX}% ${safeY}%`,
    }));
  };

  // Mouse drag handler pada viewport preview
  const updatePositionFromMouseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    setFocalPosition(rawX, rawY);
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPosition(true);
    updatePositionFromMouseEvent(e);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPosition) return;
    updatePositionFromMouseEvent(e);
  };

  const handleCropMouseUp = () => {
    setIsDraggingPosition(false);
  };

  // Deteksi format file GIF
  const isCurrentFileGif =
    (formData.image && formData.image.type === 'image/gif') ||
    (formData.image_url && formData.image_url.toLowerCase().endsWith('.gif')) ||
    (previewImage && previewImage.toLowerCase().includes('.gif')) ||
    (previewImage && previewImage.startsWith('data:image/gif'));

  // Eksekusi Hard Canvas Crop (khusus non-GIF)
  const handleApplyCanvasCrop = () => {
    if (!previewImage) return;
    setIsCroppingCanvas(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewImage;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Rasio HD banner ~ 1200 x 360 (10:3)
        const targetWidth = 1200;
        const targetHeight = 360;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsCroppingCanvas(false);
          return;
        }

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const targetRatio = targetWidth / targetHeight;
        const currentScale = (formData.image_scale || 100) / 100;

        let srcW = imgWidth;
        let srcH = imgHeight;

        if (imgWidth / imgHeight > targetRatio) {
          srcH = imgHeight / currentScale;
          srcW = (imgHeight * targetRatio) / currentScale;
        } else {
          srcW = imgWidth / currentScale;
          srcH = (imgWidth / targetRatio) / currentScale;
        }

        const [pX, pY] = parsePosition(formData.image_position);
        const maxX = imgWidth - srcW;
        const maxY = imgHeight - srcH;

        const srcX = Math.max(0, Math.min(maxX, maxX * (pX / 100)));
        const srcY = Math.max(0, Math.min(maxY, maxY * (pY / 100)));

        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], `banner_crop_${Date.now()}.jpg`, {
                type: 'image/jpeg',
              });
              setFormData((prev) => ({
                ...prev,
                image: croppedFile,
                image_position: '50% 50%',
                image_scale: 100,
              }));
              const newPreview = URL.createObjectURL(blob);
              setPreviewImage(newPreview);
            }
            setIsCroppingCanvas(false);
          },
          'image/jpeg',
          0.95
        );
      } catch (err) {
        console.error('Gagal crop canvas:', err);
        setIsCroppingCanvas(false);
      }
    };
    img.onerror = () => {
      setIsCroppingCanvas(false);
    };
  };

  const applyFilters = (newFilters: { search?: string; type?: string; status?: string }) => {
    const params: Record<string, string> = {};
    const merged = {
      search,
      type: selectedType,
      status: selectedStatus,
      ...newFilters,
    };

    if (merged.search) params.search = merged.search;
    if (merged.type && merged.type !== 'all') params.type = merged.type;
    if (merged.status && merged.status !== 'all') params.status = merged.status;

    router.get('/admin/banners', params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  // Buka Modal Tambah Banner Baru
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingBanner(null);
    setFormData({
      title: 'Halo, {name}!',
      subtitle: 'Terus semangat dalam mencari peluang karier terbaik bersama Profabel. Setiap langkahmu berarti.',
      type: 'interactive',
      image: null,
      image_url: '',
      image_position: '50% 50%',
      image_scale: 100,
      link_url: '',
      link_target: '_self',
      cta_text: '',
      search_placeholder: 'Cari lowongan pekerjaan, posisi atau perusahaan',
      bg_gradient: 'blue',
      text_color: 'dark',
      order: (stats.total || 0) + 1,
      is_active: true,
    });
    setPreviewImage(null);
    setUploadMode('file');
    setIsModalOpen(true);
  };

  // Buka Modal Edit Banner
  const openEditModal = (banner: BannerData) => {
    setIsEditing(true);
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      type: banner.type || 'interactive',
      image: null,
      image_url: banner.image_url || '',
      image_position: banner.image_position || '50% 50%',
      image_scale: banner.image_scale || 100,
      link_url: banner.link_url || '',
      link_target: banner.link_target || '_self',
      cta_text: banner.cta_text || '',
      search_placeholder: banner.search_placeholder || 'Cari lowongan pekerjaan, posisi atau perusahaan',
      bg_gradient: banner.bg_gradient || 'blue',
      text_color: banner.text_color || 'dark',
      order: banner.order || 0,
      is_active: banner.is_active,
    });
    setPreviewImage(banner.display_image_url);
    setUploadMode(banner.image_url && !banner.image_path ? 'url' : 'file');
    setIsModalOpen(true);
  };

  // Handle Pilih File Gambar / GIF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit Form Tambah / Edit
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.subtitle) payload.append('subtitle', formData.subtitle);
    payload.append('type', formData.type);
    if (formData.link_url) payload.append('link_url', formData.link_url);
    payload.append('link_target', formData.link_target);
    if (formData.cta_text) payload.append('cta_text', formData.cta_text);
    if (formData.search_placeholder) payload.append('search_placeholder', formData.search_placeholder);
    payload.append('bg_gradient', formData.bg_gradient);
    payload.append('text_color', formData.text_color);
    payload.append('order', String(formData.order));
    payload.append('is_active', formData.is_active ? '1' : '0');
    payload.append('image_position', formData.image_position || '50% 50%');
    payload.append('image_scale', String(formData.image_scale || 100));

    if (uploadMode === 'file' && formData.image) {
      payload.append('image', formData.image);
    } else if (uploadMode === 'url' && formData.image_url) {
      payload.append('image_url', formData.image_url);
    }

    if (isEditing && editingBanner) {
      payload.append('_method', 'PUT');
      router.post(`/admin/banners/${editingBanner.id}`, payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      });
    } else {
      router.post('/admin/banners', payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      });
    }
  };

  // Handle Toggle Aktif
  const handleToggle = (banner: BannerData) => {
    router.post(`/admin/banners/${banner.id}/toggle`, {}, { preserveScroll: true });
  };

  // Handle Naik / Turunkan Urutan
  const handleMoveOrder = (banner: BannerData, direction: 'up' | 'down') => {
    const bannerList = [...banners.data];
    const currentIndex = bannerList.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= bannerList.length) return;

    const targetBanner = bannerList[targetIndex];
    const newOrders = [
      { id: banner.id, order: targetBanner.order },
      { id: targetBanner.id, order: banner.order },
    ];

    router.post('/admin/banners/reorder', { orders: newOrders }, { preserveScroll: true });
  };

  // Handle Hapus Banner
  const handleDeleteSubmit = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    router.delete(`/admin/banners/${deleteTarget.id}`, {
      onSuccess: () => {
        setIsDeleting(false);
        setDeleteTarget(null);
      },
      onError: () => setIsDeleting(false),
    });
  };

  // Gradient Helper
  const getGradientClass = (gradientId: string | null) => {
    const found = availableGradients.find((g) => g.id === gradientId);
    return found ? found.class : 'from-[#EBF5FA] via-[#E1EFF6] to-[#D5E9F4]';
  };

  const activeBanners = banners.data.filter((b) => b.is_active);

  return (
    <AdminLayout>
      <Head title="Kelola Banner Beranda - Admin Profabel" />

      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
        {/* Flash Notifications */}
        {flash?.success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{flash.success}</span>
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{flash.error}</span>
            </div>
          </div>
        )}

        {/* 1. Header Page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#1769E0] text-white shadow-2xs">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#102B4B] tracking-tight">
                  Kelola Banner & Carousel Beranda
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur tayangan slide beranda pelamar: dukung banner interaktif (sapaan & pencarian), media visual (foto / animasi GIF), dan kartu pengumuman.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.reload()}
              className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs font-semibold h-9 rounded-xl shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Segarkan</span>
            </Button>

            <Button
              type="button"
              onClick={openCreateModal}
              className="bg-[#1769E0] hover:bg-blue-600 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Banner Baru</span>
            </Button>
          </div>
        </div>

        {/* 2. Kartu Statistik Ringkasan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Banner
            </span>
            <h3 className="text-2xl font-black text-[#102B4B] mt-1">
              {stats.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua slide terdaftar</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Banner Aktif (Tayang)
            </span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {stats.active || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Muncul di carousel pelamar</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Media Gambar / GIF
            </span>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {stats.image_gif || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Foto visual & GIF bergerak</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Interaktif & Info
            </span>
            <h3 className="text-2xl font-black text-blue-600 mt-1">
              {(stats.interactive || 0) + (stats.info || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sapaan + search & promo</p>
          </div>
        </div>

        {/* 3. Live Preview Mockup Carousel di Beranda Pelamar */}
        {activeBanners.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1769E0]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#102B4B]">
                  Live Preview: Tampilan Carousel di Beranda Pelamar
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Menampilkan {activeBanners.length} slide aktif
              </span>
            </div>

            {/* Mockup Container: Fixed Height h-[240px] 1:1 Dengan Halaman Pelamar */}
            <div className="relative max-w-3xl mx-auto h-[240px] overflow-hidden rounded-3xl border border-[#D0E5F0] shadow-sm bg-slate-900">
              {(() => {
                const currentSlide = activeBanners[previewSlideIdx] || activeBanners[0];
                const isDark = currentSlide.type === 'image' || currentSlide.bg_gradient === 'dark' || currentSlide.text_color === 'light';

                return (
                  <div className="relative w-full h-full">
                    {/* Tipe 1: Gambar / GIF Animasi (Full Edge-to-Edge) */}
                    {currentSlide.type === 'image' && (
                      <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                        {currentSlide.display_image_url ? (
                          <img
                            src={currentSlide.display_image_url}
                            alt={currentSlide.title}
                            style={{
                              objectPosition: currentSlide.image_position || '50% 50%',
                              transform:
                                currentSlide.image_scale && currentSlide.image_scale > 100
                                  ? `scale(${currentSlide.image_scale / 100})`
                                  : undefined,
                              transformOrigin: currentSlide.image_position || '50% 50%',
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                            Tidak ada gambar banner
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col justify-end text-white">
                          <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{currentSlide.title}</h3>
                          {currentSlide.subtitle && (
                            <p className="mt-1 text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl">{currentSlide.subtitle}</p>
                          )}
                          {currentSlide.cta_text && (
                            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-lg w-fit">
                              <span>{currentSlide.cta_text}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tipe 2: Interaktif & Info dengan Gradien */}
                    {currentSlide.type !== 'image' && (
                      <div
                        className={`w-full h-full p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col justify-between bg-gradient-to-r ${getGradientClass(
                          currentSlide.bg_gradient
                        )}`}
                      >
                        {/* Tipe Interaktif */}
                        {currentSlide.type === 'interactive' && (
                          <div className="max-w-md z-10">
                            <h3 className="text-xl sm:text-2xl font-extrabold text-[#102B4B] line-clamp-1">
                              {currentSlide.title.replace('{name}', 'Budi Santoso')}
                            </h3>
                            <p className="mt-1.5 text-xs text-[#475569] line-clamp-2">
                              {currentSlide.subtitle || 'Terus semangat mencari peluang karier bersama Profabel.'}
                            </p>
                            <div className="mt-4 flex items-center rounded-xl bg-[#0C2742] p-1.5 shadow-md">
                              <Search className="ml-2.5 h-4 w-4 text-slate-300" />
                              <span className="text-xs text-slate-300 px-2.5 py-1 flex-1 truncate">
                                {currentSlide.search_placeholder || 'Cari lowongan pekerjaan...'}
                              </span>
                              <span className="rounded-lg bg-white px-3.5 py-1 text-xs font-bold text-[#102B4B]">
                                Cari
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Tipe Info */}
                        {currentSlide.type === 'info' && (
                          <div className="max-w-md z-10 space-y-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1769E0]/15 text-[#1769E0] border border-[#1769E0]/20">
                              Program & Rekomendasi
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-[#102B4B] line-clamp-1">
                              {currentSlide.title}
                            </h3>
                            {currentSlide.subtitle && (
                              <p className="text-xs text-[#475569] line-clamp-2">{currentSlide.subtitle}</p>
                            )}
                            {currentSlide.cta_text && (
                              <div className="pt-1">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0C2742] text-white text-xs font-bold shadow-xs">
                                  <span>{currentSlide.cta_text}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Dots & Badge di Preview Mockup */}
                    <div className="absolute bottom-3 sm:bottom-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
                      <div className="flex items-center gap-1.5 pointer-events-auto">
                        {activeBanners.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewSlideIdx(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              previewSlideIdx === idx
                                ? isDark ? 'w-5 bg-white' : 'w-5 bg-[#0C2742]'
                                : isDark ? 'w-1.5 bg-white/40' : 'w-1.5 bg-[#94A3B8]/50'
                            }`}
                          />
                        ))}
                      </div>
                      <div
                        className={`pointer-events-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isDark
                            ? 'bg-black/50 text-white border-white/20'
                            : 'bg-white/80 text-slate-600 border-slate-200'
                        }`}
                      >
                        {previewSlideIdx + 1} / {activeBanners.length}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 4. Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari judul banner, deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-16 text-xs h-9 rounded-xl border-slate-200 bg-slate-50/70"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-white bg-[#1769E0] hover:bg-blue-600 rounded-lg transition"
            >
              Cari
            </button>
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tipe */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                applyFilters({ type: e.target.value });
              }}
              className="text-xs h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="all">Semua Tipe Banner</option>
              <option value="interactive">Interaktif (Search Bar)</option>
              <option value="image">Media Gambar / GIF</option>
              <option value="info">Info / Pengumuman</option>
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                applyFilters({ status: e.target.value });
              }}
              className="text-xs h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Tayang</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* 5. Tabel Daftar Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[840px]">
              <thead className="bg-[#F8FBFE] text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-20 text-center">Urutan</th>
                  <th className="py-3 px-4 min-w-[140px]">Media / Preview</th>
                  <th className="py-3 px-4 min-w-[260px]">Judul & Deskripsi</th>
                  <th className="py-3 px-4 w-32">Tipe Banner</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada banner terdaftar</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Klik tombol "Tambah Banner Baru" di atas untuk menambahkan slide carousel.
                      </p>
                    </td>
                  </tr>
                ) : (
                  banners.data.map((banner, index) => {
                    const isGif =
                      banner.display_image_url &&
                      (banner.display_image_url.toLowerCase().endsWith('.gif') ||
                        banner.display_image_url.includes('.gif'));

                    return (
                      <tr key={banner.id} className="hover:bg-slate-50/70 transition">
                        {/* 1. Urutan Slide */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-slate-700">
                            <span className="w-5 text-center">{banner.order}</span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveOrder(banner, 'up')}
                                className="text-slate-400 hover:text-[#1769E0] disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                                title="Geser Urutan Naik"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={index === banners.data.length - 1}
                                onClick={() => handleMoveOrder(banner, 'down')}
                                className="text-slate-400 hover:text-[#1769E0] disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                                title="Geser Urutan Turun"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 2. Media / Preview */}
                        <td className="py-3.5 px-4">
                          {banner.type === 'image' && banner.display_image_url ? (
                            <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group/thumb">
                              <img
                                src={banner.display_image_url}
                                alt={banner.title}
                                style={{ objectPosition: banner.image_position || '50% 50%' }}
                                className="w-full h-full object-cover"
                              />
                              {isGif && (
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-600 text-white shadow-xs">
                                  GIF
                                </span>
                              )}
                            </div>
                          ) : banner.type === 'interactive' ? (
                            <div className="w-28 h-16 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 flex flex-col justify-between shadow-2xs">
                              <span className="text-[9px] font-bold text-[#1769E0] truncate">
                                Halo, {"{name}"}
                              </span>
                              <div className="h-4 rounded bg-[#0C2742] text-[8px] text-slate-300 flex items-center px-1.5 gap-1">
                                <Search className="w-2.5 h-2.5" />
                                <span className="truncate">Cari...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-28 h-16 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-2 flex flex-col justify-between shadow-2xs">
                              <span className="text-[9px] font-bold text-indigo-700 truncate">
                                {banner.title}
                              </span>
                              {banner.cta_text && (
                                <span className="text-[8px] bg-[#0C2742] text-white px-1.5 py-0.5 rounded w-fit font-bold">
                                  {banner.cta_text}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 3. Judul & Konten */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span>{banner.title}</span>
                          </div>
                          {banner.subtitle && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-md">
                              {banner.subtitle}
                            </p>
                          )}
                          {banner.link_url && (
                            <a
                              href={banner.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#1769E0] hover:underline flex items-center gap-1 mt-1 font-mono"
                            >
                              <Link2 className="w-3 h-3" />
                              <span className="truncate max-w-xs">{banner.link_url}</span>
                            </a>
                          )}
                        </td>

                        {/* 4. Tipe Banner */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {banner.type === 'interactive' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Search className="w-3 h-3" />
                              <span>Interaktif</span>
                            </span>
                          )}
                          {banner.type === 'image' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Film className="w-3 h-3" />
                              <span>{isGif ? 'Animasi GIF' : 'Foto / Gambar'}</span>
                            </span>
                          )}
                          {banner.type === 'info' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Sparkles className="w-3 h-3" />
                              <span>Info / Promo</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Status Aktif / Nonaktif Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(banner)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition shadow-2xs ${
                              banner.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                banner.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            <span>{banner.is_active ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>

                        {/* 6. Aksi Edit & Hapus */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(banner)}
                              className="text-xs h-8 px-2.5 rounded-xl border-slate-200 hover:text-[#1769E0]"
                            >
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(banner)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                              title="Hapus Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== MODAL FORM CREATE / EDIT BANNER ===================== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="w-[95vw] sm:max-w-[760px] max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:p-7"
          style={{ maxWidth: '760px', width: '95vw' }}
        >
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-[#102B4B] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#1769E0]" />
              <span>{isEditing ? 'Edit Konfigurasi Banner' : 'Tambah Banner Carousel Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Sesuaikan tipe banner, konten visual foto/GIF, teks motivasi atau fitur pencarian interaktif.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-5 pt-2">
            {/* 1. Pemilihan Tipe Banner */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Pilih Tipe Banner:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option 1: Interaktif */}
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'interactive' }))}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                    formData.type === 'interactive'
                      ? 'border-[#1769E0] bg-blue-50/50 ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-blue-100 text-[#1769E0]">
                      <Search className="w-4 h-4" />
                    </span>
                    {formData.type === 'interactive' && <Check className="w-4 h-4 text-[#1769E0]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102B4B]">Interaktif (Search)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Sapaan nama + input pencarian lowongan kerja langsung.
                    </p>
                  </div>
                </button>

                {/* Option 2: Gambar / GIF Animasi */}
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'image' }))}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                    formData.type === 'image'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                      <Film className="w-4 h-4" />
                    </span>
                    {formData.type === 'image' && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102B4B]">Foto / GIF Animasi</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Banner grafis visual, foto poster, atau animasi GIF bergerak.
                    </p>
                  </div>
                </button>

                {/* Option 3: Info / Promo */}
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'info' }))}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                    formData.type === 'info'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    {formData.type === 'info' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102B4B]">Info / Promo</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Kartu pengumuman promosi dengan tombol aksi (CTA).
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Judul & Subjudul Banner */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="b_title" className="text-xs font-bold text-slate-700">
                    Judul Banner <span className="text-rose-500">*</span>
                  </Label>
                  {formData.type === 'interactive' && (
                    <span className="text-[11px] text-blue-600 font-medium">
                      Tip: Tulis <code>{"{name}"}</code> untuk menyisipkan nama pelamar otomatis
                    </span>
                  )}
                </div>
                <Input
                  id="b_title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    formData.type === 'interactive'
                      ? 'Misal: Halo, {name}!'
                      : 'Misal: Bursa Kerja Inklusif 2026'
                  }
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b_sub" className="text-xs font-bold text-slate-700">
                  Subjudul / Pesan Deskripsi:
                </Label>
                <textarea
                  id="b_sub"
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Deskripsi pendukung atau kalimat motivasi..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1769E0]"
                />
              </div>
            </div>

            {/* 3. Konfigurasi Khusus Berdasarkan Tipe */}
            {/* TIPE INTERAKTIF: Search placeholder */}
            {formData.type === 'interactive' && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                <Label htmlFor="b_search" className="text-xs font-bold text-[#102B4B]">
                  Placeholder Input Pencarian Lowongan:
                </Label>
                <Input
                  id="b_search"
                  value={formData.search_placeholder}
                  onChange={(e) => setFormData({ ...formData, search_placeholder: e.target.value })}
                  placeholder="Cari lowongan pekerjaan, posisi atau perusahaan"
                  className="text-xs h-9 rounded-xl bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  Ketika pelamar mengetik dan menekan enter/klik Cari, sistem akan langsung mengarahkan ke halaman pencarian lowongan.
                </p>
              </div>
            )}

            {/* TIPE GAMBAR / GIF: Upload file atau link eksternal */}
            {formData.type === 'image' && (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#102B4B]">
                    File Gambar / GIF Animasi:
                  </Label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                        uploadMode === 'file'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Upload File (Foto/GIF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                        uploadMode === 'url'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Tempel URL Gambar/GIF
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-4 text-center cursor-pointer transition"
                    >
                      <Upload className="w-6 h-6 text-purple-600 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-slate-700">
                        Klik untuk upload foto banner atau GIF animasi
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mendukung: JPG, PNG, WebP, dan <strong>GIF (Animasi Bergerak)</strong> maks 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setPreviewImage(e.target.value);
                      }}
                      placeholder="https://contoh.com/animasi-banner.gif"
                      className="text-xs h-9 rounded-xl bg-white"
                    />
                    <p className="text-[11px] text-slate-400">
                      Anda dapat memasukkan direct link foto atau file .gif langsung dari internet.
                    </p>
                  </div>
                )}

                {/* Live Preview & Tool Penyesuaian / Crop Gambar */}
                {previewImage && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Crosshair className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-[#102B4B]">
                          Atur Posisi Tampil & Crop Foto (Focal Point)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowOverlaySim((prev) => !prev)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            showOverlaySim
                              ? 'bg-purple-100 text-purple-700 border-purple-300'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        >
                          {showOverlaySim ? 'Sembunyikan Simulasi Teks' : 'Lihat Simulasi Teks'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              image_position: '50% 50%',
                              image_scale: 100,
                            }));
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                          title="Kembalikan posisi fokus dan zoom ke nilai awal"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Posisi</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Viewport Canvas */}
                    <div
                      ref={cropContainerRef}
                      onMouseDown={handleCropMouseDown}
                      onMouseMove={handleCropMouseMove}
                      onMouseUp={handleCropMouseUp}
                      onMouseLeave={handleCropMouseUp}
                      className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-purple-300 bg-slate-950 select-none cursor-crosshair group/viewport shadow-inner"
                      title="Klik atau geser mouse untuk mengatur area foto yang ingin ditampilkan"
                    >
                      <img
                        src={previewImage}
                        alt="Preview Penyesuaian"
                        style={{
                          objectPosition: `${cropX}% ${cropY}%`,
                          transform: `scale(${cropScale / 100})`,
                          transformOrigin: `${cropX}% ${cropY}%`,
                        }}
                        className="w-full h-full object-cover pointer-events-none transition-all duration-75"
                      />

                      {/* Crosshair Target Pin */}
                      <div
                        style={{ left: `${cropX}%`, top: `${cropY}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-75"
                      >
                        <div className="relative flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-600/40 shadow-md animate-pulse" />
                          <div className="absolute w-2 h-2 rounded-full bg-white shadow-xs" />
                        </div>
                      </div>

                      {/* Top Helper Floating Badge */}
                      <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs shadow-xs">
                          X: {cropX}% | Y: {cropY}% | Zoom: {cropScale}%
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-600/90 text-white backdrop-blur-xs">
                          Klik / Geser Mouse di Foto Ini
                        </span>
                      </div>

                      {/* Overlay Simulation if enabled */}
                      {showOverlaySim && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 sm:p-5 flex flex-col justify-end text-white pointer-events-none z-10">
                          <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1 drop-shadow-sm">
                            {formData.title || 'Judul Banner'}
                          </h4>
                          {formData.subtitle && (
                            <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5 max-w-lg">
                              {formData.subtitle}
                            </p>
                          )}
                          {formData.cta_text && (
                            <span className="mt-2 text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg w-fit shadow-xs">
                              {formData.cta_text}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Controls: 9 Presets & Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                      {/* 9-Point Presets (5 cols) */}
                      <div className="md:col-span-5 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <LayoutGrid className="w-3 h-3 text-purple-600" />
                          <span>Pilihan Cepat (Preset Fokus):</span>
                        </Label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: '↖ Kiri Atas', x: 0, y: 0 },
                            { label: '⬆ Atas', x: 50, y: 0 },
                            { label: '↗ Kanan Atas', x: 100, y: 0 },
                            { label: '⬅ Kiri', x: 0, y: 50 },
                            { label: '⏺ Tengah', x: 50, y: 50 },
                            { label: '➡ Kanan', x: 100, y: 50 },
                            { label: '↙ Kiri Bawah', x: 0, y: 100 },
                            { label: '⬇ Bawah', x: 50, y: 100 },
                            { label: '↘ Kanan Bawah', x: 100, y: 100 },
                          ].map((preset) => {
                            const isMatch = Math.abs(cropX - preset.x) < 5 && Math.abs(cropY - preset.y) < 5;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setFocalPosition(preset.x, preset.y)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center border ${
                                  isMatch
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          💡 <em>Tip: Pilih <strong>"⬆ Atas"</strong> jika bagian kepala/wajah orang terpotong.</em>
                        </p>
                      </div>

                      {/* Sliders Precision (7 cols) */}
                      <div className="md:col-span-7 space-y-2.5">
                        {/* Slider Vertikal (Y) */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Posisi Vertikal (Atas ↔ Bawah):</span>
                            <span className="text-purple-600 font-mono font-bold">{cropY}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={cropY}
                            onChange={(e) => setFocalPosition(cropX, Number(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>0% (Paling Atas)</span>
                            <span>50% (Tengah)</span>
                            <span>100% (Paling Bawah)</span>
                          </div>
                        </div>

                        {/* Slider Horizontal (X) */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Posisi Horizontal (Kiri ↔ Kanan):</span>
                            <span className="text-purple-600 font-mono font-bold">{cropX}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={cropX}
                            onChange={(e) => setFocalPosition(Number(e.target.value), cropY)}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>

                        {/* Slider Zoom Scale */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span className="flex items-center gap-1">
                              <ZoomIn className="w-3 h-3 text-purple-600" />
                              <span>Zoom / Skala Foto:</span>
                            </span>
                            <span className="text-purple-600 font-mono font-bold">{cropScale}%</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={200}
                            step={5}
                            value={cropScale}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, image_scale: Number(e.target.value) }))
                            }
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Canvas Crop Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-purple-100">
                      {isCurrentFileGif ? (
                        <span className="text-[11px] text-purple-700 bg-purple-100/80 border border-purple-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Animasi GIF Bergerak: Penyesuaian posisi tersimpan otomatis tanpa merusak animasi frame.</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCanvasCrop}
                          disabled={isCroppingCanvas}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>{isCroppingCanvas ? 'Memproses Crop...' : 'Terapkan Potong Gambar (Crop Fisik HD)'}</span>
                        </button>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Posisi fokus akan langsung digunakan pada carousel pelamar.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIPE GAMBAR / INFO: Link URL saat diklik & CTA Text */}
            {(formData.type === 'image' || formData.type === 'info') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <Label htmlFor="b_link" className="text-xs font-bold text-slate-700">
                    Tautan Klik (Link URL):
                  </Label>
                  <Input
                    id="b_link"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="Misal: /jobs atau /app/ai-assistant"
                    className="text-xs h-9 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="b_cta" className="text-xs font-bold text-slate-700">
                    Teks Tombol Aksi (CTA):
                  </Label>
                  <Input
                    id="b_cta"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Misal: Lihat Lowongan / Coba Sekarang"
                    className="text-xs h-9 rounded-xl bg-white"
                  />
                </div>
              </div>
            )}

            {/* 4. Pengaturan Latar Belakang & Urutan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Pilihan Gradien */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700">
                  Tema Gradien Background:
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableGradients.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, bg_gradient: g.id })}
                      className={`p-2 rounded-xl border text-center transition flex items-center gap-2 ${
                        formData.bg_gradient === g.id
                          ? 'border-[#1769E0] ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${g.class} border shrink-0`} />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urutan Tampil (Order) */}
              <div className="space-y-1.5">
                <Label htmlFor="b_order" className="text-xs font-bold text-slate-700">
                  Urutan Slide:
                </Label>
                <Input
                  id="b_order"
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="text-xs h-9 rounded-xl bg-white"
                />
                <p className="text-[10px] text-slate-400">Angka lebih kecil tampil lebih awal</p>
              </div>
            </div>

            {/* Switch Status Aktif */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <Label htmlFor="b_active" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Status Banner Aktif
                </Label>
                <p className="text-[11px] text-slate-500">
                  Jika aktif, banner akan langsung ditayangkan di carousel beranda pelamar.
                </p>
              </div>
              <input
                id="b_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#1769E0] rounded border-slate-300 cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1769E0] hover:bg-blue-600 text-white text-xs font-bold rounded-xl px-5"
              >
                {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL KONFIRMASI HAPUS ===================== */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Hapus Banner Carousel?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Anda yakin ingin menghapus banner <strong>"{deleteTarget?.title}"</strong>? Slide ini akan dihapus dari carousel beranda secara permanen.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="text-xs font-semibold rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
            >
              {isDeleting ? 'Menghapus...' : 'Konfirmasi Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
