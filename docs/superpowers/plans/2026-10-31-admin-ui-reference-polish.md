# Admin UI Reference Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish existing admin screens to match provided AKSARA/Profabel reference layouts without breaking current moderation and account lifecycle behavior.

**Architecture:** Keep Laravel controllers and Inertia page entrypoints. Extend admin page payloads with aggregate counts and detail data only where needed. Use shared admin visual primitives inside existing page files unless reuse is clearly needed; keep role-aware app navigation in the existing sidebar/header components. Add a dedicated verification route backed by existing `CompanyProfile.is_approved` state.

**Tech Stack:** Laravel, Inertia.js React, TypeScript, Tailwind CSS v4, lucide-react, PHPUnit/Pest feature tests already present in `tests/Feature/Admin`.

**Spec:** `docs/superpowers/specs/ReferenceUI/admin/`

## Global Constraints

- Preserve existing admin authorization middleware: `auth` + `role:admin`.
- Preserve existing account lifecycle confirmation requiring `current_password`.
- Preserve existing vacancy status values: `active`, `closed`, `draft`.
- Do not implement Business Intelligence, reports redesign, charts backed by new analytics tables, or other analytics features until new references arrive.
- Do not add frontend dependencies; use installed `lucide-react`, Inertia, and Tailwind.
- Keep controls keyboard-accessible and retain visible focus states.
- Use existing database fields; no schema changes required for this UI pass.

## Review Focus

- Existing admin actions must still submit to current endpoints and retain password validation — cover in existing admin feature tests plus type/build checks.
- Empty datasets and missing optional profile fields must render without crashes — cover with controller payload assertions and defensive React rendering.
- Verification status must remain consistent between company profile and linked user — cover existing toggle test and new verification route test.
- Filters and pagination must preserve query parameters — cover controller request tests and use `withQueryString()`.
- Responsive tables and side panels must remain usable at narrow widths — verify with responsive Tailwind structure and browser/manual run.

---

### Task 1: Admin Navigation and Shared Visual Baseline

**Files:**
- Modify: `resources/js/components/app-sidebar.tsx`
- Modify: `resources/js/components/app-header.tsx`
- Modify: `resources/js/components/app-logo.tsx`
- Modify: `resources/js/layouts/app-layout.tsx`

**Interfaces:**
- Consumes existing role from `page.props.auth.user.role`.
- Produces admin navigation labels/routes: Dashboard, Kelola Pengguna, Verifikasi Perusahaan, Kelola Lowongan, while keeping existing reports and public catalog routes available but visually secondary.

- [ ] **Step 1: Update admin navigation labels and active routes**
  Keep `/admin/users`, `/admin/vacancies`, `/admin/reports`, and `/jobs` working; add `/admin/companies/verification` link and use `Kelola Lowongan` label for vacancy moderation.

- [ ] **Step 2: Align admin shell branding and spacing**
  Keep role-agnostic layout behavior intact. Use existing logo component and current accessibility toolbar; only adjust admin-compatible colors, surface background, and header affordances needed by reference screens.

- [ ] **Step 3: Run frontend type check**
  Run: `npm run types:check`
  Expected: PASS.

### Task 2: Dashboard Reference Layout

**Files:**
- Modify: `app/Http/Controllers/Admin/DashboardController.php`
- Modify: `resources/js/pages/admin/dashboard.tsx`
- Test: `tests/Feature/Admin/AdminDashboardTest.php`

**Interfaces:**
- Controller continues returning `stats`, `recentApplications`, and `recentVacancies`, and adds stable aggregate fields needed by cards: `verified_companies`, `closed_vacancies`, `pending_vacancies`, and `application_statuses`.
- React page renders data defensively when arrays are empty.

- [ ] **Step 1: Extend dashboard payload with existing-model aggregates**
  Query counts from `User`, `CompanyProfile`, `Vacancy`, and `Application`; do not create analytics storage or time-series claims unsupported by current data.

- [ ] **Step 2: Replace dark banner/metric-only dashboard with reference hierarchy**
  Render light admin canvas, page heading/date control visual, four KPI cards, pending verification callout, activity feed, and vacancy/application summaries. Keep links to `/admin/users`, `/admin/companies/verification`, and `/admin/vacancies`.

- [ ] **Step 3: Add accessible status/color treatment**
  Use text labels with color, not color alone; ensure cards and activity rows have meaningful headings and responsive stacking.

- [ ] **Step 4: Extend dashboard feature assertions**
  Assert new aggregate props exist while retaining existing component and authorization assertions.

- [ ] **Step 5: Run tests**
  Run: `php artisan test tests/Feature/Admin/AdminDashboardTest.php`
  Expected: PASS.

### Task 3: Kelola Pengguna with Pelamar/Perusahaan Tabs and Detail Drawer

**Files:**
- Modify: `app/Http/Controllers/Admin/UserController.php`
- Modify: `resources/js/pages/admin/users/index.tsx`
- Modify: `tests/Feature/Admin/AdminUserManagementTest.php`

**Interfaces:**
- Existing `GET /admin/users` remains source of paginated users and supports `role` and `search`.
- Existing POST/DELETE lifecycle actions remain unchanged.
- Page adds local selected-user detail drawer; no new mutation endpoint required.

- [ ] **Step 1: Extend user index payload with role counts and filter metadata**
  Return counts for pelamar/perusahaan using the same query constraints where practical; retain `users` paginator and `filters` shape for compatibility.

- [ ] **Step 2: Add tabbed role navigation**
  Tabs map to `role=pelamar`, `role=perusahaan`, and all users; preserve current URL filters and pagination.

- [ ] **Step 3: Restyle table and filters to reference layout**
  Add KPI cards, search/filter bar, status badges, compact row actions, and responsive overflow without changing action URLs.

- [ ] **Step 4: Add local detail drawer**
  Clicking a row/detail action shows available user, company profile, or seeker profile fields; missing fields show safe fallback text. Keep lifecycle buttons and password dialog available from row actions/drawer.

- [ ] **Step 5: Add backend assertions for counts/filter preservation**
  Assert Inertia payload includes counts and role filtering still returns matching users.

- [ ] **Step 6: Run tests**
  Run: `php artisan test tests/Feature/Admin/AdminUserManagementTest.php`
  Expected: PASS.

### Task 4: Dedicated Verifikasi Perusahaan Screen

**Files:**
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/Admin/UserController.php`
- Modify: `resources/js/pages/admin/users/index.tsx` or Create: `resources/js/pages/admin/companies/verification.tsx`
- Modify: `tests/Feature/Admin/AdminUserManagementTest.php`

**Interfaces:**
- Add `GET /admin/companies/verification` named `admin.companies.verification`.
- Add `UserController::verificationIndex(Request $request): Response` returning paginated company profiles, counts, and filters.
- Existing `POST /admin/companies/{company}/verify` remains mutation endpoint.

- [ ] **Step 1: Add authorized verification route and controller action**
  Query `CompanyProfile` with linked user and vacancy counts; support `search`, `is_approved`, and pagination with query strings.

- [ ] **Step 2: Add verification page matching reference**
  Render verification KPI cards, status tabs, search/filter controls, company table, and local detail drawer with company fields and safe document/accessibility placeholders based only on available model data.

- [ ] **Step 3: Wire approve/unverify controls**
  Submit existing verification endpoint with boolean `is_approved`; show status labels and preserve page state.

- [ ] **Step 4: Add route and payload feature assertions**
  Verify admin access, non-admin denial, company listing, and filter behavior.

- [ ] **Step 5: Run tests**
  Run: `php artisan test tests/Feature/Admin/AdminUserManagementTest.php`
  Expected: PASS.

### Task 5: Kelola Lowongan Reference Layout and Detail Drawer

**Files:**
- Modify: `app/Http/Controllers/Admin/VacancyModerationController.php`
- Modify: `resources/js/pages/admin/vacancies/index.tsx`
- Modify: `tests/Feature/Admin/AdminVacancyModerationTest.php`

**Interfaces:**
- Existing `GET /admin/vacancies`, `PATCH /admin/vacancies/{vacancy}/status`, and `DELETE /admin/vacancies/{vacancy}` remain unchanged.
- Index payload adds status counts while retaining `vacancies` paginator and `filters`.

- [ ] **Step 1: Extend vacancy index payload with status counts**
  Count active, closed, and draft vacancies using current database state.

- [ ] **Step 2: Add status tabs and KPI cards**
  Tabs map to existing `status` query values; preserve search and pagination query strings.

- [ ] **Step 3: Restyle vacancy table**
  Show title/company, location/work model, publication/deadline data when present, applicants count, status badge, and compact action controls with responsive overflow.

- [ ] **Step 4: Add local vacancy detail drawer**
  Display description, category-equivalent existing fields, accessibility relations when available, and existing status/takedown actions; never invent missing database values.

- [ ] **Step 5: Extend feature assertions and run tests**
  Assert counts and current moderation behavior.
  Run: `php artisan test tests/Feature/Admin/AdminVacancyModerationTest.php`
  Expected: PASS.

### Task 6: Whole Admin Verification

**Files:**
- No new product files unless fixes are required.

- [ ] **Step 1: Run admin feature suite**
  Run: `php artisan test tests/Feature/Admin`
  Expected: all tests pass.

- [ ] **Step 2: Run frontend checks**
  Run: `npm run types:check` and `npm run check`
  Expected: both pass.

- [ ] **Step 3: Run production frontend build**
  Run: `npm run build`
  Expected: build succeeds.

- [ ] **Step 4: Review diff for scope control**
  Confirm no analytics/report redesign, no dependency changes, no route collisions, and no mutation endpoint regressions.
