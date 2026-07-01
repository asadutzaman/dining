<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    public $message;

    public $code;

    function __construct($message = 'Unknown server error, please try again later.', int $code)
    {
        $this->message = $message;
        $this->code = $code;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }
}
