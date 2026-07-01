<?php

namespace App\Repositories;

use App\Models\UnitMapping;
use App\Services\ODataService;

class UnitMappingRepository extends BaseRepository
{
    /**
     * @var UnitMapping
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new UnitMapping();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteUnitMappingByIds($itemId, $itemUnitMappingIds)
    {
        return $this->newQuery()
            ->where('item_id', $itemId)
            ->whereNotIn('id', $itemUnitMappingIds)
            ->delete();
    }
}
