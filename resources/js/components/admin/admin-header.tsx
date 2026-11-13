import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Building2,
    CheckCheck,
    ChevronDown,
    Mail,
    Menu,
    ShieldCheck,
    UserPlus,
} from 'lucide-react';
import type { ReactElement } from 'react';
import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';

interface AdminNotification {
    id: string;
    title: string;
    message: string;
    category: 'verification' | 'vacancy' | 'user' | 'system';
    link: string;
    created_at: string;
    time_ago: string;
    is_read: boolean;
}

export function AdminHeader({
    onMenuClick,
    menuExpanded,
}: {
    onMenuClick: () => void;
    menuExpanded: boolean;
}): ReactElement {
    const page = usePage();
    const user = (page.props.auth as { user: User }).user;
    const getInitials = useInitials();

    const adminNotifications = ((page.props as any).adminNotifications || []) as AdminNotification[];
    const unreadCount = ((page.props as any).adminUnreadNotificationsCount ??
        adminNotifications.filter((n) => !n.is_read).length) as number;

    return (
        <header className="sticky top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-7">
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] lg:hidden"
                    aria-label={menuExpanded ? 'Tutup menu admin' : 'Buka menu admin'}
                    aria-expanded={menuExpanded}
                >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <img src="/images/logos/logo_biru.svg" alt="AKSARA" className="h-8 w-auto sm:h-9" />
                </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Admin Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
                            aria-label="Buka notifikasi admin"
                        >
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-80 sm:w-96 rounded-2xl border border-slate-100 p-0 shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#102B4B]">Notifikasi</span>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1769E0]">
                                        {unreadCount} Baru
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.post('/admin/notifications/read-all', {}, { preserveScroll: true });
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#1769E0] hover:underline"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tandai dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                            {adminNotifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-400">
                                    <Bell className="mx-auto h-7 w-7 text-slate-300 stroke-[1.5]" />
                                    <p className="mt-2 text-xs font-medium">Tidak ada notifikasi baru</p>
                                </div>
                            ) : (
                                adminNotifications.map((notif) => {
                                    const iconBg =
                                        notif.category === 'verification'
                                            ? 'bg-amber-50 text-amber-600'
                                            : notif.category === 'vacancy'
                                            ? 'bg-blue-50 text-blue-600'
                                            : notif.category === 'user'
                                            ? 'bg-purple-50 text-purple-600'
                                            : 'bg-emerald-50 text-emerald-600';

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                if (!notif.is_read) {
                                                    router.post(
                                                        `/admin/notifications/${notif.id}/read`,
                                                        {},
                                                        { preserveScroll: true }
                                                    );
                                                }
                                                router.visit(notif.link);
                                            }}
                                            className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 ${
                                                notif.is_read ? 'opacity-75' : 'bg-blue-50/25'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                                            >
                                                {notif.category === 'verification' && (
                                                    <Building2 className="h-4 w-4" />
                                                )}
                                                {notif.category === 'vacancy' && (
                                                    <Briefcase className="h-4 w-4" />
                                                )}
                                                {notif.category === 'user' && (
                                                    <UserPlus className="h-4 w-4" />
                                                )}
                                                {notif.category === 'system' && (
                                                    <ShieldCheck className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-[#102B4B]">
                                                    {notif.title}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 leading-snug">
                                                    {notif.message}
                                                </p>
                                                <span className="mt-1 block text-[10px] text-slate-400">
                                                    {notif.time_ago}
                                                </span>
                                            </div>
                                            {!notif.is_read && (
                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1769E0]" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <Link
                            href="/admin/notifications"
                            className="block border-t border-slate-100 bg-slate-50/70 p-3 text-center text-xs font-bold text-[#1769E0] transition hover:bg-blue-50/50 rounded-b-2xl"
                        >
                            Lihat Semua Notifikasi
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/admin/messages" className="flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100" aria-label="Buka pesan dan pengumuman">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="ml-1 flex min-h-11 items-center gap-2 rounded-full px-1.5 py-1 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] sm:pr-3">
                            <Avatar className="h-9 w-9 border border-slate-200">
                                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                                <AvatarFallback className="bg-[#101B4D] text-xs font-bold text-white">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-sm font-semibold text-[#101B4D] sm:inline">ADMIN</span>
                            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-xl"><UserMenuContent user={user} /></DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
