import type { ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

export interface ColumnBarItem {
    label: string;
    sublabel?: string;
    value: number; // percentage or count
    displayValue?: string;
    color?: string;
}

interface BiColumnBarChartProps {
    title: string;
    info?: string;
    items: ColumnBarItem[];
    maxValue?: number;
    unit?: string;
}

export function BiColumnBarChart({
    title,
    info,
    items,
    maxValue = 100,
    unit = '%',
}: BiColumnBarChartProps): ReactElement {
    const chartHeight = 140;

    return (
        <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-4 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>
            </div>

            {/* Column Bars */}
            <div className="flex flex-1 items-end justify-between gap-1.5 sm:gap-3 py-2" style={{ minHeight: `${chartHeight}px` }}>
                {items.map((it, idx) => {
                    const heightPct = Math.min(100, Math.max(8, (it.value / maxValue) * 100));
                    const color = it.color || '#2A78D6';

                    return (
                        <div key={idx} className="flex flex-1 flex-col items-center justify-end h-full min-w-0">
                            {/* Value on top */}
                            <span className="mb-1.5 truncate text-[10px] sm:text-[11px] font-bold text-[#101B4D]">
                                {it.displayValue || `${it.value}${unit}`}
                            </span>

                            {/* Bar */}
                            <div className="w-full max-w-[36px] rounded-t-lg bg-slate-100 flex items-end overflow-hidden" style={{ height: `${heightPct}%` }}>
                                <div
                                    className="w-full h-full rounded-t-lg transition-all duration-500"
                                    style={{ backgroundColor: color }}
                                />
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-center w-full min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 leading-tight truncate px-0.5" title={it.label}>
                                    {it.label}
                                </p>
                                {it.sublabel && (
                                    <p className="text-[9px] text-slate-400 font-medium truncate">
                                        {it.sublabel}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
