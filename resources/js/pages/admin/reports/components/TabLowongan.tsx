import {
    Briefcase,
    CheckCircle2,
    Clock,
    FileCheck2,
    Lightbulb,
    MapPin,
    Monitor,
    Sparkles,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { BiDonutChart } from './bi-donut-chart';
import { BiHorizontalBarList } from './bi-horizontal-bar-list';
import { BiLineChart } from './bi-line-chart';
import { BiMetricCard } from './bi-metric-card';

interface TabLowonganProps {
    vacancies: any;
}

export function TabLowongan({ vacancies }: TabLowonganProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BiMetricCard
                    title="Total Lowongan"
                    value={vacancies.total}
                    growth={vacancies.total_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Briefcase}
                    tone="blue"
                    splitLeft={{ label: 'Dibuat Perusahaan', value: vacancies.companies_created }}
                    splitRight={{ label: 'Rata-rata per Bulan', value: vacancies.monthly_avg }}
                />
                <BiMetricCard
                    title="Lowongan Aktif"
                    value={vacancies.active}
                    growth={vacancies.active_growth}
                    growthText="Dari periode sebelumnya"
                    icon={CheckCircle2}
                    tone="green"
                    splitLeft={{ label: 'Persentase dari Total', value: `${vacancies.active_pct}%` }}
                    splitRight={{ label: 'Rata-rata per Bulan', value: vacancies.active_monthly_avg }}
                />
                <BiMetricCard
                    title="Menunggu Review"
                    value={vacancies.draft}
                    growth={vacancies.draft_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Clock}
                    tone="amber"
                    splitLeft={{ label: 'Persentase dari Total', value: `${vacancies.draft_pct}%` }}
                    splitRight={{ label: 'Rata-rata per Bulan', value: vacancies.draft_monthly_avg }}
                />
                <BiMetricCard
                    title="Lowongan Ditutup"
                    value={vacancies.closed}
                    growth={vacancies.closed_growth}
                    growthText="Dari periode sebelumnya"
                    icon={XCircle}
                    tone="purple"
                    splitLeft={{ label: 'Persentase dari Total', value: `${vacancies.closed_pct}%` }}
                    splitRight={{ label: 'Rata-rata per Bulan', value: vacancies.closed_monthly_avg }}
                />
            </div>

            {/* Row 2: Trend & Top Categories */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <BiLineChart
                    title="Tren Lowongan per Bulan"
                    info="Dinamika lowongan baru, tayang aktif, dan lowongan yang telah ditutup"
                    series={[
                        { key: 'total', name: 'Total Lowongan', color: '#1769E0' },
                        { key: 'active', name: 'Lowongan Aktif', color: '#10B981' },
                        { key: 'closed', name: 'Lowongan Ditutup', color: '#8B5CF6' },
                    ]}
                    data={vacancies.monthly_trend || []}
                    dataByYear={vacancies.monthly_trend_by_year}
                    availableYears={vacancies.available_years}
                    isAllPeriod={Boolean(vacancies.is_all_period)}
                    defaultYear={vacancies.selected_year}
                />
                <BiHorizontalBarList
                    title="Kategori Lowongan Terbanyak"
                    info="Bidang pekerjaan dengan peluang lowongan kerja terbanyak"
                    items={vacancies.top_categories || []}
                    filterOptions={['Top 5', 'Semua']}
                />
            </div>

            {/* Row 3: 3 Columns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Model Kerja Donut */}
                <BiDonutChart
                    title="Model Kerja"
                    info="Komposisi penawaran model kerja onsite, hybrid, dan remote"
                    centerValue={vacancies.total}
                    centerLabel="Total Lowongan"
                    items={vacancies.work_models || []}
                />

                {/* Sebaran Lokasi Lowongan */}
                <div className="flex flex-col h-full justify-between rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Sebaran Lokasi Lowongan</h3>
                            <span className="text-xs font-semibold text-slate-400">Top 5 Lokasi</span>
                        </div>

                        {(vacancies.locations || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada data lokasi
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(vacancies.locations || []).map((loc: any) => (
                                    <div key={loc.rank} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                    {loc.rank}
                                                </span>
                                                <span className="font-semibold text-slate-700">{loc.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <strong className="font-bold text-[#101B4D]">{loc.count}</strong>
                                                <span className="text-slate-400 font-medium">({loc.pct}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-[#1769E0]"
                                                style={{ width: `${Math.min(100, Math.max(5, loc.pct))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-[#1769E0]" /> Tersebar di berbagai provinsi Indonesia
                    </div>
                </div>

                {/* Lowongan Paling Diminati Table */}
                <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Lowongan Paling Diminati</h3>
                            <span className="text-xs font-semibold text-slate-400">Top 5</span>
                        </div>

                        {(vacancies.most_demanded || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada data pelamar lowongan
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(vacancies.most_demanded || []).map((v: any) => (
                                    <div key={v.rank} className="flex items-center justify-between border-b border-slate-50 pb-2.5 text-xs last:border-none">
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                {v.rank}
                                            </span>
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1769E0]">
                                                <Briefcase className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate font-semibold text-slate-700">{v.title}</span>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="font-bold text-[#1769E0]">{v.count}</span>
                                            <span className="ml-1 text-[11px] text-slate-400">pelamar</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 4: Insights */}
            <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                <div className="mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-[#101B4D]">Insight BI</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-4 text-xs">
                        <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <div>
                            <h4 className="font-bold text-[#101B4D]">Kategori dengan Pertumbuhan Tertinggi</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Kategori Teknologi Informasi mengalami kenaikan pembukaan lowongan sebesar 42% dibanding periode sebelumnya.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-4 text-xs">
                        <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                        <div>
                            <h4 className="font-bold text-[#101B4D]">Tren Model Kerja Inklusif</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Lowongan model Hybrid dan Remote mencakup 60% dari total postingan, meningkatkan aksesibilitas bagi pelamar dengan disabilitas fisik dan mobilitas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-purple-50/60 p-4 text-xs">
                        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <div>
                            <h4 className="font-bold text-[#101B4D]">Temuan Terkait Moderasi</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Sekitar 15% lowongan masih dalam antrean review moderasi dengan rata-rata waktu verifikasi 2,3 hari kerja.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
