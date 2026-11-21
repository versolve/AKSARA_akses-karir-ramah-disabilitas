import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Building2,
    CheckCheck,
    ChevronDown,
    FileText,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Moon,
    Settings,
    Sun,
    UserCheck,
    User as UserIcon,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';

interface CompanyNotificationItem {
    id: string;
    title: string;
    message: string;
    category: 'application' | 'message' | 'verification' | 'vacancy' | 'system';
    link: string;
    created_at: string;
    time_ago: string;
    is_read: boolean;
}

export function CompanyHeader({
    onMenuClick,
    menuExpanded,
}: {
    onMenuClick: () => void;
    menuExpanded: boolean;
}): ReactElement {
    const page = usePage();
    const user = (page.props.auth as { user: User })?.user;
    const companyNotifications = ((page.props as Record<string, unknown>).companyNotifications || []) as CompanyNotificationItem[];
    const unreadCount = Number((page.props as Record<string, unknown>).companyUnreadNotificationsCount || 0);
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const avatarSrc = user?.avatar || ((user as any)?.company_profile?.logo_url as string | undefined);

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const handleMarkAsRead = (notif: CompanyNotificationItem): void => {
        if (!notif.is_read) {
            router.post(`/company/notifications/${notif.id}/read`, {}, { preserveScroll: true });
        }
        router.visit(`/company/notifications?id=${notif.id}`);
    };

    const handleMarkAllAsRead = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        router.post('/company/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <header className="sticky top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-7 dark:border-white/10 dark:bg-[#020B3C]">
            {/* Left side: Hamburger, Logo & Perusahaan Badge */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] lg:hidden dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label={menuExpanded ? 'Tutup menu perusahaan' : 'Buka menu perusahaan'}
                    aria-expanded={menuExpanded}
                >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Link href="/company/dashboard" className="flex items-center gap-2">
                        <img
                            src="/images/logos/logo_biru.svg"
                            alt="Profabel"
                            className="h-8 w-auto sm:h-9 logo-light"
                        />
                        <img
                            src="/images/logos/logo_putih.svg"
                            alt="Profabel"
                            className="h-8 w-auto sm:h-9 logo-dark"
                        />
                    </Link>

                    <span className="hidden sm:inline-flex items-center rounded-full bg-[#EBF5FA] border border-blue-100 px-3 py-0.5 text-xs font-bold text-[#1769E0] dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-[#38BDF8]">
                        Perusahaan
                    </span>
                </div>
            </div>

            {/* Right side: Bell, Mail & HR Admin Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] dark:text-slate-200 dark:hover:bg-white/10"
                            aria-label="Notifikasi perusahaan"
                        >
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-80 sm:w-96 rounded-2xl border border-slate-100 p-0 shadow-2xl bg-white dark:border-white/10 dark:bg-[#071336]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#102B4B] dark:text-white">Notifikasi</span>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1769E0] dark:bg-blue-900/60 dark:text-[#38BDF8]">
                                        {unreadCount} Baru
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#1769E0] hover:underline dark:text-[#38BDF8]"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tandai dibaca
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-white/5">
                            {companyNotifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-400">
                                    <Bell className="mx-auto h-7 w-7 text-slate-300 stroke-[1.5] dark:text-slate-600" />
                                    <p className="mt-2 text-xs font-medium dark:text-slate-400">Tidak ada notifikasi baru</p>
                                </div>
                            ) : (
                                companyNotifications.map((notif) => {
                                    const iconBg =
                                        notif.category === 'application'
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                                            : notif.category === 'message'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'
                                            : notif.category === 'verification'
                                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300'
                                            : notif.category === 'vacancy'
                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleMarkAsRead(notif)}
                                            className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                                                notif.is_read ? 'opacity-75' : 'bg-blue-50/25 dark:bg-blue-950/30'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                                            >
                                                {notif.category === 'application' && (
                                                    <Users className="h-4 w-4" />
                                                )}
                                                {notif.category === 'message' && (
                                                    <MessageSquare className="h-4 w-4" />
                                                )}
                                                {notif.category === 'verification' && (
                                                    <Building2 className="h-4 w-4" />
                                                )}
                                                {notif.category === 'vacancy' && (
                                                    <Briefcase className="h-4 w-4" />
                                                )}
                                                {notif.category === 'system' && (
                                                    <FileText className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p
                                                        className={`text-xs truncate ${
                                                            notif.is_read
                                                                ? 'font-medium text-slate-700 dark:text-slate-300'
                                                                : 'font-bold text-[#102B4B] dark:text-white'
                                                        }`}
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
                                                    {notif.message}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                                    {notif.time_ago}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50 dark:border-white/10 dark:bg-[#050E2E]">
                            <Link
                                href="/company/notifications"
                                className="block w-full py-1.5 text-xs font-bold text-[#1769E0] transition hover:bg-blue-50 dark:text-[#38BDF8] dark:hover:bg-white/5 rounded-xl"
                            >
                                Lihat Semua Notifikasi
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mail Icon */}
                <Link
                    href="/messages"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label="Pesan masuk"
                >
                    <Mail className="h-5 w-5" aria-hidden="true" />
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="ml-1 flex min-h-11 items-center gap-2.5 rounded-full px-1.5 py-1 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] sm:pr-3 dark:hover:bg-white/10"
                        >
                            <Avatar className="h-9 w-9 border border-slate-200 overflow-hidden bg-white dark:border-white/20">
                                {avatarSrc ? (
                                    <AvatarImage
                                        src={avatarSrc}
                                        alt={user.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                ) : null}
                                <AvatarFallback className="bg-[#101B4D] text-xs font-bold text-white dark:bg-[#1D64EC]">
                                    {getInitials(user.name) || 'HR'}
                                </AvatarFallback>
                            </Avatar>

                            <span className="hidden text-sm font-semibold text-[#101B4D] sm:inline max-w-[160px] truncate dark:text-white" title={user?.name || 'HR Admin'}>
                                {user?.name || 'HR Admin'}
                            </span>
                            <ChevronDown
                                className="hidden h-4 w-4 text-slate-400 sm:block shrink-0 dark:text-slate-400"
                                aria-hidden="true"
                            />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#071336]">
                        <div className="flex items-center gap-2.5 px-3 py-2">
                            <Avatar className="h-10 w-10 border border-slate-200 overflow-hidden bg-white shrink-0 dark:border-white/20">
                                {avatarSrc ? (
                                    <AvatarImage
                                        src={avatarSrc}
                                        alt={user.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                ) : null}
                                <AvatarFallback className="bg-[#101B4D] text-xs font-bold text-white dark:bg-[#1D64EC]">
                                    {getInitials(user.name) || 'HR'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#102B4B] truncate dark:text-white">{user.name}</p>
                                <p className="text-[11px] text-slate-400 truncate dark:text-slate-400">{user.email}</p>
                                <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1769E0] dark:bg-blue-950/60 dark:text-[#38BDF8]">
                                    Mitra Perusahaan
                                </span>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="dark:bg-white/10" />

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/profile"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                                <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span>Profil Perusahaan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/vacancies"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                                <UserIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span>Kelola Lowongan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/notifications"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                                <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span>Notifikasi Perusahaan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/settings/profile"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                                <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span>Pengaturan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="dark:bg-white/10" />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                            <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
