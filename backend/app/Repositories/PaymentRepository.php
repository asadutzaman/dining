<?php

namespace App\Repositories;

use App\Models\Payment;
use App\Services\ODataService;

class PaymentRepository extends BaseRepository
{
    /**
    * @var Payment
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['payment_number', 'remarks'];

    public function __construct()
    {
        $this->model = new Payment();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
