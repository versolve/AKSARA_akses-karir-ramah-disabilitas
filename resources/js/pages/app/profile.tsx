import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  Award, BriefcaseBusiness, Calendar, Download, Eye, FileText, FolderKanban, GraduationCap, HeartHandshake, Info, Link2, Mail, MapPin, Phone, User, X,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface WorkExperience {
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  start_year?: number;
  end_year?: number;
  location?: string;
}

interface Project {
  name: string;
  description?: string;
  url?: string;
  skills?: string[];
}

interface Certification {
  name: string;
  issuer?: string;
  year?: number;
  credential_url?: string;
}

interface ProfileData {
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
  educations: EducationItem[];
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

export default function PelamarProfile({ user: profileUser = {}, profile, accessibility = {} }: Props): ReactElement {
  const userName = profileUser.name || 'Pelamar';
  const userEmail = profileUser.email || '';
  const userAvatar = profileUser.avatar || null;
  const skills = profile.skills ?? [];
  const workExperiences = profile.work_experiences ?? [];
  const educations = profile.educations ?? [];
  const projects = profile.projects ?? [];
  const certifications = profile.certifications ?? [];
  const completion = Math.min(100, Math.max(0, profile.profile_completed_percentage ?? 80));

  return (
    <AppLayout>
      <Head title="Profil Saya - Profabel" />

      <main className="min-h-screen bg-[#F4F9FC] py-8 sm:py-10">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <header className="mb-8 sm:mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#102B4D] sm:text-4xl">Profil Saya</h1>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#52677A] sm:text-base">Kelola informasi pribadi, CV, dan preferensi aksesibilitas untuk pengalaman melamar yang baik.</p>
          </header>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-xl bg-white p-5 sm:p-6">
                <h2 className="text-2xl font-extrabold text-[#102B4D]">Informasi Dasar</h2>
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-x-7 gap-y-3 sm:grid-cols-2"><DetailRow icon={<User />} label="Nama Lengkap" value={profileUser.name || '-'} /><DetailRow icon={<Mail />} label="Email" value={userEmail || '-'} /></div>
                  <hr className="border-[#E4EDF3]" />
                  <div className="grid grid-cols-1 gap-x-7 gap-y-3 sm:grid-cols-2"><DetailRow icon={<Phone />} label="Nomor Telepon" value={profile.phone || '-'} /><DetailRow icon={<Calendar />} label="Tanggal Lahir" value={formatBirthDate(profile.birth_date)} /></div>
                  <hr className="border-[#E4EDF3]" />
                  <div className="grid grid-cols-1 gap-x-7 gap-y-3 sm:grid-cols-2"><DetailRow icon={<MapPin />} label="Domisili" value={profile.domicile || '-'} /><DetailRow icon={<User />} label="Jenis Kelamin" value={profile.gender || '-'} /></div>
                  <hr className="border-[#E4EDF3]" />
                  <div className="grid grid-cols-1 gap-x-7 gap-y-3 sm:grid-cols-2"><DetailRow icon={<BriefcaseBusiness />} label="Profesi / Judul Profesional" value={profile.current_job_title || '-'} /><DetailRow icon={<HeartHandshake />} label="Status Mencari Pekerjaan" value="Sedang mencari pekerjaan" /></div>
                </div>
              </section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Tentang Saya</h2><p className="mt-4 text-sm leading-relaxed text-[#3D5265]">{profile.bio || '-'}</p></section>

              <section className="rounded-xl bg-white p-5 sm:p-6">
                <h2 className="text-2xl font-extrabold text-[#102B4D]">Informasi Kontak <span className="text-base font-medium text-[#718494]">(Opsional)</span></h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {profile.linkedin_url && <ContactPill icon={<Link2 className="h-4 w-4 text-[#176C98]" />} url={profile.linkedin_url} label="LinkedIn" />}
                  {profile.portfolio_url && <ContactPill icon={<Link2 className="h-4 w-4 text-[#176C98]" />} url={profile.portfolio_url} label="Portofolio" />}
                  {!profile.linkedin_url && !profile.portfolio_url && <EmptyState text="Belum ada link profesional." />}
                </div>
              </section>

              <section className="rounded-xl bg-white p-5 sm:p-6">
                <h2 className="text-2xl font-extrabold text-[#102B4D]">Pengalaman Kerja</h2>
                {!workExperiences.length && <EmptyState text="Belum ada pengalaman kerja." />}
                <div className="mt-5 space-y-4">{workExperiences.map((item, index) => <TimelineItem key={index} icon={<BriefcaseBusiness className="h-5 w-5 text-[#176C98]" />}><div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-4"><span className="text-base font-extrabold text-[#102B4D]">{item.company}</span><div className="flex flex-wrap items-center gap-2 text-xs text-[#718494]"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatPeriod(item.start_date, item.end_date)}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location || '-'}</span></div></div><p className="mt-1 font-semibold text-[#176C98]">{item.position}</p>{item.description && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#3D5265]">{item.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim()}</li>)}</ul>}</TimelineItem>)}</div>
              </section>

              <section className="rounded-xl bg-white p-5 sm:p-6">
                <h2 className="text-2xl font-extrabold text-[#102B4D]">Pendidikan</h2>
                {!educations.length && <EmptyState text="Belum ada riwayat pendidikan." />}
                <div className="mt-5 space-y-4">{educations.map((item, index) => <TimelineItem key={index} icon={<GraduationCap className="h-5 w-5 text-[#E0A900]" />}><div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-4"><span className="text-base font-extrabold text-[#102B4D]">{item.institution}</span><div className="flex flex-wrap items-center gap-2 text-xs text-[#718494]"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatYearRange(item.start_year, item.end_year)}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location || '-'}</span></div></div><p className="mt-1 font-semibold text-[#176C98]">{item.degree}</p></TimelineItem>)}</div>
              </section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Keahlian <span className="text-base font-normal text-[#718494]">(Skills)</span></h2>{!skills.length && <EmptyState text="Belum ada keahlian terdaftar." />}<div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-[#DDEFFC] px-3.5 py-1.5 text-sm font-medium text-[#176C98]">{skill}<X className="h-3.5 w-3.5 opacity-50" aria-hidden="true" /></span>)}</div></section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Proyek</h2>{!projects.length && <EmptyState text="Belum ada proyek ditampilkan." />}<div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">{projects.map((project, index) => <ProjectCard key={index} project={project} />)}</div></section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Sertifikasi</h2>{!certifications.length && <EmptyState text="Belum ada sertifikasi atau pelatihan." />}<div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">{certifications.map((cert, index) => <CertificationCard key={index} certification={cert} />)}</div></section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-6">
              <section className="rounded-xl bg-white p-5 sm:p-6">
                <div className="flex flex-col items-center text-center"><div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#154E72] text-3xl font-extrabold text-white shadow-sm">{userAvatar ? <img src={userAvatar} alt={userName} className="h-full w-full object-cover" /> : userName.substring(0, 2).toUpperCase()}</div><h3 className="text-xl font-extrabold text-[#102B4D]">{userName}</h3><p className="text-xs text-[#718494]">Pelamar</p>{profile.domicile && <p className="mt-0.5 text-xs text-[#718494]">{profile.domicile}</p>}<div className="mt-5 w-full"><div className="mb-1.5 flex items-center justify-between text-xs font-bold"><span className="text-[#102B4D]">Kelengkapan Profil</span><span className="text-[#102B4D]">{completion}%</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-[#DDE7ED]"><div className="h-full rounded-full bg-[#176C98] transition-all duration-500" style={{ width: `${completion}%` }} /></div></div><div className="mt-4 flex w-full flex-col gap-2"><Link href="/app/profile/edit" className="block"><Button className="min-h-11 w-full bg-[#123B5D] font-bold text-white hover:bg-[#0C2742]">Edit Profil</Button></Link><button type="button" onClick={() => navigator.clipboard.writeText(window.location.href)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] px-3 text-sm font-bold text-[#176C98] hover:bg-[#F7FAFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677A5]">Bagikan Profil</button></div></div>
              </section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Informasi Singkat</h2><div className="mt-5 space-y-4"><SummaryRow icon={<User />} label="Nama" value={profileUser.name || '-'} /><SummaryRow icon={<Mail />} label="Email" value={userEmail || '-'} /><SummaryRow icon={<Phone />} label="Telepon" value={profile.phone || '-'} /><SummaryRow icon={<MapPin />} label="Domisili" value={profile.domicile || '-'} /><SummaryRow icon={<Calendar />} label="Tanggal Lahir" value={formatBirthDate(profile.birth_date)} /><SummaryRow icon={<User />} label="Jenis Kelamin" value={profile.gender || '-'} /><SummaryRow icon={<BriefcaseBusiness />} label="Profesi / Judul Profesional" value={profile.current_job_title || '-'} /><SummaryRow icon={<HeartHandshake />} label="Status Mencari Pekerjaan" value="Sedang mencari pekerjaan" /></div></section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">Accessibility Profile</h2><p className="mt-1.5 text-sm leading-5 text-[#718494]">Informasi untuk membantu perusahaan memahami cara terbaik untuk mendukung dan menyesuaikan lingkungan kerja.</p><div className="mt-4 flex flex-wrap gap-2">{accessibility.accommodations_needed?.length ? accessibility.accommodations_needed.map((acc) => <span key={acc} className="inline-flex items-center rounded-md border border-[#D8E3EA] bg-[#F7FBFD] px-3 py-1.5 text-xs font-medium text-[#173A55]">{translateAccommodation(acc)}</span>) : <span className="text-sm text-[#9DAFBF]">Tidak ada preferensi aksesibilitas.</span>}</div>{accessibility.notes && <div className="mt-4 flex gap-2 rounded-lg bg-[#EEF6FB] p-3 text-xs leading-5 text-[#52677A]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#176C98]" /><div><p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#176C98]">Informasi Tambahan</p><p>{accessibility.notes}</p></div></div>}</section>

              <section className="rounded-xl bg-white p-5 sm:p-6"><h2 className="text-2xl font-extrabold text-[#102B4D]">CV yang Tersimpan</h2>{profile.cv_url ? <><div className="mt-4 flex items-center gap-3 rounded-lg bg-[#EEF6FB] p-3"><FileText className="h-7 w-7 shrink-0 text-rose-500" /><div className="min-w-0"><p className="truncate text-sm font-bold text-[#173A55]">{profile.cv_name || 'CV Tersimpan'}</p><p className="text-xs text-[#718494]">Diunggah pada {profile.cv_updated_at ? formatDateFromIso(profile.cv_updated_at) : '-'}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><a href={profile.cv_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1677A5] text-xs font-bold text-[#176C98]"><Eye className="h-4 w-4" />Lihat CV</a><a href={profile.cv_url} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1677A5] text-xs font-bold text-[#176C98]"><Download className="h-4 w-4" />Unduh CV</a></div></> : <p className="mt-4 text-sm text-[#9DAFBF]">Belum ada CV tersimpan.</p>}</section>
            </aside>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactElement; label: string; value: string }) { return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#718494] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div className="min-w-0"><p className="text-sm text-[#718494]">{label}</p><p className="break-words text-sm font-semibold text-[#173A55]">{value}</p></div></div>; }
function TimelineItem({ icon, children }: { icon: ReactElement; children: ReactElement | ReactElement[] }) { return <div className="relative flex gap-3.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7FBFD]">{icon}</div><div className="flex-1 pt-1">{children}</div></div>; }
function ContactPill({ icon, url, label }: { icon: ReactElement; url: string; label: string }) { return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#D8E3EA] bg-[#F7FBFD] px-4 py-2.5 text-sm font-semibold text-[#176C98] hover:border-[#1677A5] hover:bg-[#EFF9FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677A5]"><span>{icon}</span><span className="max-w-[140px] truncate">{label}: {url}</span></a>; }
function ProjectCard({ project }: { project: Project }) { return <div className="flex flex-col gap-3 rounded-lg border border-[#CBD8E1] bg-white p-4"><div><h3 className="text-base font-extrabold text-[#102B4D]">{project.name}</h3><p className="mt-1 text-sm leading-relaxed text-[#3D5265]">{project.description || '-'}</p></div>{project.skills?.length ? <div className="flex flex-wrap gap-2 pt-2">{project.skills.map((skill) => <span key={skill} className="inline-flex items-center rounded-md bg-[#DDEFFC] px-2.5 py-1 text-[10px] font-bold text-[#176C98]">{skill}</span>)}</div> : null}</div>; }
function CertificationCard({ certification }: { certification: Certification }) { return <div className="flex items-start gap-3 rounded-lg border border-[#CBD8E1] bg-white p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EEF6FB] text-[#176C98]"><Award className="h-5 w-5" /></div><div className="min-w-0"><p className="text-sm font-extrabold text-[#102B4D]">{certification.name}</p><p className="text-xs text-[#718494]">{certification.issuer || 'Platform terbuka'} · {certification.year || 'N/A'}</p>{certification.credential_url && <a href={certification.credential_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#176C98] hover:underline">Verifikasi Credential</a>}</div></div>; }
function EmptyState({ text }: { text: string }) { return <p className="rounded-lg border border-dashed border-[#B9CAD5] bg-[#F8FBFD] px-4 py-5 text-center text-sm text-[#718494]">{text}</p>; }
function SummaryRow({ icon, label, value }: { icon: ReactElement; label: string; value: string }) { return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#6C8192] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div className="min-w-0"><p className="text-sm text-[#718494]">{label}</p><p className="break-words text-sm font-semibold text-[#173A55]">{value}</p></div></div>; }
function formatBirthDate(value?: string): string { if (!value) return '-'; return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
function formatPeriod(start?: string, end?: string): string { if (!start && !end) return '-'; const s = start ? new Date(start).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : ''; const e = end ? new Date(end).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : ''; return [s, e].filter(Boolean).join(' – '); }
function formatYearRange(start?: number, end?: number): string { if (!start && !end) return '-'; return [start, end].filter(Boolean).join(' – '); }
function translateAccommodation(key: string): string { const map: Record<string, string> = { komunikasi_tertulis: 'Komunikasi tertulis lebih disukai', remote_work: 'Kerja remote atau hybrid', screen_reader: 'Screen reader dan keyboard alternatif', flexible_hours: 'Jadwal kerja fleksibel', ramp: 'Akses fisik tertentu' }; return map[key] || key.replace(/_/g, ' '); }
function formatDateFromIso(iso: string): string { try { return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; } }
