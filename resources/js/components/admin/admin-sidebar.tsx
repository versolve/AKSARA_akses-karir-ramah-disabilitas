import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    FileText,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';

interface AdminNavItem {
    title: string;
    href: string;
    icon: typeof LayoutDashboard;
}

export function AdminSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }): ReactElement {
    const { isCurrentUrl } = useCurrentUrl();
    const sections: Array<{ label: string; items: AdminNavItem[] }> = [
        { label: '', items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }] },
        {
            label: 'Manajemen',
            items: [
                { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
                { title: 'Verifikasi Perusahaan', href: '/admin/companies/verification', icon: ShieldCheck },
                { title: 'Kelola Lowongan', href: '/admin/vacancies', icon: Briefcase },
            ],
        },
        {
            label: 'Analitik',
            items: [
                { title: 'Business Intelligence', href: '/admin/reports', icon: BarChart3 },
                { title: 'Laporan', href: '/admin/reports', icon: FileText },
            ],
        },
        { label: 'Sistem', items: [{ title: 'Pengaturan', href: '/settings/profile', icon: Settings }] },
    ];

    return (
        <div className="flex h-full min-h-[calc(100vh-72px)] w-64 flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#EEF2F6] px-5 py-4">
                <span className="text-sm font-extrabold tracking-tight text-[#101B4D]">ADMIN</span>
                {mobile && <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Tutup menu admin"><X className="h-5 w-5" /></button>}
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Menu navigasi admin">
                {sections.map((section, idx) => (
                    <div key={section.label || `section-${idx}`} className="space-y-1">
                        {section.label && <p className="px-3 text-[11px] font-bold tracking-[0.08em] text-slate-400">{section.label}</p>}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = isCurrentUrl(item.href);
                                const Icon = item.icon;
                                return <Link key={item.title} href={item.href} prefetch onClick={onClose} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] ${active ? 'bg-[#EBF5FA] font-bold text-[#1769E0]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px]" aria-hidden="true" /><span>{item.title}</span></Link>;
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
}
