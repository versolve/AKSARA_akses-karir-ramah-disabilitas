import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    const user = (usePage().props.auth as { user?: { role?: string } } | undefined)?.user;
    const layout = user?.role === 'admin' ? (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>{children}</AppSidebarLayout>
    ) : (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>{children}</AppHeaderLayout>
    );

    return (
        <div className="min-h-screen bg-[#F7FAFD] font-sans text-[#102B4B]">
            {layout}
            <AccessibilityToolbar />
        </div>
    );
}
