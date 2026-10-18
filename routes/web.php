<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/jobs', [\App\Http\Controllers\JobListingController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{slug}', [\App\Http\Controllers\JobListingController::class, 'show'])->name('jobs.show');

// Role-scoped dashboard routes — must be registered BEFORE the {current_team}
// catch-all below, otherwise /app/dashboard is captured as team "app".
Route::prefix('app')
    ->middleware(['auth', 'role:pelamar'])
    ->group(function () {
        Route::get('/dashboard', \App\Http\Controllers\Seeker\DashboardController::class)->name('app.dashboard');
        Route::get('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'edit'])->name('app.profile.edit');
        Route::post('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'update'])->name('app.profile.update');
        Route::get('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'edit'])->name('app.accessibility-profile.edit');
        Route::post('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'update'])->name('app.accessibility-profile.update');
        Route::get('/applications', [\App\Http\Controllers\Seeker\ApplicationController::class, 'index'])->name('app.applications.index');
        Route::post('/vacancies/{vacancy}/apply', [\App\Http\Controllers\Seeker\ApplicationController::class, 'apply'])->name('app.vacancies.apply');
        Route::get('/notifications', [\App\Http\Controllers\Seeker\NotificationController::class, 'index'])->name('app.notifications.index');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Seeker\NotificationController::class, 'markAsRead'])->name('app.notifications.read');
        Route::post('/notifications/read-all', [\App\Http\Controllers\Seeker\NotificationController::class, 'markAllAsRead'])->name('app.notifications.readAll');
        Route::get('/ai-assistant', [\App\Http\Controllers\Seeker\AiCareerAssistantController::class, 'index'])->name('app.ai-assistant.index');
        Route::post('/ai/match/{vacancy}', [\App\Http\Controllers\Seeker\AiCareerAssistantController::class, 'matchVacancy'])->name('app.ai.match');
        Route::post('/ai/skill-gap', [\App\Http\Controllers\Seeker\AiCareerAssistantController::class, 'skillGap'])->name('app.ai.skill-gap');
        Route::post('/ai/cv-review', [\App\Http\Controllers\Seeker\AiCareerAssistantController::class, 'cvReview'])->name('app.ai.cv-review');
    });

Route::prefix('company')
    ->middleware(['auth', 'role:perusahaan'])
    ->group(function () {
        Route::get('/dashboard', \App\Http\Controllers\Company\DashboardController::class)->name('company.dashboard');
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
        Route::get('/dashboard', \App\Http\Controllers\Admin\DashboardController::class)->name('admin.dashboard');
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::post('/companies/{company}/verify', [\App\Http\Controllers\Admin\UserController::class, 'toggleCompanyVerification'])->name('admin.companies.verify');
        Route::get('/vacancies', [\App\Http\Controllers\Admin\VacancyModerationController::class, 'index'])->name('admin.vacancies.index');
        Route::patch('/vacancies/{vacancy}/status', [\App\Http\Controllers\Admin\VacancyModerationController::class, 'updateStatus'])->name('admin.vacancies.updateStatus');
        Route::delete('/vacancies/{vacancy}', [\App\Http\Controllers\Admin\VacancyModerationController::class, 'destroy'])->name('admin.vacancies.destroy');
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('admin.reports.index');
    });

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('/profile/avatar', [\App\Http\Controllers\ProfileAvatarController::class, 'update'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [\App\Http\Controllers\ProfileAvatarController::class, 'destroy'])->name('profile.avatar.destroy');
    Route::get('/applications/{application}/messages', [\App\Http\Controllers\ApplicationMessageController::class, 'index'])->name('applications.messages.index');
    Route::post('/applications/{application}/messages', [\App\Http\Controllers\ApplicationMessageController::class, 'store'])->name('applications.messages.store');
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
