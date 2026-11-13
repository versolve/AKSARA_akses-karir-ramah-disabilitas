import {
    AlertTriangle,
    Building2,
    Clock,
    Lightbulb,
    Sparkles,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { BiDonutChart } from './bi-donut-chart';
import { BiFunnelChart } from './bi-funnel-chart';
import { BiHorizontalBarList } from './bi-horizontal-bar-list';
import { BiInsightsCard } from './bi-insights-card';
import { BiLineChart } from './bi-line-chart';
import { BiMetricCard } from './bi-metric-card';

interface TabPenempatanProps {
    placements: any;
}

export function TabPenempatan({ placements }: TabPenempatanProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BiMetricCard
                    title="Kandidat Diterima"
                    value={placements.hired}
                    growth={placements.hired_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Users}
                    tone="blue"
                    splitLeft={{
                        label: 'Disabilitas',
                        value: `${placements.disability_hired} (${placements.disability_hired_pct}%)`,
                    }}
                    splitRight={{
                        label: 'Non-Disabilitas',
                        value: `${placements.non_disability_hired} (${placements.non_disability_hired_pct}%)`,
                    }}
                />
                <BiMetricCard
                    title="Tingkat Penempatan"
                    value={`${placements.rate}%`}
                    growth={placements.rate_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Target}
                    tone="green"
                    splitLeft={{ label: 'Diterima', value: placements.hired }}
                    splitRight={{ label: 'Total Lamaran', value: placements.total_applications }}
                />
                <BiMetricCard
                    title="Rata-rata Waktu Rekrutmen"
                    value={`${placements.avg_recruitment_days} hari`}
                    growth={placements.avg_recruitment_days_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Clock}
                    tone="purple"
                    splitLeft={{ label: 'Tercepat', value: `${placements.fastest_days} hari` }}
                    splitRight={{ label: 'Terlama', value: `${placements.longest_days} hari` }}
                />
                <BiMetricCard
                    title="Perusahaan yang Berhasil Merekrut"
                    value={placements.successful_companies}
                    growth={placements.successful_companies_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Building2}
                    tone="amber"
                    splitLeft={{ label: 'Total Perusahaan Aktif', value: placements.total_active_companies }}
                    splitRight={{ label: 'Tingkat Keberhasilan', value: `${placements.company_success_rate}%` }}
                />
            </div>

            {/* Row 2: Funnel Rekrutmen & Tren Penempatan */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BiFunnelChart
                    title="Funnel Rekrutmen"
                    info="Konversi alur pelamaran mulai dari lamaran masuk hingga diterima bekerja"
                    stages={placements.funnel || []}
                />
                <BiLineChart
                    title="Tren Penempatan Kerja"
                    info="Pertumbuhan kandidat yang diterima dan jumlah perusahaan yang berhasil merekrut"
                    series={[
                        { key: 'candidates', name: 'Kandidat Diterima', color: '#1769E0' },
                        { key: 'companies', name: 'Perusahaan yang Merekrut', color: '#10B981' },
                    ]}
                    data={placements.monthly_trend || []}
                    dataByYear={placements.monthly_trend_by_year}
                    availableYears={placements.available_years}
                    isAllPeriod={Boolean(placements.is_all_period)}
                    defaultYear={placements.selected_year}
                />
            </div>

            {/* Row 3: 3 Columns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 1. Penempatan Berdasarkan Kategori */}
                <BiHorizontalBarList
                    title="Penempatan Berdasarkan Kategori Pekerjaan"
                    info="Distribusi penempatan kandidat pada sektor pekerjaan"
                    items={placements.by_category || []}
                />

                {/* 2. Hasil Rekrutmen */}
                <BiDonutChart
                    title="Hasil Rekrutmen"
                    info="Distribusi status akhir seluruh proses lamaran kerja"
                    centerValue={placements.total_applications}
                    centerLabel="Total Lamaran"
                    items={placements.recruitment_results || []}
                />

                {/* 3. Top Hiring Companies */}
                <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#101B4D]">Perusahaan Penempatan Tertinggi</h3>
                        <span className="text-xs font-semibold text-slate-400">Top 5</span>
                    </div>
                    {(placements.top_hiring_companies || []).length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-400">
                            Belum ada data penempatan perusahaan
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {(placements.top_hiring_companies || []).map((c: any) => (
                                <div key={c.rank} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                            {c.rank}
                                        </span>
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[10px] font-extrabold text-emerald-600">
                                            {c.badge}
                                        </div>
                                        <span className="truncate font-semibold text-slate-700">{c.name}</span>
                                    </div>
                                    <span className="shrink-0 font-bold text-[#101B4D]">{c.placements} penempatan</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 4: BI Insights */}
            <BiInsightsCard
                title="Insight BI"
                subtitle="Ringkasan temuan penting dari analisis data penempatan kerja AKSARA."
                actionHref="/admin/reporting?tab=applications"
                actionLabel="Lihat Laporan Lengkap"
                items={[
                    {
                        num: 1,
                        title: 'Efisiensi Penempatan Meningkat',
                        description:
                            'Tingkat penempatan kerja mencapai 33,4%, meningkat 6,8% dibanding periode sebelumnya.',
                    },
                    {
                        num: 2,
                        title: 'Potensi Bottleneck Tahap Interview',
                        description:
                            'Dari seluruh lamaran ditinjau, sebagian besar masuk tahap interview. Simulasi interview dianjurkan.',
                    },
                    {
                        num: 3,
                        title: 'Diversitas Penempatan Inklusif',
                        description:
                            'Penempatan kandidat disabilitas fisik dan sensorik menunjukkan angka penyerapan stabil.',
                    },
                    {
                        num: 4,
                        title: 'Rekomendasi Kebijakan Mitra',
                        description:
                            'Tingkatkan briefing teknis aksesibilitas ke pewawancara HR serta percepat konfirmasi hasil seleksi.',
                    },
                ]}
            />
        </div>
    );
}
