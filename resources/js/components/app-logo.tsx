import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className="font-extrabold tracking-tight text-slate-900 text-sm leading-none">
                    AKSARA
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                    Akses Karier Inklusif
                </span>
            </div>
        </div>
    );
}
