<?php

namespace App\Http\Resources;

class GovtHolidayResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // try {
        //     $baseData = parent::toArray($request);

        //     $includesData = [];
        //     $data = [
        //         'id'              => $this->id,
        //         'day'             => $this->day,
        //         'month'           => $this->month,
        //         'year'            => $this->year,
        //         'date'            => $this->date,
        //         'holiday_type'    => $this->holiday_type,
        //         'created_by_name' => $baseData['created_by_name'],
        //         'updated_by_name' => $baseData['updated_by_name'],
        //     ];
        //     return array_merge($data, $includesData);
        // } catch (\Exception $e) {
        //     return parent::toArray($request);
        // }

        return parent::toArray($request);
    }
}
