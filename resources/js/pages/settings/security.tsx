import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import { Form, Head } from '@inertiajs/react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <Head title="Keamanan & Sandi - Pengaturan Profabel" />

            {/* Kartu Perbarui Kata Sandi */}
            <div className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#071336]">
                <div className="border-b border-[#F1F5F9] pb-4 dark:border-white/10">
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg dark:text-white">
                        Perbarui Kata Sandi
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B] sm:text-sm dark:text-slate-400">
                        Pastikan akun Anda menggunakan kata sandi yang kuat dan unik untuk menjaga keamanan akun Anda.
                    </p>
                </div>

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            {/* Kata Sandi Saat Ini */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="current_password"
                                    className="text-xs font-bold text-[#102B4B] dark:text-white"
                                >
                                    Kata Sandi Saat Ini
                                </Label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi saat ini"
                                    className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#102B4B] transition placeholder:text-slate-400 focus:border-[#007F96] focus:bg-white focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-[#0B1736]"
                                />
                                <InputError
                                    className="text-xs text-rose-600 dark:text-rose-400"
                                    message={errors.current_password}
                                />
                            </div>

                            {/* Kata Sandi Baru */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-bold text-[#102B4B] dark:text-white"
                                >
                                    Kata Sandi Baru
                                </Label>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={props.passwordRules}
                                    className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#102B4B] transition placeholder:text-slate-400 focus:border-[#007F96] focus:bg-white focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-[#0B1736]"
                                />
                                <InputError
                                    className="text-xs text-rose-600 dark:text-rose-400"
                                    message={errors.password}
                                />
                            </div>

                            {/* Konfirmasi Kata Sandi Baru */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-bold text-[#102B4B] dark:text-white"
                                >
                                    Konfirmasi Kata Sandi Baru
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Ulangi kata sandi baru"
                                    passwordrules={props.passwordRules}
                                    className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#102B4B] transition placeholder:text-slate-400 focus:border-[#007F96] focus:bg-white focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-[#0B1736]"
                                />
                                <InputError
                                    className="text-xs text-rose-600 dark:text-rose-400"
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Tips Keamanan Sandi */}
                            <div className="rounded-2xl border border-[#D0E5F0] bg-[#F0F8FC] p-4 text-xs text-[#123B5D] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
                                <div className="flex items-center gap-2 font-bold">
                                    <ShieldCheck className="h-4 w-4 text-[#007F96] dark:text-[#38BDF8]" />
                                    <span>Rekomendasi Kata Sandi Aman:</span>
                                </div>
                                <ul className="mt-2 space-y-1 pl-6 text-[#475569] dark:text-slate-300">
                                    <li className="list-disc">Minimal 8 karakter atau lebih</li>
                                    <li className="list-disc">Gunakan perpaduan huruf besar, huruf kecil, dan angka</li>
                                    <li className="list-disc">Hindari menggunakan informasi pribadi seperti tanggal lahir</li>
                                </ul>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="flex items-center justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#123B5D] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#091D31] disabled:opacity-50 sm:text-sm dark:bg-[#1D64EC] dark:hover:bg-blue-600"
                                >
                                    <Lock className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Perbarui Kata Sandi'}
                                    </span>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#071336]">
                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />
            </div>

            {/* Passkeys */}
            {props.canManagePasskeys && (
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#071336]">
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </div>
            )}
        </div>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan Akun',
            href: edit(),
        },
    ],
};
