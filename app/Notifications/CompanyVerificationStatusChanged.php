<?php

namespace App\Notifications;

use App\Models\CompanyProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyVerificationStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public CompanyProfile $company,
        public bool $isApproved
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->isApproved
            ? "[Profabel] Selamat! Akun Perusahaan {$this->company->company_name} Telah Terverifikasi Resmi"
            : "[Profabel] Pemberitahuan: Pembaruan Status Verifikasi Perusahaan {$this->company->company_name}";

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.company-verification', [
                'user' => $notifiable,
                'company' => $this->company,
                'isApproved' => $this->isApproved,
                'actionUrl' => $this->isApproved ? url('/company/vacancies/create') : url('/company/profile'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'company_verification_status',
            'title' => $this->isApproved ? 'Perusahaan Terverifikasi Resmi' : 'Status Verifikasi Perusahaan Ditangguhkan',
            'company_id' => $this->company->id,
            'company_name' => $this->company->company_name,
            'is_approved' => $this->isApproved,
            'message' => $this->isApproved
                ? "Selamat! Akun perusahaan {$this->company->company_name} telah resmi diverifikasi oleh tim Profabel."
                : "Status verifikasi akun perusahaan {$this->company->company_name} saat ini ditangguhkan oleh tim verifikator.",
            'category' => 'verification',
            'link' => $this->isApproved ? '/company/vacancies/create' : '/company/profile',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
