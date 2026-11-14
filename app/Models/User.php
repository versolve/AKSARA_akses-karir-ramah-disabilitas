<?php

namespace App\Models;

use App\Concerns\HasTeams;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property int|null $current_team_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Team|null $currentTeam
 * @property-read Collection<int, Team> $ownedTeams
 * @property-read Collection<int, Membership> $teamMemberships
 * @property-read Collection<int, Team> $teams
 */
#[Fillable(['name', 'email', 'avatar', 'password', 'current_team_id', 'role', 'is_verified', 'is_disabled', 'disabled_at', 'scheduled_deletion_at', 'verification_code', 'verification_code_expires_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'verification_code'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasTeams, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verification_code_expires_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'is_disabled' => 'boolean',
            'disabled_at' => 'datetime',
            'scheduled_deletion_at' => 'datetime',
            /* @chisel-2fa */
            'two_factor_confirmed_at' => 'datetime',
            /* @end-chisel-2fa */
        ];
    }

    /**
     * Generate and store a fresh 6-digit verification code.
     */
    public function generateEmailVerificationCode(): string
    {
        $code = sprintf('%06d', random_int(100000, 999999));

        $this->forceFill([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ])->save();

        return $code;
    }

    /**
     * Send the 6-digit email verification code.
     */
    public function sendEmailVerificationCode(): void
    {
        $code = $this->generateEmailVerificationCode();

        try {
            \Illuminate\Support\Facades\Mail::to($this->email)->send(new \App\Mail\VerifyEmailCodeMail($this, $code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email verifikasi ke {$this->email}: " . $e->getMessage());
        }

        \Illuminate\Support\Facades\Log::info("Kode Verifikasi Profabel untuk [{$this->email}]: {$code}");
    }

    /**
     * Override standard Laravel notification to use our 6-digit code email.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->sendEmailVerificationCode();
    }

    /**
     * Verify the supplied 6-digit code.
     */
    public function verifyEmailCode(string $code): bool
    {
        if (empty($this->verification_code) || empty($this->verification_code_expires_at)) {
            return false;
        }

        if (trim($this->verification_code) !== trim($code)) {
            return false;
        }

        if (now()->gt($this->verification_code_expires_at)) {
            return false;
        }

        // Successfully verified
        $this->markEmailAsVerified();

        if ($this->role === 'pelamar') {
            $this->is_verified = true;
        }

        $this->forceFill([
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ])->save();

        return true;
    }

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
        return match ($this->role) {
            'pelamar' => '/app/dashboard',
            'perusahaan' => '/company/dashboard',
            'admin' => '/admin/dashboard',
            default => '/',
        };
    }

    public function jobSeekerProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(JobSeekerProfile::class);
    }

    public function companyProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function accessibilityProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(SeekerAccessibilityProfile::class);
    }

    public function preference(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function savedVacancies(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SavedVacancy::class);
    }

    public function favoriteVacancies(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Vacancy::class, 'saved_vacancies')->withTimestamps();
    }

    public function hasFavorited(int|Vacancy $vacancy): bool
    {
        $vacancyId = $vacancy instanceof Vacancy ? $vacancy->id : $vacancy;
        return $this->savedVacancies()->where('vacancy_id', $vacancyId)->exists();
    }
}
