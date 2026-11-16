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
import { INDONESIA_PROVINCES, INDONESIA_REGIONS, parseDomicile } from '@/data/indonesia-regions';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
  Award,
  BriefcaseBusiness,
  Calendar,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Info,
  Link2,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Pencil,
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
  file_path?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
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

  const initialDomicile = parseDomicile(profile.domicile ?? '');
  const [selectedProvince, setSelectedProvince] = useState<string>(initialDomicile.province);
  const [selectedCity, setSelectedCity] = useState<string>(initialDomicile.city);

  const availableCities = selectedProvince && INDONESIA_REGIONS[selectedProvince]
    ? INDONESIA_REGIONS[selectedProvince]
    : [];

  const initialDomicileString =
    initialDomicile.city && initialDomicile.province
      ? `${initialDomicile.city}, ${initialDomicile.province}`
      : (profile.domicile ?? '');

  const profileForm = useForm<ProfileData>({
    name: profileUser.name ?? user?.name ?? '',
    email: profileUser.email ?? user?.email ?? '',
    phone: profile.phone ?? '',
    birth_date: profile.birth_date ?? '',
    domicile: initialDomicileString,
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

  const handleProvinceChange = (newProvince: string): void => {
    setSelectedProvince(newProvince);
    setSelectedCity('');
    profileForm.setData('domicile', newProvince);
  };

  const handleCityChange = (newCity: string): void => {
    setSelectedCity(newCity);
    if (newCity && selectedProvince) {
      profileForm.setData('domicile', `${newCity}, ${selectedProvince}`);
    } else if (selectedProvince) {
      profileForm.setData('domicile', selectedProvince);
    } else {
      profileForm.setData('domicile', '');
    }
  };

  // Modal states & drafts for Work, Education, Project, Certification
  const [activeModal, setActiveModal] = useState<'work' | 'education' | 'project' | 'certification' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [workDraft, setWorkDraft] = useState<WorkExperience>({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    location: '',
    description: '',
  });

  const [educationDraft, setEducationDraft] = useState<Education>({
    institution: '',
    degree: '',
    start_year: '',
    end_year: '',
    location: '',
  });

  const [projectDraft, setProjectDraft] = useState<Project>({
    name: '',
    description: '',
    url: '',
    skills: [],
  });

  const [certDraft, setCertDraft] = useState<Certification>({
    name: '',
    issuer: '',
    year: '',
    credential_url: '',
    file_path: '',
    file_url: '',
    file_name: '',
    file_type: '',
  });

  const certFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCertFile, setIsUploadingCertFile] = useState(false);
  const [certUploadError, setCertUploadError] = useState('');
  const [previewDocModal, setPreviewDocModal] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  // Modal Handlers - Pengalaman Kerja
  const openAddWork = (): void => {
    setWorkDraft({ company: '', position: '', start_date: '', end_date: '', location: '', description: '' });
    setEditingIndex(null);
    setActiveModal('work');
  };

  const openEditWork = (index: number): void => {
    setWorkDraft({ ...profileForm.data.work_experiences[index] });
    setEditingIndex(index);
    setActiveModal('work');
  };

  const handleSaveWork = (): void => {
    if (!workDraft.company.trim() || !workDraft.position.trim()) return;
    if (editingIndex !== null) {
      profileForm.setData(
        'work_experiences',
        profileForm.data.work_experiences.map((item, i) => (i === editingIndex ? workDraft : item))
      );
    } else {
      profileForm.setData('work_experiences', [...profileForm.data.work_experiences, workDraft]);
    }
    setActiveModal(null);
  };

  const handleDeleteWork = (index: number): void => {
    profileForm.setData(
      'work_experiences',
      profileForm.data.work_experiences.filter((_, i) => i !== index)
    );
  };

  // Modal Handlers - Pendidikan
  const openAddEducation = (): void => {
    setEducationDraft({ institution: '', degree: '', start_year: '', end_year: '', location: '' });
    setEditingIndex(null);
    setActiveModal('education');
  };

  const openEditEducation = (index: number): void => {
    setEducationDraft({ ...profileForm.data.educations[index] });
    setEditingIndex(index);
    setActiveModal('education');
  };

  const handleSaveEducation = (): void => {
    if (!educationDraft.institution.trim() || !educationDraft.degree.trim()) return;
    if (editingIndex !== null) {
      profileForm.setData(
        'educations',
        profileForm.data.educations.map((item, i) => (i === editingIndex ? educationDraft : item))
      );
    } else {
      profileForm.setData('educations', [...profileForm.data.educations, educationDraft]);
    }
    setActiveModal(null);
  };

  const handleDeleteEducation = (index: number): void => {
    profileForm.setData(
      'educations',
      profileForm.data.educations.filter((_, i) => i !== index)
    );
  };

  // Modal Handlers - Proyek
  const openAddProject = (): void => {
    setProjectDraft({ name: '', description: '', url: '', skills: [] });
    setEditingIndex(null);
    setActiveModal('project');
  };

  const openEditProject = (index: number): void => {
    setProjectDraft({ ...profileForm.data.projects[index] });
    setEditingIndex(index);
    setActiveModal('project');
  };

  const handleSaveProject = (): void => {
    if (!projectDraft.name.trim()) return;
    if (editingIndex !== null) {
      profileForm.setData(
        'projects',
        profileForm.data.projects.map((item, i) => (i === editingIndex ? projectDraft : item))
      );
    } else {
      profileForm.setData('projects', [...profileForm.data.projects, projectDraft]);
    }
    setActiveModal(null);
  };

  const handleDeleteProject = (index: number): void => {
    profileForm.setData(
      'projects',
      profileForm.data.projects.filter((_, i) => i !== index)
    );
  };

  // Modal Handlers - Sertifikasi
  const openAddCert = (): void => {
    setCertDraft({
      name: '',
      issuer: '',
      year: '',
      credential_url: '',
      file_path: '',
      file_url: '',
      file_name: '',
      file_type: '',
    });
    setCertUploadError('');
    setEditingIndex(null);
    setActiveModal('certification');
  };

  const openEditCert = (index: number): void => {
    setCertDraft({ ...profileForm.data.certifications[index] });
    setCertUploadError('');
    setEditingIndex(index);
    setActiveModal('certification');
  };

  const handleCertFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      setCertUploadError('Format berkas tidak didukung. Harap unggah berkas PDF atau gambar (JPG, PNG, WebP).');
      if (certFileInputRef.current) certFileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCertUploadError('Ukuran berkas melebihi batas maksimal 10 MB.');
      if (certFileInputRef.current) certFileInputRef.current.value = '';
      return;
    }

    setCertUploadError('');
    setIsUploadingCertFile(true);

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      if (csrfToken) {
        formData.append('_token', csrfToken);
      }

      const response = await fetch('/app/profile/certification/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Gagal mengunggah berkas sertifikat.');
      }

      const data = await response.json();
      setCertDraft((prev) => ({
        ...prev,
        file_path: data.file_path,
        file_url: data.file_url,
        file_name: data.file_name,
        file_type: data.file_type,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah berkas.';
      setCertUploadError(message);
    } finally {
      setIsUploadingCertFile(false);
      if (certFileInputRef.current) {
        certFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCertFile = (): void => {
    setCertDraft((prev) => ({
      ...prev,
      file_path: '',
      file_url: '',
      file_name: '',
      file_type: '',
    }));
    setCertUploadError('');
    if (certFileInputRef.current) {
      certFileInputRef.current.value = '';
    }
  };

  const handleSaveCert = (): void => {
    if (!certDraft.name.trim()) return;
    if (editingIndex !== null) {
      profileForm.setData(
        'certifications',
        profileForm.data.certifications.map((item, i) => (i === editingIndex ? certDraft : item))
      );
    } else {
      profileForm.setData('certifications', [...profileForm.data.certifications, certDraft]);
    }
    setActiveModal(null);
  };

  const handleDeleteCert = (index: number): void => {
    profileForm.setData(
      'certifications',
      profileForm.data.certifications.filter((_, i) => i !== index)
    );
  };

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

  const completion = Math.min(100, Math.max(0, profile.profile_completed_percentage ?? 0));

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
                  <ProfileField label="Provinsi Domisili" error={profileForm.errors.domicile}>
                    <select
                      value={selectedProvince}
                      onChange={(event) => handleProvinceChange(event.target.value)}
                      className={`${inputClass} w-full cursor-pointer`}
                      aria-label="Pilih Provinsi Domisili"
                    >
                      <option value="">Pilih Provinsi</option>
                      {INDONESIA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </ProfileField>
                  <ProfileField label="Kota / Kabupaten Domisili" error={profileForm.errors.domicile}>
                    <select
                      value={selectedCity}
                      onChange={(event) => handleCityChange(event.target.value)}
                      disabled={!selectedProvince}
                      className={`${inputClass} w-full cursor-pointer disabled:cursor-not-allowed disabled:bg-[#E8EFF4] disabled:text-[#8A9AA7]`}
                      aria-label="Pilih Kota atau Kabupaten Domisili"
                    >
                      <option value="">
                        {selectedProvince ? 'Pilih Kota / Kabupaten' : 'Pilih provinsi terlebih dahulu'}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </ProfileField>
                  <ProfileField label="Jenis Kelamin" error={profileForm.errors.gender}>
                    <select value={profileForm.data.gender} onChange={(event) => profileForm.setData('gender', event.target.value)} className={`${inputClass} w-full cursor-pointer`}>
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

                <div className="mt-4">
                  <ProfileField label="Profesi / Judul Profesional" error={profileForm.errors.current_job_title}>
                    <Input className={inputClass} value={profileForm.data.current_job_title} onChange={(event) => profileForm.setData('current_job_title', event.target.value)} placeholder="Contoh: UI/UX Designer / Frontend Developer" />
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

              {/* Seksi Pengalaman Kerja */}
              <section className={panelClass}>
                <SectionHeader icon={<BriefcaseBusiness />} title="Pengalaman Kerja" action="Tambah Pengalaman" onAction={openAddWork} />
                <div className="mt-5 space-y-3">
                  {profileForm.data.work_experiences.length === 0 ? (
                    <EmptyState text="Belum ada pengalaman kerja. Klik tombol di atas untuk menambahkan pengalaman." />
                  ) : (
                    profileForm.data.work_experiences.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl border border-[#D5E0E8] bg-[#F7FBFD] p-4 sm:p-5 hover:border-[#1677A5] transition"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-extrabold text-[#102B4D]">{item.position}</h4>
                            <span className="text-xs text-[#52677A]">•</span>
                            <span className="text-sm font-bold text-[#176C98]">{item.company}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pt-0.5">
                            {(item.start_date || item.end_date) && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-[#1677A5]" />
                                {item.start_date ? formatDisplayDate(item.start_date) : '-'} — {item.end_date ? formatDisplayDate(item.end_date) : 'Sekarang'}
                              </span>
                            )}
                            {item.location && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {item.location}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-[#475569] pt-2 whitespace-pre-line leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => openEditWork(index)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D5E0E8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#176C98] hover:bg-[#EEF6FB] hover:border-[#1677A5] transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWork(index)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Seksi Pendidikan */}
              <section className={panelClass}>
                <SectionHeader icon={<GraduationCap />} title="Pendidikan" action="Tambah Pendidikan" onAction={openAddEducation} />
                <div className="mt-5 space-y-3">
                  {profileForm.data.educations.length === 0 ? (
                    <EmptyState text="Belum ada riwayat pendidikan. Klik tombol di atas untuk menambahkan pendidikan." />
                  ) : (
                    profileForm.data.educations.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl border border-[#D5E0E8] bg-[#F7FBFD] p-4 sm:p-5 hover:border-[#1677A5] transition"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-base font-extrabold text-[#102B4D]">{item.institution}</h4>
                          <p className="text-sm font-semibold text-[#176C98]">{item.degree}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pt-0.5">
                            {(item.start_year || item.end_year) && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-[#1677A5]" />
                                {item.start_year || '-'} — {item.end_year || 'Sekarang'}
                              </span>
                            )}
                            {item.location && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {item.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => openEditEducation(index)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D5E0E8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#176C98] hover:bg-[#EEF6FB] hover:border-[#1677A5] transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(index)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Seksi Keahlian */}
              <section className={panelClass}>
                <SectionHeader icon={<Award />} title="Keahlian" />
                <div className="mt-5 flex flex-wrap gap-2">
                  {profileForm.data.skills.map((skill) => (
                    <span key={skill} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#DDEFFC] px-3.5 text-sm font-medium text-[#176C98]">
                      {skill}<button type="button" onClick={() => profileForm.setData('skills', profileForm.data.skills.filter((item) => item !== skill))} aria-label={`Hapus ${skill}`} className="cursor-pointer hover:opacity-75"><X className="h-4 w-4" /></button>
                    </span>
                  ))}
                  <div className="flex min-w-[240px] flex-1 gap-2 sm:max-w-sm">
                    <Input className={inputClass} value={newSkill} onChange={(event) => setNewSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} placeholder="Tambah keahlian" />
                    <Button type="button" variant="outline" onClick={addSkill} className="min-h-11 border-[#1677A5] text-[#176C98] cursor-pointer"><Plus className="h-4 w-4" />Tambah</Button>
                  </div>
                </div>
              </section>

              {/* Seksi Proyek */}
              <section className={panelClass}>
                <SectionHeader icon={<FolderKanban />} title="Proyek" action="Tambah Proyek" onAction={openAddProject} />
                <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {profileForm.data.projects.length === 0 ? (
                    <div className="xl:col-span-2">
                      <EmptyState text="Belum ada proyek. Klik tombol di atas untuk menambahkan karya terbaik kamu." />
                    </div>
                  ) : (
                    profileForm.data.projects.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col justify-between rounded-2xl border border-[#D5E0E8] bg-[#F7FBFD] p-4 sm:p-5 hover:border-[#1677A5] transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base font-extrabold text-[#102B4D]">{item.name}</h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditProject(index)}
                                className="rounded-lg p-1.5 text-[#176C98] hover:bg-[#EEF6FB] transition cursor-pointer"
                                title="Edit Proyek"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(index)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Proyek"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1677A5] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Lihat Proyek</span>
                            </a>
                          )}
                          {item.description && (
                            <p className="text-xs text-[#52677A] leading-relaxed pt-1 whitespace-pre-line line-clamp-3">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Seksi Sertifikasi */}
              <section className={panelClass}>
                <SectionHeader icon={<Award />} title="Sertifikasi" action="Tambah Sertifikasi" onAction={openAddCert} />
                <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {profileForm.data.certifications.length === 0 ? (
                    <div className="xl:col-span-2">
                      <EmptyState text="Belum ada sertifikasi atau pelatihan. Klik tombol di atas untuk menambahkan sertifikat." />
                    </div>
                  ) : (
                    profileForm.data.certifications.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col justify-between rounded-2xl border border-[#D5E0E8] bg-[#F7FBFD] p-4 sm:p-5 hover:border-[#1677A5] transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-extrabold text-[#102B4D]">{item.name}</h4>
                              {item.issuer && (
                                <p className="text-xs font-semibold text-[#176C98] mt-0.5">{item.issuer}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditCert(index)}
                                className="rounded-lg p-1.5 text-[#176C98] hover:bg-[#EEF6FB] transition cursor-pointer"
                                title="Edit Sertifikasi"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCert(index)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Sertifikasi"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pt-1">
                            {item.year && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-[#1677A5]" />
                                Tahun {item.year}
                              </span>
                            )}
                            {item.credential_url && (
                              <a
                                href={item.credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#1677A5] hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Kredensial</span>
                              </a>
                            )}
                          </div>

                          {/* Lampiran Berkas Sertifikat */}
                          {item.file_url && (
                            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-white border border-[#E2E8F0] p-2.5 shadow-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.file_type === 'pdf' || item.file_url.toLowerCase().endsWith('.pdf') ? (
                                  <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                )}
                                <span className="truncate text-xs font-semibold text-[#173A55]">
                                  {item.file_name || 'Lampiran Berkas Sertifikat'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDocModal({
                                    url: item.file_url || '',
                                    name: item.file_name || item.name,
                                    type: item.file_type || (item.file_url?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
                                  })}
                                  className="inline-flex items-center gap-1 rounded-md bg-[#EEF6FB] px-2.5 py-1 text-xs font-bold text-[#176C98] hover:bg-[#DDEFFC] transition cursor-pointer"
                                  title="Lihat Pratinjau Sertifikat"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Lihat</span>
                                </button>
                                <a
                                  href={item.file_url}
                                  download
                                  className="inline-flex items-center gap-1 rounded-md border border-[#D5E0E8] bg-white px-2 py-1 text-xs font-semibold text-[#52677A] hover:bg-slate-50 transition"
                                  title="Unduh Berkas Sertifikat"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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

      {/* ===================== MODAL PENGALAMAN KERJA ===================== */}
      <Dialog open={activeModal === 'work'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#102B4D] flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-[#1677A5]" />
              <span>{editingIndex !== null ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Tambahkan riwayat pengalaman kerja kamu agar perusahaan dapat melihat keahlian dan kontribusimu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Nama Perusahaan <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={workDraft.company}
                onChange={(e) => setWorkDraft({ ...workDraft, company: e.target.value })}
                placeholder="Contoh: PT Inklusif Teknologi Nusantara"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Posisi / Jabatan <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={workDraft.position}
                onChange={(e) => setWorkDraft({ ...workDraft, position: e.target.value })}
                placeholder="Contoh: Frontend Developer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tanggal Mulai</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="date"
                  value={workDraft.start_date}
                  onChange={(e) => setWorkDraft({ ...workDraft, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tanggal Berakhir</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="date"
                  value={workDraft.end_date}
                  onChange={(e) => setWorkDraft({ ...workDraft, end_date: e.target.value })}
                />
                <span className="text-[11px] text-[#718494] mt-1 block">Kosongkan jika masih bekerja saat ini</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Lokasi</Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={workDraft.location}
                onChange={(e) => setWorkDraft({ ...workDraft, location: e.target.value })}
                placeholder="Contoh: Jakarta Selatan (Hybrid) / Remote"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Deskripsi Pekerjaan</Label>
              <textarea
                className={`${textareaClass} mt-1.5`}
                rows={4}
                value={workDraft.description}
                onChange={(e) => setWorkDraft({ ...workDraft, description: e.target.value })}
                placeholder="Jelaskan tanggung jawab utama, proyek yang kamu kerjakan, dan pencapaian selama bekerja..."
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-5 border-[#CBD8E1] text-[#52677A] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveWork}
              disabled={!workDraft.company.trim() || !workDraft.position.trim()}
              className="bg-[#123F60] hover:bg-[#0D304A] text-white font-bold rounded-xl px-6 min-h-11 disabled:opacity-50 cursor-pointer"
            >
              Simpan Pengalaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL PENDIDIKAN ===================== */}
      <Dialog open={activeModal === 'education'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#102B4D] flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#1677A5]" />
              <span>{editingIndex !== null ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Tambahkan informasi institusi pendidikan dan jurusan atau gelar yang kamu miliki.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Institusi / Sekolah / Universitas <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={educationDraft.institution}
                onChange={(e) => setEducationDraft({ ...educationDraft, institution: e.target.value })}
                placeholder="Contoh: Universitas Indonesia"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Program Studi / Gelar <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={educationDraft.degree}
                onChange={(e) => setEducationDraft({ ...educationDraft, degree: e.target.value })}
                placeholder="Contoh: S1 Desain Komunikasi Visual / S1 Ilmu Komputer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tahun Mulai</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="number"
                  min="1950"
                  max="2100"
                  value={educationDraft.start_year}
                  onChange={(e) => setEducationDraft({ ...educationDraft, start_year: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="Contoh: 2018"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tahun Selesai / Lulus</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="number"
                  min="1950"
                  max="2100"
                  value={educationDraft.end_year}
                  onChange={(e) => setEducationDraft({ ...educationDraft, end_year: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="Contoh: 2022"
                />
                <span className="text-[11px] text-[#718494] mt-1 block">Kosongkan jika masih menempuh studi</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Lokasi</Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={educationDraft.location}
                onChange={(e) => setEducationDraft({ ...educationDraft, location: e.target.value })}
                placeholder="Contoh: Depok, Jawa Barat"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-5 border-[#CBD8E1] text-[#52677A] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEducation}
              disabled={!educationDraft.institution.trim() || !educationDraft.degree.trim()}
              className="bg-[#123F60] hover:bg-[#0D304A] text-white font-bold rounded-xl px-6 min-h-11 disabled:opacity-50 cursor-pointer"
            >
              Simpan Pendidikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL PROYEK ===================== */}
      <Dialog open={activeModal === 'project'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#102B4D] flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-[#1677A5]" />
              <span>{editingIndex !== null ? 'Edit Proyek' : 'Tambah Proyek'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Tampilkan portofolio, karya terbaik, atau aplikasi yang pernah kamu bangun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Nama Proyek <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={projectDraft.name}
                onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                placeholder="Contoh: Aplikasi Job Portal Aksesibel"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Tautan Proyek / Demo</Label>
              <Input
                className={`${inputClass} mt-1.5`}
                type="url"
                value={projectDraft.url}
                onChange={(e) => setProjectDraft({ ...projectDraft, url: e.target.value })}
                placeholder="https://github.com/username/project atau https://myproject.com"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Deskripsi Proyek</Label>
              <textarea
                className={`${textareaClass} mt-1.5`}
                rows={4}
                value={projectDraft.description}
                onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                placeholder="Ceritakan solusi yang dibuat, teknologi yang digunakan (React, Figma, dll), dan dampak proyek ini..."
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-5 border-[#CBD8E1] text-[#52677A] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveProject}
              disabled={!projectDraft.name.trim()}
              className="bg-[#123F60] hover:bg-[#0D304A] text-white font-bold rounded-xl px-6 min-h-11 disabled:opacity-50 cursor-pointer"
            >
              Simpan Proyek
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL SERTIFIKASI ===================== */}
      <Dialog open={activeModal === 'certification'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#102B4D] flex items-center gap-2">
              <Award className="h-5 w-5 text-[#1677A5]" />
              <span>{editingIndex !== null ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Tambahkan sertifikasi pelatihan atau sertifikat kompetensi yang telah kamu peroleh beserta berkas sertifikatnya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Nama Sertifikasi <span className="text-rose-500">*</span></Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={certDraft.name}
                onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                placeholder="Contoh: Introduction to Frontend Development"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#173A55]">Platform / Penerbit</Label>
              <Input
                className={`${inputClass} mt-1.5`}
                value={certDraft.issuer}
                onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
                placeholder="Contoh: Coursera, Google, Dicoding, Kemkominfo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tahun Perolehan</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="number"
                  min="1950"
                  max="2100"
                  value={certDraft.year}
                  onChange={(e) => setCertDraft({ ...certDraft, year: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="Contoh: 2024"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#173A55]">Tautan Kredensial (Opsional)</Label>
                <Input
                  className={`${inputClass} mt-1.5`}
                  type="url"
                  value={certDraft.credential_url}
                  onChange={(e) => setCertDraft({ ...certDraft, credential_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Unggah Berkas Sertifikat (PDF / Foto) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-semibold text-[#173A55]">
                  Berkas Sertifikat (PDF atau Foto)
                </Label>
                {certDraft.file_url && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" /> Berkas Terlampir
                  </span>
                )}
              </div>

              {/* Input file tersembunyi */}
              <input
                ref={certFileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleCertFileUpload}
                className="hidden"
              />

              {!certDraft.file_url ? (
                /* Area Unggah */
                <div>
                  <button
                    type="button"
                    onClick={() => certFileInputRef.current?.click()}
                    disabled={isUploadingCertFile}
                    className="w-full rounded-2xl border-2 border-dashed border-[#CBD8E1] hover:border-[#1677A5] bg-[#F7FBFD] hover:bg-[#EEF6FB] px-5 py-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    <div className="h-12 w-12 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center text-[#1677A5] group-hover:scale-105 transition">
                      {isUploadingCertFile ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1677A5] border-t-transparent" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#173A55] block">
                        {isUploadingCertFile ? 'Sedang Mengunggah Berkas...' : 'Unggah File Sertifikat (PDF atau Foto)'}
                      </span>
                      <span className="text-xs text-[#718494] mt-0.5 block">
                        Format didukung: PDF, JPG, PNG, WebP (Maksimal 10 MB)
                      </span>
                    </div>
                  </button>
                  {certUploadError && (
                    <p className="mt-2 text-xs text-rose-600 font-medium">{certUploadError}</p>
                  )}
                </div>
              ) : (
                /* Berkas Terlampir & Pratinjau Langsung */
                <div className="rounded-2xl border border-[#CBD8E1] bg-[#F7FBFD] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                        certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf')
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf') ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#173A55]">
                          {certDraft.file_name || 'Berkas Sertifikat'}
                        </p>
                        <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf')
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf') ? 'Dokumen PDF' : 'Foto / Gambar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          url: certDraft.file_url || '',
                          name: certDraft.file_name || certDraft.name,
                          type: certDraft.file_type || (certDraft.file_url?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
                        })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD8E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#176C98] hover:bg-[#EEF6FB] transition cursor-pointer"
                        title="Perbesar / Layar Penuh"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Perbesar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => certFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD8E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#173A55] hover:bg-slate-50 transition cursor-pointer"
                        title="Ganti Berkas"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ganti</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCertFile}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Kontainer Pratinjau Dokumen */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
                      <span className="font-semibold text-[#173A55] flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-[#1677A5]" />
                        Pratinjau {certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf') ? 'Dokumen PDF' : 'Foto Sertifikat'}
                      </span>
                      <a
                        href={certDraft.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1677A5] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Buka di Tab Baru <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {certDraft.file_type === 'pdf' || certDraft.file_url.toLowerCase().endsWith('.pdf') ? (
                      /* PDF Preview Container with iframe */
                      <div className="relative w-full rounded-xl border border-[#CBD8E1] bg-white overflow-hidden shadow-inner">
                        <iframe
                          src={`${certDraft.file_url}#toolbar=1&navpanes=0`}
                          className="w-full h-72 sm:h-80 border-0"
                          title="Pratinjau Sertifikat PDF"
                        />
                      </div>
                    ) : (
                      /* Image Preview Container */
                      <div className="relative w-full rounded-xl border border-[#CBD8E1] bg-slate-100 p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={certDraft.file_url}
                          alt={certDraft.name || 'Pratinjau Sertifikat'}
                          className="max-h-72 object-contain rounded-lg shadow-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-5 border-[#CBD8E1] text-[#52677A] cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveCert}
              disabled={!certDraft.name.trim()}
              className="bg-[#123F60] hover:bg-[#0D304A] text-white font-bold rounded-xl px-6 min-h-11 disabled:opacity-50 cursor-pointer"
            >
              Simpan Sertifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL PRATINJAU DOKUMEN SERTIFIKAT ===================== */}
      <Dialog open={!!previewDocModal} onOpenChange={(open) => !open && setPreviewDocModal(null)}>
        <DialogContent className="max-w-4xl sm:max-w-5xl bg-white rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] max-h-[92vh] flex flex-col">
          <DialogHeader className="shrink-0 pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-4 pr-6">
              <div className="min-w-0">
                <DialogTitle className="text-lg font-extrabold text-[#102B4D] truncate flex items-center gap-2">
                  {previewDocModal?.type === 'pdf' ? (
                    <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                  <span className="truncate">{previewDocModal?.name || 'Pratinjau Sertifikat'}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#64748B] mt-0.5">
                  Pratinjau berkas sertifikat resolusi penuh
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {previewDocModal?.url && (
                  <>
                    <a
                      href={previewDocModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD8E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#176C98] hover:bg-[#EEF6FB] transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Buka di Tab Baru</span>
                    </a>
                    <a
                      href={previewDocModal.url}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#123F60] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D304A] transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Unduh</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-[350px] max-h-[68vh] overflow-auto py-3">
            {previewDocModal?.type === 'pdf' ? (
              <iframe
                src={`${previewDocModal.url}#toolbar=1`}
                className="w-full h-[65vh] rounded-xl border border-[#CBD8E1] bg-white"
                title="Pratinjau Dokumen PDF Penuh"
              />
            ) : (
              <div className="flex items-center justify-center min-h-[350px] p-2 bg-slate-50 rounded-xl border border-[#CBD8E1]">
                <img
                  src={previewDocModal?.url}
                  alt={previewDocModal?.name}
                  className="max-h-[65vh] object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
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
