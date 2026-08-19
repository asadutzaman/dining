<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            /*
             * Resolved against the "member" guard explicitly, never the default.
             * routes/api.php serves the mobile app, so the member is the right
             * subject to limit -- and the default guard ("token") declares an
             * access_token driver that no provider registers, so resolving it
             * throws before the request reaches a controller.
             */
            return Limit::perMinute(60)->by($request->user('member')?->id ?: $request->ip());
        });

        /*
         * Sign-in endpoints. Keyed by IP only -- there is no authenticated user
         * yet, and the bare throttle:20,1 middleware cannot be used here because
         * it resolves $request->user() on the default guard, which throws.
         */
        RateLimiter::for('member-auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });
    }
}
