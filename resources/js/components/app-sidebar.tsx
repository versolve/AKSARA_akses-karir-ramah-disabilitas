import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Briefcase,
    Building2,
    FileText,
    Globe,
    LayoutDashboard,
    LayoutGrid,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    User,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { ReactElement } from 'react';
import type { NavItem } from '@/types';

export function AppSidebar(): ReactElement {
    const page = usePage();
    const userRole = (page.props.auth as { user?: { role?: string } } | undefined)?.user?.role;

    if (userRole === 'admin') {
        const dashboardUrl = '/admin/dashboard';
        const dashboardItem: NavItem[] = [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutDashboard,
            },
        ];
        const manajemenItems: NavItem[] = [
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Verifikasi Perusahaan',
                href: '/admin/companies/verification',
                icon: ShieldCheck,
            },
            {
                title: 'Kelola Lowongan',
                href: '/admin/vacancies',
                icon: Briefcase,
            },
        ];
        const analitikItems: NavItem[] = [
            {
                title: 'Business Intelligence',
                href: '/admin/reports',
                icon: BarChart3,
            },
            {
                title: 'Laporan',
                href: '/admin/reports',
                icon: FileText,
            },
        ];
        const sistemItems: NavItem[] = [
            {
                title: 'Pengaturan',
                href: '/settings/profile',
                icon: Settings,
            },
        ];

        return (
            <Sidebar collapsible="icon" variant="sidebar" className="border-r border-[#E2E8F0] bg-white">
                <SidebarHeader className="border-b border-[#EEF2F6] px-5 py-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                                <Link href={dashboardUrl} prefetch className="flex items-center gap-3">
                                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#123B5D] to-[#1E6292] text-white font-extrabold text-sm shadow-sm">
                                        AK
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-base font-extrabold tracking-tight text-[#102B4B] leading-none">
                                            AKSARA
                                        </span>
                                        <span className="mt-1 text-[11px] font-bold text-slate-400 leading-none">
                                            AKSARA — Admin
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="space-y-4 py-4">
                    <NavMain items={dashboardItem} label="Utama" />
                    <NavMain items={manajemenItems} label="Manajemen" />
                    <NavMain items={analitikItems} label="Analitik" />
                    <NavMain items={sistemItems} label="Sistem" />
                </SidebarContent>

                <SidebarFooter className="border-t border-[#EEF2F6] p-3">
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
        );
    }

    let dashboardUrl = '/';
    let mainNavItems: NavItem[] = [];

    if (userRole === 'pelamar') {
        dashboardUrl = '/app/dashboard';
        mainNavItems = [
            { title: 'Beranda', href: '/app/dashboard', icon: LayoutGrid },
            { title: 'AI Career Assistant', href: '/app/ai-assistant', icon: Sparkles },
            { title: 'Cari Lowongan', href: '/jobs', icon: Search },
            { title: 'Lamaran Saya', href: '/app/applications', icon: FileText },
            { title: 'Profil Saya', href: '/app/profile', icon: User },
            { title: 'Notifikasi', href: '/app/notifications', icon: Bell },
        ];
    } else if (userRole === 'perusahaan') {
        dashboardUrl = '/company/dashboard';
        mainNavItems = [
            { title: 'Beranda', href: '/company/dashboard', icon: LayoutGrid },
            { title: 'Kelola Lowongan', href: '/company/vacancies', icon: Briefcase },
            { title: 'Pelamar Masuk', href: '/company/applications', icon: Users },
            { title: 'Profil Perusahaan', href: '/company/profile', icon: Building2 },
            { title: 'Katalog Lowongan', href: '/jobs', icon: Search },
        ];
    } else {
        dashboardUrl = '/';
        mainNavItems = [{ title: 'Cari Lowongan', href: '/jobs', icon: Search }];
    }

    const footerNavItems: NavItem[] = [{ title: 'Beranda Publik', href: '/', icon: Globe }];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <img src="/images/logos/logo_biru.svg" alt="AKSARA" className="h-8 w-auto" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
