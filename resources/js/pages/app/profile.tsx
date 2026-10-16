import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Phone,
  Save,
  Sparkles,
  User,
} from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with quick link to accessibility profile */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
