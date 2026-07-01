<?php

namespace App\Http\Controllers;

use App\Services\SessionService;

class SessionController extends Controller
{
    public function getSessionServiceData()
    {
        $sessionService = (new SessionService())->init();
        return $sessionService->getSessionData();
    }

}
