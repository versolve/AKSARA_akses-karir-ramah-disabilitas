import type { ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

export interface FunnelStage {
    stage: string;
    count: number;
    pct: number;
    color: string;
}

interface BiFunnelChartProps {
    title: string;
    info?: string;
    stages: FunnelStage[];
    filterOptions?: string[];
}

export function BiFunnelChart({ title, info, stages, filterOptions }: BiFunnelChartProps): ReactElement {
    // Widths for the trapezoids converging downwards
    const trapezoidWidths = ['w-[90%]', 'w-[75%]', 'w-[60%]', 'w-[45%]'];

    return (
        <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>

                {filterOptions && filterOptions.length > 0 && (
                    <select
                        aria-label={`Filter untuk ${title}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                    >
                        {filterOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2 pt-2">
                {/* Visual Funnel Stack */}
                <div className="flex flex-col items-center gap-1.5 py-2">
                    {stages.map((st, idx) => (
                        <div
                            key={st.stage}
                            className={`flex h-11 items-center justify-center rounded-lg shadow-sm transition hover:brightness-105 ${trapezoidWidths[idx] || 'w-[40%]'}`}
                            style={{ backgroundColor: st.color }}
                        >
                            <span className="text-xs font-bold text-white">
                                {new Intl.NumberFormat('id-ID').format(st.count)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Stage Details & Conversion % */}
                <div className="space-y-3">
                    {stages.map((st) => (
                        <div key={st.stage} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-medium text-slate-700">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                                {st.stage}
                            </span>
                            <span className="font-bold text-[#101B4D]">{st.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
