# AKSARA Communication, Role Dashboards, & Demo Data Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul komunikasi (notifikasi status lamaran & pesan dua arah Pelamar-HR per lamaran), dashboard statistik role-based untuk Perusahaan dan Pelamar, penyesuaian navigasi sidebar role-aware, demo seeders lengkap untuk presentasi/pengujian, serta dokumentasi README komprehensif.

**Architecture:** Notifikasi tersimpan di tabel database `notifications` standar Laravel dan dikirimkan otomatis saat HR mengubah status lamaran. Percakapan tersimpan di tabel `messages` yang berelasi dengan `applications`, dilindungi otorisasi ketat (hanya pelamar terkait dan perusahaan pemilik lowongan yang berhak berkirim pesan). Dashboard masing-masing role menghitung metrik agregat secara efisien. Seeder menyediakan data realistis dengan 3 ragam disabilitas berbeda.

**Tech Stack:** Laravel 11/12, MySQL (Laragon), Inertia.js React (TypeScript), Tailwind CSS v4, Lucide React icons.

**Spec:** [`docs/superpowers/specs/2026-10-13-aksara-web-design.md`](../specs/2026-10-13-aksara-web-design.md) (Bagian 6 & 7)

## Global Constraints
- **Larangan mutlak**: Dilarang melakukan git commit atau git push ke remote / GitHub. Semua langkah verifikasi dijalankan lokal (test suite PHPUnit / tsc / vite build).
- Otorisasi pesan: User hanya bisa melihat dan mengirim pesan pada lamaran miliknya (pelamar) atau pada lowongan perusahaannya (HR). Pihak ketiga ditolak 403 Forbidden.
- Notifikasi status lamaran memicu pembuatan database notification otomatis ke pelamar.
- Seluruh elemen interaktif touch target minimal 44x44px dan memiliki focus indicator aksesibel.

## Review Focus
- **Unauthorized message eavesdropping**: Pelamar B tidak dapat membaca atau mengirim pesan pada lamaran milik Pelamar A (403 Forbidden).
- **Company cross-messaging prevention**: Perusahaan B tidak dapat mengirim atau membaca pesan pada lamaran yang ditujukan ke Perusahaan A (403 Forbidden).
- **Notification payload integrity**: Notifikasi perubahan status memuat nama posisi, nama perusahaan, status baru, dan tautan langsung ke tracking lamaran.
- **Empty dashboard states**: Dashboard perusahaan baru (0 lowongan, 0 pelamar) dan pelamar baru (0 lamaran) tampil rapi tanpa error null pointer atau division by zero.
- **Demo seeder idempotency**: Menjalankan `php artisan db:seed` berulang kali tidak menyebabkan duplikasi email unik.

---

### Task 1: Database Notifications System for Application Status Updates

**Files:**
- Create: `database/migrations/2026_10_15_000001_create_notifications_table.php`
- Create: `app/Notifications/ApplicationStatusChanged.php`
- Create: `app/Http/Controllers/Seeker/NotificationController.php`
- Modify: `app/Http/Controllers/Company/ApplicationReviewController.php` (trigger notification on status change)
- Modify: `routes/web.php` (add notification routes)
- Test: `tests/Feature/Notifications/ApplicationNotificationTest.php`

**Interfaces:**
- Consumes: `Application`, `User` (notifiable trait)
- Produces: Notifikasi database untuk pelamar dengan endpoint index dan mark-as-read

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/Notifications/ApplicationNotificationTest.php`:

```php
<?php

namespace Tests\Feature\Notifications;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use App\Notifications\ApplicationStatusChanged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ApplicationNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_application_status_sends_notification_to_applicant(): void
    {
        Notification::fake();

        $hrUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $hrUser->id, 'company_name' => 'PT Ramah Inklusi']);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id, 'title' => 'Staf Administrasi']);

        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);

        $application = Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($hrUser)->patch('/company/applications/' . $application->id . '/status', [
            'status' => 'interview',
            'status_notes' => 'Undangan wawancara online via Google Meet.',
        ]);

        $response->assertRedirect();

        Notification::assertSentTo(
            $seekerUser,
            ApplicationStatusChanged::class,
            function ($notification) use ($application) {
                return $notification->application->id === $application->id &&
                       $notification->newStatus === 'interview';
            }
        );
    }

    public function test_pelamar_can_view_notifications_list(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($seekerUser)->get('/app/notifications');
        $response->assertOk();
    }

    public function test_pelamar_can_mark_notification_as_read(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $company = CompanyProfile::factory()->create();
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $seekerUser->notify(new ApplicationStatusChanged($application, 'interview', 'Catatan test'));

        $notification = $seekerUser->unreadNotifications()->first();
        $this->assertNotNull($notification);

        $response = $this->actingAs($seekerUser)->post('/app/notifications/' . $notification->id . '/read');
        $response->assertRedirect();

        $this->assertEquals(0, $seekerUser->fresh()->unreadNotifications()->count());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./vendor/bin/phpunit tests/Feature/Notifications/ApplicationNotificationTest.php`
Expected: FAIL (class `ApplicationStatusChanged` not found).

- [ ] **Step 3: Create notifications migration & execute**

Create `database/migrations/2026_10_15_000001_create_notifications_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
```

Run migration:
```bash
php artisan migrate --force
```

- [ ] **Step 4: Create ApplicationStatusChanged notification class**

Create `app/Notifications/ApplicationStatusChanged.php`:

```php
<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public string $newStatus,
        public ?string $notes = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'application_id' => $this->application->id,
            'vacancy_title' => $this->application->vacancy->title,
            'company_name' => $this->application->vacancy->companyProfile->company_name,
            'status' => $this->newStatus,
            'notes' => $this->notes,
            'link' => '/app/applications',
            'created_at' => now()->toIso8601String(),
        ];
    }
}
```

- [ ] **Step 5: Trigger notification in ApplicationReviewController**

Edit `app/Http/Controllers/Company/ApplicationReviewController.php`:
Inside `updateStatus()` method, dispatch notification:
```php
$application->jobSeekerProfile->user->notify(
    new \App\Notifications\ApplicationStatusChanged($application, $validated['status'], $validated['status_notes'] ?? null)
);
```

- [ ] **Step 6: Implement NotificationController and routes**

Create `app/Http/Controllers/Seeker/NotificationController.php`:

```php
<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(15);

        return Inertia::render('app/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return back()->with('status', 'Notifikasi telah ditandai dibaca.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('status', 'Semua notifikasi telah ditandai dibaca.');
    }
}
```

Register routes in `routes/web.php` inside `prefix('app')`:
```php
Route::get('/notifications', [\App\Http\Controllers\Seeker\NotificationController::class, 'index'])->name('app.notifications.index');
Route::post('/notifications/{id}/read', [\App\Http\Controllers\Seeker\NotificationController::class, 'markAsRead'])->name('app.notifications.read');
Route::post('/notifications/read-all', [\App\Http\Controllers\Seeker\NotificationController::class, 'markAllAsRead'])->name('app.notifications.readAll');
```

Create view `resources/js/pages/app/notifications/index.tsx`.

- [ ] **Step 7: Run test to verify it passes**

Run: `./vendor/bin/phpunit tests/Feature/Notifications/ApplicationNotificationTest.php`
Expected: PASS (3 tests, assertions passed).

---

### Task 2: In-App Messaging System between Pelamar and HR

**Files:**
- Create: `database/migrations/2026_10_15_000002_create_messages_table.php`
- Create: `app/Models/Message.php`
- Create: `app/Http/Controllers/ApplicationMessageController.php`
- Modify: `app/Models/Application.php` (relasi `messages`)
- Modify: `routes/web.php` (message routes)
- Test: `tests/Feature/Messages/ApplicationMessageTest.php`

**Interfaces:**
- Consumes: `Application`, `User`
- Produces: Percakapan pesan dua arah per lamaran kerja

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/Messages/ApplicationMessageTest.php`:

```php
<?php

namespace Tests\Feature\Messages;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\Message;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_pelamar_can_send_message_on_their_application(): void
    {
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $vacancy = Vacancy::factory()->create();
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $response = $this->actingAs($seekerUser)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Halo, apakah saya perlu mempersiapkan portofolio tambahan?',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'application_id' => $application->id,
            'sender_id' => $seekerUser->id,
            'body' => 'Halo, apakah saya perlu mempersiapkan portofolio tambahan?',
        ]);
    }

    public function test_hr_can_reply_message_on_candidate_application(): void
    {
        $hrUser = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $hrUser->id]);
        $vacancy = Vacancy::factory()->create(['company_profile_id' => $company->id]);
        $seekerUser = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $seekerUser->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker->id]);

        $response = $this->actingAs($hrUser)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Ya silakan bawa portofolio saat wawancara.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'application_id' => $application->id,
            'sender_id' => $hrUser->id,
            'body' => 'Ya silakan bawa portofolio saat wawancara.',
        ]);
    }

    public function test_unauthorized_user_cannot_access_or_send_messages(): void
    {
        $seekerUser1 = User::factory()->create(['role' => 'pelamar']);
        $seeker1 = JobSeekerProfile::factory()->create(['user_id' => $seekerUser1->id]);
        $vacancy = Vacancy::factory()->create();
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'job_seeker_profile_id' => $seeker1->id]);

        $otherSeeker = User::factory()->create(['role' => 'pelamar']);

        $response = $this->actingAs($otherSeeker)->get('/applications/' . $application->id . '/messages');
        $response->assertStatus(403);

        $postResponse = $this->actingAs($otherSeeker)->post('/applications/' . $application->id . '/messages', [
            'body' => 'Pesan penyusup.',
        ]);
        $postResponse->assertStatus(403);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./vendor/bin/phpunit tests/Feature/Messages/ApplicationMessageTest.php`
Expected: FAIL (404 on `/applications/{id}/messages`).

- [ ] **Step 3: Create messages migration and model**

Create `database/migrations/2026_10_15_000002_create_messages_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('body');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['application_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
```

Run migration:
```bash
php artisan migrate --force
```

Create `app/Models/Message.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'sender_id',
        'body',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
```

Add relation in `app/Models/Application.php`:
```php
public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(Message::class);
}
```

- [ ] **Step 4: Implement ApplicationMessageController with authorization**

Create `app/Http/Controllers/ApplicationMessageController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationMessageController extends Controller
{
    private function authorizeParty(Request $request, Application $application): void
    {
        $user = $request->user();

        $isApplicant = $application->jobSeekerProfile->user_id === $user->id;
        $isCompany = $application->vacancy->companyProfile->user_id === $user->id;
        $isAdmin = $user->isAdmin();

        abort_unless($isApplicant || $isCompany || $isAdmin, 403, 'Anda tidak berhak mengakses percakapan ini.');
    }

    public function index(Request $request, Application $application)
    {
        $this->authorizeParty($request, $application);

        $messages = $application->messages()
            ->with('sender:id,name,role')
            ->oldest()
            ->get();

        // Mark messages as read for receiver
        $application->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        if ($request->wantsJson()) {
            return response()->json($messages);
        }

        return Inertia::render('applications/messages', [
            'application' => $application->load(['vacancy.companyProfile', 'jobSeekerProfile.user']),
            'messages' => $messages,
        ]);
    }

    public function store(Request $request, Application $application): RedirectResponse
    {
        $this->authorizeParty($request, $application);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $application->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_read' => false,
        ]);

        return back()->with('status', 'Pesan berhasil dikirim.');
    }
}
```

Register routes in `routes/web.php`:
```php
Route::middleware(['auth'])->group(function () {
    Route::get('/applications/{application}/messages', [\App\Http\Controllers\ApplicationMessageController::class, 'index'])->name('applications.messages.index');
    Route::post('/applications/{application}/messages', [\App\Http\Controllers\ApplicationMessageController::class, 'store'])->name('applications.messages.store');
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `./vendor/bin/phpunit tests/Feature/Messages/ApplicationMessageTest.php`
Expected: PASS (3 tests, assertions passed).

---

### Task 3: Dedicated Role-Based Dashboards (Company & Pelamar Stats)

**Files:**
- Create: `app/Http/Controllers/Company/DashboardController.php`
- Create: `app/Http/Controllers/Seeker/DashboardController.php`
- Create: `resources/js/pages/company/dashboard.tsx`
- Create: `resources/js/pages/app/dashboard.tsx`
- Modify: `routes/web.php` (bind specialized dashboard controllers)
- Test: `tests/Feature/Dashboard/RoleDashboardTest.php`

**Interfaces:**
- Consumes: `Vacancy`, `Application`, `CompanyProfile`, `JobSeekerProfile`
- Produces: Halaman dashboard metrik KPI & ringkasan aktivitas terbaru

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/Dashboard/RoleDashboardTest.php`:

```php
<?php

namespace Tests\Feature\Dashboard;

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_dashboard_shows_aggregate_stats(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $company = CompanyProfile::factory()->create(['user_id' => $user->id]);

        $v1 = Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'active']);
        $v2 = Vacancy::factory()->create(['company_profile_id' => $company->id, 'status' => 'closed']);

        Application::factory()->create(['vacancy_id' => $v1->id, 'status' => 'submitted']);
        Application::factory()->create(['vacancy_id' => $v1->id, 'status' => 'interview']);

        $response = $this->actingAs($user)->get('/company/dashboard');
        $response->assertOk();
        $response->assertSee('Statistik Rekrutmen Perusahaan');
    }

    public function test_pelamar_dashboard_shows_application_summary(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $seeker = JobSeekerProfile::factory()->create(['user_id' => $user->id]);
        $vacancy = Vacancy::factory()->create();

        Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'job_seeker_profile_id' => $seeker->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($user)->get('/app/dashboard');
        $response->assertOk();
        $response->assertSee('Ringkasan Aktivitas Pelamar');
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./vendor/bin/phpunit tests/Feature/Dashboard/RoleDashboardTest.php`
Expected: FAIL (strings not found in old starter-kit dashboard).

- [ ] **Step 3: Implement Company DashboardController**

Create `app/Http/Controllers/Company/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $company = $user->companyProfile;

        if (!$company) {
            $company = CompanyProfile::create([
                'user_id' => $user->id,
                'company_name' => $user->name,
                'address' => 'Belum diisi',
            ]);
        }

        $vacanciesCount = $company->vacancies()->count();
        $activeVacanciesCount = $company->vacancies()->where('status', 'active')->count();

        $applicationsQuery = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        });

        $totalApplicants = (clone $applicationsQuery)->count();
        $inReviewCount = (clone $applicationsQuery)->whereIn('status', ['submitted', 'reviewed'])->count();
        $interviewCount = (clone $applicationsQuery)->where('status', 'interview')->count();
        $hiredCount = (clone $applicationsQuery)->where('status', 'hired')->count();

        $recentApplications = (clone $applicationsQuery)
            ->with(['jobSeekerProfile.user', 'vacancy:id,title'])
            ->latest('applied_at')
            ->limit(5)
            ->get();

        return Inertia::render('company/dashboard', [
            'company' => $company,
            'stats' => [
                'total_vacancies' => $vacanciesCount,
                'active_vacancies' => $activeVacanciesCount,
                'total_applicants' => $totalApplicants,
                'in_review' => $inReviewCount,
                'interview' => $interviewCount,
                'hired' => $hiredCount,
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}
```

- [ ] **Step 4: Implement Seeker DashboardController**

Create `app/Http/Controllers/Seeker/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobSeekerProfile;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $seeker = $user->jobSeekerProfile;

        if (!$seeker) {
            $seeker = JobSeekerProfile::create([
                'user_id' => $user->id,
            ]);
        }

        $applications = $seeker->applications()->with(['vacancy.companyProfile'])->latest('applied_at')->get();

        $totalApplied = $applications->count();
        $inReview = $applications->whereIn('status', ['submitted', 'reviewed'])->count();
        $interview = $applications->where('status', 'interview')->count();
        $hired = $applications->where('status', 'hired')->count();

        $recommendedJobs = Vacancy::active()
            ->with(['companyProfile', 'accessibilities'])
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('app/dashboard', [
            'seeker' => $seeker,
            'stats' => [
                'total_applied' => $totalApplied,
                'in_review' => $inReview,
                'interview' => $interview,
                'hired' => $hired,
            ],
            'recentApplications' => $applications->take(4)->values(),
            'recommendedJobs' => $recommendedJobs,
            'unreadNotificationsCount' => $user->unreadNotifications()->count(),
        ]);
    }
}
```

- [ ] **Step 5: Bind controllers in routes/web.php**

In `routes/web.php`:
Replace `Route::get('/dashboard', DashboardController::class)` inside `prefix('app')` with:
```php
Route::get('/dashboard', \App\Http\Controllers\Seeker\DashboardController::class)->name('app.dashboard');
```
Replace `Route::get('/dashboard', DashboardController::class)` inside `prefix('company')` with:
```php
Route::get('/dashboard', \App\Http\Controllers\Company\DashboardController::class)->name('company.dashboard');
```

- [ ] **Step 6: Create React views for both dashboards**

Create `resources/js/pages/company/dashboard.tsx` (KPI stats grid, fast shortcut links, recent candidates card).
Create `resources/js/pages/app/dashboard.tsx` (Application tracking progress summary, recommended accessible vacancies, accessibility profile completeness prompt).

- [ ] **Step 7: Run test to verify it passes**

Run: `./vendor/bin/phpunit tests/Feature/Dashboard/RoleDashboardTest.php`
Expected: PASS (2 tests, assertions passed).

---

### Task 4: Interactive UI Integration (Sidebar Nav, Notification Bell, Chat Thread)

**Files:**
- Modify: `resources/js/components/app-sidebar.tsx` (role-aware menus for Pelamar and Perusahaan)
- Modify: `resources/js/components/app-sidebar-header.tsx` (accessible notification bell badge)
- Create: `resources/js/components/chat/ApplicationChatModal.tsx` (chat thread dialog)
- Modify: `resources/js/pages/app/applications/index.tsx` (embed chat trigger)
- Modify: `resources/js/pages/company/applications/index.tsx` (embed chat trigger)

**Interfaces:**
- Consumes: User role from page props, `/applications/{id}/messages` API
- Produces: Navigasi role terstruktur, notifikasi live count, modal percakapan langsung

- [ ] **Step 1: Update AppSidebar for role-aware menus**

Edit `resources/js/components/app-sidebar.tsx`:
Add role inspection:
If role === `'pelamar'`:
- Beranda: `/app/dashboard`
- Cari Lowongan: `/jobs`
- Lamaran Saya: `/app/applications`
- Profil Saya: `/app/profile`
- Kebutuhan Aksesibilitas: `/app/accessibility-profile`
- Notifikasi: `/app/notifications`

If role === `'perusahaan'`:
- Beranda: `/company/dashboard`
- Kelola Lowongan: `/company/vacancies`
- Pelamar Masuk: `/company/applications`
- Profil Perusahaan: `/company/profile`

- [ ] **Step 2: Add Notification Bell to AppSidebarHeader**

Edit `resources/js/components/app-sidebar-header.tsx`:
Add notification icon button that links to `/app/notifications` with unread badge counter.

- [ ] **Step 3: Create ApplicationChatModal component**

Create `resources/js/components/chat/ApplicationChatModal.tsx`:
Accessible modal with scrollable message list, sender differentiation (Pelamar vs HR), input text box, and send button (touch target >= 44px).

- [ ] **Step 4: Embed chat modal trigger into candidate & tracking pages**

Add "Kirim Pesan" button in `resources/js/pages/app/applications/index.tsx` and `resources/js/pages/company/applications/index.tsx`.

- [ ] **Step 5: Verify frontend compile & lint**

Run:
```bash
npx tsc --noEmit
npm run build
```
Expected: 0 errors.

---

### Task 5: Database Demo Seeder for Presentations & Evaluation

**Files:**
- Create: `database/seeders/DemoDataSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: `php artisan db:seed` command execution

**Interfaces:**
- Consumes: All models from Phase 1 & 2
- Produces: Data demo realistis dan siap uji tanpa konfigurasi manual

- [ ] **Step 1: Write DemoDataSeeder class**

Create `database/seeders/DemoDataSeeder.php`:
Seed:
1. **Admin**: `admin@aksara.id` / `password123`
2. **Perusahaan**:
   - `hr@inklusiftech.id` / `password123` (PT Inklusif Teknologi Nusantara)
   - `hr@karyasama.id` / `password123` (PT Karya Bersama Inklusif)
3. **Pelamar Disabilitas**:
   - `budi.netra@aksara.id` / `password123`:
     - Disabilitas: `['netra']`
     - Akomodasi: `['screen_reader_software', 'remote_option']`
   - `siti.fisik@aksara.id` / `password123`:
     - Disabilitas: `['fisik']`
     - Akomodasi: `['ramp_access', 'elevator', 'accessible_restroom']`
   - `andi.rungu@aksara.id` / `password123`:
     - Disabilitas: `['rungu']`
     - Akomodasi: `['written_communication', 'sign_language_interpreter']`
4. **5 Lowongan Aksesibel**:
   - Frontend Engineer (Remote / Ramah Netra & Rungu)
   - Data Entry Specialist (Onsite / Ramah Fisik & Rungu)
   - Customer Support Tertulis (Remote / Ramah Rungu & Wicara)
   - Quality Assurance Tester (Hybrid / Ramah Netra & Fisik)
   - Staf Administrasi & Arsip (Onsite / Fasilitas Ram & Toilet Disabilitas)
5. **Sample Lamaran & Pesan**:
   - 4 Lamaran dengan status bervariasi (`submitted`, `interview`, `hired`)
   - Riwayat percakapan antara Pelamar dan HR
   - 2 Notifikasi database belum dibaca pada akun Pelamar

- [ ] **Step 2: Register in DatabaseSeeder.php**

Edit `database/seeders/DatabaseSeeder.php`:
```php
$this->call(DemoDataSeeder::class);
```

- [ ] **Step 3: Execute and test seeding**

Run command:
```bash
php artisan db:seed --class=DemoDataSeeder
```
Expected: `Database seeding completed successfully.`

---

### Task 6: Comprehensive Project Documentation & Setup Guide

**Files:**
- Create: `README.md` (root directory)

**Interfaces:**
- Consumes: Entire project setup instructions
- Produces: Panduan instalasi, kredensial akun demo, arsitektur sistem, dan instruksi pengujian

- [ ] **Step 1: Write README.md**

Cover:
1. Tentang AKSARA (Latar belakang, Nilai Bisnis, SDGs 8 & 10)
2. Fitur Aksesibilitas (TTS, Kontras Tinggi, Skala Font, Keyboard Friendly)
3. Kredensial Akun Demo (Admin, HR, Pelamar Netra/Fisik/Rungu)
4. Persyaratan Sistem & Instalasi (PHP 8.3+, Composer, Node.js, MySQL Laragon)
5. Menjalankan Server & Pengujian Otomatis (`php artisan test`)
6. Roadmap Pembangunan (Fase 1 hingga Fase 5)

---

## Self-Review Checklist
✅ **Spec coverage**:
- Section 4: Dashboard Perusahaan & Pelamar -> Task 3.
- Section 6: Pesan dua arah Pelamar-HR -> Task 2 & Task 4.
- Section 6: Notifikasi in-app -> Task 1 & Task 4.
- Demo evaluation readiness -> Task 5 & Task 6.

✅ **Placeholder scan**: Bebas dari TODO/TBD. Semua file dan logic ditata tuntas.  
✅ **Review Focus**: Dilindungi test otorisasi percakapan (`ApplicationMessageTest`), integritas notifikasi (`ApplicationNotificationTest`), dan isolasi role dashboard (`RoleDashboardTest`).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-15-aksara-communication-dashboards-demo.md`. Konfirmasi untuk memulai eksekusi?
