import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import { Form } from '@inertiajs/react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-2.5">
                    <Smartphone className="h-5 w-5 text-[#007F96]" />
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg">
                        Autentikasi Dua Faktor (2FA)
                    </h2>
                </div>
                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                    Tingkatkan keamanan akun Anda dengan verifikasi ganda menggunakan aplikasi autentikator di ponsel.
                </p>
            </div>

            {twoFactorEnabled ? (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                        <p className="font-bold">
                            Autentikasi Dua Faktor sedang Aktif
                        </p>
                        <p className="mt-1 text-emerald-700">
                            Setiap kali login, Anda akan diminta memasukkan 6 digit kode dari aplikasi autentikator (misal: Google Authenticator) di ponsel Anda.
                        </p>
                    </div>

                    <div className="relative inline">
                        <Form {...disable.form()}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer rounded-xl bg-rose-600 px-5 text-xs font-bold text-white transition hover:bg-rose-700"
                                >
                                    {processing ? 'Memproses...' : 'Nonaktifkan 2FA'}
                                </Button>
                            )}
                        </Form>
                    </div>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
                        Saat autentikasi dua faktor diaktifkan, Anda akan dimintai kode keamanan acak saat masuk yang diperoleh dari aplikasi TOTP di ponsel Anda.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button
                                onClick={() => setShowSetupModal(true)}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#123B5D] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0C2742]"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                <span>Lanjutkan Penyiapan 2FA</span>
                            </Button>
                        ) : (
                            <Form
                                {...enable.form()}
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#123B5D] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0C2742]"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>
                                            {processing
                                                ? 'Memproses...'
                                                : 'Aktifkan 2FA'}
                                        </span>
                                    </Button>
                                )}
                            </Form>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
