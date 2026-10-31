import { useState, type ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { BreadcrumbItem } from '@/types';

export default function AdminLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggleSidebar = (): void => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            setDesktopCollapsed((collapsed) => !collapsed);
        } else {
            setMobileOpen((open) => !open);
        }
    };

    return (
        <div className="min-h-screen min-w-full bg-[#F5F9FF]">
            <AdminHeader
                onMenuClick={toggleSidebar}
                menuExpanded={!desktopCollapsed || mobileOpen}
            />
            <div className="flex min-h-[calc(100vh-72px)]">
                <aside
                    className={`hidden shrink-0 overflow-hidden border-r border-[#E2E8F0] bg-white transition-[width] duration-200 lg:block ${desktopCollapsed ? 'w-0 border-r-0' : 'w-64'}`}
                    aria-hidden={desktopCollapsed}
                >
                    <AdminSidebar />
                </aside>

                {mobileOpen && (
                    <button
                        type="button"
                        className="fixed inset-0 top-[72px] z-30 bg-[#101B4D]/35 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Tutup menu admin"
                    />
                )}
                <aside
                    className={`fixed bottom-0 left-0 top-[72px] z-40 w-[min(84vw,280px)] bg-white shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    aria-hidden={!mobileOpen}
                >
                    <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
                </aside>

                <main id="main-content" className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
