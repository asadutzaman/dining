<?php

namespace App\Repositories\Dining;

use App\Models\Dining\Member;
use App\Repositories\BaseRepository;
use App\Services\ODataService;

class MemberRepository extends BaseRepository
{
    /**
    * @var Member
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['member_code', 'rfid_card_number', 'name', 'phone', 'email', 'roll_no'];

    public function __construct()
    {
        $this->model = new Member();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkMemberCodeUnique($memberCode, $id = null)
    {
        return $this->newQuery()
            ->where('member_code', $memberCode)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }

    public function findByRfidCardNumber($rfidCardNumber)
    {
        return $this->newQuery()
            ->where('rfid_card_number', $rfidCardNumber)
            ->where('status', 1)
            ->first();
    }

    public function incrementDueBalance($memberId, $amount)
    {
        return $this->newQuery()
            ->where('id', $memberId)
            ->increment('due_balance', $amount);
    }

    public function decrementDueBalance($memberId, $amount)
    {
        return $this->newQuery()
            ->where('id', $memberId)
            ->decrement('due_balance', $amount);
    }
}
