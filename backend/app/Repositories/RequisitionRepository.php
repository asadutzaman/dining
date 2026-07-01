<?php

namespace App\Repositories;

use App\Models\Requisition;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;

class RequisitionRepository extends BaseRepository
{
    /**
     * @var Requisition
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['subject', 'description'];

    public function __construct()
    {
        $this->model         = new Requisition();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // CHECK REQUISITION NUMBER UNIQUE
    public function checkReqNumberUnique($requisitionNumber, $id = null)
    {
        return $this->newQuery()
            ->where('requisition_number', $requisitionNumber)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }

    protected function applyFilters(Builder $query, array $filters = []): Builder
    {
        $sessionService = (new SessionService())->init();
        $query = parent::applyFilters($query, $filters);
        // Manage own records
        $userId = $sessionService->getUserId();
        $query->where('created_by', $userId);

        return $query;
    }
}
