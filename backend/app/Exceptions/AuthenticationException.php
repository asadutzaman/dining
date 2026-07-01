<?php

namespace App\Exceptions;

use Exception;

class AuthenticationException extends Exception
{
    protected $message;

    protected $code = 401;

    public function __construct($message = 'Login details not valid')
    {
        $this->message = $message;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }

}
