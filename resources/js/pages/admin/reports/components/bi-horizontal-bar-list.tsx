import type { ElementType, ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

export interface HorizontalBarItem {
    label: string;
    count: number;
    pct?: number;
    color?: string;
    icon?: ElementType;
}

interface BiHorizontalBarListProps {
    title: string;
    info?: string;
    items: HorizontalBarItem[];
    filterOptions?: string[];
    defaultFilter?: string;
}

export function BiHorizontalBarList({
    title,
    info,
    items,
    filterOptions,
}: BiHorizontalBarListProps): ReactElement {
    const maxVal = Math.max(...items.map((it) => it.count), 1);
    const palette = ['#2A78D6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

    return (
        <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>

                {filterOptions && filterOptions.length > 0 && (
                    <select
                        aria-label={`Filter untuk ${title}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                    >
                        {filterOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-6 text-xs font-medium text-slate-400">
                    Belum ada data tersedia
                </div>
            ) : (
                <div className="flex flex-1 flex-col justify-start space-y-3.5 pt-0.5">
                    {items.map((it, idx) => {
                        const widthPct = Math.min(100, Math.max(4, Math.round((it.count / maxVal) * 100)));
                        const color = it.color || palette[idx % palette.length];
                        const Icon = it.icon;

                        return (
                            <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-700">
                                        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                                        <span className="truncate text-[11px] sm:text-xs" title={it.label}>{it.label}</span>
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1.5 text-right">
                                        <strong className="text-[11px] sm:text-xs font-bold text-[#101B4D]">
                                            {new Intl.NumberFormat('id-ID').format(it.count)}
                                        </strong>
                                        {it.pct !== undefined && (
                                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">({it.pct}%)</span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${widthPct}%`, backgroundColor: color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
