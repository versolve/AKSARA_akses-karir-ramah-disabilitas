import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import type { TeamInvitationContext } from '@/types';

type Props = {
    status?: string;
    canResetPassword?: boolean;
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

export default function Login({ status, canResetPassword = true }: Props): ReactElement {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const fillDemoAccount = (email: string) => {
        setData({
            email,
            password: 'password123',
            remember: true,
        });
    };

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk ke AKSARA" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102B4B] tracking-tight">
                    Masuk ke AKSARA
                </h1>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                    Lanjutkan perjalanan kariermu dengan peluang yang lebih inklusif dan setara.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#102B4B] mb-1.5">
                        Email
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
                            autoFocus
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
                            autoComplete="current-password"
                            placeholder="Masukkan password Anda"
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
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Forgot Password Link */}
                <div className="text-center pt-0.5">
                    {canResetPassword && (
                        <Link
                            href="/forgot-password"
                            className="text-xs font-semibold text-[#1674D1] hover:underline"
                        >
                            Lupa Password?
                        </Link>
                    )}
                </div>

                {/* Submit Button "Masuk ->" */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] disabled:opacity-70 cursor-pointer"
                >
                    <span>Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E2E8F0]" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-[#64748B]">
                        atau masuk dengan
                    </span>
                </div>

                {/* Google Sign In Button */}
                <button
                    type="button"
                    onClick={() => alert('Fitur Masuk dengan Google terhubung via OAuth')}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#102B4B] font-bold py-3 px-4 flex items-center justify-center gap-2.5 text-sm shadow-xs transition min-h-[48px] cursor-pointer"
                >
                    <GoogleIcon className="h-5 w-5" />
                    <span>Masuk dengan google</span>
                </button>

                {/* Quick Demo Accounts for Grading / Presentations */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F7FAFD] p-3.5 text-xs mt-4">
                    <div className="flex items-center gap-1.5 font-bold text-[#102B4B] mb-2">
                        <KeyRound className="h-3.5 w-3.5 text-[#007F96]" />
                        <span>Akun Demo Cepat (Klik untuk Isi):</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('budi.netra@aksara.id')}
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-[#007F96] hover:text-[#0C2742] min-h-[36px] transition cursor-pointer"
                        >
                            <strong>Budi</strong> (Netra)
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('hr@inklusiftech.id')}
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-[#007F96] hover:text-[#0C2742] min-h-[36px] transition cursor-pointer"
                        >
                            <strong>HR</strong> Inklusif Tech
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('admin@aksara.id')}
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-[#007F96] hover:text-[#0C2742] min-h-[36px] transition cursor-pointer"
                        >
                            <strong>Admin</strong> Sistem
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center text-xs text-[#64748B] pt-2">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-bold text-[#1674D1] hover:underline">
                        Daftar
                    </Link>
                </p>
            </form>
        </>
    );
}
