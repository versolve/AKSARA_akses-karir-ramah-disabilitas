<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->hasVerifiedEmail()) {
            // Allow email verification routes and logout
            if ($request->routeIs('verification.*') || 
                $request->routeIs('logout') || 
                $request->is('email/*') || 
                $request->is('logout')) {
                return $next($request);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Alamat email Anda belum diverifikasi. Silakan masukkan kode verifikasi.',
                ], 403);
            }

            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
