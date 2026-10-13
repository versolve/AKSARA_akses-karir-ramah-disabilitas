import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <AccessibilityToolbar />
        </AppLayoutTemplate>
    );
}
