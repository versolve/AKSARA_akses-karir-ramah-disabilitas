<?php

namespace App\Notifications;

use App\Models\Vacancy;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VacancyDeadlineReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Vacancy $vacancy,
        public int $daysLeft = 2
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $companyName = $this->vacancy->companyProfile?->company_name ?? 'Perusahaan Mitra';

        return (new MailMessage)
            ->subject("[Pengingat Profabel] Segera Berakhir: Lowongan {$this->vacancy->title} di {$companyName}")
            ->view('emails.vacancy-deadline-reminder', [
                'user' => $notifiable,
                'vacancy' => $this->vacancy,
                'companyName' => $companyName,
                'daysLeft' => $this->daysLeft,
                'actionUrl' => url("/jobs/{$this->vacancy->slug}"),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $companyName = $this->vacancy->companyProfile?->company_name ?? 'Perusahaan Mitra';

        return [
            'type' => 'vacancy_deadline_reminder',
            'title' => 'Batas Akhir Lowongan Segera Ditutup',
            'message' => "Lowongan {$this->vacancy->title} di {$companyName} yang Anda simpan akan ditutup dalam {$this->daysLeft} hari lagi.",
            'category' => 'job_alert',
            'link' => "/jobs/{$this->vacancy->slug}",
            'vacancy_id' => $this->vacancy->id,
            'vacancy_title' => $this->vacancy->title,
            'company_name' => $companyName,
            'days_left' => $this->daysLeft,
            'deadline' => $this->vacancy->deadline ? $this->vacancy->deadline->toDateString() : null,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
