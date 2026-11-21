import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'verification' | 'vacancy' | 'user' | 'system';
  link: string;
  created_at: string;
  time_ago: string;
  is_read: boolean;
}

interface Props {
  notifications: NotificationItem[];
  counts: {
    all: number;
    unread: number;
    verification: number;
    vacancy: number;
    user: number;
    system: number;
  };
  activeFilter: string;
  unreadCount: number;
}

export default function AdminNotificationsIndex({
  notifications = [],
  counts = { all: 0, unread: 0, verification: 0, vacancy: 0, user: 0, system: 0 },
  activeFilter = 'all',
  unreadCount = 0,
}: Props): ReactElement {
  const [filter, setFilter] = useState<string>(activeFilter);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('id');
      if (targetId && notifications.length > 0) {
        const found = notifications.find((n) => n.id === targetId);
        if (found) {
          setSelectedNotif(found);
          if (!found.is_read) {
            handleMarkAsRead(found.id);
          }
        }
      }
    }
  }, [notifications]);

  const applyFilter = (newFilter: string): void => {
    setFilter(newFilter);
    router.get(
      '/admin/notifications',
      { filter: newFilter },
      { preserveState: true, replace: true }
    );
  };

  const handleMarkAsRead = (id: string, e?: React.MouseEvent): void => {
    if (e) e.stopPropagation();
    router.post(`/admin/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const handleMarkAllAsRead = (): void => {
    router.post('/admin/notifications/read-all', {}, { preserveScroll: true });
  };

  const handleDelete = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    router.delete(`/admin/notifications/${id}`, { preserveScroll: true });
  };

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'verification':
        return {
          icon: <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/40',
          borderColor: 'border-amber-200 dark:border-amber-900/40',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
          badgeText: 'Verifikasi Perusahaan',
          actionText: 'Tinjau Verifikasi',
        };
      case 'vacancy':
        return {
          icon: <Briefcase className="h-5 w-5 text-blue-600 dark:text-[#38BDF8]" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40',
          borderColor: 'border-blue-200 dark:border-blue-900/40',
          badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#38BDF8] border-blue-200 dark:border-blue-800/40',
          badgeText: 'Lowongan Kerja',
          actionText: 'Kelola Lowongan',
        };
      case 'user':
        return {
          icon: <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/40',
          borderColor: 'border-purple-200 dark:border-purple-900/40',
          badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
          badgeText: 'Pengguna Baru',
          actionText: 'Kelola Pengguna',
        };
      default:
        return {
          icon: <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
          borderColor: 'border-emerald-200 dark:border-emerald-900/40',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
          badgeText: 'Sistem & Keamanan',
          actionText: 'Lihat Pengaturan',
        };
    }
  };

  return (
    <AdminLayout>
      <Head title="Notifikasi Administrator - Profabel" />

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Administrator</span>
              <span>•</span>
              <span className="text-[#1769E0] dark:text-[#38BDF8]">Pusat Notifikasi</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#102B4B] dark:text-white sm:text-3xl">
              Notifikasi Sistem
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Pantau permohonan verifikasi perusahaan, moderasi lowongan, pendaftaran pengguna, dan status sistem Profabel.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-[#1769E0] bg-white dark:bg-[#071336] dark:border-white/10 dark:text-[#38BDF8] dark:hover:bg-white/10 px-4 py-2 text-xs font-bold text-[#1769E0] shadow-sm hover:bg-blue-50 self-start sm:self-auto min-h-[40px]"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tandai Semua Dibaca ({unreadCount})</span>
            </Button>
          )}
        </div>

        {/* 4 Summary Cards (Responsive: 2 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Card 1: Total */}
          <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white dark:bg-[#071336] dark:border-white/10 p-3.5 sm:p-5 shadow-xs">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Total Notifikasi</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-[#102B4B] dark:text-white">{counts.all}</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400">Semua aktivitas</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0] dark:bg-blue-950/40 dark:text-[#38BDF8]">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </article>

          {/* Card 2: Belum Dibaca */}
          <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white dark:bg-[#071336] dark:border-white/10 p-3.5 sm:p-5 shadow-xs">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Belum Dibaca</p>
              <div className="mt-1 sm:mt-2 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-[#102B4B] dark:text-white">{counts.unread}</span>
                {counts.unread > 0 && (
                  <span className="rounded-full bg-red-100 dark:bg-rose-950/40 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-red-600 dark:text-rose-400">
                    Aktif
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400">Pemberitahuan</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </article>

          {/* Card 3: Verifikasi Perusahaan */}
          <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white dark:bg-[#071336] dark:border-white/10 p-3.5 sm:p-5 shadow-xs">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Verifikasi Dokumen</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-[#102B4B] dark:text-white">{counts.verification}</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400">Legalitas mitra</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </article>

          {/* Card 4: Moderasi Lowongan */}
          <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white dark:bg-[#071336] dark:border-white/10 p-3.5 sm:p-5 shadow-xs">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Moderasi Lowongan</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-[#102B4B] dark:text-white">{counts.vacancy}</p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400">Lowongan baru</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </article>
        </div>

        {/* Navigation Filter Tabs (Horizontally scrollable on mobile) */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-white/10 flex-nowrap sm:flex-wrap"
          aria-label="Filter Kategori Notifikasi"
        >
          {[
            { id: 'all', label: 'Semua', count: counts.all },
            { id: 'unread', label: 'Belum Dibaca', count: counts.unread },
            { id: 'verification', label: 'Verifikasi Perusahaan', count: counts.verification },
            { id: 'vacancy', label: 'Lowongan Kerja', count: counts.vacancy },
            { id: 'user', label: 'Pengguna Baru', count: counts.user },
            { id: 'system', label: 'Sistem & Backup', count: counts.system },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => applyFilter(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-[#1769E0] text-white shadow-sm dark:bg-[#1D64EC]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100 dark:bg-[#071336] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  filter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-[#050E2E] dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Notification List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white dark:bg-[#071336] dark:border-white/10 py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1769E0] dark:bg-blue-950/40 dark:text-[#38BDF8]">
              <Bell className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#102B4B] dark:text-white">
              Tidak Ada Notifikasi
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Tidak ada notifikasi yang sesuai dengan filter yang Anda pilih saat ini.
            </p>
            {filter !== 'all' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => applyFilter('all')}
                className="mt-4 rounded-xl text-xs font-bold text-[#1769E0] dark:text-[#38BDF8] dark:border-white/10 dark:hover:bg-white/10"
              >
                Tampilkan Semua Notifikasi
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const details = getCategoryDetails(item.category);

              return (
                <article
                  key={item.id}
                  onClick={() => {
                    setSelectedNotif(item);
                    if (!item.is_read) {
                      handleMarkAsRead(item.id);
                    }
                  }}
                  className={`group flex cursor-pointer flex-col justify-between gap-3.5 sm:gap-4 rounded-2xl border p-4 sm:p-5 transition hover:shadow-md sm:flex-row sm:items-center ${
                    item.is_read
                      ? 'border-slate-100 bg-white dark:border-white/10 dark:bg-[#071336] opacity-85 hover:opacity-100'
                      : 'border-blue-100 bg-blue-50/20 shadow-xs dark:border-blue-500/30 dark:bg-[#0B1E48]/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${details.bgColor}`}
                    >
                      {details.icon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${details.badgeBg}`}
                        >
                          {details.badgeText}
                        </span>
                        {!item.is_read && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-extrabold text-[#1769E0] dark:text-[#38BDF8]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
                            Baru
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.time_ago}
                        </span>
                      </div>

                      <h2 className="mt-1 text-sm font-bold text-[#102B4B] group-hover:text-[#1769E0] dark:text-white dark:group-hover:text-[#38BDF8] transition">
                        {item.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Touch Friendly on Mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-slate-100/80 dark:border-white/10 pt-3 sm:border-0 sm:pt-0 shrink-0 w-full sm:w-auto">
                    <Link
                      href={item.link}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.is_read) {
                          handleMarkAsRead(item.id);
                        }
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#102B4B] transition hover:bg-[#1769E0] hover:text-white dark:bg-[#050E2E] dark:border dark:border-white/10 dark:text-[#38BDF8] dark:hover:bg-[#1D64EC] dark:hover:text-white min-h-[38px]"
                    >
                      <span>{details.actionText}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Tandai dibaca"
                          aria-label="Tandai dibaca"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-[#38BDF8]"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Hapus notifikasi"
                        aria-label="Hapus notifikasi"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-900/40 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Notifikasi Admin */}
      <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-[#071336] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/10">
          {selectedNotif && (() => {
            const details = getCategoryDetails(selectedNotif.category);
            return (
              <div className="space-y-5">
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${details.bgColor}`}>
                      {details.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${details.badgeBg}`}>
                          {details.badgeText}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {selectedNotif.time_ago}
                        </span>
                      </div>
                      <DialogTitle className="mt-1 text-base font-extrabold text-[#102B4B] dark:text-white">
                        {selectedNotif.title}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <div className="rounded-2xl bg-slate-50 dark:bg-[#050E2E] border border-slate-100 dark:border-white/10 p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedNotif.message}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleDelete(selectedNotif.id, e);
                      setSelectedNotif(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedNotif(null)}
                      className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 dark:border-white/10 dark:bg-[#050E2E] dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer"
                    >
                      Tutup
                    </Button>
                    {selectedNotif.link && (
                      <Link
                        href={selectedNotif.link}
                        className="flex items-center gap-1.5 rounded-xl bg-[#1769E0] hover:bg-[#1258C2] px-4 py-2 text-xs font-bold text-white transition"
                      >
                        <span>{details.actionText}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
