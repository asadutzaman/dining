<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\BookingController;
use App\Http\Controllers\Api\Mobile\DuesController;
use App\Http\Controllers\Api\Mobile\HomeController;
use App\Http\Controllers\Api\Mobile\NotificationController;
use App\Http\Controllers\Api\Mobile\ProfileController;

/*
|--------------------------------------------------------------------------
| KhaiDai mobile API (v1)
|--------------------------------------------------------------------------
|
| The member-facing surface for the dining app. Separate from routes/web.php,
| which serves the staff admin client: these routes are stateless bearer-token
| endpoints on the "member" guard, and are deliberately NOT behind restrictIp --
| students book from anywhere, not from the counter's network.
|
*/

Route::prefix('mobile/v1')->group(function () {

    /*
    | Public: obtaining a session. Throttled by IP on top of the per-phone limits
    | in MemberAuthService, so a single host cannot sweep numbers.
    */
    Route::prefix('auth')->middleware('throttle:member-auth')->group(function () {
        Route::post('/request-otp', [AuthController::class, 'requestOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    });

    Route::middleware('auth:member')->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/device', [AuthController::class, 'registerDevice']);
        });

        # Home (screen 1a)
        Route::get('/home', [HomeController::class, 'index']);

        # Bookings (screens 1b, 1c, 1d)
        Route::prefix('bookings')->group(function () {
            Route::get('/plan', [BookingController::class, 'plan']);
            Route::get('/usual-week', [BookingController::class, 'usualWeek']);
            Route::get('/upcoming', [BookingController::class, 'upcoming']);
            Route::get('/history', [BookingController::class, 'history']);

            Route::post('/', [BookingController::class, 'book']);
            Route::post('/cancel', [BookingController::class, 'cancel']);
            Route::put('/day', [BookingController::class, 'syncDay']);
            Route::put('/week', [BookingController::class, 'syncWeek']);
        });

        # Dues & payments (screen 1e)
        Route::prefix('dues')->group(function () {
            Route::get('/', [DuesController::class, 'index']);
            Route::get('/charges', [DuesController::class, 'charges']);
        });

        # Profile (screen 1f)
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::patch('/preferences', [ProfileController::class, 'updatePreferences']);
            Route::post('/report-card', [ProfileController::class, 'reportCard']);
        });

        # Notifications (screen 1g)
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
            Route::post('/{id}/read', [NotificationController::class, 'markRead']);
            Route::post('/{id}/dismiss', [NotificationController::class, 'dismiss']);
        });
    });
});
