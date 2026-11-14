<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailVerificationCodeController extends Controller
{
    /**
     * Verify the user's email address using the 6-digit code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ], [
            'code.required' => 'Silakan masukkan 6 digit kode verifikasi.',
            'code.size' => 'Kode verifikasi harus terdiri dari 6 angka.',
        ]);

        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended($user->getDashboardRoute());
        }

        $code = trim($request->input('code'));

        if (! $user->verifyEmailCode($code)) {
            throw ValidationException::withMessages([
                'code' => 'Kode verifikasi yang Anda masukkan salah atau sudah kadaluarsa (melebihi 15 menit). Silakan coba lagi atau kirim ulang kode baru.',
            ]);
        }

        return redirect()->intended($user->getDashboardRoute())
            ->with('status', 'Akun Anda berhasil diverifikasi! Selamat datang di Profabel.');
    }

    /**
     * Resend the 6-digit verification code email.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended($user->getDashboardRoute());
        }

        $user->sendEmailVerificationCode();

        return back()->with('status', 'verification-code-sent');
    }
}
