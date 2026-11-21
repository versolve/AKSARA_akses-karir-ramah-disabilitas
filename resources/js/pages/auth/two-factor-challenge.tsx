import { Form, Head, router, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Mail, RefreshCw } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

interface Props {
    userEmail?: string;
    status?: string;
}

export default function TwoFactorChallenge({ userEmail, status }: Props) {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const [isResending, setIsResending] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);

    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendEmail = (): void => {
        if (isResending || countdown > 0) return;
        setIsResending(true);
        router.post(
            '/two-factor-challenge/resend',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsResending(false);
                    setCountdown(60);
                },
            }
        );
    };

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Kode Pemulihan Darurat',
                description:
                    'Silakan konfirmasi akses ke akun Anda dengan memasukkan salah satu kode pemulihan darurat Anda.',
                toggleText: 'Masuk menggunakan kode verifikasi email / aplikasi',
            };
        }

        return {
            title: 'Verifikasi Dua Langkah (2FA)',
            description:
                'Masukkan 6 digit kode keamanan yang dikirimkan ke email Anda atau dari aplikasi autentikator.',
            toggleText: 'Gunakan kode pemulihan darurat',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Verifikasi Dua Langkah - Profabel" />

            <div className="space-y-5">
                {status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                        {status}
                    </div>
                )}

                {!showRecoveryInput && userEmail && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-[#102B4B] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#1769E0]">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span>Kode OTP Terkirim ke Email</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                            Kami telah mengirimkan 6 digit kode verifikasi ke <strong>{userEmail}</strong>. Masukkan kode dari email atau dari aplikasi autentikator ponsel Anda.
                        </p>
                    </div>
                )}

                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Masukkan kode pemulihan"
                                        autoFocus={showRecoveryInput}
                                        required
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            autoFocus
                                        >
                                            <InputOTPGroup>
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />

                                    <div className="pt-1 text-center text-xs text-slate-500">
                                        Belum menerima kode di email?{' '}
                                        <button
                                            type="button"
                                            disabled={isResending || countdown > 0}
                                            onClick={handleResendEmail}
                                            className="font-bold text-[#1769E0] hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                                        >
                                            {isResending && <RefreshCw className="h-3 w-3 animate-spin" />}
                                            {countdown > 0
                                                ? `Kirim ulang (${countdown}s)`
                                                : 'Kirim Ulang ke Email'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#1769E0] hover:bg-[#1258c2] text-white font-bold"
                                disabled={processing}
                            >
                                {processing ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}
                            </Button>

                            <div className="text-center text-xs text-muted-foreground pt-1">
                                <span>Atau Anda dapat </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-[#102B4B] font-semibold underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-current"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
