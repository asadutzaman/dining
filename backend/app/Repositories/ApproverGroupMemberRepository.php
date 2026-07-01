<?php

namespace App\Repositories;

use App\Models\ApproverGroupMember;
use App\Services\ODataService;

class ApproverGroupMemberRepository extends BaseRepository
{
    /**
     * @var ApproverGroupMember
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['approver_group_id', 'user_id', 'approver_type'];

    public function __construct()
    {
        $this->model         = new ApproverGroupMember();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteApproverGroupMemberByIds($approverGroupId, $approverGroupMemberIds)
    {
        return $this->newQuery()
            ->where('approver_group_id', $approverGroupId)
            ->whereNotIn('id', $approverGroupMemberIds)
            ->delete();
    }

    public function approverGroupMemberList($approverGroupId = null)
    {
        return $this->newQuery()
            ->with([
                'userInfo:id,name,email,designation_id',
                'userInfo.designation:id,title'
            ])
            ->when(isset($approverGroupId), function ($query) use ($approverGroupId) {
                $query->where('approver_group_id', $approverGroupId);
            })
            ->get();
    }

    public function getApproverGroupMemberIds($approverGroupId)
    {
        return $this->newQuery()
            ->where('approver_group_id', $approverGroupId)
            ->pluck('id')
            ->toArray();
    }

    public function getApproverGroupMemberUserIds($approverGroupId)
    {
        return $this->newQuery()
            ->where('approver_group_id', $approverGroupId)
            ->pluck('user_id')
            ->toArray();
    }
    public function getUserIdsByMemberIds($memberIds)
    {
        return $this->newQuery()
            ->whereIn('id', $memberIds)
            ->pluck('user_id')
            ->toArray();
    }
}
