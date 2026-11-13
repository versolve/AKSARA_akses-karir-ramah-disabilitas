import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ElementType, ReactElement } from 'react';

interface MetricProps {
    title: string;
    value: string | number;
    growth?: number;
    growthText?: string;
    icon: ElementType;
    tone?: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'teal';
    splitLeft?: { label: string; value: string | number };
    splitRight?: { label: string; value: string | number };
    subtext?: string;
}

const toneMap = {
    blue: { bg: 'bg-blue-50', text: 'text-[#1769E0]' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
};

export function BiMetricCard({
    title,
    value,
    growth,
    growthText,
    icon: Icon,
    tone = 'blue',
    splitLeft,
    splitRight,
    subtext,
}: MetricProps): ReactElement {
    const isPositive = growth !== undefined && growth >= 0;
    const toneStyle = toneMap[tone] || toneMap.blue;

    return (
        <article className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)] transition hover:shadow-md">
            <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-slate-500">{title}</span>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyle.bg} ${toneStyle.text}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-xl font-extrabold tracking-tight text-[#101B4D] sm:text-2xl xl:text-3xl">
                        {typeof value === 'number' ? new Intl.NumberFormat('id-ID').format(value) : value}
                    </span>
                    {growth !== undefined && (
                        <span
                            className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                        >
                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(growth)}%
                        </span>
                    )}
                </div>

                {(growthText || subtext) && (
                    <p className="mt-1 truncate text-[11px] text-slate-400" title={growthText || subtext}>
                        {growthText || subtext}
                    </p>
                )}
            </div>

            {(splitLeft || splitRight) && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5 text-[11px]">
                    {splitLeft && (
                        <div className="flex min-w-0 items-center gap-1">
                            <span className="truncate text-slate-400">{splitLeft.label}</span>
                            <span className="shrink-0 font-bold text-[#101B4D]">{splitLeft.value}</span>
                        </div>
                    )}
                    {splitRight && (
                        <div className="ml-auto flex min-w-0 items-center gap-1 text-right">
                            <span className="truncate text-slate-400">{splitRight.label}</span>
                            <span className="shrink-0 font-bold text-[#101B4D]">{splitRight.value}</span>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
