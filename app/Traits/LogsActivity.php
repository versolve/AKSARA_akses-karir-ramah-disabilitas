<?php

namespace App\Traits;

use App\Services\Audit\ActivityLogger;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            ActivityLogger::logModelChange($model, 'create', severity: 'info');
        });

        static::updated(function (Model $model) {
            $original = $model->getOriginal();
            $severity = 'info';

            // Jika ada perubahan field penting/sensitif (misal role, status, is_active), naikkan severity ke warning
            $dirty = $model->getDirty();
            if (isset($dirty['role']) || isset($dirty['status']) || isset($dirty['is_active']) || isset($dirty['is_primary'])) {
                $severity = 'warning';
            }

            ActivityLogger::logModelChange($model, 'update', oldAttributes: $original, severity: $severity);
        });

        static::deleted(function (Model $model) {
            $original = $model->getOriginal();
            ActivityLogger::logModelChange($model, 'delete', oldAttributes: $original, severity: 'danger');
        });
    }
}
