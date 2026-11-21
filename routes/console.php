<?php

use App\Models\TeamInvitation;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Schedule::command('users:delete-expired')
    ->daily()
    ->description('Delete expired disabled users');

Schedule::command('vacancies:send-deadline-reminders --days=2')
    ->dailyAt('08:00')
    ->description('Send email reminders to candidates for favorited vacancies closing soon');

Schedule::command('vacancies:send-job-alerts --limit=30')
    ->weeklyOn(1, '09:00')
    ->description('Send weekly email alerts for recommended inclusive vacancies');
