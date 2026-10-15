import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Clock, FileText } from 'lucide-react';
import type { ReactElement } from 'react';

interface NotificationData {
  application_id?: number;
  vacancy_title?: string;
  company_name?: string;
  status?: string;
  notes?: string;
  link?: string;
}

interface NotificationItem {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

interface Props {
  notifications: {
    data: NotificationItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: Props): ReactElement {
  const markAsRead = (id: string): void => {
    router.post(`/app/notifications/${id}/read`);
  };

  const markAllAsRead = (): void => {
    router.post('/app/notifications/read-all');
  };

  return (
    <AppLayout>
      <Head title="Notifikasi Aktivitas Lamaran" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pemberitahuan & Notifikasi</h1>
            <p className="mt-1 text-sm text-slate-600">
              Pembaruan status lamaran dan pesan dari pihak perusahaan.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs text-teal-700 hover:bg-teal-50 min-h-[44px]"
            >
              <CheckCheck className="h-4 w-4" />
              Tandai Semua Dibaca ({unreadCount})
            </Button>
          )}
        </div>

        {notifications.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Belum ada notifikasi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Pembaruan terkait proses lamaran Anda akan ditampilkan di halaman ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.data.map((item) => {
              const isUnread = !item.read_at;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-5 transition sm:flex-row sm:items-center ${
                    isUnread
                      ? 'border-teal-300 bg-teal-50/40 shadow-sm'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" aria-label="Belum dibaca" />
                      )}
                      <h2 className="text-base font-bold text-slate-900">
                        {item.data.vacancy_title}
                      </h2>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                        {item.data.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700">
                      Perusahaan <strong className="text-slate-900">{item.data.company_name}</strong> telah memperbarui status lamaran Anda menjadi: <span className="font-semibold text-teal-800">{item.data.status}</span>.
                    </p>

                    {item.data.notes && (
                      <p className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600 mt-2">
                        <strong>Catatan HR:</strong> {item.data.notes}
                      </p>
                    )}

                    <p className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={item.data.link || '/app/applications'}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 min-h-[44px]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Buka Lamaran
                    </Link>

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Tandai sudah dibaca"
                        aria-label="Tandai notifikasi sudah dibaca"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
