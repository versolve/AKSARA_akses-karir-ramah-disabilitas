import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
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
  Trash2,
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

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    // If ?id=... is in the URL, automatically select and display that notification
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('id');
      if (targetId && notifications.data.length > 0) {
        const found = notifications.data.find((n) => n.id === targetId);
        if (found) {
          setSelectedNotif(found);
          setMobileView('detail');
          if (!found.read_at) {
            markAsRead(found.id);
          }
        }
      }
    }
  }, [page.url, notifications.data]);

  const markAsRead = (id: string): void => {
    router.post(`/app/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const markAllAsRead = (): void => {
    router.post('/app/notifications/read-all', {}, { preserveScroll: true });
  };

  const handleDeleteNotif = (id: string, e?: React.MouseEvent): void => {
    if (e) e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
      router.delete(`/app/notifications/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedNotif?.id === id) {
            setSelectedNotif(null);
            setMobileView('list');
          }
        },
      });
    }
  };

  const handleSelectNotif = (item: NotificationItem): void => {
    setSelectedNotif(item);
    if (!item.read_at) {
      markAsRead(item.id);
    }
    setMobileView('detail');
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
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#DCFCE7] dark:border-emerald-900/40 text-[#16A36B] dark:text-emerald-400 font-extrabold text-xs shrink-0">
          {companyInitials}
        </div>
      );
    }
    if (status === 'hired') {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5FA] dark:bg-blue-950/40 border border-[#D0E5F0] dark:border-blue-900/40 text-[#123B5D] dark:text-[#38BDF8] font-extrabold text-xs shrink-0">
          {companyInitials}
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE2E2] dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[#B91C1C] dark:text-rose-400 shrink-0">
          <X className="h-5 w-5 stroke-[2.5]" />
        </div>
      );
    }
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5FA] dark:bg-blue-950/40 border border-[#D0E5F0] dark:border-blue-900/40 text-[#1674D1] dark:text-[#38BDF8] shrink-0">
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
      <Head title="Notifikasi - Profabel" />

      <div className="py-4 sm:py-6 max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Mobile View Switcher Tab (< lg screen only) */}
        <div className="flex lg:hidden items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#071336] border border-slate-200/80 dark:border-white/10 shadow-xs mb-4">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
              mobileView === 'list'
                ? 'bg-white text-[#102B4B] shadow-sm dark:bg-[#1D64EC] dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Notifikasi</span>
            {notifications.data.length > 0 && (
              <span className="rounded-full bg-slate-200/80 dark:bg-[#050E2E] px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {notifications.data.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileView('detail')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
              mobileView === 'detail'
                ? 'bg-white text-[#102B4B] shadow-sm dark:bg-[#1D64EC] dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Detail Notifikasi</span>
            {selectedNotif && !selectedNotif.read_at && (
              <span className="h-2 w-2 rounded-full bg-[#1674D1] dark:bg-[#38BDF8]" />
            )}
          </button>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT COLUMN: NOTIFIKASI (5 COLS) ===================== */}
          <div
            className={`lg:col-span-5 rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-4 sm:p-6 shadow-xs space-y-4 ${
              mobileView === 'list' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/10 pb-3.5">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[#102B4B] dark:text-white">Notifikasi</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#1674D1]/10 dark:bg-blue-950/50 text-[#1674D1] dark:text-[#38BDF8] text-[10px] font-extrabold px-2 py-0.5">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1674D1] dark:text-[#38BDF8] hover:underline cursor-pointer"
                    title="Tandai semua notifikasi telah dibaca"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tandai Dibaca</span>
                  </button>
                )}
                <Bell className="h-4 w-4 text-[#102B4B] dark:text-slate-400" />
              </div>
            </div>

            {notifications.data.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Bell className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p>Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9] dark:divide-white/5">
                {notifications.data.map((item) => {
                  const isSelected = selectedNotif?.id === item.id;
                  const isUnread = !item.read_at;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotif(item)}
                      className={`flex items-start justify-between gap-3 p-3 sm:p-3.5 rounded-2xl transition cursor-pointer min-h-[56px] ${
                        isSelected
                          ? 'bg-[#EBF5FA] dark:bg-[#0B1E48]'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {getNotifIcon(item)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-xs text-[#102B4B] dark:text-white truncate">
                              {getNotifTitle(item)}
                            </h3>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-[#1674D1] dark:bg-[#38BDF8] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-[#102B4B] dark:text-slate-200 truncate mt-0.5">
                            {item.data.company_name}
                          </p>
                          <p className="text-[10px] text-[#64748B] dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.data.notes || `Untuk posisi ${item.data.vacancy_title}...`}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-medium text-[#94A3B8] dark:text-slate-400 shrink-0">
                        {formatItemTime(item.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===================== RIGHT COLUMN: DETAIL NOTIFIKASI (7 COLS) ===================== */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileView === 'detail' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Mobile Back Button to list view */}
            <div className="flex lg:hidden items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1674D1] dark:text-[#38BDF8] hover:underline py-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Daftar Notifikasi</span>
              </button>
            </div>

            <div className="rounded-3xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#071336] p-5 sm:p-8 shadow-xs">
              {/* Header di dalam kotak putih */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/10 pb-4 mb-5">
                <h2 className="font-bold text-sm text-[#102B4B] dark:text-white">Detail Notifikasi</h2>
                {selectedNotif && (
                  <button
                    type="button"
                    onClick={() => handleDeleteNotif(selectedNotif.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                    title="Hapus notifikasi ini"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              {selectedNotif ? (
                <div className="space-y-6">
                  {/* Header Row: Company Logo, Info & Action */}
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-white/10 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#DCFCE7] dark:border-emerald-900/40 text-[#16A36B] dark:text-emerald-400 font-extrabold text-base shrink-0">
                        {(selectedNotif.data.company_name || 'MB').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#102B4B] dark:text-white">
                          {selectedNotif.data.company_name}
                        </h3>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">
                          {selectedNotif.data.vacancy_title}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] dark:text-slate-400 mt-0.5">
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
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4 text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                    <p>Halo {userName},</p>

                    <p>
                      {selectedNotif.data.status === 'interview' && (
                        <>
                          Kami mengundang Anda untuk mengikuti tahap wawancara untuk posisi{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.vacancy_title}</strong> di{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.company_name}</strong>.
                        </>
                      )}
                      {selectedNotif.data.status === 'hired' && (
                        <>
                          Selamat! Lamaran Anda untuk posisi{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.vacancy_title}</strong> di{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.company_name}</strong> telah{' '}
                          <strong className="text-[#16A36B] dark:text-emerald-400">DITERIMA</strong>.
                        </>
                      )}
                      {selectedNotif.data.status === 'rejected' && (
                        <>
                          Terima kasih atas minat Anda melamar di{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.company_name}</strong>. Saat ini kualifikasi Anda belum sesuai dengan posisi ini.
                        </>
                      )}
                      {(!selectedNotif.data.status || selectedNotif.data.status === 'reviewed' || selectedNotif.data.status === 'submitted') && (
                        <>
                          Terdapat pembaruan status pada lamaran Anda untuk posisi{' '}
                          <strong className="text-[#102B4B] dark:text-white">{selectedNotif.data.vacancy_title}</strong>: {selectedNotif.data.notes || 'Berkas Anda sedang diproses.'}
                        </>
                      )}
                    </p>

                    {/* Schedule Details Box */}
                    <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#050E2E] border border-[#F1F5F9] dark:border-white/10 p-4 sm:p-5 space-y-3 text-xs">
                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2">
                        <span className="sm:col-span-4 font-semibold text-[#102B4B] dark:text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#1674D1] dark:text-[#38BDF8] shrink-0" />
                          Hari, tanggal
                        </span>
                        <span className="sm:col-span-8 text-[#475569] dark:text-slate-300 pl-5 sm:pl-0">
                          : {selectedNotif.data.interview_date || 'Senin, 20 Oktober 2026'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2">
                        <span className="sm:col-span-4 font-semibold text-[#102B4B] dark:text-white flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#1674D1] dark:text-[#38BDF8] shrink-0" />
                          Waktu
                        </span>
                        <span className="sm:col-span-8 text-[#475569] dark:text-slate-300 pl-5 sm:pl-0">
                          : {selectedNotif.data.interview_time || '10.00 - 10.45 WIB'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2">
                        <span className="sm:col-span-4 font-semibold text-[#102B4B] dark:text-white flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5 text-[#1674D1] dark:text-[#38BDF8] shrink-0" />
                          Platform
                        </span>
                        <span className="sm:col-span-8 text-[#475569] dark:text-slate-300 pl-5 sm:pl-0">
                          : {selectedNotif.data.interview_platform || 'Google Meet'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Silahkan konfirmasi kehadiran Anda melalui tombol di bawah ini. Jika ada kendala, mohon konfirmasi kepada kami.
                    </p>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#F1F5F9] dark:border-white/10">
                    {selectedNotif.data.application_id && (
                      <Link
                        href={`/app/applications/${selectedNotif.data.application_id}`}
                        className="w-full sm:w-auto flex-1 rounded-2xl bg-[#123B5D] hover:bg-[#0C2742] dark:bg-[#1D64EC] dark:hover:bg-blue-600 text-white font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        Konfirmasi Kehadiran
                      </Link>
                    )}

                    {selectedNotif.data.application_id ? (
                      <Link
                        href={`/messages?application_id=${selectedNotif.data.application_id}`}
                        className="w-full sm:w-auto flex-1 rounded-2xl border border-[#123B5D] bg-white hover:bg-slate-50 text-[#123B5D] dark:border-white/10 dark:bg-[#050E2E] dark:hover:bg-white/10 dark:text-white font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        Hubungi Perusahaan/HR
                      </Link>
                    ) : (
                      <Link
                        href="/app/applications"
                        className="w-full sm:w-auto flex-1 rounded-2xl border border-[#123B5D] bg-white hover:bg-slate-50 text-[#123B5D] dark:border-white/10 dark:bg-[#050E2E] dark:hover:bg-white/10 dark:text-white font-bold py-3 px-5 text-xs text-center transition min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        Buka Lamaran Saya
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-20 sm:py-28 flex flex-col items-center justify-center text-center">
                  <div className="h-14 w-14 rounded-full bg-[#F8FAFC] dark:bg-[#050E2E] border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-[#94A3B8] mb-3">
                    <Bell className="h-6 w-6 text-[#94A3B8] dark:text-slate-400" />
                  </div>
                  <h3 className="font-bold text-sm text-[#102B4B] dark:text-white">Belum ada notifikasi</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 max-w-xs">
                    Pilih salah satu notifikasi di sebelah kiri untuk melihat rincian pesannya.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

