<?php

namespace Tests\Feature\Auth;

use App\Mail\VerifyEmailCodeMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_generates_code_and_redirects_to_verification_prompt(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Kandidat Baru',
            'email' => 'kandidat@profabel.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'pelamar',
        ]);

        $response->assertRedirect(route('verification.notice'));

        $user = User::where('email', 'kandidat@profabel.test')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);
        $this->assertFalse($user->is_verified);
        $this->assertNotNull($user->verification_code);
        $this->assertEquals(6, strlen($user->verification_code));
        $this->assertNotNull($user->verification_code_expires_at);

        Mail::assertSent(VerifyEmailCodeMail::class, function ($mail) use ($user) {
            return $mail->hasTo('kandidat@profabel.test') && $mail->code === $user->verification_code;
        });
    }

    public function test_unverified_user_cannot_access_app_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'pelamar',
            'email_verified_at' => null,
            'is_verified' => false,
            'verification_code' => '123456',
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->actingAs($user)->get('/app/dashboard');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_unverified_company_cannot_access_company_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'perusahaan',
            'email_verified_at' => null,
            'is_verified' => false,
            'verification_code' => '654321',
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->actingAs($user)->get('/company/dashboard');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_invalid_verification_code_is_rejected(): void
    {
        $user = User::factory()->create([
            'role' => 'pelamar',
            'email_verified_at' => null,
            'verification_code' => '123456',
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->actingAs($user)->post('/email/verify-code', [
            'code' => '999999',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_verification_code_is_rejected(): void
    {
        $user = User::factory()->create([
            'role' => 'pelamar',
            'email_verified_at' => null,
            'verification_code' => '123456',
            'verification_code_expires_at' => now()->subMinutes(5),
        ]);

        $response = $this->actingAs($user)->post('/email/verify-code', [
            'code' => '123456',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_valid_code_activates_pelamar_account(): void
    {
        $user = User::factory()->create([
            'role' => 'pelamar',
            'email_verified_at' => null,
            'is_verified' => false,
            'verification_code' => '789123',
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->actingAs($user)->post('/email/verify-code', [
            'code' => '789123',
        ]);

        $response->assertRedirect('/app/dashboard');

        $user->refresh();
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertTrue($user->is_verified);
        $this->assertNull($user->verification_code);
        $this->assertNull($user->verification_code_expires_at);
    }

    public function test_resend_code_generates_new_code_and_sends_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'resend@profabel.test',
            'role' => 'pelamar',
            'email_verified_at' => null,
            'verification_code' => '111111',
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->actingAs($user)->post('/email/resend-code');

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-code-sent');

        $user->refresh();
        $this->assertNotNull($user->verification_code);
        $this->assertEquals(6, strlen($user->verification_code));

        Mail::assertSent(VerifyEmailCodeMail::class, function ($mail) use ($user) {
            return $mail->hasTo('resend@profabel.test') && $mail->code === $user->verification_code;
        });
    }
}
