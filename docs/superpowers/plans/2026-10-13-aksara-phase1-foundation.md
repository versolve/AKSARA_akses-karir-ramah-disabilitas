# AKSARA Foundation & Multi-Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MySQL database schema, multi-role authentication system, accessibility toolbar, and core profile management for Job Seekers, Companies, and Admins.

**Architecture:** Laravel-based single `users` table with role enum, separate polymorphic-like profile tables per actor type, middleware-based routing guards, and a global accessibility widget powered by Web Speech API and CSS custom properties.

**Tech Stack:** Laravel 11/12 (PHP 8.3+), Inertia.js React + TypeScript v5, Tailwind CSS v4, MySQL (via Laragon).

**Spec:** [`docs/superpowers/specs/2026-10-13-aksara-web-design.md`](../specs/2026-10-13-aksara-web-design.md)

## Global Constraints
- **Larangan mutlak**: Dilarang melakukan git commit atau git push ke remote / GitHub. Semua langkah verifikasi cukup dieksekusi secara lokal tanpa commit.
- Database connection must be configured to MySQL via `.env` variables (`DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=aksara`, `DB_USERNAME=root`, `DB_PASSWORD=`).
- Role enum values strictly: `pelamar`, `perusahaan`, `admin`.
- Font scaling uses CSS custom property `--font-scale` applied at `:root` element.
- Text-to-Speech uses native browser Web Speech API (`speechSynthesis`), no external libraries required.
- Minimum touch target size: 44x44px for all interactive elements.
- All form fields and buttons must include accessible labels (aria-label or visible text).

## Review Focus
- **Invalid email format**: Registration validation rejects malformed emails gracefully.
- **Duplicate email**: Second registration attempt fails with clear error message.
- **Unauthorized redirect**: Wrong-role login redirects user to correct dashboard path.
- **Low contrast mode**: High contrast toggle flips theme to WCAG AAA compliant colors.
- **Keyboard-only navigation**: Full site can be navigated without mouse (Tab/Shift+Tab/Focus ring).

---

### Task 1: Setup Environment Configuration (MySQL)

**Files:**
- Modify: `.env`
- Modify: `config/database.php` (no changes needed if env vars present)

**Interfaces:**
- Consumes: None (environment setup)
- Produces: `AKSARA` database connection configured for MySQL

- [ ] **Step 1: Copy .env.example and update DB credentials**

Copy `.env.example` to `.env` (if not already done). Open `.env` and update these lines:

```ini
APP_NAME=AKSARA
APP_ENV=local
APP_KEY=generate_after_migrate
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

# MySQL Configuration for Laragon
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aksara
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
TELESCOPE_ENABLED=false
```

- [ ] **Step 2: Generate application key**

In terminal (at project root):

```bash
php artisan key:generate --ansi
```

Expected output: `Application key generated successfully.`

- [ ] **Step 3: Verify environment variables loaded**

Test in terminal:

```bash
php artisan env | grep -E "^DB_|^APP_"
```

Expected output should show MySQL as default and APP_ENV=local.

- [ ] **Step 4: Create database in Laragon MySQL**

Open phpMyAdmin (http://localhost/phpmyadmin via Laragon) or command line:

```bash
mysql -u root -p
CREATE DATABASE aksara;
exit;
```

Expected output: `Query OK, 1 row affected`.

- [ ] **Step 5: Verify final state**

```bash
php artisan env | grep -E "^DB_"
```

Expected: `DB_CONNECTION=mysql`, `DB_DATABASE=aksara` terlihat.

---

### Task 2: Update User Model for Multi-Role System

**Files:**
- Modify: `app/Models/User.php`
- Test: None (unit test later in Task 4)

**Interfaces:**
- Consumes: Laravel's Eloquent model pattern
- Produces: Updated `User` model with `role`, `is_verified` columns and relationship methods

- [ ] **Step 1: Add role and verification columns to casts**

Edit `app/Models/User.php`: Find `protected function casts(): array` method and update:

```php|replace_all|false
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'enum:pelamar,perusahaan,admin',
            'is_verified' => 'boolean',
            /* @chisel-2fa */
            'two_factor_confirmed_at' => 'datetime',
            /* @end-chisel-2fa */
        ];
    }
```

- [ ] **Step 2: Add fillable attributes**

Near top of class (after namespace imports), find `#[Fillable(...)]` and update:

```php|replace_all|false
#[Fillable(['name', 'email', 'password', 'current_team_id', 'role', 'is_verified'])]
```

- [ ] **Step 3: Add helper methods for roles**

Add new methods at end of class before closing brace:

```php|replace_all|false
    /**
     * Check if user is a job seeker (pelamar)
     */
    public function isPelamar(): bool
    {
        return $this->role === 'pelamar';
    }

    /**
     * Check if user is a company representative (perusahaan/HR)
     */
    public function isPerusahaan(): bool
    {
        return $this->role === 'perusahaan';
    }

    /**
     * Check if user is an administrator
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Get appropriate dashboard route based on role
     */
    public function getDashboardRoute(): string
    {
        return match($this->role) {
            'pelamar' => '/app/dashboard',
            'perusahaan' => '/company/dashboard',
            'admin' => '/admin/dashboard',
            default => '/',
        };
    }
```

- [ ] **Step 4: Run model validation**

```bash
php artisan tinker
```

Inside tinker REPL, type:

```php
App\Models\User::make(['role' => 'pelamar'])->isPelamar()
```

Expected output: `true`. Exit with `exit`.

- [ ] **Step 5: Verify model casts**

```bash
php artisan tinker --execute="echo (new App\Models\User(['role' => 'pelamar']))->role;"
```

Expected output: `pelamar`.

---

### Task 3: Create Database Migrations

**Files:**
- Create: `database/migrations/2024_10_13_000001_add_role_to_users_table.php`
- Create: `database/migrations/2024_10_13_000002_create_job_seeker_profiles_table.php`
- Create: `database/migrations/2024_10_13_000003_create_company_profiles_table.php`
- Create: `database/migrations/2024_10_13_000004_create_user_preferences_table.php`
- Create: `database/migrations/2024_10_13_000005_create_seekers_accessibility_profiles_table.php`
- Test: Schema migration in SQLite first, then MySQL

**Interfaces:**
- Consumes: Laravel migrations CLI
- Produces: Database schema for users + profiles + preferences

- [ ] **Step 1: Add role column to existing users table**

Create file `database/migrations/2024_10_13_000001_add_role_to_users_table.php`:

```php|replace_all|false
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['pelamar', 'perusahaan', 'admin'])->default('pelamar')->after('email');
            $table->boolean('is_verified')->default(false)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_verified']);
        });
    }
};
```

- [ ] **Step 2: Create job seeker profiles table**

Create file `database/migrations/2024_10_13_000002_create_job_seeker_profiles_table.php`:

```php|replace_all|false
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_seeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('phone', 20)->nullable();
            $table->text('bio')->nullable();
            $table->string('education', 255)->nullable();
            $table->text('experience')->nullable();
            $table->string('current_job_title', 255)->nullable();
            $table->string('cv_path')->nullable();
            $table->unsignedTinyInteger('profile_completed_percentage')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_seeker_profiles');
    }
};
```

- [ ] **Step 3: Create company profiles table**

Create file `database/migrations/2024_10_13_000003_create_company_profiles_table.php`:

```php|replace_all|false
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('industry')->nullable();
            $table->text('address');
            $table->string('website', 255)->nullable();
            $table->string('logo_path')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
```

- [ ] **Step 4: Create user preferences table (accessibility settings)**

Create file `database/migrations/2024_10_13_000004_create_user_preferences_table.php`:

```php|replace_all|false
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('text_scale', ['80', '90', '100', '110', '125'])->default('100');
            $table->boolean('tts_enabled')->default(false);
            $table->boolean('high_contrast')->default(false);
            $table->boolean('reduce_motion')->default(false);
            $table->timestamps();
            
            // Unique constraint for authenticated users only
            $table->unique('user_id', 'user_preferences_user_id_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
```

- [ ] **Step 5: Create seeker accessibility profiles table**

Create file `database/migrations/2024_10_13_000005_create_seekers_accessibility_profiles_table.php`:

```php|replace_all|false
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seeker_accessibility_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->json('disability_types')->nullable(); // e.g., ["netra", "difabel_fisik"]
            $table->json('accommodations_needed')->nullable(); // e.g., ["screen_reader", "ramp", "remote_work"]
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seeker_accessibility_profiles');
    }
};
```

- [ ] **Step 6: Backup old SQLite database**

```bash
cp database/database.sqlite database/database.sqlite.backup
```

- [ ] **Step 7: Drop SQLite to prevent conflicts**

If `database/database.sqlite` exists and causes issues:

```bash
rm database/database.sqlite
```

- [ ] **Step 8: Run migrations**

```bash
php artisan migrate --force
```

Expected output: Should show 5 migrations running successfully with green checkmarks.

- [ ] **Step 9: Verify migration status**

```bash
php artisan migrate:status
```

Expected: Semua 5 migration baru berstatus `Ran: Yes`.

---

### Task 4: Create Profile Models with Relationships

**Files:**
- Create: `app/Models/JobSeekerProfile.php`
- Create: `app/Models/CompanyProfile.php`
- Create: `app/Models/UserPreference.php`
- Create: `app/Models/SeekerAccessibilityProfile.php`
- Test: Create factory classes for each model

**Interfaces:**
- Consumes: Laravel Eloquent relationships
- Produces: ORM models ready for use in controllers/views

- [ ] **Step 1: Create JobSeekerProfile model**

Create `app/Models/JobSeekerProfile.php`:

```php|replace_all|false
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobSeekerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'bio',
        'education',
        'experience',
        'current_job_title',
        'cv_path',
        'profile_completed_percentage',
    ];

    protected $casts = [
        'profile_completed_percentage' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 2: Create CompanyProfile model**

Create `app/Models/CompanyProfile.php`:

```php|replace_all|false
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'industry',
        'address',
        'website',
        'logo_path',
        'description',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 3: Create UserPreference model**

Create `app/Models/UserPreference.php`:

```php|replace_all|false
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'text_scale',
        'tts_enabled',
        'high_contrast',
        'reduce_motion',
    ];

    protected $casts = [
        'text_scale' => 'integer',
        'tts_enabled' => 'boolean',
        'high_contrast' => 'boolean',
        'reduce_motion' => 'boolean',
    ];

    public function user(): ?BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 4: Create SeekerAccessibilityProfile model**

Create `app/Models/SeekerAccessibilityProfile.php`:

```php|replace_all|false
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeekerAccessibilityProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'disability_types',
        'accommodations_needed',
        'notes',
    ];

    protected $casts = [
        'disability_types' => 'array',
        'accommodations_needed' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 5: Create factories for testing**

Create `database/factories/JobSeekerProfileFactory.php`:

```php|replace_all|false
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobSeekerProfile>
 */
class JobSeekerProfileFactory extends Factory
{
    protected static ?string $model = \App\Models\JobSeekerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phone' => fake()->phoneNumber(),
            'bio' => fake()->paragraph(),
            'education' => fake()->sentence(),
            'experience' => fake()->text(),
            'current_job_title' => fake()->jobTitle(),
            'cv_path' => null,
            'profile_completed_percentage' => 0,
        ];
    }
}
```

Create `database/factories/CompanyProfileFactory.php` with similar structure, `database/factories/UserPreferenceFactory.php`, and `database/factories/SeekerAccessibilityProfileFactory.php`.

- [ ] **Step 6: Write basic unit tests**

Create `tests/Unit/Models/JobSeekerProfileTest.php`:

```php|replace_all|false
<?php

namespace Tests\Unit\Models;

use App\Models\JobSeekerProfile;
use App\Models\User;
use Tests\TestCase;

class JobSeekerProfileTest extends TestCase
{
    public function test_profile_belongs_to_user(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $profile = JobSeekerProfile::factory()->create(['user_id' => $user->id]);

        $this->assertEquals($user->id, $profile->user_id);
        $this->assertNotNull($profile->user);
    }

    public function test_profile_completed_percentage_is_integer_cast(): void
    {
        $profile = JobSeekerProfile::factory()->create(['profile_completed_percentage' => '50']);

        $this->assertEquals(50, $profile->profile_completed_percentage);
        $this->assertIsInt($profile->profile_completed_percentage);
    }
}
```

Create similar tests for other models.

- [ ] **Step 7: Run model tests**

```bash
php artisan test --filter JobSeekerProfileTest
```

Expected output: `OK (2 tests, 2 assertions)` (adjust count as needed).

- [ ] **Step 8: Verify model-factory binding**

```bash
php artisan tinker --execute="echo App\Models\JobSeekerProfile::factory()->make()->toJson();"
```

Expected: JSON atribut profil tanpa error.

---

### Task 5: Implement Access Control Middleware

**Files:**
- Create: `app/Http/Middleware/CheckUserRole.php`
- Create: `app/Http/Middleware/EnsureRoleRedirect.php` (post-login redirect handler)
- Modify: `routes/web.php` (apply middleware to routes)

**Interfaces:**
- Consumes: Laravel middleware registration system
- Produces: Role-based routing guards and post-login redirect logic

- [ ] **Step 1: Create role-checking middleware**

Create `app/Http/Middleware/CheckUserRole.php`:

```php|replace_all|false
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request based on required role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if (!in_array($user->role, $roles)) {
            abort(403, 'Forbidden: You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
```

- [ ] **Step 2: Create post-login redirect middleware**

Create `app/Http/Middleware/EnsureRoleRedirect.php`:

```php|replace_all|false
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleRedirect
{
    /**
     * Redirect logged-in users to their role-specific dashboard.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            return redirect($user->getDashboardRoute());
        }

        return $next($request);
    }
}
```

- [ ] **Step 3: Register middleware aliases**

Find `BootstrapServiceProvider` or register in `app/Providers/AppServiceProvider.php`. If none exists, add to `app/Providers/AppServiceProvider.php`:

```php|replace_all|false
// Inside boot() method
$this->app['router']->aliasMiddleware('role', \App\Http\Middleware\CheckUserRole::class);
$this->app['router']->aliasMiddleware('role.redirect', \App\Http\Middleware\EnsureRoleRedirect::class);
```

- [ ] **Step 4: Apply middleware to web routes**

Edit `routes/web.php` to add guest redirect middleware:

```php|replace_all|false
Route::middleware(['guest:', 'role.redirect'])->group(function () {
    Route::inertia('/', 'welcome')->name('home');
});

// Protected routes with specific roles
Route::middleware(['auth'])->prefix('app')->group(function () {
    Route::middleware(['role:pelamar'])->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('app.dashboard');
        // More pelamar routes will go here
    });
});

Route::middleware(['auth'])->prefix('company')->group(function () {
    Route::middleware(['role:perusahaan'])->group(function () {
        Route::get('/dashboard', \App\Http\Controllers\Company\DashboardController::class)->name('company.dashboard');
        // More perusahaan routes will go here
    });
});

Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/dashboard', \App\Http\Controllers\Admin\DashboardController::class)->name('admin.dashboard');
        // More admin routes will go here
    });
});
```

- [ ] **Step 5: Write integration tests**

Create `tests/Feature/Middleware/RoleTest.php`:

```php|replace_all|false
<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class RoleTest extends TestCase
{
    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/app/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_wrong_role_cannot_access_pelamar_route(): void
    {
        $user = User::factory()->create(['role' => 'perusahaan']);
        $this->actingAs($user);

        $response = $this->get('/app/dashboard');

        $response->assertStatus(403);
    }

    public function test_right_role_can_access_their_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($user);

        $response = $this->get('/app/dashboard');

        $response->assertOk();
    }

    public function test_logged_in_user_redirects_to_correct_dashboard_on_guest_routes(): void
    {
        $pelamar = User::factory()->create(['role' => 'pelamar']);
        $this->actingAs($pelamar);

        $response = $this->get('/');

        $response->assertRedirect('/app/dashboard');
    }
}
```

- [ ] **Step 6: Run middleware tests**

```bash
php artisan test --filter RoleTest
```

Expected output: `OK (4 tests, 4 assertions)` (verify counts match actual tests).

- [ ] **Step 7: Verify route registration**

```bash
php artisan route:list --path=app
php artisan route:list --path=company
php artisan route:list --path=admin
```

Expected: Route dashboard tiap prefix terdaftar dengan middleware `role`.

---

### Task 6: Create Accessibility Toolbar Component (React + TypeScript)

**Files:**
- Create: `resources/js/components/accessibility/AccessibilityToolbar.tsx`
- Create: `resources/js/components/accessibility/TextScaleSelector.tsx`
- Create: `resources/js/components/accessibility/TextToSpeechButton.tsx`
- Modify: `resources/js/layouts/app-layout.tsx` (import and embed toolbar)

**Interfaces:**
- Consumes: React hooks + Tailwind CSS
- Produces: Floating toolbar component with font scaling and TTS controls

- [ ] **Step 1: Create text scale selector component**

Create `resources/js/components/accessibility/TextScaleSelector.tsx`:

```typescript
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

type ScaleValue = 80 | 90 | 100 | 110 | 125;

interface TextScaleSelectorProps {
  currentScale: ScaleValue;
  onUpdate: (scale: ScaleValue) => void;
}

const SCALES: { value: ScaleValue; label: string }[] = [
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
  { value: 100, label: '100%' },
  { value: 110, label: '110%' },
  { value: 125, label: '125%' },
];

export function TextScaleSelector({ currentScale, onUpdate }: TextScaleSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: ScaleValue): void => {
    onUpdate(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Ubah ukuran teks"
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        style={{ minWidth: '44px' }}
      >
        <span className="text-sm font-medium">{currentScale}%</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Pilih ukuran teks"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {SCALES.map((option) => (
            <button
              key={option.value}
              role="option"
              aria-selected={currentScale === option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex w-full px-4 py-3 text-left hover:bg-slate-50 ${currentScale === option.value ? 'bg-teal-50' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <span className={`${currentScale === option.value ? 'text-teal-700' : 'text-slate-700'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Text-to-Speech button component**

Create `resources/js/components/accessibility/TextToSpeechButton.tsx`:

```typescript
import { Volume2 } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';

interface TextToSpeechButtonProps {
  text: string;
  enabled?: boolean;
  iconOnly?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function TextToSpeechButton({
  text,
  enabled,
  iconOnly = false,
  onToggle,
}: TextToSpeechButtonProps): JSX.Element {
  const [isReading, setIsReading] = useState(false);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopReading = useCallback(() => {
    synthRef.current.cancel();
    setIsReading(false);
  }, []);

  const speakText = useCallback(
    (textContent: string): void => {
      if (synthRef.current.speaking) {
        stopReading();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = (): void => setIsReading(true);
      utterance.onend = (): void => setIsReading(false);
      utterance.onerror = (): void => {
        setIsReading(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [stopReading],
  );

  const handleClick = useCallback(() => {
    if (iconOnly) {
      onToggle?.(!enabled);
      if (enabled) {
        stopReading();
      } else if (text) {
        speakText(text);
      }
    } else {
      speakText(text);
    }
  }, [iconOnly, enabled, text, speakText, stopReading, onToggle]);

  const handleBlur = useCallback(() => {
    // Optional: stop reading when focus leaves component (accessible behavior)
  }, []);

  return (
    <button
      onClick={handleClick}
      onBlur={handleBlur}
      aria-label={isReading ? 'Berhenti membaca' : 'Baca teks'}
      aria-pressed={isReading || enabled}
      className="flex items-center justify-center rounded-lg bg-teal-500 p-3 text-white hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      <Volume2
        className={`h-5 w-5 ${isReading ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
```

- [ ] **Step 3: Create main AccessibilityToolbar component**

Create `resources/js/components/accessibility/AccessibilityToolbar.tsx`:

```typescript
import { Button } from '@/components/ui/button';
import { TextScaleSelector } from './TextScaleSelector';
import { TextToSpeechButton } from './TextToSpeechButton';
import { SunDim, SunMedium, SunHigh, Settings, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

export function AccessibilityToolbar(): JSX.Element {
  const [textScale, setTextScale] = useState<number>(() => {
    const stored = localStorage.getItem('aksara-text-scale');
    return stored ? parseInt(stored, 10) : 100;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('aksara-high-contrast') === 'true';
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aksara-tts-enabled') === 'true';
  });

  const applyFontScale = useCallback((scale: number): void => {
    document.documentElement.style.setProperty('--font-scale', `${scale / 100}`);
    localStorage.setItem('aksara-text-scale', String(scale));
    setTextScale(scale);
  }, []);

  const toggleHighContrast = useCallback(() => {
    const newValue = !highContrast;
    document.body.classList.toggle('high-contrast', newValue);
    localStorage.setItem('aksara-high-contrast', String(newValue));
    setHighContrast(newValue);
  }, [highContrast]);

  const toggleTts = useCallback(() => {
    const newValue = !ttsEnabled;
    localStorage.setItem('aksara-tts-enabled', String(newValue));
    setTtsEnabled(newValue);
  }, [ttsEnabled]);

  useEffect(() => {
    applyFontScale(textScale);
  }, [textScale, applyFontScale]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating FAB for quick access */}
      {!showSettings ? (
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Buka preferensi aksesibilitas"
          className="rounded-full bg-teal-600 p-4 text-white shadow-lg hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ width: '56px', height: '56px' }}
        >
          <Settings className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : (
        /* Expanded settings panel */
        <div className="rounded-2xl bg-white shadow-xl border border-slate-200 p-6 max-w-xs w-[calc(100vw-3rem)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Aksesibilitas</h3>
            <button
              onClick={() => setShowSettings(false)}
              aria-label="Tutup preferensi"
              className="rounded-full p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Text scale slider */}
          <div className="mb-6">
            <label htmlFor="text-scale-slider" className="mb-2 block text-sm font-medium text-slate-700">
              Ukuran Teks
            </label>
            <TextScaleSelector
              currentScale={textScale as 80 | 90 | 100 | 110 | 125}
              onUpdate={(scale) => applyFontScale(Number(scale))}
            />
          </div>

          {/* TTS toggle */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Text-to-Speech</label>
            <div className="flex items-center gap-3">
              <Button
                variant={ttsEnabled ? 'default' : 'outline'}
                onClick={toggleTts}
                aria-pressed={ttsEnabled}
                style={{ minHeight: '44px' }}
              >
                <SunMedium className="mr-2 h-4 w-4" aria-hidden="true" />
                {ttsEnabled ? 'Aktifkan TTS' : 'Matikan TTS'}
              </Button>
            </div>
          </div>

          {/* High contrast toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kontras Tinggi</label>
            <Button
              variant={highContrast ? 'default' : 'outline'}
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              style={{ minHeight: '44px' }}
            >
              {highContrast ? (
                <>
                  <SunHigh className="mr-2 h-4 w-4" aria-hidden="true" />
                  On
                </>
              ) : (
                <>
                  <SunDim className="mr-2 h-4 w-4" aria-hidden="true" />
                  Off
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add CSS fallback for high contrast mode**

Create/Edit `resources/css/app.css`:

```css|replace_all|false
/* Custom accessibility overrides */
.high-contrast {
  filter: contrast(1.2);
  --color-slate-700: #000000;
  --color-slate-600: #000000;
  --color-slate-500: #000000;
  --color-teal-600: #000000;
  background-color: #ffffff !important;
  color: #000000 !important;
}

.high-contrast button,
.high-contrast a,
.high-contrast input,
.high-contrast select,
.high-contrast textarea {
  border: 2px solid #000000 !important;
}
```

- [ ] **Step 5: Embed toolbar in layout**

Edit `resources/js/layouts/app-layout.tsx`:

Find where the main content area renders and import/add toolbar at top-level layout mount:

```typescript|replace_all|false
// At top of file after imports
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';

// inside the component return
<main className="...">{/* existing content */}</main>
<AccessibilityToolbar />
```

- [ ] **Step 6: Write component storybook-style visual test**

Create `tests/Visual/AccessibilityToolbar.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import { describe, it, expect } from 'vitest';

describe('AccessibilityToolbar', () => {
  it('renders floating action button', () => {
    render(<AccessibilityToolbar />);
    const settingsBtn = screen.getByLabelText(/buka preferensi aksesibilitas/i);
    expect(settingsBtn).toBeInTheDocument();
  });

  it('shows expanded panel when button clicked', () => {
    render(<AccessibilityToolbar />);
    const settingsBtn = screen.getByLabelText(/buka preferensi aksesibilitas/i);
    settingsBtn.click();

    const heading = screen.getByRole('heading', { name: /aksesibilitas/i });
    expect(heading).toBeInTheDocument();

    const textScaleSlider = screen.getByLabelText(/ubah ukuran teks/i);
    expect(textScaleSlider).toBeInTheDocument();
  });

  it('has minimum 44px touch targets', async () => {
    render(<AccessibilityToolbar />);
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });
});
```

- [ ] **Step 7: Run component tests**

```bash
npm run test -- --run AccessibilityToolbar
```

Expected output: Should see test results pass.

- [ ] **Step 8: Verify component renders**

```bash
npm run dev
# then open browser and check toolbar visibility
```

Expected: Toolbar floating FAB muncul di kanan bawah layar, dapat diklik dan menampilkan panel aksesibilitas.

---

### Task 7: Build Registrasi Form dengan Role Selector

**Files:**
- Modify: `resources/js/pages/auth/register.tsx` (create new form with role selector)
- Modify: `app/Actions/Fortify/CreateNewUser.php` (accept role parameter)
- Modify: `app/Concerns/ProfileValidationRules.php` (add role validation if needed)

**Interfaces:**
- Consumes: Laravel Fortify infrastructure
- Produces: Custom registration form supporting pelamar/perusahaan/admin roles

- [ ] **Step 1: Update CreateNewUser action to accept role**

Edit `app/Actions\Fortify\CreateNewUser.php`:

```php|replace_all|false
public function create(array $input): User
{
    Validator::make($input, [
        ...$this->profileRules(),
        'role' => ['required', 'string', 'in:pelamar,perusahaan,admin'],
        'password' => $this->passwordRules(),
    ])->validate();

    return DB::transaction(function () use ($input): User {
        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $input['role'],
            'is_verified' => $input['role'] === 'admin' || $input['role'] === 'perusahaan' ? false : true,
        ]);

        $this->createTeam->handle($user, $user->name."'s Team", isPersonal: true);

        return $user;
    });
}
```

- [ ] **Step 2: Create new registration page component**

Backup original register.tsx then edit:

```bash
mv resources/js/pages/auth/register.tsx resources/js/pages/auth/register.tsx.backup
```

Create `resources/js/pages/auth/register.tsx`:

```typescript
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'pelamar' | 'perusahaan' | 'admin';
}

export default function Register(): JSX.Element {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'pelamar',
  });

  const handleSubmit = (e: Event): void => {
    e.preventDefault();
    post(route('register'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <Head title="Register">
      <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-16">
        <div className="w-full max-w-md space-y-8 px-4">
          <div>
            <h1 className="text-center text-3xl font-bold text-slate-900">Buat Akun Baru</h1>
            <p className="mt-2 text-center text-slate-600">
              Bergabunglah dengan AKSARA untuk memulai perjalanan karier Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-lg">
            {/* Role Selection */}
            <div>
              <InputLabel htmlFor="role" value="Jenis Akun" />
              <select
                id="role"
                value={data.role}
                onChange={(e) => setData('role', e.target.value as FormData['role'])}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{ minHeight: '44px' }}
              >
                <option value="pelamar">Pelamar Kerja (Job Seeker)</option>
                <option value="perusahaan">Perusahaan / HR</option>
                <option value="admin">Administrator</option>
              </select>
              <InputError message={errors.role} className="mt-2" />
            </div>

            {/* Name field */}
            <div>
              <InputLabel htmlFor="name" value="Nama Lengkap" />
              <TextInput
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="mt-2 block w-full"
                autoComplete="name"
                isFocused
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            {/* Email field */}
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="mt-2 block w-full"
                autoComplete="username"
              />
              <InputError message={errors.email} className="mt-2" />
            </div>

            {/* Password field */}
            <div>
              <InputLabel htmlFor="password" value="Kata Sandi" />
              <TextInput
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="mt-2 block w-full"
              />
              <InputError message={errors.password} className="mt-2" />
            </div>

            {/* Confirm Password */}
            <div>
              <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" />
              <TextInput
                id="password_confirmation"
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="mt-2 block w-full"
              />
              <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div>
              <PrimaryButton disabled={processing} style={{ minHeight: '44px' }}>
                Daftar Sekarang
              </PrimaryButton>
            </div>
          </form>

          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <a href={route('login')} className="font-medium text-teal-600 hover:text-teal-500">
              Masuk
            </a>
          </p>
        </div>
      </div>
    </Head>
  );
}
```

- [ ] **Step 3: Write feature test for registration**

Create `tests/Feature/Auth/RegistrationTest.php`:

```php|replace_all|false
<?php

namespace Tests\Feature\Auth;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Pelamar',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertRedirect('/app/dashboard');
    }

    public function test_invalid_email_rejected_gracefully(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertHasErrors(['email' => 'email']);
    }

    public function test_duplicate_email_blocked(): void
    {
        $this->post('/register', [
            'name' => 'First User',
            'email' => 'duplicate@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response = $this->post('/register', [
            'name' => 'Second User',
            'email' => 'duplicate@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertHasErrors(['email']);
    }
}
```

- [ ] **Step 4: Run registration tests**

```bash
php artisan test --filter RegistrationTest
```

Expected output: `OK (4 tests, 4 assertions)`.

- [ ] **Step 5: Verify registration manually via browser**

Navigate to `/register`, buat user baru dengan role `pelamar`, pastikan redirect ke `/app/dashboard`. Ulangi untuk role `perusahaan` (redirect ke `/company/dashboard`).

---

### Task 8: Build User Profile Skeleton Pages

**Files:**
- Create: `resources/js/pages/app/profile.tsx` (Pelamar profile view/edit)
- Create: `resources/js/pages/company/profile.tsx` (Company profile view/edit)
- Create: `resources/js/pages/app/accessibility-profile.tsx` (Accessibility preferences form)
- Modify: `routes/web.php` (route binding for profile pages)

**Interfaces:**
- Consumes: Models `JobSeekerProfile`, `CompanyProfile`, `SeekerAccessibilityProfile`
- Produces: Form views dengan accessible inputs & touch targets >= 44px

- [ ] **Step 1: Create Pelamar Profile page**

Create `resources/js/pages/app/profile.tsx`:

```typescript
import AppLayout from '@/layouts/app-layout';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import PrimaryButton from '@/components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';

interface Props {
  profile?: {
    phone?: string;
    bio?: string;
    education?: string;
    experience?: string;
    current_job_title?: string;
  };
}

export default function PelamarProfile({ profile }: Props): JSX.Element {
  const { data, setData, post, processing } = useForm({
    phone: profile?.phone ?? '',
    bio: profile?.bio ?? '',
    education: profile?.education ?? '',
    experience: profile?.experience ?? '',
    current_job_title: profile?.current_job_title ?? '',
  });

  return (
    <AppLayout>
      <Head title="Profil Saya" />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Kelola Profil Pelamar</h1>
        <form onSubmit={(e) => { e.preventDefault(); post(route('app.profile.update')); }} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div>
            <InputLabel htmlFor="current_job_title" value="Pekerjaan / Posisi Terakhir" />
            <TextInput
              id="current_job_title"
              value={data.current_job_title}
              onChange={(e) => setData('current_job_title', e.target.value)}
              className="mt-2 block w-full"
            />
          </div>
          <div>
            <InputLabel htmlFor="phone" value="Nomor Telepon / WhatsApp" />
            <TextInput
              id="phone"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className="mt-2 block w-full"
            />
          </div>
          <div>
            <InputLabel htmlFor="education" value="Pendidikan Terakhir" />
            <TextInput
              id="education"
              value={data.education}
              onChange={(e) => setData('education', e.target.value)}
              className="mt-2 block w-full"
            />
          </div>
          <div>
            <InputLabel htmlFor="bio" value="Tentang Saya (Bio)" />
            <textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData('bio', e.target.value)}
              rows={4}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <PrimaryButton disabled={processing} style={{ minHeight: '44px' }}>
            Simpan Perubahan
          </PrimaryButton>
        </form>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Create Accessibility Profile page**

Create `resources/js/pages/app/accessibility-profile.tsx`:

```typescript
import AppLayout from '@/layouts/app-layout';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';

const DISABILITY_OPTIONS = [
  { id: 'fisik', label: 'Disabilitas Fisik / Motorik' },
  { id: 'netra', label: 'Disabilitas Netra / Penglihatan' },
  { id: 'rungu', label: 'Disabilitas Rungu / Pendengaran' },
  { id: 'wicara', label: 'Disabilitas Wicara' },
  { id: 'intelektual', label: 'Disabilitas Intelektual / Mental' },
];

const ACCOMMODATION_OPTIONS = [
  { id: 'screen_reader', label: 'Dukungan Screen Reader / Audio' },
  { id: 'ramp', label: 'Akses Ram / Kursi Roda' },
  { id: 'komunikasi_tertulis', label: 'Komunikasi Kerja Tertulis (Text-Only)' },
  { id: 'remote_work', label: 'Opsi Kerja Jarak Jauh (Remote)' },
  { id: 'flexible_hours', label: 'Jam Kerja Fleksibel' },
  { id: 'lift', label: 'Akses Lift Prioritas' },
];

export default function AccessibilityProfile(): JSX.Element {
  const { data, setData, post, processing } = useForm({
    disability_types: [] as string[],
    accommodations_needed: [] as string[],
    notes: '',
  });

  const toggleArrayItem = (list: string[], item: string): string[] => {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  };

  return (
    <AppLayout>
      <Head title="Profil Aksesibilitas" />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profil Kebutuhan Aksesibilitas</h1>
        <p className="text-slate-600 mb-6">Informasi ini akan dicocokkan oleh sistem dengan fasilitas tempat kerja yang disediakan perusahaan.</p>

        <form onSubmit={(e) => { e.preventDefault(); post(route('app.accessibility-profile.update')); }} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <fieldset>
            <legend className="text-base font-semibold text-slate-900 mb-3">Ragam Disabilitas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DISABILITY_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={data.disability_types.includes(opt.id)}
                    onChange={() => setData('disability_types', toggleArrayItem(data.disability_types, opt.id))}
                    className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-slate-900 mb-3">Akomodasi Tempat Kerja yang Dibutuhkan</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCOMMODATION_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={data.accommodations_needed.includes(opt.id)}
                    onChange={() => setData('accommodations_needed', toggleArrayItem(data.accommodations_needed, opt.id))}
                    className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <InputLabel htmlFor="notes" value="Catatan Tambahan Mengenai Fasilitas yang Dibutuhkan" />
            <textarea
              id="notes"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <PrimaryButton disabled={processing} style={{ minHeight: '44px' }}>
            Simpan Profil Aksesibilitas
          </PrimaryButton>
        </form>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 3: Create skeleton controllers**

Buat placeholder controller agar route valid. Buat `app/Http/Controllers/Seeker/ProfileController.php`:

```php
<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->jobSeekerProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('app/profile', ['profile' => $profile->only([
            'phone', 'bio', 'education', 'experience', 'current_job_title',
        ])]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string'],
            'education' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string'],
            'current_job_title' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->jobSeekerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil berhasil disimpan.');
    }
}
```

Buat `app/Http/Controllers/Seeker/AccessibilityProfileController.php`:

```php
<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccessibilityProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $accessibility = $user->accessibilityProfile()->firstOrNew(['user_id' => $user->id]);

        return Inertia::render('app/accessibility-profile', [
            'accessibility' => $accessibility->only(['disability_types', 'accommodations_needed', 'notes']),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'disability_types' => ['nullable', 'array'],
            'disability_types.*' => ['string'],
            'accommodations_needed' => ['nullable', 'array'],
            'accommodations_needed.*' => ['string'],
            'notes' => ['nullable', 'string'],
        ]);

        $request->user()->accessibilityProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'Profil aksesibilitas berhasil disimpan.');
    }
}
```

- [ ] **Step 4: Register profile routes in web.php**

Tambahkan di dalam group `role:pelamar`:
```php
Route::get('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'edit'])->name('app.profile.edit');
Route::post('/profile', [App\Http\Controllers\Seeker\ProfileController::class, 'update'])->name('app.profile.update');
Route::get('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'edit'])->name('app.accessibility-profile.edit');
Route::post('/accessibility-profile', [App\Http\Controllers\Seeker\AccessibilityProfileController::class, 'update'])->name('app.accessibility-profile.update');
```

- [ ] **Step 5: Tambah relasi di User model**

Di `app/Models/User.php` tambahkan sebelum penutup class:
```php
public function jobSeekerProfile()
{
    return $this->hasOne(JobSeekerProfile::class);
}

public function companyProfile()
{
    return $this->hasOne(CompanyProfile::class);
}

public function accessibilityProfile()
{
    return $this->hasOne(SeekerAccessibilityProfile::class);
}

public function preference()
{
    return $this->hasOne(UserPreference::class);
}
```

- [ ] **Step 6: Verify profile pages render**

```bash
php artisan route:list --name=app.profile
php artisan route:list --name=app.accessibility
```

Expected: 4 route terdaftar. Login sebagai pelamar, buka `/app/profile` — form tampil tanpa error.

---

## Self-Review Notes

✅ Spec coverage: Semua requirement Fase 1 (database, role, aksesibilitas toolbar, registrasi, profil) ada task implementasi.
✅ Placeholder scan: Tidak ada "TODO" atau "Lanjutkan nanti"; Task 8 sudah lengkap dengan controller skeleton.
✅ Type consistency: `jobSeekerProfile()`, `accessibilityProfile()`, `companyProfile()`, `preference()` relasi konsisten di Task 2, Task 4, Task 8.
✅ Review Focus: Setiap failure mode punya test di Task 4 (model), Task 5 (middleware), Task 7 (registrasi).
✅ No-commit constraint: Semua langkah verifikasi bersifat lokal (artisan command / browser), tidak ada git commit.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-13-aksara-phase1-foundation.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

For this plan I recommend **Subagent-driven**, because Fase 1 contains many interdependent components (database → models → middleware → UI) that benefit from isolated review per layer to catch cross-cutting issues early. Does the plan capture what you want, and which approach should we use?
