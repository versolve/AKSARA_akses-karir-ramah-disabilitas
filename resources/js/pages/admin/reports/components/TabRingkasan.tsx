import { Link } from '@inertiajs/react';
import {
    Award,
    Briefcase,
    Building2,
    CheckCircle2,
    Compass,
    Handshake,
    Sparkles,
    Star,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { BiClusteredBarChart } from './bi-clustered-bar-chart';
import { BiDonutChart } from './bi-donut-chart';
import { BiHorizontalBarList } from './bi-horizontal-bar-list';
import { BiLineChart } from './bi-line-chart';
import { BiMetricCard } from './bi-metric-card';

interface TabRingkasanProps {
    summary: any;
}

export function TabRingkasan({ summary }: TabRingkasanProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Row 1: 6 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <BiMetricCard
                    title="Total Pengguna"
                    value={summary.total_users}
                    growth={summary.users_growth}
                    growthText="Dari tahun sebelumnya"
                    icon={Users}
                    tone="blue"
                />
                <BiMetricCard
                    title="Pelamar Disabilitas"
                    value={summary.total_seekers}
                    growth={summary.seekers_growth}
                    growthText={`${summary.seekers_pct}% dari total pengguna`}
                    icon={User}
                    tone="green"
                />
                <BiMetricCard
                    title="Perusahaan Terdaftar"
                    value={summary.total_companies}
                    growth={summary.companies_growth}
                    growthText="Dari tahun sebelumnya"
                    icon={Building2}
                    tone="purple"
                />
                <BiMetricCard
                    title="Lowongan Dipublikasikan"
                    value={summary.total_vacancies}
                    growth={summary.vacancies_growth}
                    growthText="Dari tahun sebelumnya"
                    icon={Briefcase}
                    tone="amber"
                />
                <BiMetricCard
                    title="Penempatan Kerja"
                    value={summary.total_placements}
                    growth={summary.placements_growth}
                    growthText="Dari tahun sebelumnya"
                    icon={Handshake}
                    tone="teal"
                />
                <BiMetricCard
                    title="Tingkat Keberhasilan"
                    value={`${summary.placement_rate}%`}
                    growth={summary.placement_rate_growth}
                    growthText="Dari total pelamar aktif"
                    icon={Star}
                    tone="purple"
                />
            </div>

            {/* Row 2: 2 Main Visual Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BiLineChart
                    title="Tren Pendaftaran Pengguna"
                    info="Pertumbuhan pendaftaran pelamar disabilitas dan perusahaan per bulan"
                    series={[
                        { key: 'seekers', name: 'Pelamar', color: '#1769E0' },
                        { key: 'companies', name: 'Perusahaan', color: '#10B981' },
                    ]}
                    data={summary.monthly_users || []}
                    dataByYear={summary.monthly_users_by_year}
                    availableYears={summary.available_years}
                    isAllPeriod={Boolean(summary.is_all_period)}
                    defaultYear={summary.selected_year}
                />
                <BiClusteredBarChart
                    title="Lowongan dan Penempatan Kerja"
                    data={summary.monthly_vacancies_placements || []}
                    dataByYear={summary.monthly_vacancies_placements_by_year}
                    availableYears={summary.available_years}
                    isAllPeriod={Boolean(summary.is_all_period)}
                    defaultYear={summary.selected_year}
                />
            </div>

            {/* Row 3: 3 Analytics Widgets */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BiDonutChart
                    title="Sebaran Jenis Disabilitas (Pelamar)"
                    info="Persentase jenis ragam disabilitas yang terdata pada profil pelamar"
                    centerValue={summary.total_seekers}
                    centerLabel="pelamar"
                    items={summary.disability_distribution || []}
                />
                <BiHorizontalBarList
                    title="Industri dengan Lowongan Terbanyak"
                    info="Sektor industri paling aktif membuka lowongan inklusif"
                    items={summary.top_industries || []}
                />

                {/* Sebaran Perusahaan di Indonesia */}
                <div className="flex flex-col h-full justify-between rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Sebaran Perusahaan di Indonesia</h3>
                            <span className="text-xs font-semibold text-slate-400">Provinsi Terbanyak</span>
                        </div>

                        {/* Top Table */}
                        {(summary.top_provinces || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada data lokasi perusahaan
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {(summary.top_provinces || []).map((prov: any) => (
                                    <div key={prov.rank} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                {prov.rank}
                                            </span>
                                            <span className="font-semibold text-slate-700">{prov.province}</span>
                                        </div>
                                        <strong className="font-bold text-[#101B4D]">{prov.count}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Compass className="h-3.5 w-3.5 text-[#1769E0]" /> Cakupan Nasional
                        </span>
                        <span>Total {summary.total_companies} Perusahaan Tersebar</span>
                    </div>
                </div>
            </div>

            {/* Row 4: Tables & Insights */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Lowongan Terpopuler */}
                <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Lowongan Terpopuler</h3>
                            <Link href="/admin/vacancies" className="text-xs font-bold text-[#1769E0] hover:underline">
                                Lihat Semua
                            </Link>
                        </div>

                        {(summary.popular_vacancies || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada lowongan terdaftar
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(summary.popular_vacancies || []).map((v: any) => (
                                    <div key={v.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 text-xs last:border-none">
                                        <div className="min-w-0 pr-2">
                                            <p className="truncate font-bold text-[#101B4D]">{v.title}</p>
                                            <p className="truncate text-[11px] text-slate-400">{v.company}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="font-bold text-[#1769E0]">{v.applications}</span>
                                            <span className="ml-1 text-[11px] text-slate-400">lamaran</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Perusahaan Paling Aktif */}
                <div className="flex flex-col h-full rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Perusahaan Paling Aktif</h3>
                            <Link href="/admin/companies/verification" className="text-xs font-bold text-[#1769E0] hover:underline">
                                Lihat Semua
                            </Link>
                        </div>

                        {(summary.active_companies || []).length === 0 ? (
                            <div className="py-6 text-center text-xs font-medium text-slate-400">
                                Belum ada perusahaan aktif
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(summary.active_companies || []).map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 text-xs last:border-none">
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-[#1769E0]">
                                                {(c.name.replace(/^(PT|CV|Yayasan)\s+/i, '').trim().slice(0, 2) || 'PT').toUpperCase()}
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

                {/* Insights & Rekomendasi */}
                <div className="flex flex-col h-full justify-between rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#1769E0]" />
                            <h3 className="text-sm font-extrabold text-[#101B4D]">Insights & Rekomendasi</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-2.5 text-xs">
                                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                <div>
                                    <p className="font-bold text-[#101B4D]">Penempatan kerja meningkat 45%</p>
                                    <p className="text-[11px] text-slate-500">Terdapat peningkatan signifikan dibanding tahun lalu.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-2.5 text-xs">
                                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                <div>
                                    <p className="font-bold text-[#101B4D]">Industri TI paling banyak peluang</p>
                                    <p className="text-[11px] text-slate-500">38% lowongan berasal dari industri teknologi informasi.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-2.5 text-xs">
                                <Users className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <div>
                                    <p className="font-bold text-[#101B4D]">Pertumbuhan perusahaan baru tinggi</p>
                                    <p className="text-[11px] text-slate-500">Jumlah perusahaan terdaftar naik 27% dibanding tahun lalu.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-violet-50/60 p-2.5 text-xs">
                                <Award className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                <div>
                                    <p className="font-bold text-[#101B4D]">Kesadaran inklusi meningkat</p>
                                    <p className="text-[11px] text-slate-500">Perusahaan mencantumkan fasilitas aksesibilitas naik 32%.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
