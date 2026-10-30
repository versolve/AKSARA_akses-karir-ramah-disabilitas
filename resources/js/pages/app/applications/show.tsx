import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
  Accessibility,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  X,
  MessageSquare,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface AccessibilityItem {
  id: number;
  accommodation_type: string;
  description?: string;
}

interface CompanyItem {
  id: number;
  company_name: string;
  description?: string;
}

interface VacancyDetail {
  id: number;
  title: string;
  slug: string;
  location: string;
  work_model: string;
  job_type: string;
  company_profile: CompanyItem;
  accessibilities: AccessibilityItem[];
}

interface ApplicationDetail {
  id: number;
  vacancy_id: number;
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
  status_notes?: string;
  applied_at: string;
  cv_path: string;
  cover_letter?: string;
  vacancy: VacancyDetail;
}

interface Props {
  application: ApplicationDetail;
}

const ACCESSIBILITY_LABELS: Record<string, string> = {
  ramp_access: 'Ruang kerja aksesibel (kursi roda)',
  elevator: 'Akses lift prioritas gedung',
  accessible_restroom: 'Fasilitas toilet aksesibel & parkir khusus',
  screen_reader_software: 'Dukungan software screen reader',
  sign_language_interpreter: 'Juru bahasa isyarat / BISINDO',
  written_communication: 'Komunikasi kerja tertulis (text-only)',
  flexible_hours: 'Fleksibilitas jadwal kerja',
  remote_option: 'Fleksibilitas kerja (remote/hybrid)',
  ergonomic_workspace: 'Alat bantu kerja sesuai kebutuhan',
  quiet_space: 'Proses rekrutmen yang inklusif',
};

export default function ApplicationShow({ application }: Props): ReactElement {
  const app = application;
  const vac = app.vacancy;
  const comp = vac.company_profile;

  const appliedDate = new Date(app.applied_at);
  const formattedDate = appliedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = appliedDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStepStatus = (stepKey: string): 'done' | 'current' | 'upcoming' => {
    const order = ['submitted', 'reviewed', 'interview', 'hired'];
    const currentIdx = order.indexOf(app.status);
    const stepIdx = order.indexOf(stepKey);

    if (app.status === 'rejected') {
      if (stepKey === 'submitted') return 'done';
      if (stepKey === 'reviewed') return 'done';
      return 'upcoming';
    }

    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const getStatusBadge = () => {
    switch (app.status) {
      case 'hired':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold px-3 py-1 text-xs">
            <CheckCircle2 className="h-4 w-4" />
            Diterima
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] font-bold px-3 py-1 text-xs">
            <XCircle className="h-4 w-4" />
            Ditolak
          </span>
        );
      case 'interview':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FA] text-[#1674D1] font-bold px-3 py-1 text-xs">
            <Clock className="h-4 w-4" />
            Tahap Wawancara
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FA] text-[#1674D1] font-bold px-3 py-1 text-xs">
            <Clock className="h-4 w-4" />
            Ditinjau HR
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FA] text-[#1674D1] font-bold px-3 py-1 text-xs">
            <Clock className="h-4 w-4" />
            Lamaran Dikirim
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <Head title={`Detail Lamaran - ${vac.title}`} />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/app/applications"
            className="text-xs sm:text-sm font-semibold text-[#1674D1] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Lamaran Saya</span>
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
            Detail Lamaran
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Pantau perkembangan lamaranmu dan lihat informasi lengkapnya.
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card (matches Detail Lamaran.png) */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-black text-xl shrink-0">
                    {comp.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#102B4B] leading-tight">
                      {vac.title}
                    </h2>
                    <p className="text-sm font-semibold text-[#64748B] mt-0.5">
                      {comp.company_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {vac.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        <span className="capitalize">{vac.job_type} ({vac.work_model})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Dilamar pada {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {/* Application Tracking Section */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#102B4B]">Application Tracking</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Berikut adalah tahapan proses rekrutmen dan riwayat pembaruan lamaranmu.
                </p>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                {/* Step 1: Lamaran Dikirim */}
                <div className="relative">
                  <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#16A36B] text-white">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-[#102B4B]">Lamaran Dikirim</h4>
                      <span className="text-xs text-[#64748B]">{formattedDate}, {formattedTime}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      CV dan dokumen lamaran berhasil dikirim ke perusahaan
                    </p>

                    {/* Dokumen yang dikirim container */}
                    <div className="mt-3 rounded-2xl bg-[#EBF5FA] p-3.5 border border-[#D0E5F0]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4B] mb-2">
                        <FileText className="h-3.5 w-3.5 text-[#1674D1]" />
                        <span>Dokumen yang dikirim</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/storage/${app.cv_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white border border-[#D0E5F0] px-3 py-1 text-xs font-semibold text-[#1674D1] hover:bg-slate-50 transition flex items-center gap-1"
                        >
                          <span>CV ATS</span>
                          <Download className="h-3 w-3" />
                        </a>
                        <span className="rounded-lg bg-white border border-[#D0E5F0] px-3 py-1 text-xs font-semibold text-[#475569]">
                          Portofolio
                        </span>
                        {app.cover_letter && (
                          <span className="rounded-lg bg-white border border-[#D0E5F0] px-3 py-1 text-xs font-semibold text-[#475569]">
                            Cover Letter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Ditinjau oleh HR */}
                <div className="relative">
                  {getStepStatus('reviewed') === 'done' || getStepStatus('reviewed') === 'current' ? (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1674D1] text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-300" />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-[#102B4B]">Ditinjau oleh HR</h4>
                      {app.status !== 'submitted' && (
                        <span className="text-xs text-[#64748B]">{formattedDate}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Lamaran kamu sedang ditinjau oleh tim rekrutmen.
                    </p>

                    {/* Catatan dari HR container */}
                    <div className="mt-3 rounded-2xl bg-[#EBF5FA] p-3.5 border border-[#D0E5F0]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4B] mb-1">
                        <MessageSquare className="h-3.5 w-3.5 text-[#1674D1]" />
                        <span>Catatan dari HR</span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {app.status_notes ||
                          'Lamaran kamu sedang ditinjau oleh tim rekrutmen. Jika profil sesuai, kami akan menghubungi kamu untuk tahap wawancara.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Wawancara */}
                <div className="relative">
                  {getStepStatus('interview') === 'done' || getStepStatus('interview') === 'current' ? (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#16A36B] text-white">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-300" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm text-[#102B4B]">Wawancara</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {app.status === 'interview'
                        ? 'Jadwal wawancara telah diatur. Periksa pesan atau email untuk tautan meeting.'
                        : 'Menunggu jadwal wawancara dari perusahaan.'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Keputusan Akhir */}
                <div className="relative">
                  {app.status === 'hired' ? (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#16A36B] text-white">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  ) : app.status === 'rejected' ? (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#B91C1C] text-white">
                      <X className="h-4 w-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute -left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-300" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm text-[#102B4B]">Keputusan Akhir</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {app.status === 'hired'
                        ? 'Selamat! Anda diterima untuk posisi pekerjaan ini.'
                        : app.status === 'rejected'
                        ? 'Lamaran belum dapat dilanjutkan oleh pihak perusahaan.'
                        : 'Menunggu hasil akhir dari proses rekrutmen.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Card 1: Informasi Lamaran */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#102B4B]">Informasi Lamaran</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Perusahaan
                  </span>
                  <strong className="text-[#102B4B] text-right">{comp.company_name}</strong>
                </div>

                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    Lokasi
                  </span>
                  <strong className="text-[#102B4B] text-right">{vac.location}</strong>
                </div>

                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    Jenis Pekerjaan
                  </span>
                  <strong className="text-[#102B4B] text-right capitalize">
                    {vac.job_type} ({vac.work_model})
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Tanggal Melamar
                  </span>
                  <strong className="text-[#102B4B] text-right">{formattedDate}, {formattedTime}</strong>
                </div>

                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Sumber Lowongan
                  </span>
                  <strong className="text-[#102B4B] text-right">Profabel</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Tentang Perusahaan */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-[#102B4B]">Tentang Perusahaan</h3>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-bold text-base shrink-0">
                  {comp.company_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102B4B]">{comp.company_name}</h4>
                </div>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed pt-1">
                {comp.description ||
                  'Perusahaan teknologi yang berfokus pada pengembangan solusi digital untuk masyarakat yang lebih inklusif.'}
              </p>
            </div>

            {/* Card 3: Aksesibilitas di Perusahaan */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#102B4B]">Aksesibilitas di Perusahaan</h3>

              <div className="space-y-2 text-xs">
                {vac.accessibilities && vac.accessibilities.length > 0 ? (
                  vac.accessibilities.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>{ACCESSIBILITY_LABELS[acc.accommodation_type] ?? acc.accommodation_type}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>Ruang kerja aksesibel (kursi roda)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>Fasilitas pendukung (toilet aksesibel, parkir khusus)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>Fleksibilitas kerja (remote/hybrid)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>Alat bantu kerja sesuai kebutuhan</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A36B] shrink-0" />
                      <span>Proses rekrutmen yang inklusif</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card 4: Aksi Cepat */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-[#102B4B]">Aksi Cepat</h3>

              <Link
                href={`/messages?application_id=${app.id}`}
                className="w-full rounded-2xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span>Hubungi HR</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
