<?php

namespace App\Services\Audit;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class ActivityLogger
{
    /**
     * Daftar field sensitif yang wajib disamarkan (masked) demi keamanan & privasi.
     */
    protected static array $sensitiveFields = [
        'password',
        'password_confirmation',
        'admin_password',
        'api_key',
        'secret',
        'token',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'verification_code',
        'cvv',
        'card_number',
    ];

    /**
     * Catat aktivitas audit secara umum.
     */
    public static function log(
        string $action,
        string $module,
        string $description,
        ?Model $subject = null,
        array $old = [],
        array $new = [],
        string $severity = 'info',
        array $extra = []
    ): ?ActivityLog {
        try {
            /** @var User|null $actor */
            $actor = Auth::user();

            $ip = request()?->ip() ?? '127.0.0.1';
            $userAgent = request()?->userAgent();
            $browser = self::parseUserAgent($userAgent);
            $url = request()?->fullUrl();
            $method = request()?->method() ?? 'POST';

            $maskedOld = self::maskSensitiveFields($old);
            $maskedNew = self::maskSensitiveFields($new);
            $diff = self::computeDiff($maskedOld, $maskedNew);

            $properties = [
                'old' => !empty($maskedOld) ? $maskedOld : null,
                'new' => !empty($maskedNew) ? $maskedNew : null,
                'diff' => !empty($diff) ? $diff : null,
                'extra' => !empty($extra) ? self::maskSensitiveFields($extra) : null,
            ];

            // Bersihkan properties yang null
            $properties = array_filter($properties, fn ($v) => !is_null($v));

            $subjectLabel = null;
            if ($subject) {
                $subjectLabel = self::resolveSubjectLabel($subject);
            }

            return ActivityLog::create([
                'user_id' => $actor?->id,
                'actor_name' => $actor?->name ?? 'Sistem Otomatis',
                'actor_email' => $actor?->email,
                'actor_role' => $actor?->role ?? 'system',
                'action' => $action,
                'module' => $module,
                'module_label' => self::resolveModuleLabel($module),
                'description' => $description,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id' => $subject?->getKey(),
                'subject_label' => $subjectLabel,
                'properties' => !empty($properties) ? $properties : null,
                'severity' => in_array($severity, ['info', 'warning', 'danger'], true) ? $severity : 'info',
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'browser' => $browser,
                'method' => $method,
                'url' => $url,
            ]);
        } catch (Throwable $e) {
            Log::error('ActivityLogger failed to record log: ' . $e->getMessage(), [
                'action' => $action,
                'module' => $module,
            ]);
            return null;
        }
    }

    public static function info(string $action, string $module, string $description, ?Model $subject = null, array $old = [], array $new = [], array $extra = []): ?ActivityLog
    {
        return self::log($action, $module, $description, $subject, $old, $new, 'info', $extra);
    }

    public static function warning(string $action, string $module, string $description, ?Model $subject = null, array $old = [], array $new = [], array $extra = []): ?ActivityLog
    {
        return self::log($action, $module, $description, $subject, $old, $new, 'warning', $extra);
    }

    public static function danger(string $action, string $module, string $description, ?Model $subject = null, array $old = [], array $new = [], array $extra = []): ?ActivityLog
    {
        return self::log($action, $module, $description, $subject, $old, $new, 'danger', $extra);
    }

    /**
     * Catat perubahan model Eloquent otomatis (mendukung old vs new diff).
     */
    public static function logModelChange(
        Model $model,
        string $action,
        ?string $description = null,
        array $oldAttributes = [],
        string $severity = 'info'
    ): ?ActivityLog {
        $module = self::guessModuleFromModel($model);
        $subjectLabel = self::resolveSubjectLabel($model);

        if (!$description) {
            $actionLabel = match ($action) {
                'create' => 'membuat',
                'update' => 'memperbarui',
                'delete' => 'menghapus',
                'restore' => 'memulihkan',
                default => $action,
            };
            $actor = Auth::user()?->name ?? 'Sistem';
            $description = "{$actor} {$actionLabel} " . class_basename($model) . " (#{$model->getKey()})";
        }

        $newAttributes = $action === 'delete' ? [] : $model->getAttributes();

        return self::log(
            action: $action,
            module: $module,
            description: $description,
            subject: $model,
            old: $oldAttributes,
            new: $newAttributes,
            severity: $severity
        );
    }

    /**
     * Samarkan field sensitif (password, secret, token, api_key).
     */
    public static function maskSensitiveFields(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $lowerKey = strtolower((string) $key);
            $isSensitive = false;

            foreach (self::$sensitiveFields as $sensitive) {
                if (str_contains($lowerKey, $sensitive)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $result[$key] = '•••••••• (Dirahasiakan)';
            } elseif (is_array($value)) {
                $result[$key] = self::maskSensitiveFields($value);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    /**
     * Hitung perbedaan (diff) antara state lama dan baru.
     */
    public static function computeDiff(array $old, array $new): array
    {
        $diff = [];
        $allKeys = array_unique(array_merge(array_keys($old), array_keys($new)));

        foreach ($allKeys as $key) {
            $oldVal = $old[$key] ?? null;
            $newVal = $new[$key] ?? null;

            // Jangan masukkan jika nilainya sama persis atau hanya beda tipe null/string kosong yang identik
            if ($oldVal === $newVal) {
                continue;
            }

            // Abaikan kolom timestamp created_at / updated_at jika tidak relevan
            if (in_array($key, ['updated_at', 'created_at', 'remember_token'], true)) {
                continue;
            }

            $diff[$key] = [
                'old' => $oldVal,
                'new' => $newVal,
            ];
        }

        return $diff;
    }

    /**
     * Ekstrak nama browser & OS yang manusiawi dari User Agent string.
     */
    public static function parseUserAgent(?string $ua): string
    {
        if (empty($ua)) {
            return 'Internal CLI / API';
        }

        $os = 'Unknown OS';
        if (stripos($ua, 'windows nt 10') !== false || stripos($ua, 'windows nt 11') !== false) {
            $os = 'Windows 11/10';
        } elseif (stripos($ua, 'windows') !== false) {
            $os = 'Windows';
        } elseif (stripos($ua, 'macintosh') !== false || stripos($ua, 'mac os x') !== false) {
            $os = 'macOS';
        } elseif (stripos($ua, 'android') !== false) {
            $os = 'Android';
        } elseif (stripos($ua, 'iphone') !== false || stripos($ua, 'ipad') !== false) {
            $os = 'iOS';
        } elseif (stripos($ua, 'linux') !== false) {
            $os = 'Linux';
        }

        $browser = 'Unknown Browser';
        if (stripos($ua, 'edg') !== false) {
            $browser = 'Microsoft Edge';
        } elseif (stripos($ua, 'chrome') !== false && stripos($ua, 'chromium') === false) {
            $browser = 'Google Chrome';
        } elseif (stripos($ua, 'firefox') !== false) {
            $browser = 'Mozilla Firefox';
        } elseif (stripos($ua, 'safari') !== false && stripos($ua, 'chrome') === false) {
            $browser = 'Apple Safari';
        } elseif (stripos($ua, 'opera') !== false || stripos($ua, 'opr') !== false) {
            $browser = 'Opera';
        }

        return "{$browser} on {$os}";
    }

    /**
     * Menghasilkan label modul yang mudah dibaca.
     */
    public static function resolveModuleLabel(string $module): string
    {
        return match ($module) {
            'users' => 'Kelola Pengguna',
            'companies' => 'Verifikasi Perusahaan',
            'vacancies' => 'Kelola Lowongan',
            'applications' => 'Lamaran Kerja',
            'ai_engine' => 'AI Management',
            'settings' => 'Pengaturan Sistem',
            'messages' => 'Pesan & Pengumuman',
            'auth' => 'Autentikasi & Keamanan',
            'reports' => 'Business Intelligence',
            default => ucfirst(str_replace('_', ' ', $module)),
        };
    }

    /**
     * Menghasilkan label subjek yang mudah dipahami (misal: nama lowongan, nama pengguna).
     */
    protected static function resolveSubjectLabel(Model $subject): string
    {
        $base = class_basename($subject);

        if (isset($subject->title)) {
            return "{$base}: {$subject->title}";
        }
        if (isset($subject->name)) {
            return "{$base}: {$subject->name}";
        }
        if (isset($subject->email)) {
            return "{$base}: {$subject->email}";
        }

        return "{$base} #{$subject->getKey()}";
    }

    /**
     * Menebak modul dari nama class Model.
     */
    protected static function guessModuleFromModel(Model $model): string
    {
        $class = class_basename($model);

        return match ($class) {
            'User' => 'users',
            'CompanyProfile', 'CompanyReport' => 'companies',
            'Vacancy', 'VacancyAccessibility' => 'vacancies',
            'Application' => 'applications',
            'AiApiConfig', 'AiApiLog' => 'ai_engine',
            'Message' => 'messages',
            default => 'system',
        };
    }
}
