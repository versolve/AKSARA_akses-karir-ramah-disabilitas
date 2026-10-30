# Admin user deactivation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin controls on `/admin/users` to deactivate users for 30 days, reactivate them, or permanently delete them immediately, with the authenticated admin password required for every destructive action.

**Architecture:** Store account state on `users` with `is_disabled`, `disabled_at`, and `scheduled_deletion_at`. Extend the existing admin `UserController`, route group, and users table. Use one password-confirmation modal for deactivate, reactivate, and permanent delete; backend validates `current_password` and rejects admin targets and self-targets. Add a daily scheduled command that permanently deletes accounts whose 30-day deadline has passed.

**Tech Stack:** Laravel, Eloquent, Inertia.js, React, TypeScript, Tailwind CSS, PHPUnit.

**Spec:** `docs/superpowers/specs/ReferenceUI/Edit Profil.png` and approved admin-user-actions visual companion.

## Global Constraints

- Password field is `current_password`; Laravel `current_password` validation checks the authenticated admin's password.
- Deactivation keeps user and related data; it blocks login and schedules permanent deletion exactly 30 days after deactivation.
- Reactivation clears disabled state and scheduled deletion date.
- Permanent deletion removes the user and related data immediately, with no undo.
- Admin users cannot be deactivated or deleted; an admin cannot target their own account.
- Existing company verification, filters, pagination, and role middleware remain unchanged.
- No new dependency.

## Review Focus

- Wrong admin password: action is rejected, target state does not change, validation error returns.
- Admin target or self-target: action is rejected before mutation.
- Deactivation deadline: account is scheduled exactly 30 days ahead and is excluded from login.
- Reactivation: disabled state and scheduled deletion are both cleared.
- Scheduled cleanup boundary: accounts at or before `now()` are deleted; future deadlines remain.

---

### Task 1: Persist account lifecycle state

**Files:**
- Create: `database/migrations/YYYY_MM_DD_HHMMSS_add_account_lifecycle_to_users_table.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Admin/AdminUserManagementTest.php`

**Interfaces:**
- Produces nullable `disabled_at`, nullable `scheduled_deletion_at`, and boolean `is_disabled` with default `false`.
- User casts lifecycle dates to `datetime` and `is_disabled` to `boolean`.

- [ ] Write tests asserting new users are active, deactivation fields can be stored, and date/boolean casts return expected types.
- [ ] Run `php artisan test tests/Feature/Admin/AdminUserManagementTest.php` and verify new tests fail before migration/model changes.
- [ ] Add migration with `is_disabled`, `disabled_at`, and `scheduled_deletion_at` fields and indexes for scheduled cleanup.
- [ ] Add fields to `User` fillable/casts without changing password hashing behavior.
- [ ] Run the focused test file and verify it passes.

### Task 2: Add protected admin endpoints

**Files:**
- Modify: `routes/web.php:52-62`
- Modify: `app/Http/Controllers/Admin/UserController.php`
- Test: `tests/Feature/Admin/AdminUserManagementTest.php`

**Interfaces:**
- `POST /admin/users/{user}/deactivate` → `deactivate(Request $request, User $user): RedirectResponse`.
- `POST /admin/users/{user}/activate` → `activate(Request $request, User $user): RedirectResponse`.
- `DELETE /admin/users/{user}` → `destroy(Request $request, User $user): RedirectResponse`.
- Each endpoint validates `current_password` with `['required', 'current_password']` before mutation.

- [ ] Add failing feature tests for correct-password deactivation, activation, immediate deletion, wrong password, self-target, and admin-target cases.
- [ ] Run focused tests and verify failures identify missing routes/actions or state changes.
- [ ] Register endpoints inside existing `auth` + `role:admin` route group.
- [ ] Implement shared guard logic rejecting self-target and any target with `role === 'admin'`.
- [ ] Deactivate with `disabled_at = now()` and `scheduled_deletion_at = now()->addDays(30)`; activate by clearing all lifecycle fields; destroy via model deletion after password and target checks.
- [ ] Return `back()` with Indonesian status messages and validation errors.
- [ ] Run focused tests and verify all endpoint cases pass.

### Task 3: Block disabled accounts from authentication

**Files:**
- Modify: `app/Http/Middleware/EnsureRoleRedirect.php` or existing authentication flow identified by the test failure
- Modify: `app/Actions/Fortify/*` only if existing flow requires it
- Test: `tests/Feature/Auth/AuthenticationTest.php` or `tests/Feature/Auth/LoginRoleRedirectTest.php`

**Interfaces:**
- A user with `is_disabled = true` cannot complete login and receives an authentication error.
- Active and reactivated users retain existing login behavior.

- [ ] Add failing test for disabled-user login rejection and active-user login success.
- [ ] Run the focused authentication test and verify disabled user currently logs in or reaches the wrong state.
- [ ] Add the smallest check in the existing authentication path; do not alter role redirects for active users.
- [ ] Run focused authentication tests and verify pass.

### Task 4: Add scheduled permanent cleanup

**Files:**
- Create: `app/Console/Commands/DeleteExpiredDisabledUsers.php`
- Modify: `routes/console.php` or the project scheduler registration point
- Test: `tests/Feature/Admin/AdminUserManagementTest.php`

**Interfaces:**
- Artisan command signature: `users:delete-expired`.
- Command deletes users where `is_disabled = true` and `scheduled_deletion_at <= now()`.
- Command leaves active users and disabled users with future deadlines untouched.

- [ ] Add failing test covering expired, future, active, and admin users.
- [ ] Run focused test and verify command is missing or behavior fails.
- [ ] Implement query and schedule command daily using existing Laravel scheduling style.
- [ ] Run focused test and verify only expired disabled non-admin accounts are deleted.

### Task 5: Add `/admin/users` actions and password modal

**Files:**
- Modify: `resources/js/pages/admin/users/index.tsx`

**Interfaces:**
- `UserItem` includes `is_disabled`, `disabled_at`, and `scheduled_deletion_at`.
- Active user shows `Nonaktifkan`; disabled user shows `Aktifkan` and `Hapus sekarang`.
- Each action opens a confirmation modal with target name, action warning, password input, cancel button, and submit button.
- Modal submits `current_password` to the matching endpoint and preserves existing filters/table behavior.

- [ ] Add lifecycle fields to TypeScript types and render status/deadline text.
- [ ] Add action state and one reusable modal; never submit password through query parameters.
- [ ] Use Inertia `router.post` for deactivate/activate and `router.delete` for permanent delete, including `current_password` payload.
- [ ] Hide lifecycle actions for admin rows and show existing company verification action unchanged.
- [ ] Run `npm run build` and verify TypeScript/build output succeeds.

### Task 6: Full verification

**Files:**
- Test: `tests/Feature/Admin/AdminUserManagementTest.php`

- [ ] Run `php artisan test tests/Feature/Admin/AdminUserManagementTest.php tests/Feature/Auth/AuthenticationTest.php tests/Feature/Auth/LoginRoleRedirectTest.php`.
- [ ] Run `npm run build`.
- [ ] Run VS Code diagnostics for changed PHP/TSX files.
- [ ] Review `git diff` and confirm no database, admin, self-target, or password-verification bypass exists.
