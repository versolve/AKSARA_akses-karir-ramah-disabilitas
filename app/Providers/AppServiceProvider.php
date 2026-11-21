<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\Ai\AiManager::class, function ($app) {
            return new \App\Services\Ai\AiManager($app);
        });

        $this->app->bind(\App\Contracts\AiProviderInterface::class, function ($app) {
            return $app->make(\App\Services\Ai\AiManager::class)->driver();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerSecurityEventListeners();
    }

    /**
     * Register security event listeners for 2FA status changes.
     */
    protected function registerSecurityEventListeners(): void
    {
        \Illuminate\Support\Facades\Event::listen(\Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed::class, function ($event) {
            try {
                $event->user?->notify(new \App\Notifications\AccountSecurityAlertNotification('two_factor_enabled', [
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email peringatan 2FA enabled: " . $e->getMessage());
            }
        });

        \Illuminate\Support\Facades\Event::listen(\Laravel\Fortify\Events\TwoFactorAuthenticationDisabled::class, function ($event) {
            try {
                $event->user?->notify(new \App\Notifications\AccountSecurityAlertNotification('two_factor_disabled', [
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email peringatan 2FA disabled: " . $e->getMessage());
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
