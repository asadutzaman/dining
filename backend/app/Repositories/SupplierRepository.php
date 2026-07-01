<?php

namespace App\Repositories;

use App\Models\Supplier;
use App\Services\ODataService;

class SupplierRepository extends BaseRepository
{
    /**
     * @var Supplier
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['supplier_name', 'supplier_no', 'phone', 'email', 'address'];

    public function __construct()
    {
        $this->model         = new Supplier();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // CHECK SUPPLIER NO UNIQUE
    public function checkSupplierNoUnique($supplierNo, $id = null)
    {
        return $this->newQuery()
            ->where('supplier_no', $supplierNo)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }
}
