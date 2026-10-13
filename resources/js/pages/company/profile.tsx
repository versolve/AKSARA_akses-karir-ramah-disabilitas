import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ReactElement } from 'react';

interface CompanyData {
  company_name: string;
  industry: string;
  address: string;
  website: string;
  description: string;
}

interface Props {
  company?: Partial<CompanyData>;
}

export default function CompanyProfile({ company = {} }: Props): ReactElement {
  const { data, setData, post, processing } = useForm<CompanyData>({
    company_name: company.company_name ?? '',
    industry: company.industry ?? '',
    address: company.address ?? '',
    website: company.website ?? '',
    description: company.description ?? '',
  });

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    post('/company/profile');
  };

  return (
    <AppLayout>
      <Head title="Profil Perusahaan" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Kelola Profil Perusahaan</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <Label htmlFor="company_name">Nama Perusahaan</Label>
            <Input
              id="company_name"
              value={data.company_name}
              onChange={(e) => setData('company_name', e.target.value)}
              className="mt-2 block w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="industry">Bidang Industri</Label>
            <Input
              id="industry"
              value={data.industry}
              onChange={(e) => setData('industry', e.target.value)}
              className="mt-2 block w-full"
            />
          </div>

          <div>
            <Label htmlFor="website">Website Perusahaan</Label>
            <Input
              id="website"
              type="url"
              value={data.website}
              onChange={(e) => setData('website', e.target.value)}
              className="mt-2 block w-full"
            />
          </div>

          <div>
            <Label htmlFor="address">Alamat Kantor</Label>
            <textarea
              id="address"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi Perusahaan</Label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <Button disabled={processing} type="submit" style={{ minHeight: '44px' }}>
            Simpan Profil Perusahaan
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
