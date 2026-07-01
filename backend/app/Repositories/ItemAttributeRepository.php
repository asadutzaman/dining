<?php

namespace App\Repositories;

use App\Models\ItemAttribute;
use App\Services\ODataService;

class ItemAttributeRepository extends BaseRepository
{
    /**
     * @var ItemAttribute
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['item_id'];

    public function __construct()
    {
        $this->model         = new ItemAttribute();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteItemAttributeByIds($itemId, $itemAttributeIds)
    {
        return $this->newQuery()
            ->where('item_id', $itemId)
            ->whereNotIn('id', $itemAttributeIds)
            ->delete();
    }
}
