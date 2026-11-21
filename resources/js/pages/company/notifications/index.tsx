import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import CompanyLayout from '@/layouts/company-layout';
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
    MessageSquare,
    Search,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    category: 'application' | 'message' | 'verification' | 'vacancy' | 'system';
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
        application: number;
        message: number;
        verification: number;
        vacancy: number;
        system: number;
    };
    activeFilter: string;
    search: string;
    unreadCount: number;
}

export default function CompanyNotificationsIndex({
    notifications = [],
    counts = { all: 0, unread: 0, application: 0, message: 0, verification: 0, vacancy: 0, system: 0 },
    activeFilter = 'all',
    search = '',
    unreadCount = 0,
}: Props): ReactElement {
    const [filter, setFilter] = useState<string>(activeFilter);
    const [searchTerm, setSearchTerm] = useState<string>(search);
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
            '/company/notifications',
            { filter: newFilter, search: searchTerm || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent): void => {
        e.preventDefault();
        router.get(
            '/company/notifications',
            { filter, search: searchTerm || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleMarkAsRead = (id: string, e?: React.MouseEvent): void => {
        if (e) e.stopPropagation();
        router.post(`/company/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = (): void => {
        router.post('/company/notifications/read-all', {}, { preserveScroll: true });
    };

    const handleDelete = (id: string, e: React.MouseEvent): void => {
        e.stopPropagation();
        router.delete(`/company/notifications/${id}`, { preserveScroll: true });
    };

    const getCategoryDetails = (category: string) => {
        switch (category) {
            case 'application':
                return {
                    icon: <Users className="h-5 w-5 text-blue-600 dark:text-[#38BDF8]" />,
                    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
                    borderColor: 'border-blue-200 dark:border-blue-900/40',
                    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#38BDF8] border-blue-200 dark:border-blue-800/40',
                    badgeText: 'Lamaran Masuk',
                    actionText: 'Tinjau Lamaran',
                };
            case 'message':
                return {
                    icon: <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
                    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
                    borderColor: 'border-emerald-200 dark:border-emerald-900/40',
                    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
                    badgeText: 'Pesan Pelamar',
                    actionText: 'Buka Obrolan',
                };
            case 'verification':
                return {
                    icon: <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
                    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
                    borderColor: 'border-purple-200 dark:border-purple-900/40',
                    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
                    badgeText: 'Verifikasi Akun',
                    actionText: 'Lihat Profil',
                };
            case 'vacancy':
                return {
                    icon: <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
                    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
                    borderColor: 'border-amber-200 dark:border-amber-900/40',
                    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
                    badgeText: 'Info Lowongan',
                    actionText: 'Kelola Lowongan',
                };
            default:
                return {
                    icon: <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
                    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
                    borderColor: 'border-indigo-200 dark:border-indigo-900/40',
                    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
                    badgeText: 'Sistem & Laporan',
                    actionText: 'Lihat Laporan',
                };
        }
    };

    const filterTabs = [
        { key: 'all', label: 'Semua', count: counts.all },
        { key: 'unread', label: 'Belum Dibaca', count: counts.unread },
        { key: 'application', label: 'Lamaran Masuk', count: counts.application },
        { key: 'message', label: 'Pesan Pelamar', count: counts.message },
        { key: 'verification', label: 'Verifikasi Akun', count: counts.verification },
        { key: 'vacancy', label: 'Lowongan Kerja', count: counts.vacancy },
        { key: 'system', label: 'Sistem & Laporan', count: counts.system },
    ];

    return (
        <CompanyLayout>
            <Head title="Pusat Notifikasi - Profabel Perusahaan" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                            <span>Perusahaan</span>
                            <span>•</span>
                            <span className="text-[#1769E0] dark:text-[#38BDF8]">Pusat Notifikasi</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold text-[#102B4B] dark:text-white sm:text-3xl">
                            Notifikasi Aktivitas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Pantau seluruh lamaran masuk, pesan dari pelamar, status verifikasi perusahaan, dan pembaruan sistem Profabel.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                variant="outline"
                                className="flex items-center gap-2 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] text-xs font-bold text-[#102B4B] dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-white/10"
                            >
                                <CheckCheck className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8]" />
                                Tandai Semua Dibaca ({unreadCount})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#071336] p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {filterTabs.map((tab) => {
                            const isActive = filter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => applyFilter(tab.key)}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? 'bg-[#102B4B] dark:bg-[#1D64EC] text-white shadow-sm'
                                            : 'bg-slate-50 dark:bg-[#050E2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative min-w-[240px] md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Cari notifikasi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#050E2E] pl-9 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#050E2E] focus:ring-2 focus:ring-[#1769E0]"
                        />
                    </form>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#071336] px-6 py-16 text-center shadow-sm">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1769E0] dark:text-[#38BDF8]">
                                <Bell className="h-8 w-8 stroke-[1.5]" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#102B4B] dark:text-white">
                                Tidak Ada Notifikasi
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                                {filter === 'unread'
                                    ? 'Hebat! Anda telah membaca seluruh notifikasi terbaru.'
                                    : 'Belum ada notifikasi pada kategori ini. Notifikasi aktivitas lamaran dan pesan akan muncul di sini.'}
                            </p>
                            {filter !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => applyFilter('all')}
                                    className="mt-4 rounded-xl bg-slate-100 dark:bg-white/10 px-4 py-2 text-xs font-bold text-[#102B4B] dark:text-white hover:bg-slate-200 dark:hover:bg-white/15"
                                >
                                    Tampilkan Semua Notifikasi
                                </button>
                            )}
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const details = getCategoryDetails(notif.category);

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        setSelectedNotif(notif);
                                        if (!notif.is_read) {
                                            handleMarkAsRead(notif.id);
                                        }
                                    }}
                                    className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border p-4 transition duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                                        notif.is_read
                                            ? 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#071336] opacity-85 hover:opacity-100'
                                            : 'border-blue-200 dark:border-blue-500/30 bg-blue-50/20 dark:bg-[#0B1E48]/50 shadow-sm'
                                    }`}
                                >
                                    {/* Left: Icon & Content */}
                                    <div className="flex items-start gap-3.5">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${details.bgColor} ${details.borderColor}`}
                                        >
                                            {details.icon}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${details.badgeBg}`}
                                                >
                                                    {details.badgeText}
                                                </span>
                                                <h3
                                                    className={`text-sm ${
                                                        notif.is_read
                                                            ? 'font-medium text-slate-800 dark:text-slate-200'
                                                            : 'font-bold text-[#102B4B] dark:text-white'
                                                    }`}
                                                >
                                                    {notif.title}
                                                </h3>
                                                {!notif.is_read && (
                                                    <span className="flex h-2 w-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                                {notif.message}
                                            </p>

                                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-slate-400">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {notif.time_ago}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/10 pt-3 sm:border-0 sm:pt-0">
                                        <Link
                                            href={notif.link}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!notif.is_read) {
                                                    handleMarkAsRead(notif.id);
                                                }
                                            }}
                                            className="flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-[#050E2E] border border-transparent dark:border-white/10 px-3 py-1.5 text-xs font-bold text-[#1769E0] dark:text-[#38BDF8] transition hover:bg-blue-50 dark:hover:bg-white/10"
                                        >
                                            <span>{details.actionText}</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>

                                        {!notif.is_read && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-400 transition hover:border-[#1769E0] hover:bg-blue-50 dark:hover:bg-white/10 hover:text-[#1769E0] dark:hover:text-[#38BDF8]"
                                                title="Tandai sudah dibaca"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(notif.id, e)}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-400 transition hover:border-rose-200 dark:hover:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                            title="Hapus notifikasi"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal Detail Notifikasi */}
            <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
                <DialogContent className="max-w-lg bg-white dark:bg-[#071336] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-white/10">
                    {selectedNotif && (() => {
                        const details = getCategoryDetails(selectedNotif.category);
                        return (
                            <div className="space-y-5">
                                <DialogHeader>
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${details.bgColor} ${details.borderColor}`}>
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
                                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Hapus</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setSelectedNotif(null)}
                                            className="rounded-xl text-xs font-bold border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                        >
                                            Tutup
                                        </Button>
                                        {selectedNotif.link && (
                                            <Link
                                                href={selectedNotif.link}
                                                className="flex items-center gap-1.5 rounded-xl bg-[#102B4B] dark:bg-[#1D64EC] hover:bg-[#0C223C] dark:hover:bg-[#1254B5] px-4 py-2 text-xs font-bold text-white transition"
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
        </CompanyLayout>
    );
}
