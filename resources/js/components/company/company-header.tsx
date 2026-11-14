import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    ShieldCheck,
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

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const handleMarkAsRead = (notif: CompanyNotificationItem): void => {
        if (!notif.is_read) {
            router.post(`/company/notifications/${notif.id}/read`, {}, { preserveScroll: true });
        }
        router.visit(notif.link);
    };

    const handleMarkAllAsRead = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        router.post('/company/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <header className="sticky top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-7">
            {/* Left side: Hamburger, Logo & Perusahaan Badge */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] lg:hidden"
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
                            className="h-8 w-auto sm:h-9"
                        />
                    </Link>

                    <span className="hidden sm:inline-flex items-center rounded-full bg-[#EBF5FA] border border-blue-100 px-3 py-0.5 text-xs font-bold text-[#1769E0]">
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
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0]"
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
                        className="w-80 sm:w-96 rounded-2xl border border-slate-100 p-0 shadow-2xl"
                    >
                        {/* Header */}
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
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#1769E0] hover:underline"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tandai dibaca
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                            {companyNotifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-400">
                                    <Bell className="mx-auto h-7 w-7 text-slate-300 stroke-[1.5]" />
                                    <p className="mt-2 text-xs font-medium">Tidak ada notifikasi baru</p>
                                </div>
                            ) : (
                                companyNotifications.map((notif) => {
                                    const iconBg =
                                        notif.category === 'application'
                                            ? 'bg-blue-50 text-blue-600'
                                            : notif.category === 'message'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : notif.category === 'verification'
                                            ? 'bg-purple-50 text-purple-600'
                                            : notif.category === 'vacancy'
                                            ? 'bg-amber-50 text-amber-600'
                                            : 'bg-slate-100 text-slate-600';

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleMarkAsRead(notif)}
                                            className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 ${
                                                notif.is_read ? 'opacity-75' : 'bg-blue-50/25'
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
                                                                ? 'font-medium text-slate-700'
                                                                : 'font-bold text-[#102B4B]'
                                                        }`}
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#1769E0]" />
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-400">
                                                    {notif.time_ago}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
                            <Link
                                href="/company/notifications"
                                className="block w-full py-1.5 text-xs font-bold text-[#1769E0] transition hover:bg-blue-50 rounded-xl"
                            >
                                Lihat Semua Notifikasi
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mail Icon */}
                <Link
                    href="/messages"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100"
                    aria-label="Pesan masuk"
                >
                    <Mail className="h-5 w-5" aria-hidden="true" />
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="ml-1 flex min-h-11 items-center gap-2.5 rounded-full px-1.5 py-1 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] sm:pr-3"
                        >
                            <Avatar className="h-9 w-9 border border-slate-200">
                                {user.avatar ? (
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                ) : null}
                                <AvatarFallback className="bg-[#101B4D] text-xs font-bold text-white">
                                    {getInitials(user.name) || 'HR'}
                                </AvatarFallback>
                            </Avatar>

                            <span className="hidden text-sm font-semibold text-[#101B4D] sm:inline max-w-[160px] truncate" title={user?.name || 'HR Admin'}>
                                {user?.name || 'HR Admin'}
                            </span>
                            <ChevronDown
                                className="hidden h-4 w-4 text-slate-400 sm:block shrink-0"
                                aria-hidden="true"
                            />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border border-slate-100">
                        <div className="px-3 py-2">
                            <p className="text-xs font-bold text-[#102B4B] truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                            <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1769E0]">
                                Mitra Perusahaan
                            </span>
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/profile"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <span>Profil Perusahaan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/vacancies"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <UserIcon className="h-4 w-4 text-slate-500" />
                                <span>Kelola Lowongan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/company/notifications"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Bell className="h-4 w-4 text-slate-500" />
                                <span>Notifikasi Perusahaan</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/settings/security"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <ShieldCheck className="h-4 w-4 text-slate-500" />
                                <span>Keamanan Akun</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                            <LogOut className="h-4 w-4 text-rose-500" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
