<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Serves the built web admin (a CRA single-page app) from Laravel's document root.
 *
 * The SPA and the API run on the same origin on the counter PC, which is what removes CORS
 * from the picture entirely and stops the admin depending on a hostname that goes stale.
 * Apache serves the hashed assets under /static straight off disk; only paths that match no
 * file and no route reach here, which is exactly the set of client-side routes.
 *
 * These are controller actions rather than closures on purpose: `php artisan route:cache`
 * refuses to cache a route backed by a closure, and with ~1000 routes registered that cache
 * is a real per-request saving under mod_php.
 */
class SpaController extends Controller
{
    /**
     * Catch-all: hand back the SPA shell and let React Router resolve the path.
     */
    public function index(Request $request)
    {
        /*
         * A 404 under /api must stay JSON. routes/api.php is registered before web.php and
         * both prefix /api, so anything under it that reaches the fallback is a genuine
         * unknown endpoint -- returning the HTML shell there would make the SPA's axios error
         * handler report a parse failure instead of the 404 that actually happened.
         */
        if ($request->is('api/*')) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $index = public_path('index.html');

        abort_unless(
            is_file($index),
            404,
            'The web admin has not been built into public/. Run the frontend build and copy build/ here.'
        );

        /*
         * no-store on the shell only. Everything it references under /static is content-hashed
         * and served with a far-future cache, so an upgraded build is picked up on the next
         * page load without anyone having to hard-refresh.
         */
        return response()->file($index, [
            'Cache-Control' => 'no-store, must-revalidate',
        ]);
    }

    /**
     * Kept from the old root route, which the SPA now occupies.
     */
    public function version()
    {
        return 'app-version-' . app()->version();
    }
}
