<?php

namespace App\Services;

use Illuminate\Support\Carbon;

class DateTimeService
{
    public static function getMonthFirstDay($timestamp)
    {
        $year = self::getYear($timestamp);
        $month = self::getMonth($timestamp);
        return date('Y-m-01', strtotime($year .'-' . $month . '-01'));
    }

    public static function getMonthLastDay($timestamp)
    {
        $year = self::getYear($timestamp);
        $month = self::getMonth($timestamp);
        return date('Y-m-t', strtotime($year .'-' . $month . '-01'));
    }

    public static function addDays($timestamp, $days) {
        return Carbon::parse($timestamp)->addDays($days);
    }

    public static function subDays($timestamp, $days) {
        return Carbon::parse($timestamp)->subDays($days);
    }

    public static function getYear($timestamp) {
        return Carbon::parse($timestamp)->year;
    }

    public static function getMonth($timestamp) {
        return Carbon::parse($timestamp)->month;
    }

    public static function getDay($timestamp) {
        return Carbon::parse($timestamp)->day;
    }

    public static function getHour($timestamp) {
        return Carbon::parse($timestamp)->hour;
    }

    public static function getMinute($timestamp) {
        return Carbon::parse($timestamp)->minute;
    }

    public static function getSecond($timestamp) {
        return Carbon::parse($timestamp)->second;
    }

    public static function diffInYears($startTimestamp, $endTimestamp)
    {
        $start = Carbon::parse($startTimestamp);
        $end = Carbon::parse($endTimestamp);
        return $start->diffInYears($end);
    }

    public static function diffInMonths($startTimestamp, $endTimestamp)
    {
        $start = Carbon::parse($startTimestamp);
        $end = Carbon::parse($endTimestamp);
        return $start->diffInMonths($end);
    }

    public static function diffInDays($startTimestamp, $endTimestamp)
    {
        $start = Carbon::parse($startTimestamp);
        $end = Carbon::parse($endTimestamp);
        return $start->diffInDays($end);
    }

    public static function diffInHours($startTimestamp, $endTimestamp)
    {
        $start = Carbon::parse($startTimestamp);
        $end = Carbon::parse($endTimestamp);
        return $start->diffInHours($end);
    }

    public static function diffInMinutes($startTimestamp, $endTimestamp)
    {
        $start = Carbon::parse($startTimestamp);
        $end = Carbon::parse($endTimestamp);
        return $start->diffInMinutes($end);
    }

    public static function getDate($timestamp)
    {
        return Carbon::parse($timestamp)->format('Y-m-d');
    }

    public static function getDateTime($timestamp){
        return Carbon::parse($timestamp)->toDateTimeString();
    }

    public static function getCurrentDate()
    {
        return Carbon::now()->format('Y-m-d');
    }

    public static function getCurrentDateTime()
    {
        return Carbon::now()->toDateTimeString();
    }

    public static function getLastNthMonthList($number)
    {
        $monthList = [];
        for ($i = 0; $i < $number; $i++) {
            $month = date('m', strtotime("-$i month"));
            $monthName = date('M', strtotime("-$i month"));
            $year = date('Y', strtotime("-$i month"));

            $monthList[] = [
                'month' => $month,
                'month_name' => $monthName,
                'month_start_date' => self::getMonthFirstDay($year . '-' . $month . '-01'),
                'month_end_date' => self::getMonthLastDay($year . '-' . $month . '-01'),
                'year' => $year,

            ];
        }
        return $monthList;
    }

}
