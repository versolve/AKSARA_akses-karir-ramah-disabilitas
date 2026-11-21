<?php

namespace App\Notifications;

use App\Models\Vacancy;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewVacancyPublishedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Vacancy $vacancy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $companyName = $this->vacancy->companyProfile?->company_name ?? 'Perusahaan Mitra';

        return (new MailMessage)
            ->subject("[Lowongan Baru] {$this->vacancy->title} di {$companyName} - Rekomendasi Profabel")
            ->view('emails.new-vacancy-alert', [
                'user' => $notifiable,
                'vacancy' => $this->vacancy,
                'companyName' => $companyName,
                'actionUrl' => url("/jobs/{$this->vacancy->slug}"),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $companyName = $this->vacancy->companyProfile?->company_name ?? 'Perusahaan Mitra';

        return [
            'type' => 'new_vacancy_published',
            'title' => 'Lowongan Baru Tersedia',
            'message' => "{$companyName} membuka lowongan baru: {$this->vacancy->title}.",
            'category' => 'job_alert',
            'link' => "/jobs/{$this->vacancy->slug}",
            'vacancy_id' => $this->vacancy->id,
            'vacancy_title' => $this->vacancy->title,
            'company_name' => $companyName,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
