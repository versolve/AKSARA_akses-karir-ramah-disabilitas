import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Building2,
    Calendar,
    ChartBar,
    ChevronDown,
    FileText,
    HeartHandshake,
    LayoutGrid,
    LogOut,
    Mail,
    Menu,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
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
import { useState, type ReactElement } from 'react';

export function AppHeader(): ReactElement {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth?.user;
    const userRole = user?.role;
    const currentUrl = page.url;
    const getInitials = useInitials();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            { title: 'Cari Kerja', href: '/jobs', icon: Search },
            { title: 'Kelola Lowongan', href: '/company/vacancies', icon: Briefcase },
            { title: 'Pelamar Masuk', href: '/company/applications', icon: Users },
            { title: 'Profil Perusahaan', href: '/company/profile', icon: Building2 },
        ];
    } else if (userRole === 'admin') {
        navLinks = [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
            { title: 'Moderasi Lowongan', href: '/admin/vacancies', icon: ShieldCheck },
            { title: 'Laporan & Statistik', href: '/admin/reports', icon: ChartBar },
            { title: 'Katalog Lowongan', href: '/jobs', icon: Search },
        ];
    } else {
        navLinks = [
            { title: 'Beranda', href: '/', icon: LayoutGrid },
            { title: 'Cari Kerja', href: '/jobs', icon: Search },
        ];
    }

    const isActive = (href: string): boolean => {
        if (href === '/') return currentUrl === '/';
        return currentUrl.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/images/logos/logo_biru.svg"
                            alt="AKSARA - Akses Karier Ramah Disabilitas"
                            className="h-8 sm:h-9 w-auto object-contain"
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
                                        ? 'font-bold text-[#123B5D] border-b-2 border-[#123B5D] h-16 pt-0.5'
                                        : 'font-medium text-[#64748B] hover:text-[#123B5D] h-16 pt-0.5'
                                }`}
                            >
                                {link.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: User Profile & Quick Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* Notification Bell */}
                            <Link
                                href="/app/notifications"
                                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#64748B] hover:bg-slate-100 hover:text-[#123B5D] transition"
                                aria-label="Buka notifikasi"
                            >
                                <Bell className="h-5 w-5" />
                                {userRole === 'pelamar' && (
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                                )}
                            </Link>

                            {/* Messages Icon */}
                            <Link
                                href={userRole === 'perusahaan' ? '/company/applications' : '/app/applications'}
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
                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                            {user.avatar ? (
                                                <AvatarImage src={user.avatar} alt={user.name} />
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
                                                    <Link href="/app/accessibility-profile" className="cursor-pointer text-xs flex items-center gap-2 py-2">
                                                        <HeartHandshake className="h-4 w-4 text-slate-500" />
                                                        Kebutuhan Aksesibilitas
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
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#102B4B] hover:bg-slate-50 min-h-[44px] flex items-center"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-[#123B5D] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0C2742] min-h-[44px] flex items-center"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                        aria-label="Buka menu navigasi"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                                    active
                                        ? 'bg-[#EBF5FA] text-[#123B5D]'
                                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#102B4B]'
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
