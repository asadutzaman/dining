<?php

namespace App\Repositories\Dining;

use App\Models\Dining\MealBooking;
use App\Repositories\BaseRepository;
use App\Services\ODataService;

class MealBookingRepository extends BaseRepository
{
    /**
    * @var MealBooking
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['meal_type', 'booking_status'];

    public function __construct()
    {
        $this->model = new MealBooking();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function findFor($memberId, $mealDate, $mealType)
    {
        return $this->newQuery()
            ->where('member_id', $memberId)
            ->where('meal_date', $mealDate)
            ->where('meal_type', $mealType)
            ->first();
    }

    /**
     * Every booking row a member has in a date range, keyed "Y-m-d|MEAL_TYPE" so
     * callers can build a grid without an N+1 lookup per cell.
     */
    public function keyedForRange($memberId, $from, $to): array
    {
        return $this->newQuery()
            ->where('member_id', $memberId)
            ->whereBetween('meal_date', [$from, $to])
            ->get()
            ->keyBy(function ($booking) {
                return $booking->meal_date->format('Y-m-d') . '|' . $booking->meal_type;
            })
            ->all();
    }

    /**
     * Live bookings from today forward -- the "Upcoming" tab.
     */
    public function upcomingFor($memberId, $fromDate)
    {
        return $this->newQuery()
            ->where('member_id', $memberId)
            ->where('meal_date', '>=', $fromDate)
            ->where('booking_status', MealBooking::STATUS_BOOKED)
            ->orderBy('meal_date')
            ->orderBy('meal_type')
            ->get();
    }

    /**
     * Everything already resolved -- consumed, missed or cancelled: the "Past" tab.
     */
    public function historyFor($memberId, $from, $to)
    {
        return $this->newQuery()
            ->with('mealToken')
            ->where('member_id', $memberId)
            ->whereBetween('meal_date', [$from, $to])
            ->whereIn('booking_status', [
                MealBooking::STATUS_CONSUMED,
                MealBooking::STATUS_MISSED,
                MealBooking::STATUS_CANCELLED,
            ])
            ->orderBy('meal_date', 'desc')
            ->orderBy('meal_type')
            ->get();
    }

    /**
     * Charges posted in a period, for the dues statement.
     */
    public function chargedBetween($memberId, $from, $to)
    {
        return $this->newQuery()
            ->where('member_id', $memberId)
            ->whereBetween('meal_date', [$from, $to])
            ->where('charge_status', MealBooking::CHARGE_CHARGED)
            ->get();
    }

    /**
     * Kitchen counts for a service date: how many of each meal are booked.
     */
    public function countsForDate($mealDate): array
    {
        return $this->newQuery()
            ->selectRaw('meal_type, count(*) as total')
            ->where('meal_date', $mealDate)
            ->where('booking_status', MealBooking::STATUS_BOOKED)
            ->groupBy('meal_type')
            ->pluck('total', 'meal_type')
            ->all();
    }

    /**
     * Bookings whose meal has come and gone without a card scan. The nightly
     * settlement sweep charges these as no-shows.
     */
    public function unsettledBefore($mealDate)
    {
        return $this->newQuery()
            ->where('meal_date', '<=', $mealDate)
            ->where('booking_status', MealBooking::STATUS_BOOKED)
            ->where('charge_status', MealBooking::CHARGE_PENDING)
            ->orderBy('meal_date')
            ->get();
    }

    /**
     * How often a member booked each weekday/meal over a recent window. Backs
     * "Repeat my usual week" -- their habit, not a hardcoded default.
     */
    public function habitCounts($memberId, $from, $to): array
    {
        return $this->newQuery()
            ->select('meal_date', 'meal_type')
            ->where('member_id', $memberId)
            ->whereBetween('meal_date', [$from, $to])
            ->whereIn('booking_status', [
                MealBooking::STATUS_BOOKED,
                MealBooking::STATUS_CONSUMED,
                MealBooking::STATUS_MISSED,
            ])
            ->get()
            ->reduce(function (array $carry, $booking) {
                // 0 (Sunday) .. 6 (Saturday), matching Carbon's dayOfWeek.
                $key = $booking->meal_date->dayOfWeek . '|' . $booking->meal_type;
                $carry[$key] = ($carry[$key] ?? 0) + 1;

                return $carry;
            }, []) ?? [];
    }
}
