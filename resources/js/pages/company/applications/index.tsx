import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, FileText, UserCheck, Users, X } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';

interface AccessibilityProfileItem {
  id: number;
  disability_types?: string[];
  accommodations_needed?: string[];
  notes?: string;
}

interface SeekerUser {
  id: number;
  name: string;
  email: string;
  accessibility_profile?: AccessibilityProfileItem;
}

interface SeekerProfileItem {
  id: number;
  phone?: string;
  current_job_title?: string;
  user: SeekerUser;
}

interface VacancyItem {
  id: number;
  title: string;
}

interface ApplicationItem {
  id: number;
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
  status_notes?: string;
  applied_at: string;
  cv_path: string;
  cover_letter?: string;
  vacancy: VacancyItem;
  job_seeker_profile: SeekerProfileItem;
}

interface Props {
  applications: {
    data: ApplicationItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
}

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Baru Masuk',
  reviewed: 'Ditinjau',
  interview: 'Wawancara',
  hired: 'Diterima',
  rejected: 'Ditolak',
  withdrawn: 'Dibatalkan',
};

const ACCESSIBILITY_LABELS: Record<string, string> = {
  ramp_access: 'Akses Ram',
  elevator: 'Akses Lift',
  accessible_restroom: 'Toilet Khusus',
  screen_reader_software: 'Screen Reader',
  sign_language_interpreter: 'Juru Bahasa Isyarat',
  written_communication: 'Komunikasi Tertulis',
  flexible_hours: 'Jam Fleksibel',
  remote_option: 'Kerja Remote',
  ergonomic_workspace: 'Ruang Ergonomis',
  quiet_space: 'Ruang Tenang',
  fisik: 'Disabilitas Fisik',
  netra: 'Disabilitas Netra',
  rungu: 'Disabilitas Rungu',
  wicara: 'Disabilitas Wicara',
  intelektual: 'Disabilitas Intelektual',
  screen_reader: 'Screen Reader',
  ramp: 'Ram Kursi Roda',
  komunikasi_tertulis: 'Komunikasi Tertulis',
  remote_work: 'Kerja Remote',
  lift: 'Akses Lift',
};

export default function CompanyApplicationsIndex({ applications }: Props): ReactElement {
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const openStatusModal = (app: ApplicationItem): void => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNotes(app.status_notes ?? '');
  };

  const handleUpdateStatus = (e: FormEvent): void => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    router.patch(
      `/company/applications/${selectedApp.id}/status`,
      {
        status: newStatus,
        status_notes: statusNotes,
      },
      {
        onSuccess: () => {
          setSelectedApp(null);
          setIsUpdating(false);
        },
        onError: () => setIsUpdating(false),
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Kelola Pelamar Kerja" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pelamar & Kandidat Masuk</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tinjau profil pelamar, CV, dan kebutuhan akomodasi aksesibilitas tempat kerja kandidat.
          </p>
        </div>

        {applications.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Belum ada kandidat yang melamar</h3>
            <p className="mt-1 text-sm text-slate-500">
              Kandidat yang mengirim lamaran untuk lowongan Anda akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.data.map((app) => {
              const seeker = app.job_seeker_profile;
              const user = seeker.user;
              const accProfile = user.accessibility_profile;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            app.status === 'hired'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : app.status === 'interview'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {STATUS_LABELS[app.status] ?? app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Melamar posisi: <strong className="text-slate-700">{app.vacancy.title}</strong> • {new Date(app.applied_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openStatusModal(app)}
                        className="bg-teal-600 hover:bg-teal-700 text-xs min-h-[44px]"
                      >
                        Ubah Status Lamaran
                      </Button>
                    </div>
                  </div>

                  {/* Accessibility Profile Highlights */}
                  {accProfile && (
                    <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/40 p-4 text-xs">
                      <span className="font-semibold text-teal-950 block mb-1">
                        Profil & Kebutuhan Aksesibilitas Kandidat:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {accProfile.disability_types && accProfile.disability_types.map((d, i) => (
                          <span key={i} className="rounded bg-teal-100 px-2 py-0.5 text-teal-800 font-medium">
                            {ACCESSIBILITY_LABELS[d] ?? d}
                          </span>
                        ))}
                        {accProfile.accommodations_needed && accProfile.accommodations_needed.map((a, i) => (
                          <span key={i} className="rounded bg-white border border-teal-200 px-2 py-0.5 text-slate-700">
                            Akomodasi: {ACCESSIBILITY_LABELS[a] ?? a}
                          </span>
                        ))}
                      </div>
                      {accProfile.notes && (
                        <p className="mt-2 text-slate-600 italic">"{accProfile.notes}"</p>
                      )}
                    </div>
                  )}

                  {/* Cover Letter excerpt */}
                  {app.cover_letter && (
                    <div className="mt-3 text-xs text-slate-600">
                      <strong className="text-slate-800">Catatan Pelamar:</strong> {app.cover_letter}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="text-slate-500">Email: {user.email}</span>
                    <a
                      href={`/storage/${app.cv_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:underline min-h-[44px]"
                    >
                      <FileText className="h-4 w-4" />
                      Unduh / Lihat CV
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Update Status Modal */}
        {selectedApp && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 id="status-modal-title" className="text-base font-bold text-slate-900">
                  Ubah Status: {selectedApp.job_seeker_profile.user.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="modal-status-select" className="block text-sm font-medium text-slate-700">
                    Pilih Status Baru
                  </label>
                  <select
                    id="modal-status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5 text-sm min-h-[44px]"
                  >
                    <option value="submitted">Baru Masuk (Submitted)</option>
                    <option value="reviewed">Sedang Ditinjau (Reviewed)</option>
                    <option value="interview">Tahap Wawancara (Interview)</option>
                    <option value="hired">Diterima Kerja (Hired)</option>
                    <option value="rejected">Ditolak (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-notes-input" className="block text-sm font-medium text-slate-700">
                    Catatan / Pesan untuk Pelamar (Opsional)
                  </label>
                  <textarea
                    id="modal-notes-input"
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Contoh: Jadwal wawancara online via Google Meet pada hari Kamis..."
                    className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedApp(null)}
                    className="min-h-[44px]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-teal-600 hover:bg-teal-700 min-h-[44px]"
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
