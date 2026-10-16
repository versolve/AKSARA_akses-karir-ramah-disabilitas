import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Building2,
    ChartBar,
    FileText,
    Globe,
    HeartHandshake,
    LayoutGrid,
    Search,
    ShieldCheck,
    Sparkles,
    User,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const userRole = (page.props.auth as any)?.user?.role;

    let dashboardUrl = '/';
    let mainNavItems: NavItem[] = [];

    if (userRole === 'pelamar') {
        dashboardUrl = '/app/dashboard';
        mainNavItems = [
            {
                title: 'Beranda',
                href: '/app/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'AI Career Assistant',
                href: '/app/ai-assistant',
                icon: Sparkles,
            },
            {
                title: 'Cari Lowongan',
                href: '/jobs',
                icon: Search,
            },
            {
                title: 'Lamaran Saya',
                href: '/app/applications',
                icon: FileText,
            },
            {
                title: 'Profil Saya',
                href: '/app/profile',
                icon: User,
            },
            {
                title: 'Kebutuhan Aksesibilitas',
                href: '/app/accessibility-profile',
                icon: HeartHandshake,
            },
            {
                title: 'Notifikasi',
                href: '/app/notifications',
                icon: Bell,
            },
        ];
    } else if (userRole === 'perusahaan') {
        dashboardUrl = '/company/dashboard';
        mainNavItems = [
            {
                title: 'Beranda',
                href: '/company/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Kelola Lowongan',
                href: '/company/vacancies',
                icon: Briefcase,
            },
            {
                title: 'Pelamar Masuk',
                href: '/company/applications',
                icon: Users,
            },
            {
                title: 'Profil Perusahaan',
                href: '/company/profile',
                icon: Building2,
            },
            {
                title: 'Katalog Lowongan',
                href: '/jobs',
                icon: Search,
            },
        ];
    } else if (userRole === 'admin') {
        dashboardUrl = '/admin/dashboard';
        mainNavItems = [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Moderasi Lowongan',
                href: '/admin/vacancies',
                icon: ShieldCheck,
            },
            {
                title: 'Laporan & Statistik',
                href: '/admin/reports',
                icon: ChartBar,
            },
            {
                title: 'Katalog Publik',
                href: '/jobs',
                icon: Search,
            },
        ];
    } else {
        dashboardUrl = '/';
        mainNavItems = [
            {
                title: 'Cari Lowongan',
                href: '/jobs',
                icon: Search,
            },
        ];
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Beranda Publik',
            href: '/',
            icon: Globe,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
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
