import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Briefcase,
    Building2,
    ChartBar,
    FileText,
    FolderGit2,
    HeartHandshake,
    LayoutGrid,
    Search,
    Shield,
    ShieldCheck,
    Sparkles,
    User,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
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
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
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
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
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
