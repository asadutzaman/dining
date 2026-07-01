<?php

namespace App\Repositories;

use App\Models\GoodsReceiveNote;
use App\Services\ODataService;

class GoodsReceiveNoteRepository extends BaseRepository
{
    /**
     * @var GoodsReceiveNote
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['grn_number', 'branch_id', 'status'];

    public function __construct()
    {
        $this->model         = new GoodsReceiveNote();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // CHECK GRN NUMBER UNIQUE
    public function checkGrnNumberUnique($grnNumber, $id = null)
    {
        return $this->newQuery()
            ->where('grn_number', $grnNumber)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }
}
