import { Button } from '@/components/ui/button';
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
import { useState, type ReactElement } from 'react';

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
          icon: <Building2 className="h-5 w-5 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeText: 'Verifikasi Perusahaan',
          actionText: 'Tinjau Verifikasi',
        };
      case 'vacancy':
        return {
          icon: <Briefcase className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          badgeText: 'Lowongan Kerja',
          actionText: 'Kelola Lowongan',
        };
      case 'user':
        return {
          icon: <UserPlus className="h-5 w-5 text-purple-600" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          badgeText: 'Pengguna Baru',
          actionText: 'Kelola Pengguna',
        };
      default:
        return {
          icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeText: 'Sistem & Keamanan',
          actionText: 'Lihat Pengaturan',
        };
    }
  };

  return (
    <AdminLayout>
      <Head title="Notifikasi Administrator - AKSARA" />

      <div className="min-h-screen bg-[#F8FBFE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#102B4B] sm:text-3xl">
                Notifikasi Sistem
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Pantau permohonan verifikasi perusahaan, moderasi lowongan, pendaftaran pengguna, dan status sistem AKSARA.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="flex items-center gap-2 rounded-xl border-[#1769E0] bg-white px-4 py-2.5 text-xs font-bold text-[#1769E0] shadow-sm hover:bg-blue-50"
              >
                <CheckCheck className="h-4 w-4" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Notifikasi</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.all}</p>
                <p className="mt-1 text-[11px] text-slate-400">Semua aktivitas tercatat</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                <Bell className="h-6 w-6" />
              </div>
            </article>

            {/* Card 2: Belum Dibaca */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Belum Dibaca</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B]">{counts.unread}</span>
                  {counts.unread > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      Perlu Perhatian
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Pemberitahuan aktif</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Clock className="h-6 w-6" />
              </div>
            </article>

            {/* Card 3: Verifikasi Perusahaan */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Verifikasi Dokumen</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.verification}</p>
                <p className="mt-1 text-[11px] text-slate-400">Legalitas perusahaan</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Building2 className="h-6 w-6" />
              </div>
            </article>

            {/* Card 4: Moderasi Lowongan */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Moderasi Lowongan</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.vacancy}</p>
                <p className="mt-1 text-[11px] text-slate-400">Lowongan kerja baru</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </article>
          </div>

          {/* Navigation Filter Tabs */}
          <nav
            className="flex flex-wrap gap-2 border-b border-slate-200 pb-3"
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
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                  filter === tab.id
                    ? 'bg-[#1769E0] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    filter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1769E0]">
                <Bell className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-base font-bold text-[#102B4B]">
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
                  className="mt-4 rounded-xl text-xs font-bold text-[#1769E0]"
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
                      if (!item.is_read) {
                        handleMarkAsRead(item.id);
                      }
                      router.visit(item.link);
                    }}
                    className={`group flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition hover:shadow-md sm:flex-row sm:items-center ${
                      item.is_read
                        ? 'border-slate-100 bg-white'
                        : 'border-blue-100 bg-blue-50/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Icon */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${details.bgColor}`}
                      >
                        {details.icon}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${details.badgeBg}`}
                          >
                            {details.badgeText}
                          </span>
                          {!item.is_read && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-[#1769E0]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1769E0]" />
                              Baru
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {item.time_ago}
                          </span>
                        </div>

                        <h2 className="mt-1 text-sm font-bold text-[#102B4B] group-hover:text-[#1769E0] transition">
                          {item.title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        href={item.link}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.is_read) {
                            handleMarkAsRead(item.id);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#102B4B] transition hover:bg-[#1769E0] hover:text-white"
                      >
                        <span>{details.actionText}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Tandai dibaca"
                          aria-label="Tandai dibaca"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Hapus notifikasi"
                        aria-label="Hapus notifikasi"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
