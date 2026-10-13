import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
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
      <Head title="Profil Saya" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Kelola Profil Pelamar</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <Label htmlFor="current_job_title">Pekerjaan / Posisi Terakhir</Label>
            <Input
              id="current_job_title"
              value={data.current_job_title}
              onChange={(e) => setData('current_job_title', e.target.value)}
              className="mt-2 block w-full"
            />
            {errors.current_job_title && (
              <p className="mt-2 text-sm text-red-600">{errors.current_job_title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className="mt-2 block w-full"
              autoComplete="tel"
            />
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="education">Pendidikan Terakhir</Label>
            <Input
              id="education"
              value={data.education}
              onChange={(e) => setData('education', e.target.value)}
              className="mt-2 block w-full"
            />
            {errors.education && <p className="mt-2 text-sm text-red-600">{errors.education}</p>}
          </div>

          <div>
            <Label htmlFor="experience">Pengalaman Kerja</Label>
            <textarea
              id="experience"
              value={data.experience}
              onChange={(e) => setData('experience', e.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            />
            {errors.experience && (
              <p className="mt-2 text-sm text-red-600">{errors.experience}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Tentang Saya (Bio)</Label>
            <textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData('bio', e.target.value)}
              rows={4}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            />
            {errors.bio && <p className="mt-2 text-sm text-red-600">{errors.bio}</p>}
          </div>

          <Button disabled={processing} type="submit" style={{ minHeight: '44px' }}>
            Simpan Perubahan
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
