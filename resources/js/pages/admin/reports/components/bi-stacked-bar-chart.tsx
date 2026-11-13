import type { ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

interface StackedData {
    label: string;
    active: number;
    semi_active: number;
    inactive: number;
}

interface BiStackedBarChartProps {
    title: string;
    info?: string;
    data: {
        seekers: StackedData;
        companies: StackedData;
    };
}

export function BiStackedBarChart({ title, info, data }: BiStackedBarChartProps): ReactElement {
    const rawTotal = Math.max(
        data.seekers.active + data.seekers.semi_active + data.seekers.inactive,
        data.companies.active + data.companies.semi_active + data.companies.inactive,
        10
    );
    const maxY = rawTotal <= 15 ? 15 : rawTotal <= 30 ? 30 : rawTotal <= 50 ? 50 : rawTotal <= 100 ? 100 : Math.ceil(rawTotal / 50) * 50;
    const ticks = [0, Math.round(maxY * 0.33), Math.round(maxY * 0.66), maxY];

    const chartHeight = 150;

    const renderBar = (item: StackedData) => {
        const total = item.active + item.semi_active + item.inactive;
        const activePct = (item.active / maxY) * 100;
        const semiPct = (item.semi_active / maxY) * 100;
        const inactPct = (item.inactive / maxY) * 100;

        return (
            <div className="flex flex-col items-center min-w-0">
                <span className="mb-1 text-xs font-bold text-[#101B4D]">{total}</span>
                <div
                    className="flex w-14 sm:w-16 flex-col-reverse overflow-hidden rounded-lg bg-slate-100"
                    style={{ height: `${chartHeight}px` }}
                >
                    <div
                        className="w-full bg-[#10B981] transition-all duration-500 flex items-center justify-center overflow-hidden"
                        style={{ height: `${activePct}%` }}
                        title={`Aktif: ${item.active}`}
                    >
                        {item.active > 0 && activePct >= 14 && (
                            <span className="text-[10px] font-bold text-white truncate px-0.5">
                                {item.active}
                            </span>
                        )}
                    </div>
                    <div
                        className="w-full bg-[#F59E0B] transition-all duration-500 flex items-center justify-center overflow-hidden"
                        style={{ height: `${semiPct}%` }}
                        title={`Kurang Aktif: ${item.semi_active}`}
                    >
                        {item.semi_active > 0 && semiPct >= 14 && (
                            <span className="text-[10px] font-bold text-white truncate px-0.5">
                                {item.semi_active}
                            </span>
                        )}
                    </div>
                    <div
                        className="w-full bg-[#EF4444] transition-all duration-500 flex items-center justify-center overflow-hidden"
                        style={{ height: `${inactPct}%` }}
                        title={`Tidak Aktif: ${item.inactive}`}
                    >
                        {item.inactive > 0 && inactPct >= 14 && (
                            <span className="text-[10px] font-bold text-white truncate px-0.5">
                                {item.inactive}
                            </span>
                        )}
                    </div>
                </div>
                <span className="mt-2 text-center text-[11px] font-semibold text-slate-600 truncate max-w-[100px]" title={item.label}>
                    {item.label}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>
            </div>

            <div className="flex items-end justify-around gap-4 pt-1">
                {/* Y-axis Ticks */}
                <div className="flex flex-col justify-between text-right text-[10px] text-slate-400 shrink-0" style={{ height: `${chartHeight}px` }}>
                    {ticks.slice().reverse().map((t) => (
                        <span key={t}>{t}</span>
                    ))}
                </div>

                {/* Bars */}
                {renderBar(data.seekers)}
                {renderBar(data.companies)}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 pt-3 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    Aktif
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    Kurang Aktif
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                    Tidak Aktif
                </span>
            </div>
        </div>
    );
}
