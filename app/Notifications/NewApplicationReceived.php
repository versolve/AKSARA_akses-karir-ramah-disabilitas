<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationReceived extends Notification
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
        $applicantName = $this->application->jobSeekerProfile?->user?->name ?? 'Pelamar';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';

        return (new MailMessage)
            ->subject("Lamaran Baru Masuk: {$applicantName} - {$vacancyTitle}")
            ->view('emails.new-application', [
                'user' => $notifiable,
                'application' => $this->application,
                'applicantName' => $applicantName,
                'vacancyTitle' => $vacancyTitle,
                'actionUrl' => url('/company/applications'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $applicantName = $this->application->jobSeekerProfile?->user?->name ?? 'Pelamar';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Posisi Pekerjaan';

        return [
            'application_id' => $this->application->id,
            'title' => 'Lamaran Masuk Baru',
            'message' => "{$applicantName} telah mengirim lamaran untuk posisi {$vacancyTitle}.",
            'category' => 'application',
            'applicant_name' => $applicantName,
            'vacancy_title' => $vacancyTitle,
            'link' => '/company/applications',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
