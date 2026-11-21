import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Mail, Save, User } from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="space-y-6">
            <Head title="Profil Akun - Pengaturan Profabel" />

            {/* Kartu Informasi Akun */}
            <div className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#071336]">
                <div className="border-b border-[#F1F5F9] pb-4 dark:border-white/10">
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg dark:text-white">
                        Informasi Identitas & Akun
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B] sm:text-sm dark:text-slate-400">
                        Perbarui nama lengkap dan alamat email yang terhubung dengan akun Profabel Anda.
                    </p>
                </div>

                {status && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{status}</span>
                    </div>
                )}

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Input Nama Lengkap */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="name"
                                    className="text-xs font-bold text-[#102B4B] dark:text-white"
                                >
                                    Nama Lengkap
                                </Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={auth.user.name}
                                        required
                                        autoComplete="name"
                                        placeholder="Nama lengkap Anda"
                                        className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-3.5 pl-10 text-xs text-[#102B4B] transition outline-none placeholder:text-slate-400 focus:border-[#007F96] focus:bg-white focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-[#0B1736]"
                                    />
                                </div>
                                <InputError
                                    className="text-xs text-rose-600 dark:text-rose-400"
                                    message={errors.name}
                                />
                            </div>

                            {/* Input Alamat Email */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-bold text-[#102B4B] dark:text-white"
                                >
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={auth.user.email}
                                        required
                                        autoComplete="username"
                                        placeholder="nama@email.com"
                                        className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-3.5 pl-10 text-xs text-[#102B4B] transition outline-none placeholder:text-slate-400 focus:border-[#007F96] focus:bg-white focus:ring-2 focus:ring-[#007F96]/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-[#0B1736]"
                                    />
                                </div>
                                <InputError
                                    className="text-xs text-rose-600 dark:text-rose-400"
                                    message={errors.email}
                                />
                            </div>

                            {/* Email Verification Alert */}
                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <p className="font-bold">
                                                Alamat email Anda belum terverifikasi.
                                            </p>
                                            <p className="mt-1 leading-relaxed text-amber-700 dark:text-amber-400">
                                                Silakan periksa kotak masuk email Anda atau{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="cursor-pointer font-bold text-[#123B5D] underline transition hover:text-[#0C2742] dark:text-[#38BDF8] dark:hover:text-blue-300"
                                                >
                                                    klik di sini untuk mengirim ulang tautan verifikasi
                                                </Link>
                                                .
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Submit Button */}
                            <div className="flex items-center justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#123B5D] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0C2742] active:bg-[#091D31] disabled:opacity-50 sm:text-sm dark:bg-[#1D64EC] dark:hover:bg-blue-600"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </span>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* Zona Bahaya: Hapus Akun */}
            <DeleteUser />
        </div>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
