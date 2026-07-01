<?php

namespace App\Http\Middleware;

use App\Services\SessionService;
use Closure;

class AuthVerifyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $sessionService = (new SessionService())->init();
        $userToken = $sessionService->getUserToken();
        if ($userToken) {
            return $next($request);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
            // abort(401);
        }
    }
}
