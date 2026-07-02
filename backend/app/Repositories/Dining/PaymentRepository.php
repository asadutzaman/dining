<?php

namespace App\Repositories\Dining;

use App\Models\Dining\Payment;
use App\Repositories\BaseRepository;
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
