import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const user = (page.props.auth as any)?.user;
    const isPelamar = user?.role === 'pelamar';

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {isPelamar && (
                <div className="flex items-center gap-2">
                    <Link
                        href="/app/notifications"
                        className="relative flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 min-h-[44px] min-w-[44px]"
                        aria-label="Buka notifikasi"
                    >
                        <Bell className="h-5 w-5" />
                    </Link>
                </div>
            )}
        </header>
    );
}
