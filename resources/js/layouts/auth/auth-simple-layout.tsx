import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 p-6 md:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <a
                href="#auth-form"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:p-3 focus:text-sm focus:font-bold focus:text-white"
            >
                Lewati ke formulir
            </a>

            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2"
                            aria-label="Kembali ke beranda Profabel"
                        >
                            <AppLogo />
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
                            {description && (
                                <p className="text-sm text-slate-600">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div id="auth-form" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>

            {/* Global Floating Accessibility Toolbar */}
            <AccessibilityToolbar />
        </div>
    );
}
