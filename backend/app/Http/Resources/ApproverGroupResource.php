<?php

namespace App\Http\Resources;

use App\Repositories\ApproverGroupMemberRepository;

class ApproverGroupResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $baseData = parent::toArray($request);
        $data = [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description
        ];

        if (!$this->isCollection) {
            $data['approverGroupMemberListData'] = (new ApproverGroupMemberRepository())
                ->newQuery()
                ->with(['userInfo:id,name'])
                ->where('approver_group_id', $this->id)
                ->get();

            foreach ($data['approverGroupMemberListData'] as $key => $member) {
                $member->user_name = $member->userInfo->name ?? null;
            }
        }
        return array_merge($data, $baseData);
    }
}
