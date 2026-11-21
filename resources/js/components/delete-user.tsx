import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-7 shadow-xs dark:border-rose-950/60 dark:bg-rose-950/20">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs dark:bg-rose-950/60 dark:text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg dark:text-rose-200">
                        Zona Bahaya: Hapus Akun Permanen
                    </h2>
                    <p className="text-xs leading-relaxed text-[#64748B] sm:text-sm dark:text-rose-300/80">
                        Setelah akun Anda dihapus, seluruh data profil, riwayat lamaran, berkas dokumen, dan preferensi akun akan dihapus permanen dari sistem Profabel. Tindakan ini bersifat final dan tidak dapat dipulihkan kembali.
                    </p>
                </div>
            </div>

            <div className="flex justify-end border-t border-rose-100 pt-3 dark:border-rose-950/50">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            className="flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:bg-rose-800"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Hapus Akun Saya</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:max-w-md dark:border-white/10 dark:bg-[#071336]">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#102B4B] dark:text-white">
                                Konfirmasi Hapus Akun
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
                                Apakah Anda benar-benar yakin ingin menghapus akun Anda? Seluruh data akun akan hilang permanen. Masukkan kata sandi akun Anda untuk mengonfirmasi tindakan ini.
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="mt-4 space-y-4"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="delete-password"
                                            className="text-xs font-bold text-[#102B4B] dark:text-white"
                                        >
                                            Kata Sandi Anda
                                        </Label>

                                        <PasswordInput
                                            id="delete-password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi untuk verifikasi"
                                            autoComplete="current-password"
                                            className="h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#102B4B] focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 sm:text-sm dark:border-white/10 dark:bg-[#0B1736] dark:text-white dark:placeholder:text-slate-500"
                                        />

                                        <InputError
                                            message={errors.password}
                                            className="text-xs text-rose-600 dark:text-rose-400"
                                        />
                                    </div>

                                    <DialogFooter className="mt-5 gap-2 sm:gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                                className="cursor-pointer rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1736] dark:text-slate-200 dark:hover:bg-white/10"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="cursor-pointer rounded-xl bg-rose-600 px-5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                        >
                                            {processing
                                                ? 'Menghapus...'
                                                : 'Ya, Hapus Akun'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
