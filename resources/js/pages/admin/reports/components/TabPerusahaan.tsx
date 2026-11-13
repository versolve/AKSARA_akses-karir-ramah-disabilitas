import {
    Briefcase,
    Building2,
    CheckCircle2,
    Lightbulb,
    Target,
    TrendingUp,
    UserPlus,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { BiColumnBarChart } from './bi-column-bar-chart';
import { BiDonutChart } from './bi-donut-chart';
import { BiHorizontalBarList } from './bi-horizontal-bar-list';
import { BiLineChart } from './bi-line-chart';
import { BiMetricCard } from './bi-metric-card';

interface TabPerusahaanProps {
    companies: any;
}

export function TabPerusahaan({ companies }: TabPerusahaanProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BiMetricCard
                    title="Total Perusahaan"
                    value={companies.total}
                    growth={companies.total_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Building2}
                    tone="blue"
                    splitLeft={{ label: 'Aktif', value: companies.active }}
                    splitRight={{ label: 'Nonaktif', value: Math.max(0, companies.total - companies.active) }}
                />
                <BiMetricCard
                    title="Perusahaan Terverifikasi"
                    value={companies.verified}
                    growth={companies.verified_growth}
                    growthText={`${companies.verified_pct}% dari total perusahaan`}
                    icon={CheckCircle2}
                    tone="green"
                    splitLeft={{ label: 'Terverifikasi', value: companies.verified }}
                    splitRight={{ label: 'Menunggu Verifikasi', value: companies.pending }}
                />
                <BiMetricCard
                    title="Perusahaan Aktif"
                    value={companies.active}
                    growth={companies.active_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Briefcase}
                    tone="amber"
                    splitLeft={{ label: 'Memiliki Lowongan', value: companies.with_vacancies }}
                    splitRight={{ label: 'Tanpa Lowongan', value: companies.without_vacancies }}
                />
                <BiMetricCard
                    title="Perusahaan Baru Bulan Ini"
                    value={companies.new_this_month}
                    growth={companies.new_this_month_growth}
                    growthText="Dari bulan sebelumnya"
                    icon={UserPlus}
                    tone="purple"
                    splitLeft={{ label: 'Terverifikasi', value: companies.new_verified }}
                    splitRight={{ label: 'Menunggu Verifikasi', value: companies.new_pending }}
                />
            </div>

            {/* Row 2: Line Chart & Donut */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <BiLineChart
                    title="Tren Pertumbuhan Perusahaan"
                    info="Pertumbuhan total perusahaan, akun terverifikasi, dan akun aktif"
                    series={[
                        { key: 'total', name: 'Total Perusahaan', color: '#1769E0' },
                        { key: 'verified', name: 'Perusahaan Terverifikasi', color: '#10B981' },
                        { key: 'active', name: 'Perusahaan Aktif', color: '#8B5CF6' },
                    ]}
                    data={companies.monthly_growth || []}
                    dataByYear={companies.monthly_growth_by_year}
                    availableYears={companies.available_years}
                    isAllPeriod={Boolean(companies.is_all_period)}
                    defaultYear={companies.selected_year}
                />
                <BiDonutChart
                    title="Status Verifikasi Perusahaan"
                    info="Proporsi status legalitas dan verifikasi perusahaan mitra"
                    centerValue={companies.total}
                    centerLabel="Total Perusahaan"
                    items={[
                        {
                            label: 'Terverifikasi',
                            value: companies.total > 0 ? Number(((companies.verified / companies.total) * 100).toFixed(1)) : 0,
                            count: companies.verified,
                            color: '#10B981',
                        },
                        {
                            label: 'Menunggu Verifikasi',
                            value: companies.total > 0 ? Number(((companies.pending / companies.total) * 100).toFixed(1)) : 0,
                            count: companies.pending,
                            color: '#F59E0B',
                        },
                        {
                            label: 'Ditolak',
                            value: companies.total > 0 ? Number((((companies.rejected || 0) / companies.total) * 100).toFixed(1)) : 0,
                            count: companies.rejected || 0,
                            color: '#EF4444',
                        },
                    ]}
                />
            </div>

            {/* Row 3: 3 Columns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BiHorizontalBarList
                    title="Perusahaan Berdasarkan Industri"
                    info="Sebaran sektor bidang usaha perusahaan mitra"
                    items={(companies.top_industries || []).map((it: any) => ({
                        label: it.label,
                        count: it.count,
                        pct: it.pct,
                        color: it.color,
                    }))}
                />

                <BiColumnBarChart
                    title="Ukuran Perusahaan"
                    info="Distribusi perusahaan berdasarkan jumlah karyawan"
                    items={(companies.company_sizes || []).map((s: any) => ({
                        label: s.label,
                        sublabel: `${s.pct}%`,
                        value: s.count,
                        displayValue: `${s.count}`,
                        color: s.color,
                    }))}
                    maxValue={70}
                    unit=""
                />

                {/* Perusahaan Paling Aktif Table */}
                <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Perusahaan Paling Aktif</h3>
                            <span className="text-xs font-semibold text-slate-400">Berdasarkan Lowongan</span>
                        </div>

                        {(companies.top_active || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada perusahaan aktif
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(companies.top_active || []).map((c: any) => (
                                    <div key={c.rank} className="flex items-center justify-between border-b border-slate-50 pb-2.5 text-xs last:border-none">
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                {c.rank}
                                            </span>
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-[#1769E0]">
                                                {c.badge}
                                            </div>
                                            <span className="truncate font-semibold text-slate-700">{c.name}</span>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="font-bold text-[#101B4D]">{c.vacancies}</span>
                                            <span className="ml-1 text-[11px] text-slate-400">lowongan</span>
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
                            <h4 className="font-bold text-[#101B4D]">Tren Positif Pertumbuhan Perusahaan</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Total perusahaan meningkat 15% dibanding periode sebelumnya dengan rata-rata pertambahan 13 perusahaan baru setiap bulan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-4 text-xs">
                        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                        <div>
                            <h4 className="font-bold text-[#101B4D]">Industri Teknologi Mendominasi</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Industri Teknologi Informasi menjadi sektor terbesar (26,9%), menunjukkan minat tinggi sektor digital dalam mendukung inklusi disabilitas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-4 text-xs">
                        <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                            <h4 className="font-bold text-[#101B4D]">Rekomendasi Strategis</h4>
                            <p className="mt-1 leading-relaxed text-slate-600">
                                Prioritaskan verifikasi 18 perusahaan pending, dorong kemitraan industri manufaktur & ritel, serta optimalkan retensi perusahaan aktif.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
