import { Button } from '@/components/ui/button';
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
import { useState, type ReactElement } from 'react';

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
                    icon: <Users className="h-5 w-5 text-blue-600" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                    badgeText: 'Lamaran Masuk',
                    actionText: 'Tinjau Lamaran',
                };
            case 'message':
                return {
                    icon: <MessageSquare className="h-5 w-5 text-emerald-600" />,
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200',
                    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    badgeText: 'Pesan Pelamar',
                    actionText: 'Buka Obrolan',
                };
            case 'verification':
                return {
                    icon: <Building2 className="h-5 w-5 text-purple-600" />,
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200',
                    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
                    badgeText: 'Verifikasi Akun',
                    actionText: 'Lihat Profil',
                };
            case 'vacancy':
                return {
                    icon: <Briefcase className="h-5 w-5 text-amber-600" />,
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
                    badgeText: 'Info Lowongan',
                    actionText: 'Kelola Lowongan',
                };
            default:
                return {
                    icon: <ShieldCheck className="h-5 w-5 text-indigo-600" />,
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-indigo-200',
                    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <span>Perusahaan</span>
                            <span>•</span>
                            <span className="text-[#1769E0]">Pusat Notifikasi</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold text-[#102B4B] sm:text-3xl">
                            Notifikasi Aktivitas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pantau seluruh lamaran masuk, pesan dari pelamar, status verifikasi perusahaan, dan pembaruan sistem Profabel.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                variant="outline"
                                className="flex items-center gap-2 rounded-xl border-slate-200 bg-white text-xs font-bold text-[#102B4B] shadow-sm hover:bg-slate-50"
                            >
                                <CheckCheck className="h-4 w-4 text-[#1769E0]" />
                                Tandai Semua Dibaca ({unreadCount})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {filterTabs.map((tab) => {
                            const isActive = filter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => applyFilter(tab.key)}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                                        isActive
                                            ? 'bg-[#102B4B] text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-200/80 text-slate-700'
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
                            className="h-10 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1769E0]"
                        />
                    </form>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                                <Bell className="h-8 w-8 stroke-[1.5]" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#102B4B]">
                                Tidak Ada Notifikasi
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                {filter === 'unread'
                                    ? 'Hebat! Anda telah membaca seluruh notifikasi terbaru.'
                                    : 'Belum ada notifikasi pada kategori ini. Notifikasi aktivitas lamaran dan pesan akan muncul di sini.'}
                            </p>
                            {filter !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => applyFilter('all')}
                                    className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-[#102B4B] hover:bg-slate-200"
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
                                        if (!notif.is_read) {
                                            handleMarkAsRead(notif.id);
                                        }
                                        router.visit(notif.link);
                                    }}
                                    className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border p-4 transition duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                                        notif.is_read
                                            ? 'border-slate-200/80 bg-white opacity-80 hover:opacity-100'
                                            : 'border-blue-200 bg-blue-50/20 shadow-sm'
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
                                                            ? 'font-medium text-slate-800'
                                                            : 'font-bold text-[#102B4B]'
                                                    }`}
                                                >
                                                    {notif.title}
                                                </h3>
                                                {!notif.is_read && (
                                                    <span className="flex h-2 w-2 rounded-full bg-[#1769E0]" />
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                                                {notif.message}
                                            </p>

                                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {notif.time_ago}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                                        <Link
                                            href={notif.link}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!notif.is_read) {
                                                    handleMarkAsRead(notif.id);
                                                }
                                            }}
                                            className="flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#1769E0] transition hover:bg-blue-50"
                                        >
                                            <span>{details.actionText}</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>

                                        {!notif.is_read && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-[#1769E0] hover:bg-blue-50 hover:text-[#1769E0]"
                                                title="Tandai sudah dibaca"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(notif.id, e)}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
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
        </CompanyLayout>
    );
}
