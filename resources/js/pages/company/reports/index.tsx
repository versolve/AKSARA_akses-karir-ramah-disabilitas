import { useState, useMemo, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Activity,
    Briefcase,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    FileEdit,
    FileSpreadsheet,
    FileText,
    Layers,
    MoreVertical,
    Search,
    Trash2,
    UserCheck,
} from 'lucide-react';

interface ReportItem {
    id: number;
    name: string;
    type: string;
    type_label: string;
    period_label: string;
    start_date?: string;
    end_date?: string;
    format: 'pdf' | 'excel';
    status: string;
    created_at_label: string;
}

interface ReportTypeOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
}

interface Props {
    reports?: ReportItem[];
    reportTypes?: ReportTypeOption[];
    filters?: {
        search?: string;
    };
}

function formatDateIndo(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function CompanyReportsIndex({
    reports = [],
    reportTypes = [],
    filters = { search: '' },
}: Props): ReactElement {
    // Search query state
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Form State for creating new report
    const [selectedType, setSelectedType] = useState<string>('rekap_lamaran');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('this_month');
    const [customPeriodLabel, setCustomPeriodLabel] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calendar Range Modal Dialog
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [dialogStartDate, setDialogStartDate] = useState('');
    const [dialogEndDate, setDialogEndDate] = useState('');

    // Predefined preset periods
    const currentYear = new Date().getFullYear();
    const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthName = lastMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const periodPresets = [
        { id: 'this_month', label: `Bulan Ini (${currentMonthName})` },
        { id: 'last_month', label: `Bulan Lalu (${lastMonthName})` },
        { id: 'this_year', label: `Tahun Ini (${currentYear})` },
        { id: '30_days', label: '30 Hari Terakhir' },
        { id: '7_days', label: '7 Hari Terakhir' },
        { id: 'all', label: 'Semua Waktu' },
    ];

    // Compute active period display text for the form
    const activePeriodDisplay = useMemo(() => {
        if (customPeriodLabel) return customPeriodLabel;
        const found = periodPresets.find((p) => p.id === selectedPeriod);
        return found ? found.label : '1 Des 2024 – 31 Des 2024';
    }, [selectedPeriod, customPeriodLabel]);

    // Handle selecting a type from either dropdown or right-side cards
    const handleSelectType = (typeId: string) => {
        setSelectedType(typeId);
    };

    // Apply custom calendar range from dialog
    const handleApplyCalendar = () => {
        if (!dialogStartDate || !dialogEndDate) return;
        setCustomStartDate(dialogStartDate);
        setCustomEndDate(dialogEndDate);
        const label = `${formatDateIndo(dialogStartDate)} – ${formatDateIndo(dialogEndDate)}`;
        setCustomPeriodLabel(label);
        setSelectedPeriod('custom');
        setCalendarModalOpen(false);
    };

    // Handle Create Report submit
    const handleCreateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            '/company/reports',
            {
                type: selectedType,
                format: selectedFormat,
                period_label: activePeriodDisplay,
                start_date: customStartDate || undefined,
                end_date: customEndDate || undefined,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Handle Delete Report
    const handleDeleteReport = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            router.delete(`/company/reports/${id}`, {
                preserveScroll: true,
            });
        }
    };

    // Filter reports client-side for instant search response
    const filteredReports = useMemo(() => {
        if (!searchQuery.trim()) return reports;
        const q = searchQuery.toLowerCase();
        return reports.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.type_label.toLowerCase().includes(q) ||
                r.period_label.toLowerCase().includes(q)
        );
    }, [reports, searchQuery]);

    // Get readable title of selected type
    const selectedTypeObj = reportTypes.find((t) => t.id === selectedType);
    const selectedTypeTitle = selectedTypeObj ? selectedTypeObj.title : 'Pilih jenis laporan...';

    return (
        <CompanyLayout>
            <Head title="Laporan Rekrutmen - Profabel Perusahaan" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header Title & Subtitle */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                        Laporan
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Buat, kelola, dan unduh dokumen laporan rekrutmen perusahaan.
                    </p>
                </div>

                {/* Top Grid: Buat Laporan Baru (Left) & Jenis Laporan Cards (Right) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                    {/* LEFT CARD: Buat Laporan Baru (5 Cols) */}
                    <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                                <FileEdit className="h-5 w-5" />
                            </div>
                            <h2 className="text-base font-extrabold text-[#102B4B]">
                                Buat Laporan Baru
                            </h2>
                        </div>

                        <form onSubmit={handleCreateReport} className="space-y-4">
                            {/* Jenis Laporan Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Jenis Laporan
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Layers className="h-4 w-4 text-slate-400" />
                                                <span>{selectedTypeTitle}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[340px] rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                                        {reportTypes.map((t) => (
                                            <DropdownMenuItem
                                                key={t.id}
                                                onClick={() => handleSelectType(t.id)}
                                                className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                                                    selectedType === t.id
                                                        ? 'bg-blue-50 text-[#1769E0]'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{t.title}</span>
                                                {selectedType === t.id && <Check className="h-4 w-4 text-[#1769E0]" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Periode Laporan Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Periode Laporan
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{activePeriodDisplay}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[340px] rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                                        {periodPresets.map((p) => {
                                            const isSelected = selectedPeriod === p.id && !customPeriodLabel;
                                            return (
                                                <DropdownMenuItem
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPeriod(p.id);
                                                        setCustomPeriodLabel('');
                                                        setCustomStartDate('');
                                                        setCustomEndDate('');
                                                    }}
                                                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                                                        isSelected
                                                            ? 'bg-blue-50 text-[#1769E0]'
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{p.label}</span>
                                                    {isSelected && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                        <div className="my-1 border-t border-slate-100" />
                                        <DropdownMenuItem
                                            onClick={() => setCalendarModalOpen(true)}
                                            className="flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1769E0] transition"
                                        >
                                            <CalendarDays className="h-4 w-4 text-[#1769E0]" />
                                            <span>Pilih Rentang Kalender...</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Format File Segmented Radio Cards */}
                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-bold text-slate-700">
                                    Format File
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* PDF Option */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFormat('pdf')}
                                        className={`flex items-center gap-3 rounded-2xl p-3 border text-left transition cursor-pointer ${
                                            selectedFormat === 'pdf'
                                                ? 'border-[#1769E0] bg-blue-50/40 ring-2 ring-[#1769E0]/20'
                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                                                selectedFormat === 'pdf'
                                                    ? 'border-[#1769E0] bg-[#1769E0]'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {selectedFormat === 'pdf' && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        {/* Red PDF Icon badge */}
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-800">
                                            PDF
                                        </span>
                                    </button>

                                    {/* Excel Option */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFormat('excel')}
                                        className={`flex items-center gap-3 rounded-2xl p-3 border text-left transition cursor-pointer ${
                                            selectedFormat === 'excel'
                                                ? 'border-[#1769E0] bg-blue-50/40 ring-2 ring-[#1769E0]/20'
                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                                                selectedFormat === 'excel'
                                                    ? 'border-[#1769E0] bg-[#1769E0]'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {selectedFormat === 'excel' && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        {/* Green Excel Icon badge */}
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-800">
                                            Excel
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 rounded-2xl bg-[#1769E0] text-xs font-extrabold text-white shadow-sm hover:bg-[#1254B5] transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>{isSubmitting ? 'Memproses Laporan...' : 'Buat Laporan'}</span>
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT CARD: Jenis Laporan Cards (7 Cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-[#1769E0]" />
                                <h2 className="text-base font-extrabold text-[#102B4B]">
                                    Jenis Laporan
                                </h2>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Pilih jenis laporan sesuai kebutuhan rekrutmen Anda.
                            </p>
                        </div>

                        {/* 2x2 Grid Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                            {/* Card 1: Rekap Lowongan */}
                            <div
                                onClick={() => handleSelectType('rekap_lowongan')}
                                className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                                    selectedType === 'rekap_lowongan'
                                        ? 'bg-blue-50/70 border-[#1769E0] ring-2 ring-[#1769E0]/20'
                                        : 'bg-blue-50/40 border-blue-100/60 hover:bg-blue-50/80 hover:border-blue-200'
                                }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-[#1769E0]">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Rekap Lowongan
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        Daftar lowongan dan status publikasinya.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Rekap Lamaran */}
                            <div
                                onClick={() => handleSelectType('rekap_lamaran')}
                                className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                                    selectedType === 'rekap_lamaran'
                                        ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20'
                                        : 'bg-purple-50/40 border-purple-100/60 hover:bg-purple-50/80 hover:border-purple-200'
                                }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Rekap Lamaran
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        Daftar kandidat dan status lamarannya.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Hasil Seleksi */}
                            <div
                                onClick={() => handleSelectType('hasil_seleksi')}
                                className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                                    selectedType === 'hasil_seleksi'
                                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                                        : 'bg-emerald-50/40 border-emerald-100/60 hover:bg-emerald-50/80 hover:border-emerald-200'
                                }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Hasil Seleksi
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        Daftar kandidat diterima dan ditolak.
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Aktivitas Rekrutmen */}
                            <div
                                onClick={() => handleSelectType('aktivitas_rekrutmen')}
                                className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                                    selectedType === 'aktivitas_rekrutmen'
                                        ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                                        : 'bg-amber-50/40 border-amber-100/60 hover:bg-amber-50/80 hover:border-amber-200'
                                }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Aktivitas Rekrutmen
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        Riwayat kegiatan dan perubahan proses rekrutmen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM CARD: Riwayat Laporan Table */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-[#1769E0]" />
                                <h2 className="text-base font-extrabold text-[#102B4B]">
                                    Riwayat Laporan
                                </h2>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Daftar laporan yang telah dibuat dan dapat diunduh kembali.
                            </p>
                        </div>

                        {/* Search Input matching Reference UI */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama laporan..."
                                className="h-10 pl-10 pr-4 rounded-xl text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500">
                                    <th className="py-3.5 px-4">Nama Laporan</th>
                                    <th className="py-3.5 px-4 text-center">Jenis Laporan</th>
                                    <th className="py-3.5 px-4 text-center">Periode</th>
                                    <th className="py-3.5 px-4 text-center">Format</th>
                                    <th className="py-3.5 px-4 text-center">Tanggal Dibuat</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                                            {searchQuery
                                                ? `Tidak ada laporan yang cocok dengan pencarian "${searchQuery}".`
                                                : 'Belum ada riwayat laporan yang dibuat.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50/70 transition">
                                            {/* Nama Laporan with Icon */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {report.format === 'pdf' ? (
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            <FileSpreadsheet className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-slate-800">
                                                        {report.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Jenis Laporan Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                                                        report.type === 'rekap_lowongan'
                                                            ? 'bg-blue-50 text-[#1769E0]'
                                                            : report.type === 'rekap_lamaran'
                                                            ? 'bg-purple-50 text-purple-600'
                                                            : report.type === 'hasil_seleksi'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}
                                                >
                                                    {report.type_label}
                                                </span>
                                            </td>

                                            {/* Periode */}
                                            <td className="py-3.5 px-4 text-center text-slate-600 font-semibold whitespace-nowrap">
                                                {report.period_label}
                                            </td>

                                            {/* Format Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase ${
                                                        report.format === 'pdf'
                                                            ? 'bg-rose-50 text-rose-600'
                                                            : 'bg-emerald-50 text-emerald-600'
                                                    }`}
                                                >
                                                    {report.format}
                                                </span>
                                            </td>

                                            {/* Tanggal Dibuat */}
                                            <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap font-semibold">
                                                {report.created_at_label}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Selesai</span>
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Download Button */}
                                                    <a
                                                        href={`/company/reports/${report.id}/download`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1769E0] hover:bg-blue-50 transition"
                                                        title="Unduh Laporan"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>

                                                    {/* More Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
                                                            <DropdownMenuItem asChild>
                                                                <a
                                                                    href={`/company/reports/${report.id}/download`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Download className="h-3.5 w-3.5 text-[#1769E0]" />
                                                                    <span>Unduh Dokumen</span>
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteReport(report.id)}
                                                                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                <span>Hapus</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calendar Range Picker Modal Dialog */}
                <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
                    <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#102B4B]">
                                Pilih Rentang Tanggal Kalender
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Tentukan tanggal awal dan akhir untuk periode laporan yang akan diterbitkan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <label htmlFor="report-dialog-start-date" className="text-xs font-semibold text-slate-700">
                                    Tanggal Mulai
                                </label>
                                <Input
                                    id="report-dialog-start-date"
                                    type="date"
                                    value={dialogStartDate}
                                    onChange={(e) => setDialogStartDate(e.target.value)}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="report-dialog-end-date" className="text-xs font-semibold text-slate-700">
                                    Tanggal Selesai
                                </label>
                                <Input
                                    id="report-dialog-end-date"
                                    type="date"
                                    value={dialogEndDate}
                                    onChange={(e) => setDialogEndDate(e.target.value)}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCalendarModalOpen(false)}
                                className="h-10 rounded-xl text-xs font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApplyCalendar}
                                disabled={!dialogStartDate || !dialogEndDate}
                                className="h-10 rounded-xl bg-[#1769E0] text-xs font-bold hover:bg-[#1254B5]"
                            >
                                Terapkan Periode
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </CompanyLayout>
    );
}
