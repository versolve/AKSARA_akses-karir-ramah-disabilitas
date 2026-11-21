<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountSecurityAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $action,
        public array $metadata = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->action) {
            'password_updated' => '[Keamanan Akun] Kata Sandi Akun Profabel Anda Berhasil Diperbarui',
            'password_reset' => '[Keamanan Akun] Kata Sandi Akun Profabel Anda Berhasil Direset',
            'two_factor_enabled' => '[Keamanan Akun] Verifikasi 2 Langkah (2FA) Berhasil Diaktifkan',
            'two_factor_disabled' => '[Peringatan Keamanan] Verifikasi 2 Langkah (2FA) Telah Dinonaktifkan',
            default => '[Keamanan Akun] Pembaruan Keamanan Akun Profabel',
        };

        $actionUrl = method_exists($notifiable, 'isAdmin') && $notifiable->isAdmin()
            ? url('/admin/settings')
            : url('/settings/security');

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.security-alert', [
                'user' => $notifiable,
                'action' => $this->action,
                'metadata' => $this->metadata,
                'actionUrl' => $actionUrl,
                'timestamp' => now(),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $title = match ($this->action) {
            'password_updated' => 'Kata Sandi Diperbarui',
            'password_reset' => 'Kata Sandi Direset',
            'two_factor_enabled' => '2FA Berhasil Diaktifkan',
            'two_factor_disabled' => '2FA Dinonaktifkan',
            default => 'Aktivitas Keamanan Akun',
        };

        $message = match ($this->action) {
            'password_updated' => 'Kata sandi akun Anda baru saja berhasil diperbarui.',
            'password_reset' => 'Kata sandi akun Anda baru saja berhasil direset.',
            'two_factor_enabled' => 'Perlindungan verifikasi 2 langkah (2FA) kini telah aktif di akun Anda.',
            'two_factor_disabled' => 'Peringatan: Perlindungan verifikasi 2 langkah (2FA) telah dinonaktifkan.',
            default => 'Terdapat pembaruan pada setelan keamanan akun Anda.',
        };

        $actionUrl = method_exists($notifiable, 'isAdmin') && $notifiable->isAdmin()
            ? '/admin/settings'
            : '/settings/security';

        return [
            'type' => 'security_alert',
            'action' => $this->action,
            'title' => $title,
            'message' => $message,
            'category' => 'security',
            'link' => $actionUrl,
            'metadata' => $this->metadata,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
