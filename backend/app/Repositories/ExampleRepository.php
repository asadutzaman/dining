<?php

namespace App\Repositories;

use App\Models\Example;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;

class ExampleRepository extends BaseRepository
{
    /**
     * @var Example
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model = new Example();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    protected function applyFilters(Builder $query, array $filters = [], $prefix = 'db_prefix'): Builder
    {
        $sessionService = (new SessionService())->init();
        $userId = $sessionService->getUserId();


        $query = parent::applyFilters($query, $filters);

        // Manage own records
        $query->where('created_by', $userId);

        return $query;
    }
}
