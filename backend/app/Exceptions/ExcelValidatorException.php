<?php

namespace App\Exceptions;

use Exception;

class ExcelValidatorException extends Exception
{
    /**
     * @var $exception
     */

    private $exception;

    public $code = 412;

    public function __construct($exception)
    {
        $this->exception = $exception;
    }

    function render()
    {
        // foreach ($this->exception as $failure) {
        //     $failure->row(); // row that went wrong
        //     $failure->attribute(); // either heading key (if using heading row concern) or column index
        //     $failure->errors(); // Actual error messages from Laravel validator
        //     $failure->values(); // The values of the row that has failed.
        // }
        return response()->json($this->exception, $this->code);
    }
}
