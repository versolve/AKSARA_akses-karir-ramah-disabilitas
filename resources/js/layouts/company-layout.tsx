import { useState, type ReactNode } from 'react';
import { CompanyHeader } from '@/components/company/company-header';
import { CompanySidebar } from '@/components/company/company-sidebar';
import type { BreadcrumbItem } from '@/types';

export default function CompanyLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('company_sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = (): void => {
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
            setDesktopCollapsed((prev) => {
                const next = !prev;
                try {
                    localStorage.setItem('company_sidebar_collapsed', String(next));
                } catch {
                    // ignore storage quota / sandbox restrictions
                }
                return next;
            });
        } else {
            setMobileOpen((open) => !open);
        }
    };

    return (
        <div className="min-h-screen min-w-full bg-[#F8FBFE] dark:bg-[#020B3C] dark:text-[#F8FAFC]">
            <CompanyHeader
                onMenuClick={toggleSidebar}
                menuExpanded={mobileOpen}
            />
            <div className="flex min-h-[calc(100vh-72px)]">
                <aside
                    className={`sticky top-[72px] hidden h-[calc(100vh-72px)] shrink-0 self-start overflow-hidden border-r border-[#E2E8F0] bg-white transition-[width] duration-200 lg:block dark:bg-[#050E2E] dark:border-white/10 ${
                        desktopCollapsed ? 'w-[72px]' : 'w-64'
                    }`}
                >
                    <CompanySidebar collapsed={desktopCollapsed} onToggle={toggleSidebar} />
                </aside>

                {mobileOpen && (
                    <button
                        type="button"
                        className="fixed inset-0 top-[72px] z-30 bg-[#101B4D]/35 dark:bg-black/60 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Tutup menu perusahaan"
                    />
                )}
                <aside
                    className={`fixed bottom-0 left-0 top-[72px] z-40 w-[min(84vw,280px)] bg-white shadow-2xl transition-transform duration-200 lg:hidden dark:bg-[#050E2E] dark:border-r dark:border-white/10 ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    aria-hidden={!mobileOpen}
                >
                    <CompanySidebar mobile onClose={() => setMobileOpen(false)} />
                </aside>

                <main id="main-content" className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
