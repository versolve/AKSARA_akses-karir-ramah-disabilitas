import { useInitials } from '@/hooks/use-initials';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Palette, ShieldCheck, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface SettingsNavItem {
    title: string;
    description: string;
    href: string;
    icon: any;
}

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profil Akun',
        description: 'Informasi dasar, nama, dan email',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan & Sandi',
        description: 'Ubah kata sandi dan proteksi akun',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Tema & Tampilan',
        description: 'Mode terang, gelap, atau sistem',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const getInitials = useInitials();

    const roleLabel =
        user?.role === 'pelamar'
            ? 'Pelamar Kerja'
            : user?.role === 'perusahaan'
              ? 'Perusahaan Mitra'
              : 'Admin Sistem';

    return (
        <div className="space-y-6 py-6 sm:py-8">
            <Head title="Pengaturan Akun - Profabel" />

            {/* Header Pengaturan */}
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#102B4B] sm:text-3xl">
                    Pengaturan Akun
                </h1>
                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                    Kelola data identitas, keamanan sandi, dan preferensi akun Profabel Anda.
                </p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                {/* Kolom Kiri: Navigasi & Info Mini User (4 cols) */}
                <div className="space-y-4 lg:col-span-4">
                    {/* Mini Card User Info */}
                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#123B5D] text-base font-extrabold text-white shadow-xs">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user?.name || 'Avatar'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    getInitials(user?.name || 'User')
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-bold text-[#102B4B]">
                                    {user?.name}
                                </h3>
                                <p className="truncate text-xs text-[#64748B]">
                                    {user?.email}
                                </p>
                                <span className="mt-1 inline-block rounded-md bg-[#EBF5FA] px-2 py-0.5 text-[10px] font-bold text-[#007F96]">
                                    {roleLabel}
                                </span>
                            </div>
                        </div>

                        {/* Quick Link ke profil kerja spesifik role */}
                        {user?.role === 'pelamar' && (
                            <div className="mt-4 border-t border-[#F1F5F9] pt-3">
                                <Link
                                    href="/app/profile"
                                    className="flex items-center justify-between text-xs font-semibold text-[#1674D1] transition hover:text-[#0C2742]"
                                >
                                    <span>Lihat Profil Karier Pelamar</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        )}
                        {user?.role === 'perusahaan' && (
                            <div className="mt-4 border-t border-[#F1F5F9] pt-3">
                                <Link
                                    href="/company/profile"
                                    className="flex items-center justify-between text-xs font-semibold text-[#1674D1] transition hover:text-[#0C2742]"
                                >
                                    <span>Lihat Profil Perusahaan</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Navigation Sidebar Card */}
                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-3 shadow-xs">
                        <nav className="flex flex-col space-y-1.5" aria-label="Menu Pengaturan">
                            {sidebarNavItems.map((item, index) => {
                                const active = isCurrentOrParentUrl(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={`${toUrl(item.href)}-${index}`}
                                        href={item.href}
                                        className={`flex items-center gap-3.5 rounded-2xl p-3 text-xs transition sm:text-sm ${
                                            active
                                                ? 'bg-[#EBF5FA] font-bold text-[#123B5D] shadow-2xs'
                                                : 'font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#102B4B]'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                                                active
                                                    ? 'bg-white text-[#007F96] shadow-xs'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-bold">
                                                {item.title}
                                            </div>
                                            <div className="truncate text-[11px] text-[#94A3B8]">
                                                {item.description}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Kolom Kanan: Konten Halaman Pengaturan (8 cols) */}
                <div className="space-y-6 lg:col-span-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
