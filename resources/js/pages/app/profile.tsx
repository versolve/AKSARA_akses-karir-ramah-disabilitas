import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
  Briefcase,
  Camera,
  GraduationCap,
  HeartHandshake,
  Image,
  Phone,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';

interface ProfileData {
  phone: string;
  bio: string;
  education: string;
  experience: string;
  current_job_title: string;
}

interface Props {
  profile: Partial<ProfileData>;
}

export default function PelamarProfile({ profile }: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as any).auth;
  const user = auth?.user;
  const userName = user?.name || 'Pelamar';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    router.post('/profile/avatar', formData, {
      preserveScroll: true,
      onFinish: () => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleAvatarDelete = (): void => {
    if (confirm('Yakin ingin menghapus foto profil?')) {
      router.delete('/profile/avatar', { preserveScroll: true });
    }
  };

  const { data, setData, post, processing, errors } = useForm<ProfileData>({
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    education: profile.education ?? '',
    experience: profile.experience ?? '',
    current_job_title: profile.current_job_title ?? '',
  });

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    post('/app/profile');
  };

  return (
    <AppLayout>
      <Head title="Profil Saya - Pelamar AKSARA" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header with quick link to accessibility profile */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Kelola Profil Pelamar</h1>
            <p className="mt-1 text-sm text-slate-600">
              Lengkapi data kompetensi dan riwayat pengalaman untuk meningkatkan akurasi rekomendasi AI.
            </p>
          </div>
          <Link
            href="/app/accessibility-profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 min-h-[44px]"
          >
            <HeartHandshake className="h-4 w-4 text-emerald-700" />
            Atur Kebutuhan Aksesibilitas →
          </Link>
        </div>

        {/* Dedicated Profile Picture Upload Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-[#102B4B] mb-1">Foto Profil</h2>
          <p className="text-xs text-[#64748B] mb-5">
            Foto profil resmi Anda. Foto akan otomatis dipotong persegi (300×300 px) dan dikompresi ke format WebP agar berukuran sangat ringan (~20-40 KB) namun tetap tajam.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#123B5D] text-white font-extrabold text-2xl border-4 border-slate-100 shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  userName.substring(0, 2).toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold text-xs min-h-[42px] px-4 flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isUploading ? 'Mengompres & Mengunggah...' : 'Unggah Foto Baru'}
                </Button>

                {user?.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAvatarDelete}
                    disabled={isUploading}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs min-h-[42px] px-3.5 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Foto
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <p className="text-[11px] text-[#64748B]">
                Mendukung JPG, PNG, atau WebP. Maksimal 10MB.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <Label htmlFor="current_job_title" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-slate-400" />
              Pekerjaan / Posisi Terakhir
            </Label>
            <Input
              id="current_job_title"
              value={data.current_job_title}
              onChange={(e) => setData('current_job_title', e.target.value)}
              placeholder="Contoh: Frontend Developer / Staf Administrasi"
              className="mt-1.5 block w-full min-h-[44px]"
              autoFocus
            />
            {errors.current_job_title && (
              <p className="mt-1 text-xs text-rose-600">{errors.current_job_title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              Nomor Telepon / WhatsApp
            </Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              placeholder="Contoh: 081234567890"
              className="mt-1.5 block w-full min-h-[44px]"
              autoComplete="tel"
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="education" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              Pendidikan Terakhir
            </Label>
            <Input
              id="education"
              value={data.education}
              onChange={(e) => setData('education', e.target.value)}
              placeholder="Contoh: S1 Teknik Informatika / SMK Administrasi Perkantoran"
              className="mt-1.5 block w-full min-h-[44px]"
            />
            {errors.education && <p className="mt-1 text-xs text-rose-600">{errors.education}</p>}
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-semibold text-slate-800">
              Ringkasan Pengalaman Kerja
            </Label>
            <textarea
              id="experience"
              value={data.experience}
              onChange={(e) => setData('experience', e.target.value)}
              rows={3}
              placeholder="Jelaskan peran kerja sebelumnya, lama bekerja, atau proyek yang pernah Anda selesaikan..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.experience && (
              <p className="mt-1 text-xs text-rose-600">{errors.experience}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-semibold text-slate-800">
              Tentang Saya (Bio & Keahlian Utama)
            </Label>
            <textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData('bio', e.target.value)}
              rows={4}
              placeholder="Ceritakan tentang diri Anda, motivasi bekerja, keahlian khusus, dan cara kerja yang nyaman untuk Anda..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.bio && <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              disabled={processing}
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] px-6 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {processing ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
