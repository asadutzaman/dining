<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Models\Dining\MealBooking;
use App\Models\Dining\Payment;
use App\Repositories\Dining\MealBookingRepository;
use App\Services\Dining\MealBookingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Screen 1e. The running due is authoritative on the member record; everything
 * else here explains how it got there.
 */
class DuesController extends BaseMobileController
{
    /** Months offered as chips at the top of the screen. */
    private const MONTH_CHIPS = 6;

    private MealBookingRepository $bookings;

    public function __construct(MealBookingRepository $bookings)
    {
        $this->bookings = $bookings;
    }

    /**
     * GET /api/mobile/v1/dues?month=YYYY-MM
     */
    public function index(Request $request)
    {
        return $this->handle(function () use ($request) {
            $this->check($request->all(), [
                'month' => ['nullable', 'date_format:Y-m'],
            ]);

            $member = $this->member();
            $month  = $request->filled('month')
                ? Carbon::createFromFormat('Y-m', $request->input('month'))->startOfMonth()
                : now()->startOfMonth();

            $from = $month->copy()->startOfMonth();
            // Never summarise beyond today: a partial month should read as
            // "34 meals since 1 July", not project to month end.
            $to = $month->isSameMonth(now()) ? now()->endOfDay() : $month->copy()->endOfMonth();

            $charged = $this->bookings->chargedBetween($member->id, $from->format('Y-m-d'), $to->format('Y-m-d'));

            return $this->ok([
                'current_due' => (float) $member->due_balance,

                'month' => [
                    'value' => $month->format('Y-m'),
                    'label' => $month->format('F Y'),
                    'from'  => $from->format('Y-m-d'),
                    'to'    => $to->format('Y-m-d'),
                ],

                'summary' => [
                    'meals'      => $charged->count(),
                    'amount'     => round($charged->sum(fn ($b) => (float) $b->charged_amount), 2),
                    'since_label'=> 'since ' . $from->format('j F'),
                ],

                'by_meal_type' => $this->byMealType($charged),

                'payments' => $this->paymentsFor($member->id, $from, $to),

                'months' => $this->monthChips($month),
            ]);
        });
    }

    /**
     * GET /api/mobile/v1/dues/charges?month=YYYY-MM
     *
     * The "Recent charges" ledger. Includes cancelled meals so the member can
     * see the ৳0 waived rows and trust that cancelling worked.
     */
    public function charges(Request $request)
    {
        return $this->handle(function () use ($request) {
            $this->check($request->all(), [
                'month' => ['nullable', 'date_format:Y-m'],
                'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
            ]);

            $member = $this->member();
            $month  = $request->filled('month')
                ? Carbon::createFromFormat('Y-m', $request->input('month'))->startOfMonth()
                : now()->startOfMonth();

            $rows = MealBooking::query()
                ->with('mealToken')
                ->where('member_id', $member->id)
                ->whereBetween('meal_date', [
                    $month->copy()->startOfMonth()->format('Y-m-d'),
                    $month->copy()->endOfMonth()->format('Y-m-d'),
                ])
                ->whereIn('booking_status', [
                    MealBooking::STATUS_CONSUMED,
                    MealBooking::STATUS_MISSED,
                    MealBooking::STATUS_CANCELLED,
                ])
                ->orderByDesc('meal_date')
                ->orderBy('meal_type')
                ->limit((int) $request->input('limit', 50))
                ->get();

            return $this->ok($rows->map(fn ($booking) => $this->chargeRow($booking))->all());
        });
    }

    /**
     * One ledger line, with the caption the design shows under each: the token
     * number when scanned, why it was charged when missed, or when it was
     * cancelled.
     */
    private function chargeRow(MealBooking $booking): array
    {
        $meal = ucfirst(strtolower($booking->meal_type));
        $date = $booking->meal_date;

        $caption = match ($booking->booking_status) {
            MealBooking::STATUS_CONSUMED => $booking->mealToken
                ? 'Token ' . $booking->mealToken->token_number .
                    ($booking->mealToken->collected_at ? ' · ' . $booking->mealToken->collected_at->format('g:i A') : '')
                : 'Served',
            MealBooking::STATUS_MISSED    => 'Missed — not scanned',
            MealBooking::STATUS_CANCELLED => 'Cancelled before cutoff',
            default                       => null,
        };

        return [
            'id'             => $booking->id,
            'title'          => $meal . ' · ' . $date->format('D j M'),
            'caption'        => $caption,
            'meal_date'      => $date->format('Y-m-d'),
            'meal_type'      => $booking->meal_type,
            'booking_status' => $booking->booking_status,
            'charge_status'  => $booking->charge_status,
            // Both are sent so the client can strike through the original price
            // on a waived row without recomputing anything.
            'original_price' => (float) $booking->unit_price,
            'charged_amount' => (float) $booking->charged_amount,
        ];
    }

    private function byMealType($charged): array
    {
        return collect(MealBookingService::MEAL_TYPES)
            ->map(function (string $mealType) use ($charged) {
                $rows = $charged->where('meal_type', $mealType);

                return [
                    'meal_type' => $mealType,
                    'label'     => ucfirst(strtolower($mealType)),
                    'count'     => $rows->count(),
                    'amount'    => round($rows->sum(fn ($b) => (float) $b->charged_amount), 2),
                ];
            })
            ->all();
    }

    private function paymentsFor($memberId, Carbon $from, Carbon $to): array
    {
        return Payment::query()
            ->where('member_id', $memberId)
            ->whereBetween('payment_date', [$from->format('Y-m-d'), $to->format('Y-m-d')])
            ->where('status', 1)
            ->orderByDesc('payment_date')
            ->get()
            ->map(fn ($payment) => [
                'id'             => $payment->id,
                'payment_number' => $payment->payment_number,
                'amount'         => (float) $payment->amount,
                'payment_date'   => $payment->payment_date?->format('Y-m-d'),
                'payment_method' => $payment->payment_method,
                'remarks'        => $payment->remarks,
            ])
            ->all();
    }

    private function monthChips(Carbon $selected): array
    {
        $chips = [];

        for ($index = self::MONTH_CHIPS - 1; $index >= 0; $index--) {
            $month = now()->startOfMonth()->subMonths($index);
            $chips[] = [
                'value'    => $month->format('Y-m'),
                'label'    => $month->format('M'),
                'selected' => $month->isSameMonth($selected),
            ];
        }

        return $chips;
    }
}
