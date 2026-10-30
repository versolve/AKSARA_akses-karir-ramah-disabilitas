import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
  Award,
  BriefcaseBusiness,
  Calendar,
  Download,
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  Info,
  Link2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type ReactElement } from 'react';

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  start_year: number | '';
  end_year: number | '';
  location: string;
}

interface Project {
  name: string;
  description: string;
  url: string;
  skills: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: number | '';
  credential_url: string;
}

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
  skills: string[];
  work_experiences: WorkExperience[];
  educations: Education[];
  projects: Project[];
  certifications: Certification[];
}

interface AccessibilityData {
  disability_types: string[];
  accommodations_needed: string[];
  notes: string;
}

interface Props {
  user?: { name?: string; email?: string; avatar?: string | null };
  profile: Partial<ProfileData> & {
    cv_url?: string | null;
    cv_name?: string | null;
    cv_updated_at?: string | null;
    profile_completed_percentage?: number;
  };
  accessibility?: Partial<AccessibilityData>;
}

const inputClass = 'min-h-11 rounded-lg border-[#D5E0E8] bg-[#F3F7FA] px-3 text-sm text-[#173A55] placeholder:text-[#8A9AA7] focus-visible:border-[#1677A5] focus-visible:ring-[#1677A5]/15';
const textareaClass = 'w-full rounded-lg border border-[#D5E0E8] bg-[#F3F7FA] px-3 py-2.5 text-sm text-[#173A55] outline-none placeholder:text-[#8A9AA7] focus:border-[#1677A5] focus:ring-2 focus:ring-[#1677A5]/15';
const panelClass = 'rounded-xl bg-white p-5 sm:p-6';

export default function PelamarProfile({ user: profileUser = {}, profile, accessibility = {} }: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as { auth?: { user?: { name?: string; email?: string; avatar?: string | null } } }).auth;
  const user = auth?.user;
  const userName = user?.name || profileUser.name || 'Pelamar';
  const avatarUrl = user?.avatar || profileUser.avatar;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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
    skills: profile.skills ?? [],
    work_experiences: profile.work_experiences ?? [],
    educations: profile.educations ?? [],
    projects: profile.projects ?? [],
    certifications: profile.certifications ?? [],
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
    accessibilityForm.setData('accommodations_needed', current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const addSkill = (): void => {
    const skill = newSkill.trim();
    if (!skill || profileForm.data.skills.includes(skill)) return;
    profileForm.setData('skills', [...profileForm.data.skills, skill]);
    setNewSkill('');
  };

  const formatBirthDate = (value: string): string => {
    if (!value) return '-';
    return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const accommodations = [
    ['komunikasi_tertulis', 'Komunikasi tertulis lebih disukai'],
    ['remote_work', 'Kerja remote atau hybrid'],
    ['screen_reader', 'Screen reader dan keyboard alternatif'],
    ['flexible_hours', 'Jadwal kerja fleksibel'],
    ['ramp', 'Akses fisik tertentu'],
  ] as const;

  const completion = Math.min(100, Math.max(0, profile.profile_completed_percentage ?? 80));

  return (
    <AppLayout>
      <Head title="Profil Saya - Profabel" />

      <main className="min-h-screen bg-[#F4F9FC] py-8 sm:py-10">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4D] sm:text-4xl">Edit Profil</h1>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#52677A] sm:text-base">
              Perbarui informasi profil kamu agar tetap relevan dan mudah dilihat perusahaan.
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form
              id="profile-form"
              onSubmit={(event) => {
                event.preventDefault();
                profileForm.post('/app/profile', { preserveScroll: true });
              }}
              className="space-y-5"
            >
              <section className={panelClass}>
                <SectionTitle title="Informasi Dasar" description="Isi dan lengkapi informasi diri kamu." />
                <div className="mt-5 grid grid-cols-1 gap-x-7 gap-y-4 sm:grid-cols-2">
                  <ProfileField label="Nama Lengkap" error={profileForm.errors.name}>
                    <Input className={inputClass} value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} />
                  </ProfileField>
                  <ProfileField label="Email">
                    <Input className={inputClass} type="email" value={profileForm.data.email} readOnly aria-readonly="true" />
                  </ProfileField>
                  <ProfileField label="Nomor Telepon" error={profileForm.errors.phone}>
                    <Input className={inputClass} value={profileForm.data.phone} onChange={(event) => profileForm.setData('phone', event.target.value)} placeholder="0812 3456 7890" />
                  </ProfileField>
                  <ProfileField label="Tanggal Lahir" error={profileForm.errors.birth_date}>
                    <Input className={inputClass} type="date" value={profileForm.data.birth_date} onChange={(event) => profileForm.setData('birth_date', event.target.value)} />
                  </ProfileField>
                  <ProfileField label="Domisili" error={profileForm.errors.domicile}>
                    <Input className={inputClass} value={profileForm.data.domicile} onChange={(event) => profileForm.setData('domicile', event.target.value)} placeholder="Jakarta, Indonesia" />
                  </ProfileField>
                  <ProfileField label="Jenis Kelamin" error={profileForm.errors.gender}>
                    <select value={profileForm.data.gender} onChange={(event) => profileForm.setData('gender', event.target.value)} className={`${inputClass} w-full`}>
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                      <option value="Tidak ingin menyebutkan">Tidak ingin menyebutkan</option>
                    </select>
                  </ProfileField>
                </div>

                <div className="mt-4">
                  <ProfileField label="Tentang Saya" error={profileForm.errors.bio}>
                    <textarea className={textareaClass} rows={3} maxLength={500} value={profileForm.data.bio} onChange={(event) => profileForm.setData('bio', event.target.value)} placeholder="Ceritakan pengalaman, minat, dan tujuan karier kamu." />
                    <p className="mt-1 text-right text-xs text-[#7A8C9B]">{profileForm.data.bio.length}/500</p>
                  </ProfileField>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-x-7 gap-y-4 sm:grid-cols-2">
                  <ProfileField label="Profesi / Judul Profesional" error={profileForm.errors.current_job_title}>
                    <Input className={inputClass} value={profileForm.data.current_job_title} onChange={(event) => profileForm.setData('current_job_title', event.target.value)} placeholder="UI/UX Designer" />
                  </ProfileField>
                  <ProfileField label="Pendidikan Terakhir" error={profileForm.errors.education}>
                    <Input className={inputClass} value={profileForm.data.education} onChange={(event) => profileForm.setData('education', event.target.value)} placeholder="S1 Desain Komunikasi Visual" />
                  </ProfileField>
                </div>

                <div className="mt-5 border-t border-[#E4EDF3] pt-5">
                  <h3 className="text-base font-bold text-[#173A55]">Link Profesional <span className="font-normal text-[#597084]">(Opsional)</span></h3>
                  <div className="mt-3 grid grid-cols-1 gap-x-7 gap-y-4 sm:grid-cols-2">
                    <ProfileField label="LinkedIn" error={profileForm.errors.linkedin_url}>
                      <div className="relative"><Link2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#6C8192]" /><Input className={`${inputClass} pl-10`} type="url" value={profileForm.data.linkedin_url} onChange={(event) => profileForm.setData('linkedin_url', event.target.value)} placeholder="https://linkedin.com/in/nama" /></div>
                    </ProfileField>
                    <ProfileField label="Portofolio" error={profileForm.errors.portfolio_url}>
                      <div className="relative"><Link2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#6C8192]" /><Input className={`${inputClass} pl-10`} type="url" value={profileForm.data.portfolio_url} onChange={(event) => profileForm.setData('portfolio_url', event.target.value)} placeholder="https://behance.net/nama" /></div>
                    </ProfileField>
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <SectionHeader icon={<BriefcaseBusiness />} title="Pengalaman Kerja" action="Tambah Pengalaman" onAction={() => profileForm.setData('work_experiences', [...profileForm.data.work_experiences, { company: '', position: '', start_date: '', end_date: '', location: '', description: '' }])} />
                <div className="mt-5 space-y-4">
                  {profileForm.data.work_experiences.length === 0 && <EmptyState text="Belum ada pengalaman kerja. Tambahkan pengalaman terbaru kamu." />}
                  {profileForm.data.work_experiences.map((item, index) => (
                    <EditableBlock key={index} onRemove={() => profileForm.setData('work_experiences', profileForm.data.work_experiences.filter((_, itemIndex) => itemIndex !== index))}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <MiniField label="Nama Perusahaan"><Input className={inputClass} value={item.company} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'company', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField>
                        <MiniField label="Posisi"><Input className={inputClass} value={item.position} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'position', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField>
                        <MiniField label="Mulai"><Input className={inputClass} type="date" value={item.start_date} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'start_date', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField>
                        <MiniField label="Berakhir"><Input className={inputClass} type="date" value={item.end_date} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'end_date', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField>
                        <MiniField label="Lokasi"><Input className={inputClass} value={item.location} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'location', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField>
                      </div>
                      <div className="mt-3"><MiniField label="Deskripsi Pekerjaan"><textarea className={textareaClass} rows={3} value={item.description} onChange={(event) => updateArrayItem(profileForm.data.work_experiences, index, 'description', event.target.value, (items) => profileForm.setData('work_experiences', items))} /></MiniField></div>
                    </EditableBlock>
                  ))}
                </div>
              </section>

              <section className={panelClass}>
                <SectionHeader icon={<GraduationCap />} title="Pendidikan" action="Tambah Pendidikan" onAction={() => profileForm.setData('educations', [...profileForm.data.educations, { institution: '', degree: '', start_year: '', end_year: '', location: '' }])} />
                <div className="mt-5 space-y-4">
                  {profileForm.data.educations.length === 0 && <EmptyState text="Belum ada riwayat pendidikan." />}
                  {profileForm.data.educations.map((item, index) => (
                    <EditableBlock key={index} onRemove={() => profileForm.setData('educations', profileForm.data.educations.filter((_, itemIndex) => itemIndex !== index))}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <MiniField label="Institusi"><Input className={inputClass} value={item.institution} onChange={(event) => updateArrayItem(profileForm.data.educations, index, 'institution', event.target.value, (items) => profileForm.setData('educations', items))} /></MiniField>
                        <MiniField label="Program Studi"><Input className={inputClass} value={item.degree} onChange={(event) => updateArrayItem(profileForm.data.educations, index, 'degree', event.target.value, (items) => profileForm.setData('educations', items))} /></MiniField>
                        <MiniField label="Mulai"><Input className={inputClass} type="number" min="1900" max="2100" value={item.start_year} onChange={(event) => updateArrayItem(profileForm.data.educations, index, 'start_year', event.target.value ? Number(event.target.value) : '', (items) => profileForm.setData('educations', items))} /></MiniField>
                        <MiniField label="Berakhir"><Input className={inputClass} type="number" min="1900" max="2100" value={item.end_year} onChange={(event) => updateArrayItem(profileForm.data.educations, index, 'end_year', event.target.value ? Number(event.target.value) : '', (items) => profileForm.setData('educations', items))} /></MiniField>
                        <MiniField label="Lokasi"><Input className={inputClass} value={item.location} onChange={(event) => updateArrayItem(profileForm.data.educations, index, 'location', event.target.value, (items) => profileForm.setData('educations', items))} /></MiniField>
                      </div>
                    </EditableBlock>
                  ))}
                </div>
              </section>

              <section className={panelClass}>
                <SectionHeader icon={<Award />} title="Keahlian" />
                <div className="mt-5 flex flex-wrap gap-2">
                  {profileForm.data.skills.map((skill) => (
                    <span key={skill} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#DDEFFC] px-3.5 text-sm font-medium text-[#176C98]">
                      {skill}<button type="button" onClick={() => profileForm.setData('skills', profileForm.data.skills.filter((item) => item !== skill))} aria-label={`Hapus ${skill}`}><X className="h-4 w-4" /></button>
                    </span>
                  ))}
                  <div className="flex min-w-[240px] flex-1 gap-2 sm:max-w-sm">
                    <Input className={inputClass} value={newSkill} onChange={(event) => setNewSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} placeholder="Tambah keahlian" />
                    <Button type="button" variant="outline" onClick={addSkill} className="min-h-11 border-[#1677A5] text-[#176C98]"><Plus className="h-4 w-4" />Tambah</Button>
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <SectionHeader icon={<FolderKanban />} title="Proyek" action="Tambah Proyek" onAction={() => profileForm.setData('projects', [...profileForm.data.projects, { name: '', description: '', url: '', skills: [] }])} />
                <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {profileForm.data.projects.length === 0 && <div className="xl:col-span-2"><EmptyState text="Belum ada proyek. Tambahkan karya terbaik kamu." /></div>}
                  {profileForm.data.projects.map((item, index) => (
                    <EditableBlock key={index} onRemove={() => profileForm.setData('projects', profileForm.data.projects.filter((_, itemIndex) => itemIndex !== index))}>
                      <div className="space-y-3">
                        <MiniField label="Nama Proyek"><Input className={inputClass} value={item.name} onChange={(event) => updateArrayItem(profileForm.data.projects, index, 'name', event.target.value, (items) => profileForm.setData('projects', items))} /></MiniField>
                        <MiniField label="Deskripsi"><textarea className={textareaClass} rows={4} value={item.description} onChange={(event) => updateArrayItem(profileForm.data.projects, index, 'description', event.target.value, (items) => profileForm.setData('projects', items))} /></MiniField>
                        <MiniField label="Tautan Proyek"><Input className={inputClass} type="url" value={item.url} onChange={(event) => updateArrayItem(profileForm.data.projects, index, 'url', event.target.value, (items) => profileForm.setData('projects', items))} placeholder="https://" /></MiniField>
                      </div>
                    </EditableBlock>
                  ))}
                </div>
              </section>

              <section className={panelClass}>
                <SectionHeader icon={<Award />} title="Sertifikasi" action="Tambah Sertifikasi" onAction={() => profileForm.setData('certifications', [...profileForm.data.certifications, { name: '', issuer: '', year: '', credential_url: '' }])} />
                <div className="mt-5 space-y-4">
                  {profileForm.data.certifications.length === 0 && <EmptyState text="Belum ada sertifikasi atau pelatihan." />}
                  {profileForm.data.certifications.map((item, index) => (
                    <EditableBlock key={index} onRemove={() => profileForm.setData('certifications', profileForm.data.certifications.filter((_, itemIndex) => itemIndex !== index))}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MiniField label="Nama Sertifikasi"><Input className={inputClass} value={item.name} onChange={(event) => updateArrayItem(profileForm.data.certifications, index, 'name', event.target.value, (items) => profileForm.setData('certifications', items))} /></MiniField>
                        <MiniField label="Platform / Penerbit"><Input className={inputClass} value={item.issuer} onChange={(event) => updateArrayItem(profileForm.data.certifications, index, 'issuer', event.target.value, (items) => profileForm.setData('certifications', items))} /></MiniField>
                        <MiniField label="Tahun"><Input className={inputClass} type="number" min="1900" max="2100" value={item.year} onChange={(event) => updateArrayItem(profileForm.data.certifications, index, 'year', event.target.value ? Number(event.target.value) : '', (items) => profileForm.setData('certifications', items))} /></MiniField>
                        <MiniField label="Tautan Kredensial"><Input className={inputClass} type="url" value={item.credential_url} onChange={(event) => updateArrayItem(profileForm.data.certifications, index, 'credential_url', event.target.value, (items) => profileForm.setData('certifications', items))} placeholder="https://" /></MiniField>
                      </div>
                    </EditableBlock>
                  ))}
                </div>
              </section>
            </form>

            <aside className="space-y-5 lg:sticky lg:top-6">
              <section className={panelClass}>
                <h2 className="text-2xl font-extrabold text-[#102B4D]">Foto Profil</h2>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#154E72] text-2xl font-bold text-white">
                    {user?.avatar ? <img src={user.avatar} alt={userName} className="h-full w-full object-cover" /> : userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar} className="min-h-11 border-[#1677A5] text-[#176C98]"><Upload className="mr-2 h-4 w-4" />{isUploadingAvatar ? 'Mengunggah...' : 'Ubah Foto'}</Button>
                    <p className="mt-2 text-xs leading-5 text-[#718494]">JPG, PNG, WebP. Maksimal 2 MB.</p>
                    {user?.avatar && <button type="button" onClick={() => router.delete('/profile/avatar')} className="mt-1 text-xs font-medium text-rose-600 hover:underline">Hapus foto</button>}
                  </div>
                </div>
                <div className="mt-5 flex gap-2.5 rounded-lg border border-[#D8E8F1] bg-[#F3F8FB] p-3 text-xs leading-5 text-[#52677A]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1677A5]" />Gunakan foto profesional untuk meningkatkan peluang dilirik rekruter.</div>
              </section>

              <section className={panelClass}>
                <div className="flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-extrabold text-[#102B4D]">Informasi Singkat</h2>
                  <span className="text-sm font-bold text-[#173A55]">{completion}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#DDE7ED]"><div className="h-full rounded-full bg-[#176C98]" style={{ width: `${completion}%` }} /></div>
                <div className="mt-5 space-y-4">
                  <SummaryRow icon={<User />} label="Nama" value={profileForm.data.name || '-'} />
                  <SummaryRow icon={<Mail />} label="Email" value={profileForm.data.email || '-'} />
                  <SummaryRow icon={<Phone />} label="Telepon" value={profileForm.data.phone || '-'} />
                  <SummaryRow icon={<MapPin />} label="Domisili" value={profileForm.data.domicile || '-'} />
                  <SummaryRow icon={<Calendar />} label="Tanggal Lahir" value={formatBirthDate(profileForm.data.birth_date)} />
                  <SummaryRow icon={<BriefcaseBusiness />} label="Profesi" value={profileForm.data.current_job_title || '-'} />
                </div>
              </section>

              <form onSubmit={(event) => { event.preventDefault(); accessibilityForm.post('/app/accessibility-profile', { preserveScroll: true }); }} className={`${panelClass} space-y-4`}>
                <SectionTitle title="Accessibility Profile" description="Informasi untuk membantu perusahaan menyesuaikan lingkungan kerja." />
                <div className="space-y-2.5">
                  {accommodations.map(([key, label]) => (
                    <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[#D8E3EA] px-3 text-sm leading-5 text-[#173A55] focus-within:ring-2 focus-within:ring-[#1677A5]/20">
                      <input type="checkbox" checked={accessibilityForm.data.accommodations_needed.includes(key)} onChange={() => toggleAccommodation(key)} className="h-4 w-4 rounded border-[#91A5B5] text-[#176C98] focus:ring-[#1677A5]" />
                      {label}
                    </label>
                  ))}
                </div>
                <ProfileField label="Informasi Tambahan">
                  <textarea className={textareaClass} rows={3} value={accessibilityForm.data.notes} onChange={(event) => accessibilityForm.setData('notes', event.target.value)} placeholder="Jelaskan penyesuaian lain yang kamu butuhkan." />
                </ProfileField>
                <div className="flex gap-2 rounded-lg bg-[#EEF6FB] p-3 text-xs leading-5 text-[#52677A]"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#176C98]" />Informasi ini hanya terlihat oleh perusahaan setelah kamu melamar.</div>
                <Button type="submit" variant="outline" disabled={accessibilityForm.processing} className="w-full min-h-11 border-[#1677A5] text-[#176C98]">{accessibilityForm.processing ? 'Menyimpan...' : 'Simpan Aksesibilitas'}</Button>
              </form>

              <section className={panelClass}>
                <SectionTitle title="CV Saya" description="Unggah dan kelola CV untuk digunakan saat melamar pekerjaan." />
                <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
                <button type="button" onClick={() => cvInputRef.current?.click()} disabled={isUploadingCv} className="mt-4 w-full rounded-lg border border-dashed border-[#9FC2D5] bg-[#F7FBFD] px-4 py-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677A5]">
                  <FileText className="mx-auto h-9 w-9 text-[#1689BE]" />
                  <span className="mt-2 block text-sm font-bold text-[#173A55]">{isUploadingCv ? 'Mengunggah...' : 'Unggah CV'}</span>
                  <span className="mt-1 block text-xs text-[#718494]">PDF, DOC, DOCX. Maksimal 5 MB.</span>
                </button>
                {profile.cv_url && (
                  <div className="mt-4">
                    <div className="flex items-center gap-3 rounded-lg bg-[#EEF6FB] p-3"><FileText className="h-7 w-7 shrink-0 text-rose-500" /><div className="min-w-0"><p className="truncate text-sm font-bold text-[#173A55]">{profile.cv_name ?? 'CV Tersimpan'}</p><p className="text-xs text-[#718494]">Siap digunakan saat melamar</p></div></div>
                    <div className="mt-3 grid grid-cols-2 gap-2"><a href={profile.cv_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1677A5] text-xs font-bold text-[#176C98]"><Eye className="h-4 w-4" />Lihat CV</a><a href={profile.cv_url} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1677A5] text-xs font-bold text-[#176C98]"><Download className="h-4 w-4" />Unduh CV</a></div>
                  </div>
                )}
              </section>

              <Button type="submit" form="profile-form" disabled={profileForm.processing} className="min-h-12 w-full bg-[#123F60] text-base font-bold text-white hover:bg-[#0D304A]">{profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </aside>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return <div><h2 className="text-2xl font-extrabold text-[#102B4D]">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-[#718494]">{description}</p>}</div>;
}

function SectionHeader({ icon, title, action, onAction }: { icon: ReactElement; title: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2.5 text-[#102B4D]"><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span><h2 className="text-2xl font-extrabold">{title}</h2></div>{action && <Button type="button" variant="outline" onClick={onAction} className="min-h-10 border-[#1677A5] text-[#176C98]"><Plus className="mr-1.5 h-4 w-4" />{action}</Button>}</div>;
}

function ProfileField({ label, error, children }: { label: string; error?: string; children: ReactElement | ReactElement[] }) {
  return <div><Label className="text-sm font-semibold text-[#173A55]">{label}</Label><div className="mt-1.5">{children}</div>{error && <p className="mt-1 text-xs text-rose-600">{error}</p>}</div>;
}

function MiniField({ label, children }: { label: string; children: ReactElement }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-[#405D72]">{label}</span>{children}</label>;
}

function EditableBlock({ children, onRemove }: { children: ReactElement | ReactElement[]; onRemove: () => void }) {
  return <div className="relative rounded-lg border border-[#CBD8E1] p-4 pt-6"><button type="button" onClick={onRemove} className="absolute right-2 top-2 rounded p-1 text-[#718494] hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300" aria-label="Hapus item"><Trash2 className="h-4 w-4" /></button>{children}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-[#B9CAD5] bg-[#F8FBFD] px-4 py-5 text-center text-sm text-[#718494]">{text}</p>;
}

function SummaryRow({ icon, label, value }: { icon: ReactElement; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#6C8192] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div className="min-w-0"><p className="text-sm text-[#718494]">{label}</p><p className="break-words text-sm font-semibold text-[#173A55]">{value}</p></div></div>;
}

function updateArrayItem<T, K extends keyof T>(items: T[], index: number, key: K, value: T[K], setItems: (items: T[]) => void): void {
  setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
}
