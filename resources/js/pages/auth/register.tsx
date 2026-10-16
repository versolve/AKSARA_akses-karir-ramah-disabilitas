import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, User, Users } from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import type { TeamInvitationContext } from '@/types';

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'pelamar' | 'perusahaan';
}

type Props = {
  passwordRules?: string;
  teamInvitation?: TeamInvitationContext | null;
};

export default function Register({ teamInvitation }: Props): ReactElement {
  const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'pelamar' as 'pelamar' | 'perusahaan',
  });

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
      <Head title="Daftar Akun Baru" />

      {teamInvitation && (
        <div className="mb-4">
          <TeamInvitationAlert invitation={teamInvitation} action="Register" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Role Selector Cards */}
        <div>
          <Label className="text-sm font-semibold text-slate-800 block mb-2">
            Pilih Peran Akun Anda
          </Label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Pelamar Option */}
            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition min-h-[44px] ${
                data.role === 'pelamar'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className={`h-4 w-4 ${data.role === 'pelamar' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-900">Pencari Kerja</span>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="pelamar"
                  checked={data.role === 'pelamar'}
                  onChange={() => {
                    setData('role', 'pelamar');
                    clearErrors('role');
                  }}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Penyandang disabilitas yang mencari pekerjaan aksesibel
              </p>
            </label>

            {/* Perusahaan Option */}
            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition min-h-[44px] ${
                data.role === 'perusahaan'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className={`h-4 w-4 ${data.role === 'perusahaan' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-900">Mitra Perusahaan / HR</span>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="perusahaan"
                  checked={data.role === 'perusahaan'}
                  onChange={() => {
                    setData('role', 'perusahaan');
                    clearErrors('role');
                  }}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Membuka lowongan dengan akomodasi disabilitas
              </p>
            </label>
          </div>
          {errors.role && <p className="mt-1.5 text-xs text-rose-600">{errors.role}</p>}
        </div>

        {/* Name Field */}
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-slate-800">
            {data.role === 'perusahaan' ? 'Nama Perwakilan / HR' : 'Nama Lengkap'}
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            autoComplete="name"
            placeholder={data.role === 'perusahaan' ? 'Contoh: Bagas Pratama (HRD)' : 'Contoh: Budi Santoso'}
            aria-label="Nama lengkap"
            className="mt-1.5 min-h-[44px]"
            required
            autoFocus
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
            Alamat Email
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            autoComplete="email"
            placeholder="nama@email.com"
            aria-label="Alamat email aktif"
            className="mt-1.5 min-h-[44px]"
            required
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-slate-800">
            Kata Sandi
          </Label>
          <Input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter..."
            aria-label="Kata sandi baru"
            className="mt-1.5 min-h-[44px]"
            required
          />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        {/* Password Confirmation */}
        <div>
          <Label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-800">
            Konfirmasi Kata Sandi
          </Label>
          <Input
            id="password_confirmation"
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi..."
            aria-label="Ulangi kata sandi"
            className="mt-1.5 min-h-[44px]"
            required
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-rose-600">{errors.password_confirmation}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={processing}
          className="mt-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] shadow-sm"
        >
          {processing ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
        </Button>

        <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-600">
          Sudah memiliki akun AKSARA?{' '}
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </form>
    </>
  );
}

Register.layout = {
  title: 'Buat Akun Baru',
  description: 'Daftar sebagai pencari kerja atau mitra perusahaan inklusif',
};
