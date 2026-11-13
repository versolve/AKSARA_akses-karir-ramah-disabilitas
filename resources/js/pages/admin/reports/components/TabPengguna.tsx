import { Building2, Globe, TrendingUp, User, Users } from 'lucide-react';
import type { ReactElement } from 'react';
import { BiDonutChart } from './bi-donut-chart';
import { BiHorizontalBarList } from './bi-horizontal-bar-list';
import { BiInsightsCard } from './bi-insights-card';
import { BiLineChart } from './bi-line-chart';
import { BiMetricCard } from './bi-metric-card';
import { BiStackedBarChart } from './bi-stacked-bar-chart';

interface TabPenggunaProps {
    users: any;
}

export function TabPengguna({ users }: TabPenggunaProps): ReactElement {
    return (
        <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BiMetricCard
                    title="Total Pengguna"
                    value={users.total}
                    growth={users.total_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Users}
                    tone="blue"
                    splitLeft={{ label: 'Pelamar', value: users.seekers }}
                    splitRight={{ label: 'Perusahaan', value: users.companies }}
                />
                <BiMetricCard
                    title="Total Pelamar"
                    value={users.seekers}
                    growth={users.seekers_growth}
                    growthText="Dari periode sebelumnya"
                    icon={User}
                    tone="green"
                    splitLeft={{ label: 'Pengguna Aktif', value: users.active_seekers }}
                    splitRight={{ label: 'Pengguna Baru', value: users.new_seekers }}
                />
                <BiMetricCard
                    title="Total Perusahaan"
                    value={users.companies}
                    growth={users.companies_growth}
                    growthText="Dari periode sebelumnya"
                    icon={Building2}
                    tone="amber"
                    splitLeft={{ label: 'Akun Terverifikasi', value: users.verified_companies }}
                    splitRight={{ label: 'Menunggu Verifikasi', value: users.pending_companies }}
                />
                <BiMetricCard
                    title="Pengguna Aktif Bulanan"
                    value={users.monthly_active}
                    growth={users.monthly_active_growth}
                    growthText="Dari periode sebelumnya"
                    icon={TrendingUp}
                    tone="purple"
                    splitLeft={{ label: 'Pelamar Aktif', value: users.active_seekers }}
                    splitRight={{ label: 'Perusahaan Aktif', value: users.active_companies }}
                />
            </div>

            {/* Row 2: Line Chart & Donut Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <BiLineChart
                    title="Tren Pertumbuhan Pengguna"
                    info="Pertumbuhan pendaftaran pelamar disabilitas dan mitra perusahaan"
                    series={[
                        { key: 'seekers', name: 'Pelamar', color: '#1769E0' },
                        { key: 'companies', name: 'Perusahaan', color: '#10B981' },
                    ]}
                    data={users.monthly_users || []}
                    dataByYear={users.monthly_users_by_year}
                    availableYears={users.available_years}
                    isAllPeriod={Boolean(users.is_all_period)}
                    defaultYear={users.selected_year}
                />
                <BiDonutChart
                    title="Komposisi Pengguna"
                    info="Rasio jumlah pelamar terhadap mitra perusahaan"
                    centerValue={users.total}
                    centerLabel="Total Pengguna"
                    items={[
                        {
                            label: 'Pelamar',
                            value: users.composition?.seekers_pct !== undefined ? users.composition.seekers_pct : (users.total > 0 ? Number(((users.seekers / users.total) * 100).toFixed(1)) : 0),
                            count: users.composition?.seekers ?? users.seekers,
                            color: '#1769E0',
                        },
                        {
                            label: 'Perusahaan',
                            value: users.composition?.companies_pct !== undefined ? users.composition.companies_pct : (users.total > 0 ? Number(((users.companies / users.total) * 100).toFixed(1)) : 0),
                            count: users.composition?.companies ?? users.companies,
                            color: '#10B981',
                        },
                    ]}
                />
            </div>

            {/* Row 3: 3 Analytics Widgets */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BiHorizontalBarList
                    title="Sebaran Domisili Pengguna"
                    info="10 daerah asal pelamar terbanyak"
                    items={users.domiciles || []}
                    filterOptions={['10 Teratas', 'Semua']}
                />
                <BiStackedBarChart
                    title="Status Aktivitas Pengguna"
                    info="Tingkat keterlibatan pengguna dalam platform AKSARA"
                    data={users.activity_status}
                />
                <BiHorizontalBarList
                    title="Sumber Pendaftaran"
                    info="Kanal asal pendaftaran pengguna baru"
                    items={(users.registration_sources || []).map((s: any) => ({
                        label: s.source,
                        count: s.count,
                        pct: s.pct,
                        icon: Globe,
                        color: '#1769E0',
                    }))}
                />
            </div>

            {/* Row 4: BI Insights */}
            <BiInsightsCard
                title="Insight BI"
                subtitle="Ringkasan temuan penting dari analisis data pengguna AKSARA."
                actionHref="/admin/reporting?tab=users"
                actionLabel="Lihat Laporan Lengkap"
                items={[
                    {
                        num: 1,
                        title: 'Pertumbuhan Pengguna Positif',
                        description:
                            'Total pengguna platform meningkat 12% didorong oleh kenaikan pendaftar pelamar sebesar 14%.',
                    },
                    {
                        num: 2,
                        title: 'Jakarta Masih Mendominasi',
                        description:
                            '24% pengguna berasal dari Jakarta, diikuti Bandung (13%) dan Surabaya (10%).',
                    },
                    {
                        num: 3,
                        title: 'Mayoritas Pengguna Aktif',
                        description:
                            'Sebanyak 72% pelamar dan 64% perusahaan tergolong aktif dalam 30 hari terakhir.',
                    },
                    {
                        num: 4,
                        title: 'Website Menjadi Kanal Utama',
                        description:
                            '42% pengguna mendaftar melalui website AKSARA, diikuti media sosial 25%.',
                    },
                ]}
            />
        </div>
    );
}
