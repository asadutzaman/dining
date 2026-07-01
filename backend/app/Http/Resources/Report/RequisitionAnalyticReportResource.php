<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;
use Carbon\Carbon;

class RequisitionAnalyticReportResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // $defaultData = [];
        $baseData = parent::toArray($request);

        $data = [
            'id'                     => $this->id,
            'requisition_number'     => $this->requisition_number . '-' . $this->subject,
            'logistic_name'          => $this->logistic->name ?? '',
            'branch_name'            => $this->branch->name ?? '',
            'process_status'         => $this->process_status,
            'request_by_name'        => $this->createdBy->name ?? '',
            'created_at'             => $baseData['created_at'],
            // Delay count will be disbursed date (if disbursed) / now (if not disbursed)
            'delay_days'             => ceil(Carbon::parse($this->created_at)->diffInDays(Carbon::now())), // Delay count will be disbursed date (if disbursed) / now (if not disbursed)
        ];

        $includesData = [];
        return array_merge($data, $includesData);
    }
}
