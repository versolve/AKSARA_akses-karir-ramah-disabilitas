import { Info } from 'lucide-react';
import type { ReactElement } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface BiInfoTooltipProps {
    info?: string;
}

export function BiInfoTooltip({ info }: BiInfoTooltipProps): ReactElement | null {
    if (!info) return null;

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label="Informasi penjelasan metrik"
                        className="inline-flex shrink-0 items-center justify-center text-slate-400 transition hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={true}
                    className="z-[9999] max-w-xs rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium leading-relaxed text-white shadow-xl pointer-events-none"
                >
                    {info}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
