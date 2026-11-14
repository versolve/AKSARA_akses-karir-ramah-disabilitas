import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { CheckCircle2, Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const themeOptions: {
        value: Appearance;
        icon: any;
        label: string;
        desc: string;
        iconBg: string;
        iconColor: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Mode Terang',
            desc: 'Latar putih bersih dengan kontras tajam untuk kenyamanan siang hari.',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Mode Gelap',
            desc: 'Latar gelap ramah mata untuk kenyamanan bekerja di ruangan redup.',
            iconBg: 'bg-slate-800 text-white',
            iconColor: 'text-indigo-300',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Otomatis (Sistem)',
            desc: 'Menyesuaikan otomatis dengan setelan tema sistem operasi perangkat Anda.',
            iconBg: 'bg-[#EBF5FA]',
            iconColor: 'text-[#007F96]',
        },
    ];

    return (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${className}`} {...props}>
            {themeOptions.map(
                ({ value, icon: Icon, label, desc, iconBg, iconColor }) => {
                    const isSelected = appearance === value;

                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateAppearance(value)}
                            className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                                isSelected
                                    ? 'border-[#007F96] bg-[#F0F8FC] shadow-sm ring-2 ring-[#007F96]/20'
                                    : 'border-[#E2E8F0] bg-white hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-2xs ${iconBg}`}
                                    >
                                        <Icon className={`h-5 w-5 ${iconColor}`} />
                                    </div>
                                    {isSelected && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-[#007F96]">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Aktif</span>
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-4 text-sm font-bold text-[#102B4B]">
                                    {label}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                                    {desc}
                                </p>
                            </div>
                        </button>
                    );
                },
            )}
        </div>
    );
}
