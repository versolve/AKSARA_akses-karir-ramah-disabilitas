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
