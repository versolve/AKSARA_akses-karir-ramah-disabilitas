<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
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
        $query = User::with(['companyProfile', 'jobSeekerProfile']);

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
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
