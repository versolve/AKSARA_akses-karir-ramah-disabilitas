<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CompanyProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationReviewController extends Controller
{
    private function getCompanyProfile(Request $request): CompanyProfile
    {
        $company = $request->user()->companyProfile;
        if (!$company) {
            $company = CompanyProfile::create([
                'user_id' => $request->user()->id,
                'company_name' => $request->user()->name,
                'address' => 'Belum diisi',
            ]);
        }
        return $company;
    }

    public function index(Request $request): Response
    {
        $company = $this->getCompanyProfile($request);

        $applications = Application::whereHas('vacancy', function ($q) use ($company) {
            $q->where('company_profile_id', $company->id);
        })
        ->with(['jobSeekerProfile.user', 'jobSeekerProfile.user.accessibilityProfile', 'vacancy'])
        ->latest('applied_at')
        ->paginate(15);

        return Inertia::render('company/applications/index', [
            'applications' => $applications,
        ]);
    }

    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($application->vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,reviewed,interview,rejected,hired,withdrawn'],
            'status_notes' => ['nullable', 'string'],
        ]);

        $application->update($validated);

        return back()->with('status', 'Status lamaran berhasil diperbarui.');
    }
}
