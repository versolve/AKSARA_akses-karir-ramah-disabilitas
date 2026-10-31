import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Mail, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="hidden h-10 w-10 items-center justify-center rounded-lg text-[#101B4D] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] lg:flex"
                    aria-label={menuExpanded ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
                    aria-expanded={menuExpanded}
                >
                    {menuExpanded ? <PanelLeftClose className="h-5 w-5" aria-hidden="true" /> : <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />}
                </button>
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <img src="/images/logos/logo_biru.svg" alt="AKSARA" className="h-8 w-auto sm:h-9" />
                </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/app/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100" aria-label="Buka notifikasi">
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                </Link>
                <Link href="/messages" className="flex h-10 w-10 items-center justify-center rounded-full text-[#101B4D] transition hover:bg-slate-100" aria-label="Buka pesan">
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
