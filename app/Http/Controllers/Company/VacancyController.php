<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VacancyController extends Controller
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
        $vacancies = $company->vacancies()
            ->withCount('applications')
            ->with('accessibilities')
            ->latest()
            ->paginate(10);

        return Inertia::render('company/vacancies/index', [
            'vacancies' => $vacancies,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('company/vacancies/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'job_type' => ['required', 'in:full-time,part-time,contract,internship,freelance'],
            'work_model' => ['required', 'in:onsite,remote,hybrid'],
            'location' => ['required', 'string', 'max:255'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'is_salary_public' => ['boolean'],
            'experience_level' => ['required', 'in:junior,mid,senior,lead'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string'],
            'skills_required' => ['nullable', 'array'],
            'skills_required.*' => ['string'],
            'status' => ['required', 'in:draft,active,closed'],
            'deadline' => ['nullable', 'date'],
            'accessibilities' => ['nullable', 'array'],
            'accessibilities.*.accommodation_type' => ['required', 'string'],
            'accessibilities.*.description' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($company, $validated) {
            $vacancy = $company->vacancies()->create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'job_type' => $validated['job_type'],
                'work_model' => $validated['work_model'],
                'location' => $validated['location'],
                'salary_min' => $validated['salary_min'] ?? null,
                'salary_max' => $validated['salary_max'] ?? null,
                'is_salary_public' => $validated['is_salary_public'] ?? true,
                'experience_level' => $validated['experience_level'],
                'requirements' => $validated['requirements'] ?? [],
                'skills_required' => $validated['skills_required'] ?? [],
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            if (!empty($validated['accessibilities'])) {
                foreach ($validated['accessibilities'] as $acc) {
                    $vacancy->accessibilities()->create([
                        'accommodation_type' => $acc['accommodation_type'],
                        'description' => $acc['description'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('company.vacancies.index')->with('status', 'Lowongan berhasil dipublikasikan.');
    }

    public function edit(Request $request, Vacancy $vacancy): Response
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        return Inertia::render('company/vacancies/edit', [
            'vacancy' => $vacancy->load('accessibilities'),
        ]);
    }

    public function update(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'job_type' => ['required', 'in:full-time,part-time,contract,internship,freelance'],
            'work_model' => ['required', 'in:onsite,remote,hybrid'],
            'location' => ['required', 'string', 'max:255'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'is_salary_public' => ['boolean'],
            'experience_level' => ['required', 'in:junior,mid,senior,lead'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string'],
            'skills_required' => ['nullable', 'array'],
            'skills_required.*' => ['string'],
            'status' => ['required', 'in:draft,active,closed'],
            'deadline' => ['nullable', 'date'],
            'accessibilities' => ['nullable', 'array'],
            'accessibilities.*.accommodation_type' => ['required', 'string'],
            'accessibilities.*.description' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($vacancy, $validated) {
            $vacancy->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'job_type' => $validated['job_type'],
                'work_model' => $validated['work_model'],
                'location' => $validated['location'],
                'salary_min' => $validated['salary_min'] ?? null,
                'salary_max' => $validated['salary_max'] ?? null,
                'is_salary_public' => $validated['is_salary_public'] ?? true,
                'experience_level' => $validated['experience_level'],
                'requirements' => $validated['requirements'] ?? [],
                'skills_required' => $validated['skills_required'] ?? [],
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            if (isset($validated['accessibilities'])) {
                $vacancy->accessibilities()->delete();
                foreach ($validated['accessibilities'] as $acc) {
                    $vacancy->accessibilities()->create([
                        'accommodation_type' => $acc['accommodation_type'],
                        'description' => $acc['description'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('company.vacancies.index')->with('status', 'Lowongan berhasil diperbarui.');
    }

    public function destroy(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $company = $this->getCompanyProfile($request);
        abort_if($vacancy->company_profile_id !== $company->id, 403);

        $vacancy->delete();
        return redirect()->route('company.vacancies.index')->with('status', 'Lowongan berhasil dihapus.');
    }
}
