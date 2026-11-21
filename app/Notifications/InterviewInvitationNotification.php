<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InterviewInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public ?string $interviewNotes = null
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
            ->subject("Undangan Wawancara Kerja: {$vacancyTitle} di {$companyName}")
            ->view('emails.interview-invitation', [
                'user' => $notifiable,
                'application' => $this->application,
                'vacancyTitle' => $vacancyTitle,
                'companyName' => $companyName,
                'interviewNotes' => $this->interviewNotes,
                'actionUrl' => url('/app/applications'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';
        $companyName = $this->application->vacancy?->companyProfile?->company_name ?? 'Perusahaan';

        return [
            'application_id' => $this->application->id,
            'title' => 'Undangan Wawancara Kerja',
            'message' => "Selamat! Anda diundang untuk mengikuti wawancara kerja untuk posisi {$vacancyTitle} di {$companyName}.",
            'category' => 'interview',
            'vacancy_title' => $vacancyTitle,
            'company_name' => $companyName,
            'notes' => $this->interviewNotes,
            'link' => '/app/applications',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
