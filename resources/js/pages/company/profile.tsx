import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import {
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Save,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';

interface CompanyData {
  company_name: string;
  industry: string;
  address: string;
  website: string;
  description: string;
  is_approved: boolean;
}

interface Props {
  company?: Partial<CompanyData>;
}

export default function CompanyProfile({ company = {} }: Props): ReactElement {
  const { data, setData, post, processing, errors } = useForm({
    company_name: company.company_name ?? '',
    industry: company.industry ?? '',
    address: company.address ?? '',
    website: company.website ?? '',
    description: company.description ?? '',
  });

  const isApproved = Boolean(company.is_approved);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    post('/company/profile');
  };

  return (
    <AppLayout>
      <Head title="Profil Perusahaan - Mitra Inklusif AKSARA" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Profil Perusahaan</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola informasi identitas perusahaan yang akan dilihat oleh para pencari kerja.
            </p>
          </div>

          <div>
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Mitra Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
                <XCircle className="h-4 w-4 text-amber-600" />
                Menunggu Verifikasi Admin
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <Label htmlFor="company_name" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              Nama Resmi Perusahaan
            </Label>
            <Input
              id="company_name"
              value={data.company_name}
              onChange={(e) => setData('company_name', e.target.value)}
              placeholder="Contoh: PT Inklusif Teknologi Nusantara"
              className="mt-1.5 block w-full min-h-[44px]"
              required
            />
            {errors.company_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.company_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="industry" className="text-sm font-semibold text-slate-800">
                Bidang Industri / Sektor
              </Label>
              <Input
                id="industry"
                value={data.industry}
                onChange={(e) => setData('industry', e.target.value)}
                placeholder="Contoh: Teknologi Informasi / Manufaktur"
                className="mt-1.5 block w-full min-h-[44px]"
              />
              {errors.industry && (
                <p className="mt-1 text-xs text-rose-600">{errors.industry}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-slate-400" />
                Website Perusahaan
              </Label>
              <Input
                id="website"
                type="url"
                value={data.website}
                onChange={(e) => setData('website', e.target.value)}
                placeholder="https://perusahaan.co.id"
                className="mt-1.5 block w-full min-h-[44px]"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-rose-600">{errors.website}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              Alamat Kantor / Kantor Pusat
            </Label>
            <textarea
              id="address"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              rows={3}
              placeholder="Tuliskan alamat lengkap beserta kota dan provinsi..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
            {errors.address && (
              <p className="mt-1 text-xs text-rose-600">{errors.address}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-semibold text-slate-800">
              Deskripsi Perusahaan & Budaya Kerja Inklusif
            </Label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
              placeholder="Jelaskan profil perusahaan, visi, dan komitmen penyediaan tempat kerja ramah disabilitas..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              disabled={processing}
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] px-6 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {processing ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
