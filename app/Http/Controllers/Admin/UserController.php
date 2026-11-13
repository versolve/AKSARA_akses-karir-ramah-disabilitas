<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $role = $request->input('role', 'pelamar');
        $search = $request->input('search');
        $status = $request->input('status');
        $gender = $request->input('gender');
        $domicile = $request->input('domicile');
        $disability = $request->input('disability');

        $query = User::with(['companyProfile', 'jobSeekerProfile', 'accessibilityProfile']);

        if ($role && in_array($role, ['pelamar', 'perusahaan', 'admin'], true)) {
            $query->where('role', $role);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('companyProfile', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%")->orWhere('industry', 'like', "%{$search}%"))
                  ->orWhereHas('jobSeekerProfile', fn ($jq) => $jq->where('current_job_title', 'like', "%{$search}%")->orWhere('skills', 'like', "%{$search}%"));
            });
        }

        if ($status === 'active') {
            $query->where('is_disabled', false);
        } elseif ($status === 'disabled') {
            $query->where('is_disabled', true);
        }

        if ($gender) {
            $query->whereHas('jobSeekerProfile', fn ($q) => $q->where('gender', $gender));
        }

        if ($domicile) {
            $query->where(function ($q) use ($domicile) {
                $q->whereHas('jobSeekerProfile', fn ($jq) => $jq->where('domicile', 'like', "%{$domicile}%"))
                  ->orWhereHas('companyProfile', fn ($cq) => $cq->where('address', 'like', "%{$domicile}%"));
            });
        }

        if ($disability) {
            $query->whereHas('accessibilityProfile', function ($q) use ($disability) {
                $q->where('disability_types', 'like', "%{$disability}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        // Base query for current role counts
        $baseRoleQuery = User::query();
        if ($role && in_array($role, ['pelamar', 'perusahaan', 'admin'], true)) {
            $baseRoleQuery->where('role', $role);
        }

        $totalCount = (clone $baseRoleQuery)->count();
        $activeCount = (clone $baseRoleQuery)->where('is_disabled', false)->count();
        $disabledCount = (clone $baseRoleQuery)->where('is_disabled', true)->count();
        $newCount = (clone $baseRoleQuery)->where('created_at', '>=', now()->subDays(30))->count();

        $domiciles = JobSeekerProfile::whereNotNull('domicile')->where('domicile', '!=', '')->pluck('domicile')->unique()->values()->all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'role' => $role,
                'search' => $search ?? '',
                'status' => $status ?? '',
                'gender' => $gender ?? '',
                'domicile' => $domicile ?? '',
                'disability' => $disability ?? '',
            ],
            'counts' => [
                'pelamar' => User::where('role', 'pelamar')->count(),
                'perusahaan' => User::where('role', 'perusahaan')->count(),
                'total' => $totalCount,
                'active' => $activeCount,
                'disabled' => $disabledCount,
                'new_30_days' => $newCount,
                'active_pct' => $totalCount > 0 ? round(($activeCount / $totalCount) * 100, 1) : 0,
                'disabled_pct' => $totalCount > 0 ? round(($disabledCount / $totalCount) * 100, 1) : 0,
            ],
            'availableDomiciles' => $domiciles,
        ]);
    }

    public function verificationIndex(Request $request): Response
    {
        $query = CompanyProfile::with('user')->withCount('vacancies')->latest();

        if ($status = $request->input('status')) {
            $query->when($status === 'pending', fn ($builder) => $builder->where('is_approved', false))
                ->when($status === 'verified', fn ($builder) => $builder->where('is_approved', true));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('company_name', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('email', 'like', "%{$search}%"));
            });
        }

        $companies = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/companies/verification', [
            'companies' => $companies,
            'filters' => $request->only(['status', 'search']),
            'counts' => [
                'all' => CompanyProfile::count(),
                'pending' => CompanyProfile::where('is_approved', false)->count(),
                'verified' => CompanyProfile::where('is_approved', true)->count(),
            ],
        ]);
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        $this->authorizeLifecycleAction($request, $user);
        $this->validateAdminPassword($request);

        $user->update([
            'is_disabled' => true,
            'disabled_at' => now(),
            'scheduled_deletion_at' => now()->addDays(30),
        ]);

        return back()->with('status', 'Akun pengguna dinonaktifkan selama 30 hari.');
    }

    public function activate(Request $request, User $user): RedirectResponse
    {
        $this->authorizeLifecycleAction($request, $user);
        $this->validateAdminPassword($request);

        $user->update([
            'is_disabled' => false,
            'disabled_at' => null,
            'scheduled_deletion_at' => null,
        ]);

        return back()->with('status', 'Akun pengguna diaktifkan kembali.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeLifecycleAction($request, $user);
        $this->validateAdminPassword($request);

        $user->delete();

        return back()->with('status', 'Akun pengguna dihapus permanen.');
    }

    private function validateAdminPassword(Request $request): void
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
        ]);
    }

    private function authorizeLifecycleAction(Request $request, User $user): void
    {
        if ($user->isAdmin() || $user->is($request->user())) {
            abort(403, 'Akun admin dan akun sendiri tidak dapat dikelola dari halaman ini.');
        }
    }

    public function toggleCompanyVerification(Request $request, CompanyProfile $company): RedirectResponse
    {
        $validated = $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->update([
                'is_approved' => $validated['is_approved'],
            ]);

            if ($company->user) {
                $company->user->update([
                    'is_verified' => $validated['is_approved'],
                ]);
            }
        });

        $statusMsg = $validated['is_approved'] ? 'Perusahaan berhasil diverifikasi.' : 'Status verifikasi perusahaan dicabut.';

        return back()->with('status', $statusMsg);
    }
}
