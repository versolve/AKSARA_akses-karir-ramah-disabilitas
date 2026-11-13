import {
    Accessibility,
    AlertTriangle,
    Award,
    Building2,
    CheckCircle2,
    Eye,
    FileText,
    HeartHandshake,
    Laptop,
    Lightbulb,
    Sparkles,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { BiColumnBarChart } from './bi-column-bar-chart';
import { BiDonutChart } from './bi-donut-chart';
import { BiHeatmapMatrix } from './bi-heatmap-matrix';
import { BiMetricCard } from './bi-metric-card';

interface TabAksesibilitasProps {
    accessibility: any;
}

export function TabAksesibilitas({ accessibility }: TabAksesibilitasProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BiMetricCard
                    title="Profil Aksesibilitas Terisi"
                    value={accessibility.seekers_with_profile}
                    growth={accessibility.seekers_with_profile_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Accessibility}
                    tone="blue"
                    splitLeft={{ label: 'Total Pelamar', value: accessibility.total_seekers }}
                    splitRight={{ label: 'Tingkat Pengisian', value: `${accessibility.profile_fill_rate}%` }}
                />
                <BiMetricCard
                    title="Perusahaan Menyediakan Dukungan"
                    value={accessibility.companies_with_support}
                    growth={accessibility.companies_with_support_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Building2}
                    tone="green"
                    splitLeft={{ label: 'Total Perusahaan', value: accessibility.total_companies }}
                    splitRight={{ label: 'Tingkat Penyediaan', value: `${accessibility.support_provision_rate}%` }}
                />
                <BiMetricCard
                    title="Tingkat Kecocokan Aksesibilitas"
                    value={`${accessibility.match_rate}%`}
                    growth={accessibility.match_rate_growth}
                    growthText="Dari periode sebelumnya"
                    icon={CheckCircle2}
                    tone="purple"
                    splitLeft={{ label: 'Lowongan Cocok', value: accessibility.matching_vacancies }}
                    splitRight={{ label: 'Dari Total Lowongan', value: accessibility.total_vacancies }}
                />
                <BiMetricCard
                    title="Gap Aksesibilitas Utama"
                    value={`${accessibility.gap_rate}%`}
                    growth={accessibility.gap_rate_change}
                    growthText="Masih belum terpenuhi"
                    icon={AlertTriangle}
                    tone="amber"
                    splitLeft={{ label: 'Kebutuhan Pelamar', value: accessibility.seeker_demand_total }}
                    splitRight={{ label: 'Dukungan Tersedia', value: accessibility.company_support_total }}
                />
            </div>

            {/* Row 2: 3 Visual Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Dual Horizontal Bars: Kebutuhan Pelamar vs Dukungan Perusahaan */}
                <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-extrabold text-[#101B4D]">Kebutuhan Pelamar vs Dukungan Perusahaan</h3>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#1769E0]" /> Pelamar
                            </span>
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" /> Perusahaan
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-1">
                        {(accessibility.demand_vs_support || []).map((item: any) => (
                            <div key={item.category} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-slate-700">
                                    <span>{item.category}</span>
                                    <div className="flex gap-3 text-[11px]">
                                        <span className="text-[#1769E0]">{item.seeker}%</span>
                                        <span className="text-[#10B981]">{item.company}%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {/* Pelamar Bar */}
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-[#1769E0]"
                                            style={{ width: `${Math.min(100, Math.max(0, item.seeker))}%` }}
                                        />
                                    </div>
                                    {/* Perusahaan Bar */}
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-[#10B981]"
                                            style={{ width: `${Math.min(100, Math.max(0, item.company))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jenis Dukungan yang Paling Tersedia */}
                <BiDonutChart
                    title="Jenis Dukungan Paling Tersedia"
                    info="Fasilitas akomodasi aksesibilitas yang disediakan perusahaan"
                    centerValue={accessibility.company_support_total}
                    centerLabel="Total Dukungan"
                    items={accessibility.available_support || []}
                />

                {/* Kebutuhan Aksesibilitas Pelamar Column Chart */}
                <BiColumnBarChart
                    title="Kebutuhan Aksesibilitas Pelamar"
                    info="Persentase pelamar yang memerlukan fasilitas akomodasi"
                    items={(accessibility.seeker_needs || []).map((n: any) => ({
                        label: n.category,
                        value: n.pct,
                        color: n.color,
                    }))}
                    maxValue={100}
                    unit="%"
                />
            </div>

            {/* Row 3: 3 Columns: Heatmap Matrix + Gap List + Insights */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Matriks Kecocokan Aksesibilitas (Heatmap) */}
                <div className="lg:col-span-1">
                    <BiHeatmapMatrix
                        title="Matriks Kecocokan Aksesibilitas"
                        info="Tingkat kecocokan antara kebutuhan pelamar dan dukungan perusahaan"
                        columns={accessibility.match_matrix?.columns || []}
                        rows={accessibility.match_matrix?.rows || []}
                    />
                </div>

                {/* Accessibility Gap */}
                <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#101B4D]">Accessibility Gap</h3>
                        <span className="text-xs font-semibold text-slate-400">Selisih Terbesar</span>
                    </div>

                    <div className="space-y-3">
                        {(accessibility.gap_items || []).map((gap: any) => (
                            <div
                                key={gap.title}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
                            >
                                <div>
                                    <h4 className="font-bold text-[#101B4D]">{gap.title}</h4>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Kebutuhan {gap.seeker_pct}% | Dukungan {gap.company_pct}%
                                    </p>
                                </div>
                                <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-extrabold text-rose-600">
                                    {gap.gap}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight BI & Rekomendasi */}
                <div className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#1769E0]" />
                        <h3 className="text-sm font-extrabold text-[#101B4D]">Insight BI & Rekomendasi</h3>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                1
                            </span>
                            <div>
                                <h4 className="font-bold text-[#101B4D]">Kesadaran Aksesibilitas Meningkat</h4>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                    Profil aksesibilitas terisi 69%, meningkat 18% dibanding periode sebelumnya.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                2
                            </span>
                            <div>
                                <h4 className="font-bold text-[#101B4D]">Perusahaan Semakin Responsif</h4>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                    118 perusahaan (76%) telah menyediakan akomodasi aksesibilitas pada lowongannya.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                                3
                            </span>
                            <div>
                                <h4 className="font-bold text-[#101B4D]">Gap Terbesar pada Fleksibilitas Kerja</h4>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                    Kesenjangan terbesar terdapat pada fleksibilitas jam kerja (-22%) dan screen reader (-18%).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                                4
                            </span>
                            <div>
                                <h4 className="font-bold text-[#101B4D]">Rekomendasi Tindakan</h4>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                    Sediakan panduan penerapan assistive tech dan optimalkan fitur verifikasi fasilitas aksesibilitas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
