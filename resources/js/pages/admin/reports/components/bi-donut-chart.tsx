import { useState, type ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

export interface DonutItem {
    label: string;
    value?: number; // percentage or weight
    pct?: number;
    count?: number;
    color: string;
}

interface BiDonutChartProps {
    title: string;
    info?: string;
    items: DonutItem[];
    centerValue: string | number;
    centerLabel: string;
    filterOptions?: string[];
    defaultFilter?: string;
}

export function BiDonutChart({
    title,
    info,
    items,
    centerValue,
    centerLabel,
    filterOptions,
    defaultFilter,
}: BiDonutChartProps): ReactElement {
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter || (filterOptions ? filterOptions[0] : ''));

    // Calculate total count or weight to derive accurate percentages
    const totalCount = items.reduce(
        (acc, it) => acc + (it.count !== undefined ? it.count : (it.value ?? it.pct ?? 0)),
        0
    );

    const normalizedItems = items.map((it) => {
        let pct: number;
        if (it.pct !== undefined) {
            pct = it.pct;
        } else if (it.value !== undefined && it.count === undefined) {
            pct = it.value;
        } else if (totalCount > 0) {
            const raw = it.count !== undefined ? it.count : (it.value ?? 0);
            pct = Number(((raw / totalCount) * 100).toFixed(1));
        } else {
            pct = 0;
        }

        const count = it.count !== undefined ? it.count : (it.value !== undefined && it.pct !== undefined ? it.value : undefined);

        return {
            ...it,
            pct,
            count,
            weight: it.count !== undefined ? it.count : (it.value ?? pct),
        };
    });

    // Compute conic gradient stops
    const totalWeight = normalizedItems.reduce((acc, it) => acc + (it.weight || 0), 0);
    let cursor = 0;
    const gradientStops = totalWeight > 0 && normalizedItems.length > 0
        ? normalizedItems.map((it) => {
              const start = cursor;
              const slice = (it.weight / totalWeight) * 100;
              cursor += slice;
              return `${it.color} ${start}% ${cursor}%`;
          })
        : ['#E2E8F0 0% 100%'];

    return (
        <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex min-w-0 items-center gap-1.5">
                    <h3 className="truncate text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>

                {filterOptions && filterOptions.length > 0 && (
                    <select
                        value={selectedFilter}
                        aria-label={`Filter untuk ${title}`}
                        onChange={(e) => setSelectedFilter(e.target.value)}
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

            {/* Content: Donut + Legend */}
            <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 py-2">
                {/* Donut Circle */}
                <div
                    className="relative flex h-28 w-28 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full shadow-inner"
                    style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
                >
                    <div className="flex h-18 w-18 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm p-1">
                        <span className="truncate text-base sm:text-lg font-extrabold text-[#101B4D]">
                            {typeof centerValue === 'number'
                                ? new Intl.NumberFormat('id-ID').format(centerValue)
                                : centerValue}
                        </span>
                        <span className="truncate text-[9px] font-semibold text-slate-400">{centerLabel}</span>
                    </div>
                </div>

                {/* Legend Breakdown */}
                <div className="w-full min-w-0 flex-1 space-y-1.5">
                    {normalizedItems.map((it) => (
                        <div key={it.label} className="flex items-center justify-between gap-2 text-xs">
                            <span className="flex min-w-0 items-center gap-1.5 truncate text-slate-600">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: it.color }} />
                                <span className="truncate text-[11px] sm:text-xs font-medium" title={it.label}>{it.label}</span>
                            </span>
                            <div className="flex shrink-0 items-center gap-1.5 text-right">
                                {it.count !== undefined && (
                                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                                        {new Intl.NumberFormat('id-ID').format(it.count)}
                                    </span>
                                )}
                                <strong className="text-[11px] sm:text-xs font-extrabold text-[#101B4D]">
                                    {it.pct !== undefined ? `${it.pct}%` : ''}
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
