<?php

namespace App\Repositories\Dining;

use App\Models\Dining\MemberCandidate;
use App\Repositories\BaseRepository;
use App\Services\ODataService;
use Illuminate\Database\Eloquent\Builder;

class MemberCandidateRepository extends BaseRepository
{
    /**
    * @var MemberCandidate
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'staff_id', 'roll_no'];

    public function __construct()
    {
        $this->model = new MemberCandidate();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function listQuery(): Builder
    {
        $query = parent::listQuery();

        return $query->whereDoesntHave('importedMember');
    }
}
