<?php

namespace App\Exceptions;

use Exception;

class NotFoundException extends Exception
{
    protected $message;

    protected $code = 404;

    public function __construct($message = 'Item not found')
    {
        $this->message = $message;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }

}
