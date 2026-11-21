<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\Vacancy;
use App\Notifications\VacancyDeadlineReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendVacancyDeadlineReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vacancies:send-deadline-reminders {--days=2 : Jumlah hari sebelum tenggat waktu}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim email pengingat batas akhir lowongan ke kandidat yang memfavoritkan lowongan';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $targetDate = Carbon::today()->addDays($days);

        $this->info("Memeriksa lowongan aktif yang akan ditutup pada atau sebelum: {$targetDate->toDateString()}");

        $vacancies = Vacancy::where('status', 'active')
            ->whereNotNull('deadline')
            ->whereDate('deadline', '>=', Carbon::today())
            ->whereDate('deadline', '<=', $targetDate)
            ->with(['companyProfile', 'favoritedBy'])
            ->get();

        $countReminded = 0;

        foreach ($vacancies as $vacancy) {
            $daysLeft = max(1, Carbon::today()->diffInDays($vacancy->deadline, false));

            // Dapatkan semua pelamar yang memfavoritkan lowongan ini
            $favoritedUsers = $vacancy->favoritedBy;

            foreach ($favoritedUsers as $user) {
                // Jangan kirim jika pelamar sudah mengirim lamaran ke lowongan ini
                $hasApplied = Application::where('vacancy_id', $vacancy->id)
                    ->whereHas('jobSeekerProfile', fn ($q) => $q->where('user_id', $user->id))
                    ->exists();

                if ($hasApplied) {
                    continue;
                }

                // Cek cache anti-spam agar tidak terkirim dua kali untuk lowongan yang sama
                $cacheKey = "deadline_reminder_{$vacancy->id}_{$user->id}";
                if (Cache::has($cacheKey)) {
                    continue;
                }

                try {
                    $user->notify(new VacancyDeadlineReminderNotification($vacancy, $daysLeft));
                    Cache::put($cacheKey, true, now()->addDays(7));
                    $countReminded++;
                    $this->line("Pengingat dikirim ke: {$user->email} untuk lowongan: {$vacancy->title}");
                } catch (\Throwable $e) {
                    Log::error("Gagal mengirim deadline reminder ke {$user->email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Selesai. Total {$countReminded} email pengingat berhasil dikirim.");

        return Command::SUCCESS;
    }
}
