import { useState, useRef, type FormEvent, type ReactElement } from 'react';
import CompanyLayout from '@/layouts/company-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Accessibility,
    Building2,
    Calendar,
    Check,
    ChevronDown,
    Globe,
    ImageIcon,
    Info,
    Link2,
    MapPin,
    Save,
    Sparkles,
    Upload,
    Users,
    Briefcase,
} from 'lucide-react';

interface CompanyData {
    id?: number;
    company_name: string;
    industry: string;
    description: string;
    location: string;
    address: string;
    website: string;
    workplace_accessibility: string;
    company_size: string;
    founded_year: string;
    company_type: string;
    logo_url?: string | null;
    is_approved?: boolean;
}

interface Props {
    company: CompanyData;
    industryOptions?: string[];
    companySizeOptions?: string[];
    companyTypeOptions?: string[];
}

export default function CompanyProfilePage({
    company,
    industryOptions = [
        'Teknologi Informasi',
        'Keuangan & Perbankan',
        'Kesehatan & Farmasi',
        'Pendidikan',
        'Manufaktur',
        'Retail & E-commerce',
        'Logistik & Transportasi',
        'Kreatif & Media',
        'Lainnya',
    ],
    companySizeOptions = [
        '< 50 karyawan',
        '51 – 200 karyawan',
        '201 – 500 karyawan',
        '501 – 1000 karyawan',
        '> 1000 karyawan',
    ],
    companyTypeOptions = [
        'Perseroan Terbatas (PT)',
        'Commanditaire Vennootschap (CV)',
        'Badan Usaha Milik Negara (BUMN)',
        'Startup',
        'Yayasan / Lembaga Swadaya Masyarakat (NGO)',
        'Pemerintah / Institusi Publik',
    ],
}: Props): ReactElement {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_url ?? null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        company_name: string;
        industry: string;
        description: string;
        location: string;
        address: string;
        website: string;
        workplace_accessibility: string;
        company_size: string;
        founded_year: string;
        company_type: string;
        logo: File | null;
    }>({
        company_name: company.company_name ?? '',
        industry: company.industry ?? 'Teknologi Informasi',
        description: company.description ?? '',
        location: company.location ?? '',
        address: company.address ?? '',
        website: company.website ?? '',
        workplace_accessibility: company.workplace_accessibility ?? '',
        company_size: company.company_size ?? '51 – 200 karyawan',
        founded_year: company.founded_year ?? '2020',
        company_type: company.company_type ?? 'Perseroan Terbatas (PT)',
        logo: null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const objectUrl = URL.createObjectURL(file);
            setLogoPreview(objectUrl);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/company/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        reset();
        setLogoPreview(company.logo_url ?? null);
    };

    return (
        <CompanyLayout>
            <Head title="Profil Perusahaan - Profabel" />

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Header Title & Subtitle */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102B4B]">
                        Profil Perusahaan
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Kelola informasi perusahaan yang ditampilkan kepada pelamar.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                        {/* ============================================================== */}
                        {/* LEFT COLUMN: Informasi Perusahaan & Workplace Accessibility     */}
                        {/* ============================================================== */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Card 1: Informasi Perusahaan */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-[#102B4B]" />
                                    <h2 className="text-base font-extrabold text-[#102B4B]">
                                        Informasi Perusahaan
                                    </h2>
                                </div>

                                {/* Row 1: Nama Perusahaan & Bidang Usaha */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Nama Perusahaan <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="Contoh: PT Profabel Karya Indonesia"
                                            className="h-11 rounded-xl text-xs font-semibold"
                                            required
                                        />
                                        {errors.company_name && (
                                            <p className="text-[11px] font-medium text-rose-500">{errors.company_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Bidang Usaha <span className="text-rose-500">*</span>
                                        </label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                                                >
                                                    <span className="truncate">{data.industry || 'Pilih bidang usaha...'}</span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl max-h-60 overflow-y-auto">
                                                {industryOptions.map((ind) => (
                                                    <DropdownMenuItem
                                                        key={ind}
                                                        onClick={() => setData('industry', ind)}
                                                        className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                                            data.industry === ind
                                                                ? 'bg-blue-50 text-[#1769E0]'
                                                                : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span>{ind}</span>
                                                        {data.industry === ind && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {errors.industry && (
                                            <p className="text-[11px] font-medium text-rose-500">{errors.industry}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Deskripsi Perusahaan */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        Deskripsi Perusahaan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            maxLength={500}
                                            placeholder="Tuliskan gambaran profil, visi misi, serta lingkungan kerja perusahaan Anda..."
                                            className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition resize-none pb-7 leading-relaxed"
                                            required
                                        />
                                        <span className="absolute bottom-2.5 right-3.5 text-[10px] font-bold text-slate-400">
                                            {data.description.length}/500
                                        </span>
                                    </div>
                                    {errors.description && (
                                        <p className="text-[11px] font-medium text-rose-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Row 3: Lokasi & Website (Left) vs Alamat Lengkap (Right) */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Left Sub-column */}
                                    <div className="space-y-4">
                                        {/* Lokasi Perusahaan */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700">
                                                Lokasi Perusahaan <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                                                    className="h-11 pl-10 rounded-xl text-xs font-semibold"
                                                    required
                                                />
                                            </div>
                                            {errors.location && (
                                                <p className="text-[11px] font-medium text-rose-500">{errors.location}</p>
                                            )}
                                        </div>

                                        {/* Website Perusahaan */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700">
                                                Website Perusahaan
                                            </label>
                                            <div className="relative">
                                                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                    placeholder="Contoh: https://www.profabel.co.id"
                                                    className="h-11 pl-10 rounded-xl text-xs font-semibold"
                                                />
                                            </div>
                                            {errors.website && (
                                                <p className="text-[11px] font-medium text-rose-500">{errors.website}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Sub-column: Alamat Lengkap */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Alamat Lengkap
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Tuliskan alamat lengkap kantor atau operasional perusahaan..."
                                            className="w-full h-[126px] rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition resize-none leading-relaxed"
                                        />
                                        {errors.address && (
                                            <p className="text-[11px] font-medium text-rose-500">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Workplace Accessibility */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-[#102B4B]" />
                                        <h2 className="text-base font-extrabold text-[#102B4B]">
                                            Workplace Accessibility
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Jelaskan fasilitas dan dukungan aksesibilitas yang tersedia di perusahaan.
                                    </p>
                                </div>

                                <div className="relative">
                                    <textarea
                                        rows={3}
                                        value={data.workplace_accessibility}
                                        onChange={(e) => setData('workplace_accessibility', e.target.value)}
                                        maxLength={500}
                                        placeholder="Contoh: Tersedia akses kursi roda, lift, toilet ramah disabilitas, area kerja yang dapat diakses, serta dukungan teknologi bantu sesuai kebutuhan individu."
                                        className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition resize-none pb-7 leading-relaxed"
                                    />
                                    <span className="absolute bottom-2.5 right-3.5 text-[10px] font-bold text-slate-400">
                                        {data.workplace_accessibility.length}/500
                                    </span>
                                </div>
                                {errors.workplace_accessibility && (
                                    <p className="text-[11px] font-medium text-rose-500">{errors.workplace_accessibility}</p>
                                )}
                            </div>

                            {/* Action Buttons matching Reference UI */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    className="h-11 px-6 rounded-xl text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 px-6 rounded-xl bg-[#1769E0] text-xs font-extrabold text-white shadow-sm hover:bg-[#1254B5] transition flex items-center gap-2 cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                </Button>
                            </div>
                        </div>

                        {/* ============================================================== */}
                        {/* RIGHT COLUMN: Logo Perusahaan & Informasi Tambahan              */}
                        {/* ============================================================== */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Card 3: Logo Perusahaan */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-[#102B4B]" />
                                    <h2 className="text-base font-extrabold text-[#102B4B]">
                                        Logo Perusahaan
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Preview Box */}
                                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm overflow-hidden">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo Perusahaan"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1769E0] text-white font-black text-xl shadow-sm">
                                                    P
                                                </div>
                                                <span className="mt-1 text-xs font-extrabold text-[#102B4B]">
                                                    Profabel
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions & Upload Button */}
                                    <div className="space-y-3">
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                            Gunakan logo perusahaan dengan format JPG, PNG, atau SVG (maks. 2 MB).
                                        </p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleLogoChange}
                                            accept="image/png,image/jpeg,image/svg+xml"
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={triggerFileInput}
                                            className="h-9 px-3.5 rounded-xl text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Upload className="h-3.5 w-3.5 text-slate-500" />
                                            <span>Ubah Logo</span>
                                        </Button>
                                    </div>
                                </div>
                                {errors.logo && (
                                    <p className="text-[11px] font-medium text-rose-500">{errors.logo}</p>
                                )}
                            </div>

                            {/* Card 4: Informasi Tambahan */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-[#102B4B]" />
                                    <h2 className="text-base font-extrabold text-[#102B4B]">
                                        Informasi Tambahan
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Ukuran Perusahaan */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Ukuran Perusahaan
                                        </label>
                                        <div className="relative">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                                                    >
                                                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <span className="truncate">{data.company_size || 'Pilih ukuran...'}</span>
                                                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                                                    {companySizeOptions.map((sz) => (
                                                        <DropdownMenuItem
                                                            key={sz}
                                                            onClick={() => setData('company_size', sz)}
                                                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                                                data.company_size === sz
                                                                    ? 'bg-blue-50 text-[#1769E0]'
                                                                    : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span>{sz}</span>
                                                            {data.company_size === sz && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Tahun Berdiri */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Tahun Berdiri
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                value={data.founded_year}
                                                onChange={(e) => setData('founded_year', e.target.value)}
                                                placeholder="Contoh: 2020"
                                                className="h-11 pl-10 rounded-xl text-xs font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Jenis Perusahaan */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Jenis Perusahaan
                                        </label>
                                        <div className="relative">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                                                    >
                                                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <span className="truncate">{data.company_type || 'Pilih jenis...'}</span>
                                                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                                                    {companyTypeOptions.map((tp) => (
                                                        <DropdownMenuItem
                                                            key={tp}
                                                            onClick={() => setData('company_type', tp)}
                                                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                                                data.company_type === tp
                                                                    ? 'bg-blue-50 text-[#1769E0]'
                                                                    : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span>{tp}</span>
                                                            {data.company_type === tp && <Check className="h-4 w-4 text-[#1769E0]" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
