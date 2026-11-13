import { useEffect, useState, type ReactElement } from 'react';
import { BiInfoTooltip } from './bi-info-tooltip';

export interface SeriesConfig {
    key: string;
    name: string;
    color: string;
}

interface BiLineChartProps {
    title: string;
    info?: string;
    series: SeriesConfig[];
    data: Array<{ label: string; [key: string]: any }>;
    dataByYear?: Record<number | string, Array<{ label: string; [key: string]: any }>>;
    availableYears?: number[];
    isAllPeriod?: boolean;
    defaultYear?: number | string;
    periodOptions?: string[];
    defaultPeriod?: string;
    onYearChange?: (year: string) => void;
}

export function BiLineChart({
    title,
    info,
    series,
    data,
    dataByYear,
    availableYears = [],
    isAllPeriod = false,
    defaultYear,
    periodOptions = [],
    defaultPeriod = '',
    onYearChange,
}: BiLineChartProps): ReactElement {
    const initialYear = String(defaultYear || (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()));
    const [selectedYear, setSelectedYear] = useState<string>(initialYear);
    const [period, setPeriod] = useState(defaultPeriod);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (defaultYear) {
            setSelectedYear(String(defaultYear));
        } else if (availableYears && availableYears.length > 0) {
            setSelectedYear(String(availableYears[0]));
        }
    }, [defaultYear, availableYears]);

    // Dynamic data: if isAllPeriod and dataByYear exists for selectedYear, use that
    const activeData = isAllPeriod && dataByYear && dataByYear[selectedYear]
        ? dataByYear[selectedYear]
        : (data || []);

    // Calculate maximum value across all series
    let rawMax = 10;
    activeData.forEach((item) => {
        series.forEach((s) => {
            const val = Number(item[s.key]) || 0;
            if (val > rawMax) rawMax = val;
        });
    });

    // Nice round yMax
    const yMax = rawMax <= 5 ? 5 : rawMax <= 10 ? 10 : rawMax <= 25 ? 25 : rawMax <= 50 ? 50 : rawMax <= 100 ? 100 : Math.ceil(rawMax / 50) * 50;
    const ticks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

    const chartWidth = 600;
    const chartHeight = 220;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const getX = (index: number) => {
        if (activeData.length <= 1) return paddingLeft + plotWidth / 2;
        return paddingLeft + (index * plotWidth) / (activeData.length - 1);
    };

    const getY = (val: number) => {
        return paddingTop + plotHeight - (val / yMax) * plotHeight;
    };

    return (
        <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                    <BiInfoTooltip info={info} />
                </div>

                <div className="flex items-center gap-4">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        {series.map((s) => (
                            <span key={s.key} className="flex items-center gap-1.5 font-medium text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name}
                            </span>
                        ))}
                    </div>

                    {/* Year Dropdown when isAllPeriod is active */}
                    {isAllPeriod && availableYears.length > 0 && (
                        <select
                            value={selectedYear}
                            aria-label={`Pilih tahun untuk ${title}`}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                onYearChange?.(e.target.value);
                            }}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#1769E0]"
                        >
                            {availableYears.map((yr) => (
                                <option key={yr} value={String(yr)}>
                                    Tahun {yr}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Period Dropdown */}
                    {!isAllPeriod && periodOptions.length > 0 && (
                        <select
                            value={period}
                            aria-label={`Pilih periode waktu untuk ${title}`}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#1769E0]"
                        >
                            {periodOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* SVG Chart Area */}
            <div className="relative">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="h-56 w-full overflow-visible"
                    role="img"
                    aria-label={title}
                >
                    {/* Horizontal Grid Lines & Y-ticks */}
                    {ticks.map((t) => {
                        const y = getY(t);
                        return (
                            <g key={t}>
                                <line
                                    x1={paddingLeft}
                                    x2={chartWidth - paddingRight}
                                    y1={y}
                                    y2={y}
                                    stroke="#F1F5F9"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="#94A3B8"
                                    fontWeight="500"
                                >
                                    {t}
                                </text>
                            </g>
                        );
                    })}

                    {/* Lines & Points for each series */}
                    {series.map((s) => {
                        const pts = activeData.map((d, idx) => `${getX(idx)},${getY(Number(d[s.key]) || 0)}`).join(' ');
                        return (
                            <g key={s.key}>
                                <polyline
                                    points={pts}
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {activeData.map((d, idx) => (
                                    <circle
                                        key={idx}
                                        cx={getX(idx)}
                                        cy={getY(Number(d[s.key]) || 0)}
                                        r={hoverIndex === idx ? 5 : 3.5}
                                        fill={s.color}
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                        className="transition-all"
                                    />
                                ))}
                            </g>
                        );
                    })}

                    {/* X-axis Labels & Hover Trigger Columns */}
                    {activeData.map((d, idx) => {
                        const x = getX(idx);
                        const colWidth = activeData.length > 0 ? plotWidth / activeData.length : plotWidth;
                        return (
                            <g key={idx}>
                                <text
                                    x={x}
                                    y={chartHeight - 8}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#64748B"
                                    fontWeight={hoverIndex === idx ? '700' : '500'}
                                >
                                    {d.label}
                                </text>
                                <rect
                                    x={x - colWidth / 2}
                                    y={paddingTop}
                                    width={colWidth}
                                    height={plotHeight}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoverIndex(idx)}
                                    onMouseLeave={() => setHoverIndex(null)}
                                />
                            </g>
                        );
                    })}

                    {/* Vertical Highlight Line when hovering */}
                    {hoverIndex !== null && (
                        <line
                            x1={getX(hoverIndex)}
                            x2={getX(hoverIndex)}
                            y1={paddingTop}
                            y2={paddingTop + plotHeight}
                            stroke="#CBD5E1"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                    )}
                </svg>

                {/* Floating Tooltip */}
                {hoverIndex !== null && activeData[hoverIndex] && (
                    <div
                        className="pointer-events-none absolute -top-2 z-30 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
                        style={{
                            left: `${Math.max(16, Math.min(84, (getX(hoverIndex) / chartWidth) * 100))}%`,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <p className="font-bold text-[#101B4D] mb-1">{activeData[hoverIndex].label}</p>
                        <div className="space-y-1">
                            {series.map((s) => (
                                <div key={s.key} className="flex items-center justify-between gap-3 text-[11px]">
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                        {s.name}
                                    </span>
                                    <strong className="font-bold text-[#101B4D]">
                                        {new Intl.NumberFormat('id-ID').format(Number(activeData[hoverIndex][s.key]) || 0)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
