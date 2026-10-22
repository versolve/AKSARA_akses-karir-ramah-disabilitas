import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
  Calendar,
  Download,
  Eye,
  FileText,
  Info,
  Link2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  domicile: string;
  gender: string;
  bio: string;
  education: string;
  experience: string;
  current_job_title: string;
  linkedin_url: string;
  portfolio_url: string;
}

interface AccessibilityData {
  disability_types: string[];
  accommodations_needed: string[];
  notes: string;
}

interface Props {
  user?: { name?: string; email?: string };
  profile: Partial<ProfileData> & {
    cv_url?: string | null;
    cv_name?: string | null;
    cv_updated_at?: string | null;
  };
  accessibility?: Partial<AccessibilityData>;
}

export default function PelamarProfile({
  user: profileUser = {},
  profile,
  accessibility = {},
}: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as any).auth;
  const user = auth?.user;
  const userName = user?.name || profileUser.name || 'Pelamar';

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const profileForm = useForm<ProfileData>({
    name: profileUser.name ?? user?.name ?? '',
    email: profileUser.email ?? user?.email ?? '',
    phone: profile.phone ?? '',
    birth_date: profile.birth_date ?? '',
    domicile: profile.domicile ?? '',
    gender: profile.gender ?? '',
    bio: profile.bio ?? '',
    education: profile.education ?? '',
    experience: profile.experience ?? '',
    current_job_title: profile.current_job_title ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    portfolio_url: profile.portfolio_url ?? '',
  });

  const accessibilityForm = useForm<AccessibilityData>({
    disability_types: accessibility.disability_types ?? [],
    accommodations_needed: accessibility.accommodations_needed ?? [],
    notes: accessibility.notes ?? '',
  });

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploadingAvatar(true);

    router.post('/profile/avatar', formData, {
      preserveScroll: true,
      onFinish: () => {
        setIsUploadingAvatar(false);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      },
    });
  };

  const handleCvUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cv', file);
    setIsUploadingCv(true);

    router.post('/app/profile/cv', formData, {
      preserveScroll: true,
      onFinish: () => {
        setIsUploadingCv(false);
        if (cvInputRef.current) cvInputRef.current.value = '';
      },
    });
  };

  const toggleAccommodation = (key: string): void => {
    const current = accessibilityForm.data.accommodations_needed;
    accessibilityForm.setData(
      'accommodations_needed',
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const formatBirthDate = (value: string): string => {
    if (!value) return '-';
    return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const accommodations = [
    ['komunikasi_tertulis', 'Komunikasi tertulis lebih disukai'],
    ['remote_work', 'Kerja remote'],
    ['screen_reader', 'Screen reader'],
    ['flexible_hours', 'Jadwal kerja fleksibel'],
    ['ramp', 'Akses fisik tertentu'],
  ] as const;

  return (
    <AppLayout>
      <Head title="Profil Saya - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">Profil Saya</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Kelola informasi pribadi, CV, dan preferensi aksesibilitas untuk pengalaman melamar yang baik.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                profileForm.post('/app/profile', { preserveScroll: true });
              }}
              className="space-y-5 rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs"
            >
              <div>
                <h2 className="text-xl font-extrabold text-[#102B4B]">Informasi Pelamar</h2>
                <p className="mt-1 text-xs text-[#64748B]">Isi dan lengkapi informasi diri kamu.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileField label="Nama Lengkap" error={profileForm.errors.name}>
                  <Input value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} />
                </ProfileField>
                <ProfileField label="Email" error={profileForm.errors.email}>
                  <Input type="email" value={profileForm.data.email} onChange={(event) => profileForm.setData('email', event.target.value)} />
                </ProfileField>
                <ProfileField label="Nomor Telepon" error={profileForm.errors.phone} icon={<Phone className="h-4 w-4" />}>
                  <Input value={profileForm.data.phone} onChange={(event) => profileForm.setData('phone', event.target.value)} placeholder="0812 3456 7890" />
                </ProfileField>
                <ProfileField label="Tanggal Lahir" error={profileForm.errors.birth_date} icon={<Calendar className="h-4 w-4" />}>
                  <Input type="date" value={profileForm.data.birth_date} onChange={(event) => profileForm.setData('birth_date', event.target.value)} />
                </ProfileField>
                <ProfileField label="Domisili" error={profileForm.errors.domicile} icon={<MapPin className="h-4 w-4" />}>
                  <Input value={profileForm.data.domicile} onChange={(event) => profileForm.setData('domicile', event.target.value)} placeholder="Jakarta, Indonesia" />
                </ProfileField>
                <ProfileField label="Jenis Kelamin" error={profileForm.errors.gender} icon={<User className="h-4 w-4" />}>
                  <select value={profileForm.data.gender} onChange={(event) => profileForm.setData('gender', event.target.value)} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F7FAFD] px-3 py-2.5 text-sm text-[#102B4B] min-h-[44px]">
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Tidak ingin menyebutkan">Tidak ingin menyebutkan</option>
                  </select>
                </ProfileField>
              </div>

              <ProfileField label="Tentang Saya" error={profileForm.errors.bio}>
                <textarea value={profileForm.data.bio} onChange={(event) => profileForm.setData('bio', event.target.value)} rows={3} maxLength={500} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F7FAFD] p-3 text-sm text-[#102B4B] focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none" placeholder="Ceritakan tentang diri kamu..." />
                <div className="mt-1 text-right text-[10px] text-[#94A3B8]">{profileForm.data.bio.length}/500</div>
              </ProfileField>

              <ProfileField label="Pekerjaan / Posisi Terakhir" error={profileForm.errors.current_job_title}>
                <Input value={profileForm.data.current_job_title} onChange={(event) => profileForm.setData('current_job_title', event.target.value)} />
              </ProfileField>

              <ProfileField label="Pendidikan Terakhir" error={profileForm.errors.education}>
                <Input value={profileForm.data.education} onChange={(event) => profileForm.setData('education', event.target.value)} />
              </ProfileField>

              <ProfileField label="Pengalaman Kerja" error={profileForm.errors.experience}>
                <textarea value={profileForm.data.experience} onChange={(event) => profileForm.setData('experience', event.target.value)} rows={3} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F7FAFD] p-3 text-sm text-[#102B4B] focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none" />
              </ProfileField>

              <div className="border-t border-[#F1F5F9] pt-5">
                <h3 className="text-sm font-bold text-[#102B4B]">Link Profesional <span className="font-normal text-[#64748B]">(Opsional)</span></h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileField label="LinkedIn" error={profileForm.errors.linkedin_url} icon={<Link2 className="h-4 w-4" />}>
                    <Input type="url" value={profileForm.data.linkedin_url} onChange={(event) => profileForm.setData('linkedin_url', event.target.value)} placeholder="https://linkedin.com/in/nama" />
                  </ProfileField>
                  <ProfileField label="Portofolio" error={profileForm.errors.portfolio_url} icon={<Link2 className="h-4 w-4" />}>
                    <Input type="url" value={profileForm.data.portfolio_url} onChange={(event) => profileForm.setData('portfolio_url', event.target.value)} placeholder="https://behance.net/nama" />
                  </ProfileField>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#F1F5F9] pt-4">
                <Button type="submit" disabled={profileForm.processing} className="bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold min-h-[44px] px-6">
                  {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-extrabold text-[#102B4B]">CV Saya</h2>
              <p className="mt-1 text-sm text-[#64748B]">Unggah dan kelola CV kamu untuk digunakan saat melamar pekerjaan.</p>
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
              <button type="button" onClick={() => cvInputRef.current?.click()} className="mt-5 w-full rounded-2xl border-2 border-dashed border-[#D0E5F0] bg-[#F7FAFD] p-8 text-center hover:bg-[#EBF5FA] transition">
                <FileText className="mx-auto h-12 w-12 text-[#1674D1]" />
                <span className="mt-2 block text-lg font-extrabold text-[#102B4B]">Unggah CV</span>
                <span className="mt-1 block text-xs text-[#64748B]">Format PDF, DOC, DOCX — maksimal 5 MB</span>
                <span className="mt-4 inline-flex rounded-xl bg-[#123B5D] px-5 py-2.5 text-xs font-bold text-white">{isUploadingCv ? 'Mengunggah...' : 'Pilih File'}</span>
              </button>
            </section>

            <form onSubmit={(event) => { event.preventDefault(); accessibilityForm.post('/app/accessibility-profile', { preserveScroll: true }); }} className="space-y-5 rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
              <div>
                <h2 className="text-xl font-extrabold text-[#102B4B]">Preferensi Aksesibilitas</h2>
                <p className="mt-1 text-sm text-[#64748B]">Atur kebutuhan aksesibilitas agar perusahaan dapat memberi pengalaman melamar yang inklusif.</p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {accommodations.map(([key, label]) => (
                  <label key={key} className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border border-[#E2E8F0] p-3 text-sm text-[#102B4B] hover:bg-[#F7FAFD]">
                    <input type="checkbox" checked={accessibilityForm.data.accommodations_needed.includes(key)} onChange={() => toggleAccommodation(key)} className="h-4 w-4 rounded text-[#123B5D]" />
                    {label}
                  </label>
                ))}
              </div>
              <textarea value={accessibilityForm.data.notes} onChange={(event) => accessibilityForm.setData('notes', event.target.value)} rows={3} placeholder="Informasi tambahan terkait kebutuhan aksesibilitas kamu..." className="w-full rounded-xl border border-[#E2E8F0] p-3 text-sm focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none" />
              <div className="flex justify-end"><Button type="submit" disabled={accessibilityForm.processing} className="bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold min-h-[44px] px-6">Simpan Preferensi</Button></div>
            </form>
          </div>

          {/* Right column */}
          <aside className="lg:col-span-4 space-y-6">
            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <h2 className="text-xl font-extrabold text-[#102B4B]">Foto Profil</h2>
              <div className="mt-5 flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#123B5D] text-2xl font-bold text-white">
                  {user?.avatar ? <img src={user.avatar} alt={userName} className="h-full w-full object-cover" /> : userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar} className="border-[#1674D1] text-[#1674D1] min-h-[42px]"><Upload className="mr-2 h-4 w-4" />{isUploadingAvatar ? 'Mengunggah...' : 'Ubah Foto'}</Button>
                  <p className="mt-2 text-[10px] text-[#94A3B8]">JPG, PNG, WebP — otomatis dikompresi 300×300</p>
                  {user?.avatar && <button type="button" onClick={() => router.delete('/profile/avatar')} className="mt-2 text-xs text-rose-600 hover:underline">Hapus foto</button>}
                </div>
              </div>
              <div className="mt-5 flex gap-2 rounded-xl border border-[#D0E5F0] bg-[#F7FAFD] p-3 text-xs text-[#64748B]"><Info className="h-4 w-4 shrink-0 text-[#1674D1]" />Gunakan foto profesional untuk meningkatkan peluang dilirik rekruter.</div>
            </section>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <h2 className="text-xl font-extrabold text-[#102B4B]">Informasi Singkat</h2>
              <div className="mt-5 space-y-4 text-sm text-[#102B4B]">
                <SummaryRow icon={<User />} label="Nama" value={profileForm.data.name || '-'} />
                <SummaryRow icon={<Mail />} label="Email" value={profileForm.data.email || '-'} />
                <SummaryRow icon={<Phone />} label="Telepon" value={profileForm.data.phone || '-'} />
                <SummaryRow icon={<MapPin />} label="Domisili" value={profileForm.data.domicile || '-'} />
                <SummaryRow icon={<Calendar />} label="Tanggal Lahir" value={formatBirthDate(profileForm.data.birth_date)} />
                <SummaryRow icon={<User />} label="Jenis Kelamin" value={profileForm.data.gender || '-'} />
              </div>
            </section>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <h2 className="text-xl font-extrabold text-[#102B4B]">CV yang Tersimpan</h2>
              {profile.cv_url ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-[#EBF5FA] p-4"><FileText className="h-6 w-6 text-rose-500" /><div><p className="text-sm font-bold text-[#102B4B]">{profile.cv_name ?? 'CV Tersimpan'}</p><p className="text-[10px] text-[#64748B]">Siap digunakan saat melamar</p></div></div>
                  <div className="grid grid-cols-2 gap-2"><a href={profile.cv_url} target="_blank" rel="noreferrer" className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-[#1674D1] text-xs font-bold text-[#1674D1]"><Eye className="h-4 w-4" />Lihat CV</a><Link href="/app/ai-assistant" className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-[#1674D1] text-xs font-bold text-[#1674D1]"><Sparkles className="h-4 w-4" />Cek dengan AI</Link></div>
                </div>
              ) : <p className="mt-4 text-xs text-[#64748B]">Belum ada CV tersimpan.</p>}
            </section>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-[#102B4B]">Contoh Tampilan ke Perusahaan</h2>
              <p className="mt-1 text-xs text-[#64748B]">Informasi kebutuhan aksesibilitas ini hanya terlihat setelah kamu melamar.</p>
              <div className="mt-4 rounded-xl bg-[#EBF5FA] p-4">
                <p className="text-xs font-bold text-[#102B4B]">Kebutuhan Aksesibilitas</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{accessibilityForm.data.accommodations_needed.map((item) => <span key={item} className="rounded-md bg-white px-2 py-1 text-[10px] text-[#1674D1]">{item.replaceAll('_', ' ')}</span>)}</div>
                <p className="mt-3 text-[11px] text-[#64748B]">Catatan dari Pelamar</p>
                <p className="text-xs text-[#102B4B]">{accessibilityForm.data.notes || '-'}</p>
              </div>
              <div className="mt-3 flex gap-2 rounded-xl bg-[#F7FAFD] p-3 text-[11px] text-[#64748B]"><Lock className="h-4 w-4 shrink-0 text-[#1674D1]" />Kamu dapat mengubah atau menyembunyikan informasi ini kapan saja.</div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function ProfileField({ label, error, icon, children }: { label: string; error?: string; icon?: ReactElement; children: ReactElement | ReactElement[] }) {
  return <div><Label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">{icon}{label}</Label><div className="mt-1.5">{children}</div>{error && <p className="mt-1 text-xs text-rose-600">{error}</p>}</div>;
}

function SummaryRow({ icon, label, value }: { icon: ReactElement; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 [&>svg]:h-5 [&>svg]:w-5 text-[#64748B]">{icon}</span><div><p className="text-xs text-[#64748B]">{label}</p><p className="font-semibold">{value}</p></div></div>;
}
