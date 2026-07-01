<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;


class ItemRequisitionStatusReportResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'branch_id'      => $this->branch_id,
            'branch_name'    => $this->branchInfo->name ?? '',
            'total_count'    => (int) $this->total_count,
            'pending_count'  => (int) $this->pending_count,
            'approved_count' => (int) $this->approved_count,
            'rejected_count' => (int) $this->rejected_count,
            'delayed_count'  => (int) $this->delayed_count,
        ];
    }
}
