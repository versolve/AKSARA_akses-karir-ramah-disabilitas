import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { TeamInvitationContext } from '@/types';
import { KeyRound, Sparkles, UserCheck, Users, Building2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    const fillDemoAccount = (email: string) => {
        setEmailValue(email);
        setPasswordValue('password123');
    };

    return (
        <>
            <Head title="Masuk ke Akun" />

            {teamInvitation && (
                <TeamInvitationAlert
                    invitation={teamInvitation}
                    action="Log in"
                />
            )}

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={emailValue}
                                    onChange={(e) => setEmailValue(e.target.value)}
                                    placeholder="nama@email.com"
                                    aria-label="Alamat email Anda"
                                    className="mt-1.5 min-h-[44px]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-800">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-xs font-medium text-emerald-700 hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={passwordValue}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                    placeholder="Masukkan kata sandi..."
                                    aria-label="Kata sandi akun Anda"
                                    className="mt-1.5 min-h-[44px]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] shadow-sm"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk ke Platform
                            </Button>
                        </div>

                        {/* Demo Accounts Quick-Fill Box (Enterprise Evaluation Helper) */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Akun Demo Cepat (Klik untuk Isi):</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                                <button
                                    type="button"
                                    onClick={() => fillDemoAccount('budi.netra@aksara.id')}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-800 min-h-[36px]"
                                >
                                    <strong>Budi</strong> (Netra)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemoAccount('hr@inklusiftech.id')}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-800 min-h-[36px]"
                                >
                                    <strong>HR</strong> Inklusif Tech
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemoAccount('admin@aksara.id')}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-800 min-h-[36px]"
                                >
                                    <strong>Admin</strong> Sistem
                                </button>
                            </div>
                            <span className="block mt-1.5 text-[10px] text-slate-400">Kata sandi default: password123</span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
                            Belum memiliki akun?{' '}
                            <Link
                                href="/register"
                                data-test="register-link"
                                className="font-bold text-emerald-700 hover:underline"
                                tabIndex={6}
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke AKSARA',
    description: 'Akses portal karier inklusif ramah disabilitas',
};
