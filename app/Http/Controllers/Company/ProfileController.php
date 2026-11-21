<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $company = $user->companyProfile()->firstOrNew(['user_id' => $user->id]);

        $companyName = $company->company_name ?: ($user->name ?? 'PT Profabel Karya Indonesia');
        $industry = $company->industry ?: 'Teknologi Informasi';
        $description = $company->description ?: 'Profabel adalah platform rekrutmen inklusif yang menghubungkan perusahaan dengan talenta terbaik, termasuk penyandang disabilitas, untuk menciptakan lingkungan kerja yang setara dan berdaya.';
        $location = $company->location ?: 'Jakarta Selatan, DKI Jakarta';
        $address = $company->address ?: 'Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan, DKI Jakarta 12430';
        $website = $company->website ?: 'https://www.profabel.co.id';
        $workplaceAccessibility = $company->workplace_accessibility ?: 'Tersedia akses kursi roda, lift, toilet ramah disabilitas, area kerja yang dapat diakses, serta dukungan teknologi bantu sesuai kebutuhan individu.';
        $companySize = $company->company_size ?: '51 – 200 karyawan';
        $foundedYear = $company->founded_year ?: '2020';
        $companyType = $company->company_type ?: 'Perseroan Terbatas (PT)';

        return Inertia::render('company/profile', [
            'company' => [
                'id' => $company->id,
                'company_name' => $companyName,
                'industry' => $industry,
                'description' => $description,
                'location' => $location,
                'address' => $address,
                'website' => $website,
                'workplace_accessibility' => $workplaceAccessibility,
                'company_size' => $companySize,
                'founded_year' => $foundedYear,
                'company_type' => $companyType,
                'logo_url' => $company->logo_path ? Storage::url($company->logo_path) : null,
                'is_approved' => (bool) ($company->is_approved ?? false),
            ],
            'industryOptions' => [
                'Teknologi Informasi',
                'Keuangan & Perbankan',
                'Kesehatan & Farmasi',
                'Pendidikan',
                'Manufaktur',
                'Retail & E-commerce',
                'Logistik & Transportasi',
                'Kreatif & Media',
                'Lainnya',
            ],
            'companySizeOptions' => [
                '< 50 karyawan',
                '51 – 200 karyawan',
                '201 – 500 karyawan',
                '501 – 1000 karyawan',
                '> 1000 karyawan',
            ],
            'companyTypeOptions' => [
                'Perseroan Terbatas (PT)',
                'Commanditaire Vennootschap (CV)',
                'Badan Usaha Milik Negara (BUMN)',
                'Startup',
                'Yayasan / Lembaga Swadaya Masyarakat (NGO)',
                'Pemerintah / Institusi Publik',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'industry' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'location' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'string', 'max:255'],
            'workplace_accessibility' => ['nullable', 'string', 'max:1000'],
            'company_size' => ['nullable', 'string', 'max:100'],
            'founded_year' => ['nullable', 'string', 'max:10'],
            'company_type' => ['nullable', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:2048'],
        ]);

        $company = $request->user()->companyProfile()->firstOrNew(['user_id' => $request->user()->id]);

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('company_logos', 'public');
            $request->user()->update([
                'avatar' => '/storage/' . $validated['logo_path'],
            ]);
        }

        unset($validated['logo']);

        $company->fill($validated);
        $company->save();

        return back()->with('status', 'Profil perusahaan berhasil disimpan.');
    }
}
