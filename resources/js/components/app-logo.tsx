import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="size-9 sm:size-10 shrink-0" />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1528]">
                Profabel
            </span>
        </div>
    );
}
