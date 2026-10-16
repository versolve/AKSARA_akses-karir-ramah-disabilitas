import { ApplicationChatModal } from '@/components/chat/ApplicationChatModal';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Building2, Calendar, CheckCircle2, Clock, FileText, MessageSquare, XCircle } from 'lucide-react';
import { useState, type ReactElement } from 'react';

interface CompanyItem {
  id: number;
  company_name: string;
}

interface VacancyItem {
  id: number;
  title: string;
  slug: string;
  location: string;
  work_model: string;
  company_profile: CompanyItem;
}

interface ApplicationItem {
  id: number;
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
  status_notes?: string;
  applied_at: string;
  cv_path: string;
  vacancy: VacancyItem;
}

interface Props {
  applications: {
    data: ApplicationItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
}

const STEPS = [
  { key: 'submitted', label: 'Terkirim' },
  { key: 'reviewed', label: 'Ditinjau' },
  { key: 'interview', label: 'Wawancara' },
  { key: 'hired', label: 'Diterima' },
];

export default function ApplicationsIndex({ applications }: Props): ReactElement {
  const [activeChat, setActiveChat] = useState<{ id: number; name: string } | null>(null);

  const getStepIndex = (status: ApplicationItem['status']): number => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'reviewed':
        return 1;
      case 'interview':
        return 2;
      case 'hired':
        return 3;
      case 'rejected':
      case 'withdrawn':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <AppLayout>
      <Head title="Lamaran Saya & Pelacakan Status" />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Lamaran Saya</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pantau perkembangan dan tahapan seleksi setiap lamaran pekerjaan Anda secara transparan.
          </p>
        </div>

        {applications.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Belum ada lamaran yang dikirim</h3>
            <p className="mt-1 text-sm text-slate-500">
              Temukan lowongan ramah disabilitas yang cocok di katalog kami.
            </p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 min-h-[44px]"
              >
                Cari Lowongan Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.data.map((app) => {
              const currentStep = getStepIndex(app.status);
              const isRejected = app.status === 'rejected';

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition"
                >
                  <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        <Link href={`/jobs/${app.vacancy.slug}`} className="hover:text-emerald-700">
                          {app.vacancy.title}
                        </Link>
                      </h2>
                      <p className="flex items-center gap-1.5 text-sm text-slate-600 mt-0.5">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {app.vacancy.company_profile.company_name} • {app.vacancy.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Dilamar: {new Date(app.applied_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Stepper Progres */}
                  <div className="py-6">
                    {isRejected ? (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-rose-800 text-sm font-medium">
                        <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                        <span>Lamaran ini belum dapat dilanjutkan oleh pihak perusahaan. Tetap semangat!</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-between">
                        {STEPS.map((step, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={step.key} className="flex flex-1 flex-col items-center relative">
                              <div
                                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                                  isDone
                                    ? 'border-emerald-700 bg-emerald-700 text-white'
                                    : 'border-slate-300 bg-white text-slate-400'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                              </div>
                              <span
                                className={`mt-2 text-xs font-semibold ${
                                  isCurrent
                                    ? 'text-emerald-800 font-bold'
                                    : isDone
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes from HR */}
                  {app.status_notes && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-1">Catatan dari HR:</span>
                      {app.status_notes}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="text-slate-500">
                      Status Terakhir: <strong className="text-slate-800 uppercase">{app.status}</strong>
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveChat({
                            id: app.id,
                            name: `HR ${app.vacancy.company_profile.company_name}`,
                          })
                        }
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline min-h-[44px]"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Pesan HR
                      </button>
                      <a
                        href={`/storage/${app.cv_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-slate-600 hover:underline min-h-[44px]"
                      >
                        <FileText className="h-4 w-4" />
                        Lihat CV
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeChat && (
          <ApplicationChatModal
            applicationId={activeChat.id}
            recipientName={activeChat.name}
            isOpen={true}
            onClose={() => setActiveChat(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
