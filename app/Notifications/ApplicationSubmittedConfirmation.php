<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationSubmittedConfirmation extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';
        $companyName = $this->application->vacancy?->companyProfile?->company_name ?? 'Perusahaan';

        return (new MailMessage)
            ->subject("Konfirmasi Lamaran Terkirim: {$vacancyTitle} di {$companyName}")
            ->view('emails.application-submitted', [
                'user' => $notifiable,
                'application' => $this->application,
                'vacancyTitle' => $vacancyTitle,
                'companyName' => $companyName,
                'appliedAt' => $this->application->applied_at ?? now(),
                'actionUrl' => url('/app/applications'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';
        $companyName = $this->application->vacancy?->companyProfile?->company_name ?? 'Perusahaan';

        return [
            'application_id' => $this->application->id,
            'title' => 'Lamaran Berhasil Dikirim',
            'message' => "Lamaran Anda untuk posisi {$vacancyTitle} di {$companyName} telah berhasil dikirimkan.",
            'category' => 'application',
            'vacancy_title' => $vacancyTitle,
            'company_name' => $companyName,
            'link' => '/app/applications',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
