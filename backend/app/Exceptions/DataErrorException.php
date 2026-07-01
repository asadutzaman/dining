<?php

namespace App\Exceptions;

use Exception;

class DataErrorException extends Exception
{
    protected $data;

    protected $code = 409;

    public function __construct($data)
    {
        $this->data = $data;
    }

    function render()
    {
        return response()->json($this->data, $this->code);
    }

}
