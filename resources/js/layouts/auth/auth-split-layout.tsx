import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import type { ReactNode } from 'react';

interface AuthSplitLayoutProps {
    children: ReactNode;
}

export default function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white font-sans selection:bg-[#20B8C1]/20 selection:text-[#0C2742]">
            {/* Left Column: Dark Navy branding panel (Visible on Desktop lg+) */}
            <div className="relative hidden lg:flex lg:w-1/2 bg-[#0C2742] items-center justify-center p-12 select-none sticky top-0 h-screen">
                <div className="max-w-md w-full flex items-center justify-center">
                    <img
                        src="/images/logos/logo_putih.svg"
                        alt="AKSARA - Akses Karier Ramah Disabilitas"
                        className="w-full max-w-[380px] object-contain drop-shadow-md"
                    />
                </div>
            </div>

            {/* Mobile Header Banner: Dark Navy on mobile only */}
            <div className="flex lg:hidden w-full bg-[#0C2742] items-center justify-center py-8 px-6">
                <img
                    src="/images/logos/logo_putih.svg"
                    alt="AKSARA"
                    className="h-10 max-w-[220px] object-contain"
                />
            </div>

            {/* Right Column: Form Content */}
            <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-14 xl:px-20 bg-white overflow-y-auto">
                <div className="mx-auto w-full max-w-lg">
                    {children}
                </div>
            </div>

            {/* Global Floating Accessibility Toolbar */}
            <AccessibilityToolbar />
        </div>
    );
}
