<?php

namespace App\Exceptions;

use Exception;

class PermissionException extends Exception
{
    protected $message;

    protected $code = 403;

    public function __construct($message = 'You do not have permission to access this resource.')
    {
        $this->message = $message;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }

}
