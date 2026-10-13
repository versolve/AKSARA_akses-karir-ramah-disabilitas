import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'pelamar' | 'perusahaan';
}

export default function Register(): ReactElement {
  const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'pelamar' as 'pelamar' | 'perusahaan',
  });

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setData('role', e.target.value as FormData['role']);
    clearErrors('role');
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    clearErrors();

    post('/register', {
      onSuccess: () => {
        reset('password', 'password_confirmation');
      },
      onError: (errs) => {
        if (errs.role && typeof errs.role === 'string') {
          setError('role', errs.role);
        }
      },
    });
  };

  return (
    <>
      <Head title="Buat Akun Baru" />
      <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-16">
        <div className="w-full max-w-md space-y-8 px-4">
          <div>
            <h1 className="text-center text-3xl font-bold text-slate-900">Buat Akun Baru</h1>
            <p className="mt-2 text-center text-slate-600">
              Bergabunglah dengan AKSARA untuk memulai perjalanan karier Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-lg">
            {/* Role Selection */}
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-slate-700">
                Jenis Akun
              </Label>
              <select
                id="role"
                value={data.role}
                onChange={handleRoleChange}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{ minHeight: '44px' }}
              >
                <option value="pelamar">Pelamar Kerja (Job Seeker)</option>
                <option value="perusahaan">Perusahaan / HR</option>
              </select>
              {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Name field */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nama Lengkap
              </Label>
              <Input
                type="text"
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                autoComplete="name"
                className="mt-2 block w-full"
                aria-required="true"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                autoComplete="username"
                className="mt-2 block w-full"
                aria-required="true"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata Sandi
              </Label>
              <Input
                type="password"
                id="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="new-password"
                className="mt-2 block w-full"
                aria-required="true"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700">
                Konfirmasi Kata Sandi
              </Label>
              <Input
                type="password"
                id="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                autoComplete="new-password"
                className="mt-2 block w-full"
                aria-required="true"
              />
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
              )}
            </div>

            <Button disabled={processing} type="submit" style={{ minHeight: '44px' }}>
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <a href="/login" className="font-medium text-teal-600 hover:text-teal-500">
              Masuk
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
