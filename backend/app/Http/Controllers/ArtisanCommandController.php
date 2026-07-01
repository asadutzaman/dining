<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class ArtisanCommandController extends Controller
{
    public function schedule()
    {
        Artisan::call('schedule:run');
    }

    public function flushAllCache()
    {
        Cache::flush();
    }
}
