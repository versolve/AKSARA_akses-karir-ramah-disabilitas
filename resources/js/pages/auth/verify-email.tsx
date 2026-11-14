import { Head, Link, router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { ArrowRight, CheckCircle2, Clock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent, type ReactElement } from 'react';

type Props = {
    userEmail?: string;
    status?: string;
    expiresAt?: string;
    devCode?: string | null;
};

export default function VerifyEmail({ userEmail, status, devCode }: Props): ReactElement {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState<number>(60);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [isResending, setIsResending] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        code: '',
    });

    // Sync digits array to form data.code
    useEffect(() => {
        const fullCode = digits.join('');
        setData('code', fullCode);
        if (fullCode.length === 6) {
            clearErrors('code');
        }
    }, [digits]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // 60-second cooldown timer for resending OTP
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Handle single digit change
    const handleChange = (index: number, value: string) => {
        const sanitized = value.replace(/\D/g, '');
        if (!sanitized) {
            const next = [...digits];
            next[index] = '';
            setDigits(next);
            return;
        }

        const char = sanitized[sanitized.length - 1];
        const next = [...digits];
        next[index] = char;
        setDigits(next);

        // Auto advance to next input
        if (index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace navigation
    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle pasting 6 digits
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const next = [...digits];
        for (let i = 0; i < 6; i++) {
            next[i] = pasted[i] || '';
        }
        setDigits(next);

        // Focus the last filled or next empty input
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    };

    // Quick auto-fill helper for local dev
    const fillDevCode = () => {
        if (!devCode || devCode.length !== 6) return;
        const arr = devCode.split('');
        setDigits(arr);
        if (inputRefs.current[5]) {
            inputRefs.current[5].focus();
        }
    };

    // Submit form
    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (data.code.length !== 6) return;

        post('/email/verify-code', {
            preserveScroll: true,
        });
    };

    // Resend verification code
    const handleResend = (): void => {
        if (!canResend || isResending) return;

        setIsResending(true);
        router.post(
            '/email/resend-code',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCountdown(60);
                    setCanResend(false);
                    setDigits(['', '', '', '', '', '']);
                    if (inputRefs.current[0]) inputRefs.current[0].focus();
                },
                onFinish: () => {
                    setIsResending(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Verifikasi Email - Profabel" />

            {/* Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-[#EBF5FA] flex items-center justify-center text-[#123B5D] mb-4">
                <ShieldCheck className="h-7 w-7 text-[#123B5D]" />
            </div>

            {/* Heading & Subtitle */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102B4B] tracking-tight">
                    Verifikasi Akun Anda
                </h1>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                    Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke alamat email terdaftar:
                </p>

                {/* Email Pill Badge */}
                {userEmail && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 text-xs font-semibold text-[#102B4B]">
                        <Mail className="h-3.5 w-3.5 text-blue-600" />
                        <span>{userEmail}</span>
                    </div>
                )}
            </div>

            {/* Resent Status Banner */}
            {status === 'verification-code-sent' && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Kode verifikasi baru berhasil dikirim!</p>
                        <p className="mt-0.5 text-xs text-emerald-700">
                            Silakan periksa kotak masuk (Inbox) atau folder Spam email Anda.
                        </p>
                    </div>
                </div>
            )}

            {/* Local Dev Helper Card */}
            {devCode && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-800 flex items-center gap-1.5">
                            🛠️ Mode Dev (Lokal)
                        </span>
                        <button
                            type="button"
                            onClick={fillDevCode}
                            className="font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                        >
                            Klik untuk Isi Otomatis
                        </button>
                    </div>
                    <p className="mt-1 text-slate-600">
                        Kode verifikasi Anda saat ini:{' '}
                        <strong className="tracking-widest font-mono text-sm text-blue-800">{devCode}</strong>
                    </p>
                </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-[#102B4B] uppercase tracking-wider mb-3">
                        6 Digit Kode Verifikasi
                    </label>

                    {/* 6 Digit Inputs Container */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                aria-label={`Digit ${index + 1} dari 6`}
                                className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-extrabold rounded-2xl border-2 transition-all duration-200 outline-none select-none ${
                                    digit
                                        ? 'border-[#123B5D] bg-[#F8FAFC] text-[#102B4B] shadow-xs'
                                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                                } focus:border-blue-600 focus:ring-4 focus:ring-blue-100`}
                            />
                        ))}
                    </div>

                    {/* Expiry Note */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Berlaku selama 15 menit
                        </span>
                        <span>{data.code.length}/6 angka</span>
                    </div>

                    <InputError message={errors.code} className="mt-2 text-xs" />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing || data.code.length !== 6}
                    className="w-full rounded-xl bg-[#123B5D] hover:bg-[#0C2742] active:bg-[#0A2239] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 text-sm shadow-sm transition min-h-[48px] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    {processing ? (
                        <span>Memverifikasi...</span>
                    ) : (
                        <>
                            <span>Verifikasi Akun</span>
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>

                {/* Resend Section */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                    <p className="text-xs text-slate-600 mb-2">Tidak menerima kode di kotak masuk email?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || isResending}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#1674D1] hover:text-[#0C2742] disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        <span>
                            {canResend
                                ? 'Kirim Ulang Kode Verifikasi'
                                : `Kirim Ulang Kode dalam ${countdown} detik`}
                        </span>
                    </button>
                </div>

                {/* Logout / Switch Account */}
                <div className="pt-2 text-center">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition underline cursor-pointer"
                    >
                        Keluar atau Daftar dengan Email Lain
                    </Link>
                </div>
            </form>
        </>
    );
}
