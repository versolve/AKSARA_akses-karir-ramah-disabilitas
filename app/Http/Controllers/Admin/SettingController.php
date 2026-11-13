<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Path to the persisted settings JSON file.
     */
    protected function getSettingsFilePath(): string
    {
        return storage_path('app/system_settings.json');
    }

    /**
     * Default system settings matching Reference UI.
     */
    protected function getDefaultSettings(): array
    {
        return [
            'app_name' => 'Aksara',
            'app_description' => 'Platform karier inklusif yang menghubungkan talenta disabilitas dengan peluang kerja yang setara bagi semua.',
            'app_version' => 'v1.0.0',
            'operational_year' => '2024',
            'official_email' => 'info@aksara.id',
            'contact_phone' => '+62 21 1234 5678',
            'logo_url' => '/images/logos/logo_biru.svg',
            'favicon_url' => '/favicon.ico',
            'theme_color' => '#1769E0',
            'maintenance_mode' => false,
            'user_registration' => true,
            'email_verification' => true,
            'show_dashboard_stats' => true,
            'languages' => [
                'id' => true,
                'en' => false,
                'ar' => false,
                'ja' => false,
            ],
            'timezone' => 'WIB (GMT+7)',
            'default_location' => 'Indonesia',
            'last_backup_at' => '12 Jun 2024, 08:30',
            'last_backup_status' => 'Berhasil',
            'support_email' => 'support@aksara.id',
            'support_whatsapp' => '+62 812 3456 7890',
            'support_operational_hours' => 'Senin - Jumat, 08:00 - 17:00',
        ];
    }

    /**
     * Retrieve all current system settings.
     */
    protected function getSettings(): array
    {
        $path = $this->getSettingsFilePath();
        $defaults = $this->getDefaultSettings();

        if (! File::exists($path)) {
            $dir = dirname($path);
            if (! File::isDirectory($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            File::put($path, json_encode($defaults, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            return $defaults;
        }

        try {
            $content = File::get($path);
            $saved = json_decode($content, true);
            if (! is_array($saved)) {
                return $defaults;
            }
            return array_replace_recursive($defaults, $saved);
        } catch (\Throwable $e) {
            return $defaults;
        }
    }

    /**
     * Persist system settings.
     */
    protected function saveSettings(array $data): void
    {
        $path = $this->getSettingsFilePath();
        $current = $this->getSettings();
        $merged = array_replace_recursive($current, $data);

        $dir = dirname($path);
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        File::put($path, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /**
     * Display settings page.
     */
    public function index(Request $request): Response
    {
        $settings = $this->getSettings();
        $tab = $request->query('tab', 'system');

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'activeTab' => $tab,
            'mustVerifyEmail' => false,
            'status' => session('status'),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => ['nullable', 'string', 'max:100'],
            'app_description' => ['nullable', 'string', 'max:250'],
            'app_version' => ['nullable', 'string', 'max:30'],
            'operational_year' => ['nullable', 'string', 'max:10'],
            'official_email' => ['nullable', 'email', 'max:150'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'theme_color' => ['nullable', 'string', 'max:30'],
            'maintenance_mode' => ['nullable', 'boolean'],
            'user_registration' => ['nullable', 'boolean'],
            'email_verification' => ['nullable', 'boolean'],
            'show_dashboard_stats' => ['nullable', 'boolean'],
            'languages' => ['nullable', 'array'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'default_location' => ['nullable', 'string', 'max:50'],
            'support_email' => ['nullable', 'email', 'max:150'],
            'support_whatsapp' => ['nullable', 'string', 'max:50'],
            'support_operational_hours' => ['nullable', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg', 'max:2048'],
            'favicon' => ['nullable', 'image', 'mimes:png,jpg,jpeg,ico,svg', 'max:1024'],
        ]);

        $payload = [];
        foreach ($validated as $key => $value) {
            if ($key !== 'logo' && $key !== 'favicon') {
                $payload[$key] = $value;
            }
        }

        // Handle uploaded logo
        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $logoPath = $logo->store('branding', 'public');
            $payload['logo_url'] = Storage::url($logoPath);
        }

        // Handle uploaded favicon
        if ($request->hasFile('favicon')) {
            $favicon = $request->file('favicon');
            $faviconPath = $favicon->store('branding', 'public');
            $payload['favicon_url'] = Storage::url($faviconPath);
        }

        $this->saveSettings($payload);

        return back()->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }

    /**
     * Trigger a mock system backup.
     */
    public function backup(Request $request): RedirectResponse
    {
        $current = $this->getSettings();
        $current['last_backup_at'] = now()->translatedFormat('d M Y, H:i');
        $current['last_backup_status'] = 'Berhasil';

        $this->saveSettings($current);

        return back()->with('success', 'Pencadangan data sistem berhasil diselesaikan.');
    }

    /**
     * Update admin profile directly to stay on admin settings page.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
        ]);

        $user->fill($validated);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        return back()->with('success', 'Profil administrator berhasil diperbarui.');
    }

    /**
     * Update admin password directly to stay on admin settings page.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', \Illuminate\Validation\Rules\Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password akun berhasil diperbarui.');
    }
}
