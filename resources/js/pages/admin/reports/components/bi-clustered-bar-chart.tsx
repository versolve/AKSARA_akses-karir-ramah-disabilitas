import { useEffect, useState, type ReactElement } from 'react';

interface ClusteredBarChartProps {
    title: string;
    data: Array<{ label: string; vacancies: number; placements: number }>;
    dataByYear?: Record<number | string, Array<{ label: string; vacancies: number; placements: number }>>;
    availableYears?: number[];
    isAllPeriod?: boolean;
    defaultYear?: number | string;
    periodOptions?: string[];
    defaultPeriod?: string;
    onYearChange?: (year: string) => void;
}

export function BiClusteredBarChart({
    title,
    data,
    dataByYear,
    availableYears = [],
    isAllPeriod = false,
    defaultYear,
    periodOptions = [],
    defaultPeriod = '',
    onYearChange,
}: ClusteredBarChartProps): ReactElement {
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

    let rawMax = 10;
    activeData.forEach((d) => {
        if (d.vacancies > rawMax) rawMax = d.vacancies;
        if (d.placements > rawMax) rawMax = d.placements;
    });

    const yMax = rawMax <= 5 ? 5 : rawMax <= 10 ? 10 : rawMax <= 25 ? 25 : rawMax <= 50 ? 50 : rawMax <= 100 ? 100 : Math.ceil(rawMax / 50) * 50;
    const ticks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

    const chartWidth = 600;
    const chartHeight = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const barWidth = 8;
    const groupGap = activeData.length > 0 ? plotWidth / activeData.length : plotWidth;

    const getY = (val: number) => {
        return paddingTop + plotHeight - (val / yMax) * plotHeight;
    };

    const getHeight = (val: number) => {
        return (val / yMax) * plotHeight;
    };

    return (
        <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" />
                            Lowongan Dipublikasikan
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                            Penempatan Kerja
                        </span>
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

            {/* SVG Chart */}
            <div className="relative">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="h-56 w-full overflow-visible"
                    role="img"
                    aria-label={title}
                >
                    {/* Ticks and horizontal lines */}
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

                    {/* Bars for each group */}
                    {activeData.map((d, idx) => {
                        const groupCenter = paddingLeft + (idx + 0.5) * groupGap;
                        const vHeight = getHeight(d.vacancies);
                        const pHeight = getHeight(d.placements);
                        const vY = getY(d.vacancies);
                        const pY = getY(d.placements);

                        return (
                            <g
                                key={idx}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoverIndex(idx)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                {/* Invisible trigger area */}
                                <rect
                                    x={groupCenter - groupGap / 2}
                                    y={paddingTop}
                                    width={groupGap}
                                    height={plotHeight}
                                    fill="transparent"
                                />

                                {/* Vacancy bar (Blue) */}
                                <rect
                                    x={groupCenter - barWidth - 1.5}
                                    y={vY}
                                    width={barWidth}
                                    height={vHeight}
                                    rx="3"
                                    fill="#1769E0"
                                    className="transition-opacity hover:opacity-90"
                                />

                                {/* Placement bar (Teal/Green) */}
                                <rect
                                    x={groupCenter + 1.5}
                                    y={pY}
                                    width={barWidth}
                                    height={pHeight}
                                    rx="3"
                                    fill="#10B981"
                                    className="transition-opacity hover:opacity-90"
                                />

                                {/* X-axis Label */}
                                <text
                                    x={groupCenter}
                                    y={chartHeight - 8}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#64748B"
                                    fontWeight={hoverIndex === idx ? '700' : '500'}
                                >
                                    {d.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Hover Tooltip */}
                {hoverIndex !== null && activeData[hoverIndex] && (
                    <div
                        className="pointer-events-none absolute -top-2 z-30 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
                        style={{
                            left: `${Math.max(16, Math.min(84, ((paddingLeft + (hoverIndex + 0.5) * groupGap) / chartWidth) * 100))}%`,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <p className="font-bold text-[#101B4D] mb-1">{activeData[hoverIndex].label}</p>
                        <div className="space-y-1 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-[#1769E0]" />
                                    Lowongan
                                </span>
                                <strong className="font-bold text-[#101B4D]">{activeData[hoverIndex].vacancies}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                    Penempatan
                                </span>
                                <strong className="font-bold text-[#101B4D]">{activeData[hoverIndex].placements}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
