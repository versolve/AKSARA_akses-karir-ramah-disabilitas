import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import type { ReactNode } from 'react';

export default function AuthLayout({
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <AuthSplitLayout>
            {children}
        </AuthSplitLayout>
    );
}
