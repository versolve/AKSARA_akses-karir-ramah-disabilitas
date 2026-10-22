import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

interface NotificationData {
  application_id?: number;
  vacancy_title?: string;
  company_name?: string;
  status?: string;
  notes?: string;
  link?: string;
  interview_date?: string;
  interview_time?: string;
  interview_platform?: string;
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
  const page = usePage();
  const auth = (page.props as any).auth;
  const userName = auth?.user?.name || 'Pelamar';

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(
    notifications.data.length > 0 ? notifications.data[0] : null
  );

  useEffect(() => {
    if (notifications.data.length > 0 && !selectedNotif) {
      setSelectedNotif(notifications.data[0]);
    }
  }, [notifications.data]);

  const markAsRead = (id: string): void => {
    router.post(`/app/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const markAllAsRead = (): void => {
    router.post('/app/notifications/read-all', {}, { preserveScroll: true });
  };

  const handleSelectNotif = (item: NotificationItem): void => {
    setSelectedNotif(item);
    if (!item.read_at) {
      markAsRead(item.id);
    }
  };

  const getNotifTitle = (item: NotificationItem): string => {
    const status = item.data.status;
    if (status === 'interview') return 'Undangan Wawancara';
    if (status === 'hired') return 'Lamaran Diterima';
    if (status === 'rejected') return 'Lamaran Ditolak';
    if (status === 'reviewed') return 'Lamaran Sedang Ditinjau';
    return item.data.vacancy_title || 'Pembaruan Lamaran';
  };

  const getNotifIcon = (item: NotificationItem) => {
    const status = item.data.status;
    const companyInitials = (item.data.company_name || 'MB').substring(0, 2).toUpperCase();

    if (status === 'interview') {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-xs shrink-0">
          {companyInitials}
        </div>
      );
    }
    if (status === 'hired') {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5FA] border border-[#D0E5F0] text-[#123B5D] font-extrabold text-xs shrink-0">
          {companyInitials}
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE2E2] border border-rose-200 text-[#B91C1C] shrink-0">
          <X className="h-5 w-5 stroke-[2.5]" />
        </div>
      );
    }
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5FA] border border-[#D0E5F0] text-[#1674D1] shrink-0">
        <MessageSquare className="h-5 w-5" />
      </div>
    );
  };

  const formatItemTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    }

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout>
      <Head title="Notifikasi - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
              Notifikasi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Dapatkan informasi terbaru seputar lamaran, pesan, dan aktivitas penting lainnya.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1674D1] hover:underline cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tandai Semua Dibaca ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* 2-Column Split Layout matching Notifikasi.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT COLUMN: TERBARU (5 COLS) ===================== */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <h2 className="font-bold text-sm text-[#102B4B]">Terbaru</h2>
              <Bell className="h-4 w-4 text-[#102B4B]" />
            </div>

            {notifications.data.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p>Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {notifications.data.map((item) => {
                  const isSelected = selectedNotif?.id === item.id;
                  const isUnread = !item.read_at;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotif(item)}
                      className={`flex items-start justify-between gap-3 p-3 rounded-2xl transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF5FA]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {getNotifIcon(item)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-xs text-[#102B4B] truncate">
                              {getNotifTitle(item)}
                            </h3>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-[#1674D1] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-[#102B4B] truncate mt-0.5">
                            {item.data.company_name}
                          </p>
                          <p className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">
                            {item.data.notes || `Untuk posisi ${item.data.vacancy_title}...`}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-medium text-[#94A3B8] shrink-0">
                        {formatItemTime(item.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===================== RIGHT COLUMN: DETAIL NOTIFIKASI (7 COLS) ===================== */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-bold text-sm text-[#102B4B]">Detail Notifikasi</h2>

            {selectedNotif ? (
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                {/* Header Row: Company Logo & Info */}
                <div className="flex items-center gap-3.5 border-b border-[#F1F5F9] pb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-base shrink-0">
                    {(selectedNotif.data.company_name || 'MB').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#102B4B]">
                      {selectedNotif.data.company_name}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {selectedNotif.data.vacancy_title}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      {new Date(selectedNotif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
                  <p>Halo {userName},</p>

                  <p>
                    {selectedNotif.data.status === 'interview' && (
                      <>
                        Kami mengundang Anda untuk mengikuti tahap wawancara untuk posisi{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.vacancy_title}</strong> di{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.company_name}</strong>.
                      </>
                    )}
                    {selectedNotif.data.status === 'hired' && (
                      <>
                        Selamat! Lamaran Anda untuk posisi{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.vacancy_title}</strong> di{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.company_name}</strong> telah{' '}
                        <strong className="text-[#16A36B]">DITERIMA</strong>.
                      </>
                    )}
                    {selectedNotif.data.status === 'rejected' && (
                      <>
                        Terima kasih atas minat Anda melamar di{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.company_name}</strong>. Saat ini kualifikasi Anda belum sesuai dengan posisi ini.
                      </>
                    )}
                    {(!selectedNotif.data.status || selectedNotif.data.status === 'reviewed' || selectedNotif.data.status === 'submitted') && (
                      <>
                        Terdapat pembaruan status pada lamaran Anda untuk posisi{' '}
                        <strong className="text-[#102B4B]">{selectedNotif.data.vacancy_title}</strong>: {selectedNotif.data.notes || 'Berkas Anda sedang diproses.'}
                      </>
                    )}
                  </p>

                  {/* Schedule Details Box (matching Reference) */}
                  <div className="rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] p-4 sm:p-5 space-y-2.5 text-xs">
                    <div className="grid grid-cols-12 gap-2">
                      <span className="col-span-4 font-semibold text-[#102B4B] flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#1674D1]" />
                        Hari, tanggal
                      </span>
                      <span className="col-span-8 text-[#475569]">
                        : {selectedNotif.data.interview_date || 'Senin, 20 Oktober 2026'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <span className="col-span-4 font-semibold text-[#102B4B] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#1674D1]" />
                        Waktu
                      </span>
                      <span className="col-span-8 text-[#475569]">
                        : {selectedNotif.data.interview_time || '10.00 - 10.45 WIB'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <span className="col-span-4 font-semibold text-[#102B4B] flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-[#1674D1]" />
                        Platform
                      </span>
                      <span className="col-span-8 text-[#475569]">
                        : {selectedNotif.data.interview_platform || 'Google Meet'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Silahkan konfirmasi kehadiran Anda melalui tombol di bawah ini. Jika ada kendala, mohon konfirmasi kepada kami.
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                  {selectedNotif.data.application_id && (
                    <Link
                      href={`/app/applications/${selectedNotif.data.application_id}`}
                      className="w-full sm:w-auto flex-1 rounded-2xl bg-[#123B5D] hover:bg-[#0C2742] text-white font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      Konfirmasi Kehadiran
                    </Link>
                  )}

                  {selectedNotif.data.application_id ? (
                    <Link
                      href={`/messages?application_id=${selectedNotif.data.application_id}`}
                      className="w-full sm:w-auto flex-1 rounded-2xl border border-[#123B5D] bg-white hover:bg-slate-50 text-[#123B5D] font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer"
                    >
                      Hubungi Perusahaan/HR
                    </Link>
                  ) : (
                    <Link
                      href="/app/applications"
                      className="w-full sm:w-auto flex-1 rounded-2xl border border-[#123B5D] bg-white hover:bg-slate-50 text-[#123B5D] font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer"
                    >
                      Buka Lamaran Saya
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-12 text-center text-xs text-slate-400">
                Pilih salah satu notifikasi di sebelah kiri untuk melihat detail pesan.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
