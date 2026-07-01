<?php

namespace App\Repositories;

use Illuminate\Support\Str;
use App\Models\AttributeValue;
use App\Services\ODataService;

class AttributeValueRepository extends BaseRepository
{
    /**
     * @var AttributeValue
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['value', 'code'];

    public function __construct()
    {
        $this->model         = new AttributeValue();
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

    public function deleteAttributeValueByIds($attributeId, $attributeValueIds)
    {
        return $this->newQuery()
            ->where('attribute_id', $attributeId)
            ->whereNotIn('id', $attributeValueIds)
            ->delete();
    }
}
