import AppHeaderLayout from '@/layouts/app/app-header-layout';
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
    return (
        <div className="min-h-screen bg-[#F7FAFD] text-[#102B4B] font-sans">
            <AppHeaderLayout breadcrumbs={breadcrumbs}>
                {children}
                <AccessibilityToolbar />
            </AppHeaderLayout>
        </div>
    );
}
