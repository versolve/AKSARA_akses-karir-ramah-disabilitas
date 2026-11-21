import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    Building2,
    FileSpreadsheet,
    FileText,
    LayoutDashboard,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Users,
    X,
} from 'lucide-react';
import type { ReactElement } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompanyNavItem {
    title: string;
    href: string;
    icon: typeof LayoutDashboard;
    matchPrefix?: string;
}

export function CompanySidebar({
    mobile = false,
    collapsed = false,
    onToggle,
    onClose,
}: {
    mobile?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
    onClose?: () => void;
}): ReactElement {
    const page = usePage();
    const currentPath = new URL(
        page.url,
        typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    ).pathname;

    const navItems: CompanyNavItem[] = [
        {
            title: 'Dashboard',
            href: '/company/dashboard',
            icon: LayoutDashboard,
            matchPrefix: '/company/dashboard',
        },
        {
            title: 'Lowongan Perusahaan',
            href: '/company/vacancies',
            icon: Briefcase,
            matchPrefix: '/company/vacancies',
        },
        {
            title: 'Kandidat',
            href: '/company/candidates',
            icon: Users,
            matchPrefix: '/company/candidates',
        },
        {
            title: 'Lamaran Masuk',
            href: '/company/applications',
            icon: FileText,
            matchPrefix: '/company/applications',
        },
        {
            title: 'Business Intelligence',
            href: '/company/bi',
            icon: BarChart3,
            matchPrefix: '/company/bi',
        },
        {
            title: 'Pesan',
            href: '/messages',
            icon: MessageSquare,
            matchPrefix: '/messages',
        },
        {
            title: 'Laporan',
            href: '/company/reports',
            icon: FileSpreadsheet,
            matchPrefix: '/company/reports',
        },
        {
            title: 'Profil Perusahaan',
            href: '/company/profile',
            icon: Building2,
            matchPrefix: '/company/profile',
        },
    ];

    const isItemActive = (item: CompanyNavItem): boolean => {
        if (item.href === '/company/dashboard' && currentPath === '/company/dashboard') {
            return true;
        }
        if (item.href === '/company/vacancies' && (currentPath.startsWith('/company/vacancies') || currentPath.startsWith('/jobs'))) {
            return true;
        }
        if (item.matchPrefix && item.href !== '/company/dashboard') {
            return currentPath.startsWith(item.matchPrefix);
        }
        return currentPath === item.href;
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex h-full w-full flex-col bg-white select-none dark:bg-[#050E2E]">
                {/* Sidebar Header */}
                <div
                    className={`flex items-center border-b border-[#EEF2F6] h-[65px] transition-all duration-200 dark:border-white/10 ${
                        collapsed ? 'justify-center px-2' : 'justify-between px-5'
                    }`}
                >
                    {!collapsed && (
                        <span className="text-sm font-extrabold tracking-tight text-[#102B4B] dark:text-white">
                            Profabel – Perusahaan
                        </span>
                    )}

                    {/* Toggle button on desktop: to the right of header when expanded, centered when collapsed */}
                    {!mobile && onToggle && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition dark:hover:bg-white/10 dark:hover:text-white ${
                                collapsed ? 'text-[#101B4D] dark:text-slate-200' : ''
                            }`}
                            title={collapsed ? 'Perluas sidebar' : 'Minimize sidebar'}
                            aria-label={collapsed ? 'Perluas sidebar' : 'Minimize sidebar'}
                        >
                            {collapsed ? (
                                <PanelLeftOpen className="h-4 w-4" />
                            ) : (
                                <PanelLeftClose className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {/* Close button on mobile */}
                    {mobile && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                            aria-label="Tutup menu perusahaan"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Nav items */}
                <nav
                    className={`flex-1 space-y-1.5 overflow-y-auto py-4 ${
                        collapsed ? 'px-2' : 'px-3.5'
                    }`}
                    aria-label="Menu navigasi perusahaan"
                >
                    {navItems.map((item) => {
                        const active = isItemActive(item);
                        const Icon = item.icon;

                        if (collapsed) {
                            return (
                                <Tooltip key={item.title}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            prefetch
                                            onClick={onClose}
                                            aria-label={item.title}
                                            className={`flex h-11 w-11 mx-auto items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] ${
                                                active
                                                    ? 'bg-[#EBF5FA] text-[#1769E0] shadow-sm font-bold dark:bg-blue-950/60 dark:text-[#38BDF8]'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        sideOffset={12}
                                        className="z-[9999] rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl dark:bg-slate-800 dark:border dark:border-white/10"
                                    >
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                onClick={onClose}
                                className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] ${
                                    active
                                        ? 'bg-[#EBF5FA] font-bold text-[#1769E0] dark:bg-blue-950/60 dark:text-[#38BDF8]'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </TooltipProvider>
    );
}
