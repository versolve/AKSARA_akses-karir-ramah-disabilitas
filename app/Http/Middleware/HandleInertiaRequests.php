<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'adminNotifications' => fn () => ($user && $user->role === 'admin')
                ? array_slice(\App\Http\Controllers\Admin\NotificationController::collectAdminNotifications($user), 0, 6)
                : [],
            'adminUnreadNotificationsCount' => fn () => ($user && $user->role === 'admin')
                ? count(array_filter(\App\Http\Controllers\Admin\NotificationController::collectAdminNotifications($user), fn ($n) => !$n['is_read']))
                : 0,
            'companyNotifications' => fn () => ($user && $user->role === 'perusahaan')
                ? array_slice(\App\Http\Controllers\Company\NotificationController::collectCompanyNotifications($user), 0, 6)
                : [],
            'companyUnreadNotificationsCount' => fn () => ($user && $user->role === 'perusahaan')
                ? count(array_filter(\App\Http\Controllers\Company\NotificationController::collectCompanyNotifications($user), fn ($n) => !$n['is_read']))
                : 0,
            'seekerUnreadNotificationsCount' => fn () => ($user && $user->role === 'pelamar')
                ? $user->unreadNotifications()->count()
                : 0,
        ];
    }
}
