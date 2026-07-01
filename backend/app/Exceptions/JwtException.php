<?php

namespace App\Exceptions;

use Exception;

class JwtException extends Exception
{
    protected $message;

    protected $code = 401;

    public function __construct($message = 'Token is invalid!')
    {
        $this->message = $message;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }
}
