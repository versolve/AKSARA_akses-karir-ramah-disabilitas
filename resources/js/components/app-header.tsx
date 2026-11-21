import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    ChartBar,
    CheckCheck,
    ChevronDown,
    FileText,
    LayoutGrid,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Moon,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Sun,
    User,
    Users,
    X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useAppearance } from '@/hooks/use-appearance';
import { useState, type ReactElement } from 'react';

interface SeekerNotificationItem {
    id: string;
    title: string;
    company_name: string;
    message: string;
    status?: string;
    link: string;
    created_at: string;
    time_ago: string;
    is_read: boolean;
}

export function AppHeader(): ReactElement {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth?.user;
    const userRole = user?.role;
    const seekerNotifications = ((page.props as any).seekerNotifications || []) as SeekerNotificationItem[];
    const seekerUnreadCount = Number((page.props as any).seekerUnreadNotificationsCount || 0);
    const currentUrl = page.url;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSelectSeekerNotif = (notif: SeekerNotificationItem): void => {
        if (!notif.is_read) {
            router.post(`/app/notifications/${notif.id}/read`, {}, { preserveScroll: true });
        }
        router.visit(`/app/notifications?id=${notif.id}`);
    };

    const handleMarkAllSeekerRead = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        router.post('/app/notifications/read-all', {}, { preserveScroll: true });
    };

    // Navigation links per role
    let navLinks: Array<{ title: string; href: string; icon?: any }> = [];

    if (userRole === 'pelamar') {
        navLinks = [
            { title: 'Beranda', href: '/app/dashboard', icon: LayoutGrid },
            { title: 'Cari Kerja', href: '/jobs', icon: Search },
            { title: 'AI Career Assistant', href: '/app/ai-assistant', icon: Sparkles },
            { title: 'Lamaran Saya', href: '/app/applications', icon: FileText },
        ];
    } else if (userRole === 'perusahaan') {
        navLinks = [
            { title: 'Beranda', href: '/company/dashboard', icon: LayoutGrid },
            { title: 'Katalog Lowongan', href: '/jobs', icon: Search },
            { title: 'Kelola Lowongan', href: '/company/vacancies', icon: Briefcase },
            { title: 'Pelamar Masuk', href: '/company/applications', icon: Users },
            { title: 'Profil Perusahaan', href: '/company/profile', icon: Building2 },
        ];
    } else if (userRole === 'admin') {
        navLinks = [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
            { title: 'Verifikasi Perusahaan', href: '/admin/companies/verification', icon: ShieldCheck },
            { title: 'Kelola Lowongan', href: '/admin/vacancies', icon: Briefcase },
            { title: 'Laporan & Statistik', href: '/admin/reports', icon: ChartBar },
            { title: 'Katalog Lowongan', href: '/jobs', icon: Search },
        ];
    } else {
        navLinks = [
            { title: 'Beranda', href: '/', icon: LayoutGrid },
            { title: 'Cari Kerja', href: '/jobs', icon: Search },
            { title: 'AI Career Assistant', href: '/app/ai-assistant', icon: Sparkles },
        ];
    }

    const isActive = (href: string): boolean => {
        if (href === '/') return currentUrl === '/';
        if (href === '/app/dashboard') {
            return currentUrl === '/app/dashboard' || currentUrl === '/';
        }
        return currentUrl.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#020B3C]/95">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Logo */}
                <div className="flex items-center gap-6 shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/images/logos/logo_biru.svg"
                            alt="Profabel - Akses Karier Ramah Disabilitas"
                            className="h-8 sm:h-9 w-auto object-contain logo-light"
                        />
                        <img
                            src="/images/logos/logo_putih.svg"
                            alt="Profabel - Akses Karier Ramah Disabilitas"
                            className="h-8 sm:h-9 w-auto object-contain logo-dark"
                        />
                    </Link>
                </div>

                {/* Middle: Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 h-16">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`inline-flex items-center text-sm transition select-none ${
                                    active
                                        ? 'font-bold text-[#123B5D] border-b-2 border-[#123B5D] h-16 pt-0.5 dark:text-white dark:border-[#38BDF8]'
                                        : 'font-medium text-[#64748B] hover:text-[#123B5D] h-16 pt-0.5 border-b-2 border-transparent dark:text-slate-300 dark:hover:text-white'
                                }`}
                            >
                                {link.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: User Profile & Quick Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {user ? (
                        <>
                            {/* Notification Bell Dropdown (Matches Admin & Company mini list) */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#64748B] hover:bg-slate-100 hover:text-[#123B5D] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1674D1]"
                                        aria-label="Buka notifikasi"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {seekerUnreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                                {seekerUnreadCount > 9 ? '9+' : seekerUnreadCount}
                                            </span>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    sideOffset={8}
                                    className="w-80 sm:w-96 rounded-2xl border border-slate-100 dark:border-white/10 p-0 shadow-2xl z-50 bg-white dark:bg-[#071336]"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-[#102B4B] dark:text-white">Notifikasi</span>
                                            {seekerUnreadCount > 0 && (
                                                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-[#1674D1] dark:text-[#38BDF8]">
                                                    {seekerUnreadCount} Baru
                                                </span>
                                            )}
                                        </div>
                                        {seekerUnreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleMarkAllSeekerRead}
                                                className="flex items-center gap-1 text-[11px] font-bold text-[#1674D1] dark:text-[#38BDF8] hover:underline cursor-pointer"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                                Tandai dibaca
                                            </button>
                                        )}
                                    </div>

                                    {/* Mini List */}
                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-white/5">
                                        {seekerNotifications.length === 0 ? (
                                            <div className="py-8 text-center text-slate-400">
                                                <Bell className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                                <p className="mt-2 text-xs font-medium">Tidak ada notifikasi baru</p>
                                            </div>
                                        ) : (
                                            seekerNotifications.map((notif) => {
                                                const companyInitials = (notif.company_name || 'MB').substring(0, 2).toUpperCase();
                                                const isInterview = notif.status === 'interview';
                                                const isHired = notif.status === 'hired';
                                                const isRejected = notif.status === 'rejected';

                                                const iconBg = isInterview
                                                    ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#16A36B] dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400'
                                                    : isHired
                                                    ? 'bg-[#EBF5FA] border-[#D0E5F0] text-[#123B5D] dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-[#38BDF8]'
                                                    : isRejected
                                                    ? 'bg-[#FEE2E2] border-rose-200 text-[#B91C1C] dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400'
                                                    : 'bg-[#EBF5FA] border-[#D0E5F0] text-[#1674D1] dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-[#38BDF8]';

                                                return (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleSelectSeekerNotif(notif)}
                                                        className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                                                            notif.is_read ? 'opacity-75' : 'bg-blue-50/25 dark:bg-[#0B1E48]/40'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-extrabold ${iconBg}`}
                                                        >
                                                            {isRejected ? (
                                                                <X className="h-4 w-4 stroke-[2.5]" />
                                                            ) : isInterview || isHired ? (
                                                                companyInitials
                                                            ) : (
                                                                <MessageSquare className="h-4 w-4" />
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
                                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#1674D1] dark:bg-[#38BDF8]" />
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] font-semibold text-[#102B4B] dark:text-slate-200 truncate mt-0.5">
                                                                {notif.company_name}
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                                                                {notif.message}
                                                            </p>
                                                            <span className="mt-1 block text-[10px] text-slate-400">
                                                                {notif.time_ago}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <Link
                                        href="/app/notifications"
                                        className="block border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#050E2E] p-3 text-center text-xs font-bold text-[#1674D1] dark:text-[#38BDF8] transition hover:bg-blue-50/50 dark:hover:bg-white/5 rounded-b-2xl"
                                    >
                                        Lihat Semua Notifikasi
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Messages Icon */}
                            <Link
                                href="/messages"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#64748B] hover:bg-slate-100 hover:text-[#123B5D] transition"
                                aria-label="Buka percakapan pesan"
                            >
                                <Mail className="h-5 w-5" />
                            </Link>

                            {/* User Avatar & Info Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-50 transition border border-transparent hover:border-[#E2E8F0] min-h-[44px]"
                                    >
                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-white">
                                            {user.avatar || (user as any).company_profile?.logo_url ? (
                                                <AvatarImage
                                                    src={user.avatar || (user as any).company_profile?.logo_url}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-[#123B5D] text-white text-xs font-bold">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-xs font-bold text-[#102B4B] leading-tight">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] text-[#64748B] capitalize leading-tight">
                                                {userRole === 'pelamar' ? 'Pelamar' : userRole === 'perusahaan' ? 'Perusahaan' : 'Admin'}
                                            </span>
                                        </div>

                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-[#E2E8F0] p-1.5" align="end">
                                    <DropdownMenuLabel className="p-2">
                                        <div className="font-bold text-xs text-[#102B4B]">{user.name}</div>
                                        <div className="text-[11px] text-slate-500">{user.email}</div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        {userRole === 'pelamar' && (
                                            <>
                                                <DropdownMenuItem asChild>
                                                    <Link href="/app/profile" className="cursor-pointer text-xs flex items-center gap-2 py-2">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                        Profil Saya
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href="/app/favorites" className="cursor-pointer text-xs flex items-center gap-2 py-2">
                                                        <Bookmark className="h-4 w-4 text-slate-500" />
                                                        Lowongan Favorit
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {userRole === 'perusahaan' && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/company/profile" className="cursor-pointer text-xs flex items-center gap-2 py-2">
                                                    <Building2 className="h-4 w-4 text-slate-500" />
                                                    Profil Perusahaan
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings/profile" className="cursor-pointer text-xs flex items-center gap-2 py-2">
                                                <Settings className="h-4 w-4 text-slate-500" />
                                                Pengaturan Akun
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full cursor-pointer text-xs flex items-center gap-2 py-2 text-rose-600 hover:text-rose-700"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Keluar (Logout)
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/login"
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-[#0B1528] hover:bg-slate-50 transition min-h-[40px] flex items-center dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-[#0B1528] px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#15233D] transition min-h-[40px] flex items-center dark:bg-white dark:text-[#0B1528] dark:hover:bg-slate-100"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                        aria-label="Buka menu navigasi"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2 dark:border-slate-800 dark:bg-[#020B3C]">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                                    active
                                        ? 'bg-[#EBF5FA] text-[#123B5D] dark:bg-blue-950/60 dark:text-[#38BDF8]'
                                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#102B4B] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                            >
                                {link.icon && <link.icon className="h-4 w-4" />}
                                <span>{link.title}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
