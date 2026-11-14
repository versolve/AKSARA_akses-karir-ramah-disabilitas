import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';
import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF5FA] text-[#007F96]">
                <KeyRound className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#102B4B]">
                Belum ada kunci sandi (Passkey)
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
                Tambahkan kunci sandi (biometrik / PIN perangkat) untuk masuk lebih cepat tanpa kata sandi.
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-2.5">
                    <KeyRound className="h-5 w-5 text-[#007F96]" />
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg">
                        Kunci Sandi (Passkeys)
                    </h2>
                </div>
                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                    Kelola autentikasi biometrik (sidik jari, Windows Hello, Face ID) untuk login instan tanpa mengetik kata sandi.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                {passkeys.length > 0 ? (
                    passkeys.map((passkey) => (
                        <PasskeyItem
                            key={passkey.id}
                            passkey={passkey}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>

            <PasskeyRegistration onSuccess={handleRegisterSuccess} />
        </div>
    );
}
