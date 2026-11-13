import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    FileText,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    ShieldCheck,
    MessageSquare,
    Users,
    X,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminNavItem {
    title: string;
    href: string;
    icon: typeof LayoutDashboard;
}

export function AdminSidebar({
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
    const { isCurrentUrl } = useCurrentUrl();
    const sections: Array<{ label: string; items: AdminNavItem[] }> = [
        { label: '', items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }] },
        {
            label: 'Manajemen',
            items: [
                { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
                { title: 'Verifikasi Perusahaan', href: '/admin/companies/verification', icon: ShieldCheck },
                { title: 'Kelola Lowongan', href: '/admin/vacancies', icon: Briefcase },
                { title: 'Pesan & Pengumuman', href: '/admin/messages', icon: MessageSquare },
            ],
        },
        {
            label: 'Analitik',
            items: [
                { title: 'Business Intelligence', href: '/admin/reports', icon: BarChart3 },
                { title: 'Laporan', href: '/admin/reporting', icon: FileText },
            ],
        },
        { label: 'Sistem', items: [{ title: 'Pengaturan', href: '/admin/settings', icon: Settings }] },
    ];

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex h-full w-full flex-col bg-white select-none">
                {/* Sidebar Header */}
                <div
                    className={`flex items-center border-b border-[#EEF2F6] h-[65px] transition-all duration-200 ${
                        collapsed ? 'justify-center px-2' : 'justify-between px-5'
                    }`}
                >
                    {!collapsed && (
                        <span className="text-sm font-extrabold tracking-tight text-[#102B4B]">
                            ADMIN
                        </span>
                    )}

                    {/* Toggle button on desktop: to the right of ADMIN when expanded, centered when collapsed */}
                    {!mobile && onToggle && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition ${
                                collapsed ? 'text-[#101B4D]' : ''
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                            aria-label="Tutup menu admin"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Nav items */}
                <nav
                    className={`flex-1 space-y-4 overflow-y-auto py-4 ${
                        collapsed ? 'px-2' : 'px-3'
                    }`}
                    aria-label="Menu navigasi admin"
                >
                    {sections.map((section, idx) => (
                        <div key={section.label || `section-${idx}`} className="space-y-1">
                            {section.label && (
                                !collapsed ? (
                                    <p className="px-3 text-[11px] font-bold tracking-[0.08em] text-slate-400 uppercase">
                                        {section.label}
                                    </p>
                                ) : (
                                    <div className="my-2 border-t border-slate-100 mx-2" />
                                )
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isCurrentUrl(item.href);
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
                                                                ? 'bg-[#EBF5FA] text-[#1769E0] shadow-sm'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="right"
                                                    sideOffset={12}
                                                    className="z-[9999] rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl"
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
                                                    ? 'bg-[#EBF5FA] font-bold text-[#1769E0]'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </TooltipProvider>
    );
}
