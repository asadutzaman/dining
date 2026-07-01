<?php

namespace App\Repositories;

use App\Models\Attribute;
use Illuminate\Support\Str;
use App\Services\ODataService;

class AttributeRepository extends BaseRepository
{
    /**
     * @var Attribute
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'description', 'code'];

    public function __construct()
    {
        $this->model         = new Attribute();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkCodeUnique($name, $id = null)
    {
        $code = Str::lower(Str::squish($name));

        return $this->newQuery()
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->firstWhere('code', $code);
    }
}
