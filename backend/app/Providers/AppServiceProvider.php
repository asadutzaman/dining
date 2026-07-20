<?php

namespace App\Providers;

use App\Interfaces\SmsGatewayInterface;
use App\Services\Sms\HttpSmsGateway;
use App\Services\Sms\LogSmsGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Driver chosen by config so member OTP login works in development
        // (log driver) without an SMS provider account.
        $this->app->bind(SmsGatewayInterface::class, function () {
            return config('sms.driver') === 'http'
                ? new HttpSmsGateway()
                : new LogSmsGateway();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
