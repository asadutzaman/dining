<?php

namespace App\Repositories;

use Illuminate\Support\Str;
use App\Models\ItemCategory;
use App\Services\ODataService;

class ItemCategoryRepository extends BaseRepository
{
    /**
     * @var ItemCategory
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'code', 'description'];

    public function __construct()
    {
        $this->model         = new ItemCategory();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkCodeUnique($name, $id = null)
    {
        $code = Str::lower(Str::replace(' ', '', Str::squish($name)));

        return $this->newQuery()
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->firstWhere('code', $code);
    }
}
