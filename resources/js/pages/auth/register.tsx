import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import type { TeamInvitationContext } from '@/types';

type Props = {
    passwordRules?: string;
    teamInvitation?: TeamInvitationContext | null;
};

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
        </svg>
    );
}

export default function Register({ teamInvitation }: Props): ReactElement {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Buat Akun AKSARA" />

            {teamInvitation && (
                <div className="mb-4">
                    <TeamInvitationAlert invitation={teamInvitation} action="Register" />
                </div>
            )}

            {/* Top Icon Badge from reference */}
            <div className="w-14 h-14 rounded-full bg-[#EBF5FA] flex items-center justify-center text-[#123B5D] mb-4">
                <UserPlus className="h-7 w-7 text-[#123B5D]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102B4B] tracking-tight">
                    Buat Akun AKSARA
                </h1>
                <p className="mt-1 text-sm text-[#64748B] leading-relaxed">
                    Langkah pertama menuju karier yang lebih inklusif.
                </p>
            </div>

            {/* Role Selection Tabs (Pelamar vs Perusahaan/HR) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Pelamar Card */}
                <button
                    type="button"
                    onClick={() => {
                        setData('role', 'pelamar');
                        clearErrors('role');
                    }}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl cursor-pointer text-left transition-all duration-200 select-none min-h-[64px] ${
                        data.role === 'pelamar'
                            ? 'bg-gradient-to-r from-[#123B5D] to-[#1E6EA7] text-white shadow-sm'
                            : 'bg-[#EBF5FA] hover:bg-[#E1EFF6] text-[#102B4B]'
                    }`}
                >
                    <User
                        className={`h-6 w-6 shrink-0 ${
                            data.role === 'pelamar' ? 'text-white' : 'text-[#102B4B]'
                        }`}
                    />
                    <div>
                        <div className="font-bold text-sm sm:text-base leading-tight">Pelamar</div>
                        <div
                            className={`text-[11px] sm:text-xs mt-0.5 leading-tight ${
                                data.role === 'pelamar' ? 'text-blue-100' : 'text-[#64748B]'
                            }`}
                        >
                            Cari pekerjaan
                        </div>
                    </div>
                </button>

                {/* Perusahaan/HR Card */}
                <button
                    type="button"
                    onClick={() => {
                        setData('role', 'perusahaan');
                        clearErrors('role');
                    }}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl cursor-pointer text-left transition-all duration-200 select-none min-h-[64px] ${
                        data.role === 'perusahaan'
                            ? 'bg-gradient-to-r from-[#123B5D] to-[#1E6EA7] text-white shadow-sm'
                            : 'bg-[#EBF5FA] hover:bg-[#E1EFF6] text-[#102B4B]'
                    }`}
                >
                    <Building2
                        className={`h-6 w-6 shrink-0 ${
                            data.role === 'perusahaan' ? 'text-white' : 'text-[#102B4B]'
                        }`}
                    />
                    <div>
                        <div className="font-bold text-sm sm:text-base leading-tight">Perusahaan/HR</div>
                        <div
                            className={`text-[11px] sm:text-xs mt-0.5 leading-tight ${
                                data.role === 'perusahaan' ? 'text-blue-100' : 'text-[#64748B]'
                            }`}
                        >
                            Rekrut talenta terbaik
                        </div>
                    </div>
                </button>
            </div>
            {errors.role && <p className="mb-4 text-xs text-rose-600">{errors.role}</p>}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-[#102B4B] mb-1.5">
                        {data.role === 'perusahaan' ? 'Nama Perusahaan' : 'Nama Lengkap'}
                    </label>
                    <div className="relative flex items-center">
                        <User className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder={
                                data.role === 'perusahaan'
                                    ? 'Masukkan nama perusahaan anda'
                                    : 'Masukkan nama lengkap anda'
                            }
                            className="w-full rounded-xl border border-[#E2E8F0] pl-11 pr-4 py-3 text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[48px]"
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1" />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#102B4B] mb-1.5">
                        {data.role === 'perusahaan' ? 'Email Perusahaan' : 'Email'}
                    </label>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="nama@email.com"
                            className="w-full rounded-xl border border-[#E2E8F0] pl-11 pr-4 py-3 text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[48px]"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-[#102B4B] mb-1.5">
                        Password
                    </label>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Buat password Anda"
                            className="w-full rounded-xl border border-[#E2E8F0] pl-11 pr-11 py-3 text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[48px]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="mt-1.5 text-xs text-[#64748B]">
                        Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.
                    </p>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-sm font-bold text-[#102B4B] mb-1.5"
                    >
                        Konfirmasi Password
                    </label>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Masukkan ulang password Anda"
                            className="w-full rounded-xl border border-[#E2E8F0] pl-11 pr-11 py-3 text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[48px]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                            aria-label={
                                showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#123B5D] focus:ring-[#007F96]"
                        required
                    />
                    <label htmlFor="terms" className="text-xs text-[#102B4B] leading-relaxed cursor-pointer select-none">
                        Saya menyetujui{' '}
                        <a href="#" className="text-[#1674D1] hover:underline font-medium">
                            Syarat dan Ketentuan
                        </a>{' '}
                        serta{' '}
                        <a href="#" className="text-[#1674D1] hover:underline font-medium">
                            Kebijakan Privasi
                        </a>{' '}
                        AKSARA.
                    </label>
                </div>

                {/* Submit Button "Daftar ->" */}
                <button
                    type="submit"
                    disabled={processing || !agreedToTerms}
                    className="w-full rounded-xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] disabled:opacity-70 cursor-pointer mt-2"
                >
                    <span>Daftar</span>
                    <ArrowRight className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E2E8F0]" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-[#64748B]">
                        atau daftar dengan
                    </span>
                </div>

                {/* Google Sign Up Button */}
                <button
                    type="button"
                    onClick={() => alert('Fitur Daftar dengan Google terhubung via OAuth')}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#102B4B] font-bold py-3 px-4 flex items-center justify-center gap-2.5 text-sm shadow-xs transition min-h-[48px] cursor-pointer"
                >
                    <GoogleIcon className="h-5 w-5" />
                    <span>Daftar dengan google</span>
                </button>

                {/* Footer Link */}
                <p className="text-center text-xs text-[#64748B] pt-2">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-bold text-[#1674D1] hover:underline">
                        Masuk
                    </Link>
                </p>
            </form>
        </>
    );
}
