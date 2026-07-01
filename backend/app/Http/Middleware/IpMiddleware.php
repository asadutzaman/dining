<?php

namespace App\Http\Middleware;

use App\Services\CommonService;
use Closure;

class IpMiddleware
{
    public $whiteIps = ['103.69.149.45', '103.36.100.12', '127.0.0.1'];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $clientIp = CommonService::getClientIp();
        $serverIp = CommonService::getServerIp();
        array_push($this->whiteIps, $serverIp);
        if (!in_array($clientIp, $this->whiteIps)) {
            //return response()->json(["Sorry! You don't have permission to access this application.'"]);
        }

        return $next($request);
    }
}
