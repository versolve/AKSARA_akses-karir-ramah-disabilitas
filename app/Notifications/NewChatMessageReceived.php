<?php

namespace App\Notifications;

use App\Models\Application;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewChatMessageReceived extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public Message $chatMessage,
        public User $sender
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $senderName = $this->sender->name ?? 'Pengguna Profabel';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Lamaran Pekerjaan';

        return (new MailMessage)
            ->subject("Pesan Baru dari {$senderName} - Profabel")
            ->view('emails.new-message', [
                'recipient' => $notifiable,
                'sender' => $this->sender,
                'application' => $this->application,
                'chatMessage' => $this->chatMessage,
                'vacancyTitle' => $vacancyTitle,
                'actionUrl' => url("/messages?application_id={$this->application->id}"),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $senderName = $this->sender->name ?? 'Pengguna Profabel';
        $vacancyTitle = $this->application->vacancy?->title ?? 'Lamaran Pekerjaan';

        return [
            'application_id' => $this->application->id,
            'title' => 'Pesan Baru Diterima',
            'message' => "Anda menerima pesan baru dari {$senderName} terkait lowongan {$vacancyTitle}.",
            'category' => 'message',
            'sender_id' => $this->sender->id,
            'sender_name' => $senderName,
            'preview' => \Illuminate\Support\Str::limit($this->chatMessage->body, 100),
            'link' => "/messages?application_id={$this->application->id}",
            'created_at' => now()->toIso8601String(),
        ];
    }
}
