<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Models\SavedVacancy;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteVacancyController extends Controller
{
    /**
     * Display a listing of user's saved/favorite vacancies.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = $user->favoriteVacancies()
            ->with(['companyProfile', 'accessibilities']);

        // Search by keyword
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('job_type', 'like', "%{$search}%")
                  ->orWhere('work_model', 'like', "%{$search}%")
                  ->orWhereHas('companyProfile', function ($cp) use ($search) {
                      $cp->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        $status = $request->input('status', 'all');
        if ($status === 'active') {
            $query->where('vacancies.status', 'active')
                  ->where(function ($q) {
                      $q->whereNull('deadline')
                        ->orWhere('deadline', '>=', now()->toDateString());
                  });
        } elseif ($status === 'closing_soon') {
            $query->where('vacancies.status', 'active')
                  ->whereNotNull('deadline')
                  ->where('deadline', '>=', now()->toDateString())
                  ->where('deadline', '<=', now()->addDays(7)->toDateString());
        } elseif ($status === 'expired') {
            $query->where(function ($q) {
                $q->where('vacancies.status', '!=', 'active')
                  ->orWhere(function ($sub) {
                      $sub->whereNotNull('deadline')
                          ->where('deadline', '<', now()->toDateString());
                  });
            });
        }

        $favorites = $query->latest('saved_vacancies.created_at')
            ->paginate(9)
            ->withQueryString();

        // Calculate statistics
        $allSaved = $user->favoriteVacancies()->get();
        $today = now()->toDateString();
        $nextWeek = now()->addDays(7)->toDateString();

        $stats = [
            'total' => $allSaved->count(),
            'active' => $allSaved->filter(function ($v) use ($today) {
                return $v->status === 'active' && (!$v->deadline || $v->deadline->format('Y-m-d') >= $today);
            })->count(),
            'closing_soon' => $allSaved->filter(function ($v) use ($today, $nextWeek) {
                if ($v->status !== 'active' || !$v->deadline) return false;
                $dl = $v->deadline->format('Y-m-d');
                return $dl >= $today && $dl <= $nextWeek;
            })->count(),
        ];

        return Inertia::render('app/favorites', [
            'favorites' => $favorites,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Toggle favorite status of a vacancy for authenticated user.
     */
    public function toggle(Request $request, Vacancy $vacancy): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $existing = SavedVacancy::where('user_id', $user->id)
            ->where('vacancy_id', $vacancy->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFavorited = false;
            $message = 'Lowongan berhasil dihapus dari daftar favorit.';
        } else {
            SavedVacancy::create([
                'user_id' => $user->id,
                'vacancy_id' => $vacancy->id,
            ]);
            $isFavorited = true;
            $message = 'Lowongan berhasil disimpan ke favorit!';
        }

        if ($request->wantsJson()) {
            return response()->json([
                'is_favorited' => $isFavorited,
                'message' => $message,
                'vacancy_id' => $vacancy->id,
                'total_favorites' => $user->savedVacancies()->count(),
            ]);
        }

        return back()->with('success', $message);
    }

    /**
     * Remove a vacancy from favorites.
     */
    public function destroy(Request $request, Vacancy $vacancy): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        SavedVacancy::where('user_id', $user->id)
            ->where('vacancy_id', $vacancy->id)
            ->delete();

        $message = 'Lowongan berhasil dihapus dari daftar favorit.';

        if ($request->wantsJson()) {
            return response()->json([
                'is_favorited' => false,
                'message' => $message,
                'vacancy_id' => $vacancy->id,
                'total_favorites' => $user->savedVacancies()->count(),
            ]);
        }

        return back()->with('success', $message);
    }
}
