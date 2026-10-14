<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')
    ->middleware(['role.redirect'])
    ->name('home');

Route::get('/jobs', [\App\Http\Controllers\JobListingController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{slug}', [\App\Http\Controllers\JobListingController::class, 'show'])->name('jobs.show');

// Role-scoped dashboard routes — must be registered BEFORE the {current_team}
// catch-all below, otherwise /app/dashboard is captured as team "app".
Route::prefix('app')
    ->middleware(['auth', 'role:pelamar'])
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('app.dashboard');
        Route::get('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'edit'])->name('app.profile.edit');
        Route::post('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'update'])->name('app.profile.update');
        Route::get('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'edit'])->name('app.accessibility-profile.edit');
        Route::post('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'update'])->name('app.accessibility-profile.update');
        Route::get('/applications', [\App\Http\Controllers\Seeker\ApplicationController::class, 'index'])->name('app.applications.index');
        Route::post('/vacancies/{vacancy}/apply', [\App\Http\Controllers\Seeker\ApplicationController::class, 'apply'])->name('app.vacancies.apply');
    });

Route::prefix('company')
    ->middleware(['auth', 'role:perusahaan'])
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('company.dashboard');
        Route::get('/profile', [App\Http\Controllers\Company\ProfileController::class, 'edit'])->name('company.profile.edit');
        Route::post('/profile', [App\Http\Controllers\Company\ProfileController::class, 'update'])->name('company.profile.update');
        Route::resource('vacancies', \App\Http\Controllers\Company\VacancyController::class, [
            'as' => 'company'
        ]);
        Route::get('/applications', [\App\Http\Controllers\Company\ApplicationReviewController::class, 'index'])->name('company.applications.index');
        Route::patch('/applications/{application}/status', [\App\Http\Controllers\Company\ApplicationReviewController::class, 'updateStatus'])->name('company.applications.updateStatus');
    });

Route::prefix('admin')
    ->middleware(['auth', 'role:admin'])
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('admin.dashboard');
    });

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
