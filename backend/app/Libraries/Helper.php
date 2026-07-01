<?php

use App\Traits\Controller\Functions\TraitRestResponse;
use Carbon\Carbon;

class Helper
{
    use TraitRestResponse;

    public function checkStatusAndRespond($request, $field, $currentStatus, $message)
    {
        if ($request->filled($field) && in_array($currentStatus, [1, 2])) {
            return $this->errorResponse($message);
        }
    }

    public function getFiscalYearRange(?string $financialYear = null): array
    {
        if (empty($financialYear)) {
            $now = Carbon::now('Asia/Dhaka');
            $startYear = $now->month >= 7 ? $now->year : $now->year - 1;
            $endYear   = $startYear + 1;
        } else {
            $parts = explode('-', $financialYear);
            if (count($parts) < 2) {
                throw new \InvalidArgumentException('Invalid financial year format');
            }
            $startYear = (int) trim($parts[0]);
            $endYear   = (int) trim($parts[1]);
            if ($startYear <= 0 || $endYear <= 0) {
                throw new \InvalidArgumentException('Invalid financial year values');
            }
        }

        return [
            'start_date' => Carbon::createFromDate($startYear, 7, 1)->startOfDay()->toDateTimeString(),
            'end_date'   => Carbon::createFromDate($endYear, 6, 30)->endOfDay()->toDateTimeString(),
        ];
    }
}
