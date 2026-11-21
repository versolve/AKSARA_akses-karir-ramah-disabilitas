<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public string $newStatus,
        public ?string $notes = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $companyName = $this->application->vacancy?->companyProfile?->company_name ?? 'Perusahaan';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';

        $statusLabels = [
            'submitted' => 'Terkirim',
            'reviewed' => 'Sedang Ditinjau',
            'under_review' => 'Sedang Ditinjau',
            'interview' => 'Tahap Wawancara',
            'accepted' => 'Diterima Bekerja',
            'rejected' => 'Belum Sesuai',
        ];

        $statusText = $statusLabels[$this->newStatus] ?? ucfirst($this->newStatus);

        return (new MailMessage)
            ->subject("Pembaruan Status Lamaran: {$vacancyTitle} di {$companyName}")
            ->view('emails.application-status', [
                'user' => $notifiable,
                'application' => $this->application,
                'vacancyTitle' => $vacancyTitle,
                'companyName' => $companyName,
                'statusText' => $statusText,
                'statusKey' => $this->newStatus,
                'notes' => $this->notes,
                'actionUrl' => url('/app/applications'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $companyName = $this->application->vacancy?->companyProfile?->company_name ?? 'Perusahaan';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';

        return [
            'application_id' => $this->application->id,
            'vacancy_title' => $vacancyTitle,
            'company_name' => $companyName,
            'status' => $this->newStatus,
            'notes' => $this->notes,
            'link' => '/app/applications',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
