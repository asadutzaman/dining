<?php

namespace App\Exceptions;

use Exception;

class MethodNotAllowedException extends Exception
{
    protected $message;

    protected $code = 405;

    public function __construct($message = 'Method not allowed')
    {
        $this->message = $message;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }

}
