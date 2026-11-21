<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Vacancy;
use App\Notifications\NewVacancyPublishedNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendNewVacancyAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vacancies:send-job-alerts {vacancy_id? : ID lowongan yang ingin disebarkan} {--limit=50 : Batas jumlah pelamar yang dikirimi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim notifikasi email rekomendasi lowongan kerja baru kepada para pencari kerja';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $vacancyId = $this->argument('vacancy_id');
        $limit = (int) $this->option('limit');

        $vacancies = $vacancyId
            ? Vacancy::where('id', $vacancyId)->where('status', 'active')->with('companyProfile')->get()
            : Vacancy::where('status', 'active')
                ->where('created_at', '>=', now()->subDays(3))
                ->with('companyProfile')
                ->latest()
                ->take(3)
                ->get();

        if ($vacancies->isEmpty()) {
            $this->warn('Tidak ada lowongan aktif yang ditemukan.');
            return Command::SUCCESS;
        }

        $seekers = User::where('role', 'pelamar')
            ->where('is_disabled', false)
            ->whereNotNull('email_verified_at')
            ->take($limit)
            ->get();

        $this->info("Ditemukan {$vacancies->count()} lowongan untuk disebarkan ke {$seekers->count()} pencari kerja.");

        $sentCount = 0;

        foreach ($vacancies as $vacancy) {
            foreach ($seekers as $user) {
                $cacheKey = "job_alert_{$vacancy->id}_{$user->id}";
                if (Cache::has($cacheKey)) {
                    continue;
                }

                try {
                    $user->notify(new NewVacancyPublishedNotification($vacancy));
                    Cache::put($cacheKey, true, now()->addDays(14));
                    $sentCount++;
                } catch (\Throwable $e) {
                    Log::error("Gagal mengirim job alert ke {$user->email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Selesai. Total {$sentCount} email rekomendasi lowongan berhasil dikirim.");

        return Command::SUCCESS;
    }
}
