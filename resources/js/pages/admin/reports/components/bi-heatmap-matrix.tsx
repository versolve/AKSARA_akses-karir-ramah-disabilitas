import type { ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

interface HeatmapRow {
    category: string;
    values: number[];
}

interface BiHeatmapMatrixProps {
    title: string;
    info?: string;
    columns: string[];
    rows: HeatmapRow[];
}

function getCellColor(val: number): { bg: string; text: string } {
    if (val >= 80) return { bg: 'bg-[#10B981]', text: 'text-white' };
    if (val >= 60) return { bg: 'bg-[#86EFAC]', text: 'text-[#065F46]' };
    if (val >= 40) return { bg: 'bg-[#FEF08A]', text: 'text-[#854D0E]' };
    if (val >= 20) return { bg: 'bg-[#FED7AA]', text: 'text-[#9A3412]' };
    return { bg: 'bg-[#FECACA]', text: 'text-[#991B1B]' };
}

const shortHeaderMap: Record<string, string> = {
    'Komunikasi Tertulis': 'Komunikasi',
    'Screen Reader': 'Screen R.',
    'Remote Working': 'Remote',
    'Fleksibilitas Jam Kerja': 'Jam Kerja',
    'Akses Kursi Roda': 'Kursi Roda',
};

export function BiHeatmapMatrix({ title, info, columns, rows }: BiHeatmapMatrixProps): ReactElement {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2EAF3] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>
            </div>

            <div className="space-y-3">
                {/* Scrollable Matrix Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs">
                        <thead>
                            <tr>
                                <th className="p-1.5 text-left font-bold text-slate-400 text-[10px] whitespace-nowrap">
                                    Kebutuhan \ Dukungan
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="p-1 font-bold text-slate-600 text-[10px] whitespace-nowrap"
                                        title={col}
                                    >
                                        {shortHeaderMap[col] || col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.category} className="border-t border-slate-50">
                                    <td
                                        className="p-1.5 text-left font-semibold text-slate-700 text-[10px] truncate max-w-[110px]"
                                        title={row.category}
                                    >
                                        {shortHeaderMap[row.category] || row.category}
                                    </td>
                                    {row.values.map((val, idx) => {
                                        const { bg, text } = getCellColor(val);
                                        return (
                                            <td key={idx} className="p-1">
                                                <div
                                                    className={`mx-auto flex h-7 sm:h-8 w-full max-w-[42px] items-center justify-center rounded-md text-[10px] sm:text-[11px] font-bold shadow-xs ${bg} ${text}`}
                                                >
                                                    {val}%
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend Below Table */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#10B981]" />
                        <span>80-100% (Sangat Baik)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#86EFAC]" />
                        <span>60-79% (Baik)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#FEF08A]" />
                        <span>40-59% (Cukup)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#FED7AA]" />
                        <span>20-39% (Rendah)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#FECACA]" />
                        <span>0-19% (Sangat Rendah)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
