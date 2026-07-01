<?php

namespace App\Exceptions;

use Exception;

class DebugException extends Exception
{
    protected $data;

    protected $message;

    protected $code = 501;

    public function __construct($data)
    {
        if (is_object($data) || is_array($data)) {
            $jsonString = json_encode($data);
        }
        else {
            $jsonString = $data;
        }

        $this->message = $jsonString;
    }

    function render()
    {
        return response()->json($this->message, $this->code);
    }

}
