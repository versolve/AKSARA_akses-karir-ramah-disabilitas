<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class DeleteExpiredDisabledUsers extends Command
{
    protected $signature = 'users:delete-expired';
    protected $description = 'Permanently delete disabled users whose 30-day deadline has passed';

    public function handle(): int
    {
        User::where('is_disabled', true)
            ->whereNotNull('scheduled_deletion_at')
            ->where('scheduled_deletion_at', '<=', now())
            ->where('role', '!=', 'admin')
            ->delete();

        $this->info('Expired disabled users deleted successfully.');

        return static::SUCCESS;
    }
}
