<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Resources\Dining\MealBookingResource;
use App\Repositories\Dining\MealBookingRepository;
use App\Services\Dining\MealBookingService;
use App\Services\Dining\MemberNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends BaseMobileController
{
    /** Guards against a client asking for an unbounded range. */
    private const MAX_RANGE_DAYS = 62;

    private MealBookingService $bookings;

    private MealBookingRepository $repository;

    private MemberNotificationService $notifications;

    public function __construct(
        MealBookingService $bookings,
        MealBookingRepository $repository,
        MemberNotificationService $notifications
    ) {
        $this->bookings      = $bookings;
        $this->repository    = $repository;
        $this->notifications = $notifications;
    }

    /**
     * GET /api/mobile/v1/bookings/plan?from=&to=
     *
     * The booking grid: one entry per day, each with a cell per meal carrying
     * its price, state and whether it can still be toggled. Backs the weekly
     * grid and the single-day picker.
     */
    public function plan(Request $request)
    {
        return $this->handle(function () use ($request) {
            [$from, $to] = $this->range($request);

            $days = $this->bookings->planForRange($this->member(), $from, $to);

            return $this->ok([
                'from'  => $from->format('Y-m-d'),
                'to'    => $to->format('Y-m-d'),
                'days'  => $days,
                'totals' => $this->totals($days),
            ]);
        });
    }

    /**
     * POST /api/mobile/v1/bookings
     */
    public function book(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'meal_date' => ['required', 'date'],
                'meal_type' => ['required', 'in:BREAKFAST,LUNCH,DINNER'],
            ]);

            $member  = $this->member();
            $booking = $this->bookings->book($member, $input['meal_date'], $input['meal_type']);

            $this->notifications->bookingConfirmed(
                $member,
                $booking->meal_date,
                $booking->meal_type,
                (float) $booking->unit_price
            );

            return $this->ok(new MealBookingResource($booking), 'Booking confirmed.');
        });
    }

    /**
     * POST /api/mobile/v1/bookings/cancel
     */
    public function cancel(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'meal_date' => ['required', 'date'],
                'meal_type' => ['required', 'in:BREAKFAST,LUNCH,DINNER'],
            ]);

            $member  = $this->member();
            $booking = $this->bookings->cancel($member, $input['meal_date'], $input['meal_type']);

            if (!$booking) {
                return $this->ok(null, 'Nothing to cancel.');
            }

            $this->notifications->bookingCancelled(
                $member,
                $booking->meal_date,
                $booking->meal_type,
                (float) $booking->unit_price
            );

            return $this->ok(new MealBookingResource($booking), 'Booking cancelled — no charge.');
        });
    }

    /**
     * PUT /api/mobile/v1/bookings/day
     *
     * "Confirm booking" on the single-day screen. The client sends the meals it
     * wants for that date and the server makes reality match, so a stale screen
     * cannot double-book.
     */
    public function syncDay(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'meal_date'    => ['required', 'date'],
                'meal_types'   => ['present', 'array'],
                'meal_types.*' => ['in:BREAKFAST,LUNCH,DINNER'],
            ]);

            $member  = $this->member();
            $outcome = $this->bookings->syncDay($member, $input['meal_date'], $input['meal_types']);

            // Reported as counts so this matches syncWeek's shape exactly -- the
            // client decodes one type for both endpoints.
            return $this->ok([
                'outcome' => [
                    'booked'    => count($outcome['booked']),
                    'cancelled' => count($outcome['cancelled']),
                    'skipped'   => $outcome['skipped'],
                ],
                'day'     => $this->bookings->planForDay($member, $input['meal_date']),
            ], $this->summarise(count($outcome['booked']), count($outcome['cancelled']), count($outcome['skipped'])));
        });
    }

    /**
     * PUT /api/mobile/v1/bookings/week
     *
     * "Confirm" on the weekly grid — the whole week applied in one call.
     */
    public function syncWeek(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'days'                => ['required', 'array', 'min:1', 'max:' . self::MAX_RANGE_DAYS],
                'days.*.meal_date'    => ['required', 'date'],
                'days.*.meal_types'   => ['present', 'array'],
                'days.*.meal_types.*' => ['in:BREAKFAST,LUNCH,DINNER'],
            ]);

            $member  = $this->member();
            $summary = $this->bookings->syncRange($member, $input['days']);

            $dates = array_column($input['days'], 'meal_date');
            sort($dates);
            $from = reset($dates);
            $to   = end($dates);

            $days   = $this->bookings->planForRange($member, $from, $to);
            $totals = $this->totals($days);

            if ($summary['booked'] > 0) {
                $this->notifications->weeklyPlanSaved($member, $from, $to, $totals['meals'], $totals['amount']);
            }

            return $this->ok([
                'outcome' => $summary,
                'from'    => $from,
                'to'      => $to,
                'days'    => $days,
                'totals'  => $totals,
            ], $this->summarise($summary['booked'], $summary['cancelled'], count($summary['skipped'])));
        });
    }

    /**
     * GET /api/mobile/v1/bookings/usual-week?from=&to=
     *
     * "Repeat my usual week" — a proposal, not a commitment. The client shows it
     * on the grid and the member still has to press Confirm.
     */
    public function usualWeek(Request $request)
    {
        return $this->handle(function () use ($request) {
            [$from, $to] = $this->range($request);

            return $this->ok([
                'from' => $from->format('Y-m-d'),
                'to'   => $to->format('Y-m-d'),
                'days' => $this->bookings->suggestUsualWeek($this->member(), $from, $to),
            ]);
        });
    }

    /**
     * GET /api/mobile/v1/bookings/upcoming
     */
    public function upcoming()
    {
        return $this->handle(function () {
            $bookings = $this->repository->upcomingFor($this->member()->id, now()->format('Y-m-d'));

            return $this->ok($this->groupByDate($bookings));
        });
    }

    /**
     * GET /api/mobile/v1/bookings/history?from=&to=
     */
    public function history(Request $request)
    {
        return $this->handle(function () use ($request) {
            $to   = $request->filled('to') ? Carbon::parse($request->input('to')) : now();
            $from = $request->filled('from')
                ? Carbon::parse($request->input('from'))
                : $to->copy()->subDays(30);

            $bookings = $this->repository->historyFor(
                $this->member()->id,
                $from->format('Y-m-d'),
                $to->format('Y-m-d')
            );

            return $this->ok($this->groupByDate($bookings));
        });
    }

    /**
     * The list screens are sectioned by date ("TODAY · SAT 12 JULY"), so the
     * grouping is done here rather than repeated in the client.
     */
    private function groupByDate($bookings): array
    {
        return $bookings
            ->groupBy(fn ($booking) => $booking->meal_date->format('Y-m-d'))
            ->map(function ($group, $date) {
                $date = Carbon::parse($date);

                return [
                    'meal_date' => $date->format('Y-m-d'),
                    'label'     => $date->isToday()
                        ? 'Today · ' . $date->format('D d F')
                        : $date->format('D d F'),
                    'is_today'  => $date->isToday(),
                    'total'     => round($group->sum(fn ($b) => (float) $b->unit_price), 2),
                    'bookings'  => MealBookingResource::collection($group->values()),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Booked meals and their cost across a plan, for the sticky footer bar.
     */
    private function totals(array $days): array
    {
        $meals  = 0;
        $amount = 0.0;

        foreach ($days as $day) {
            foreach ($day['meals'] as $meal) {
                if ($meal['state'] === MealBookingService::STATE_BOOKED) {
                    $meals++;
                    $amount += (float) $meal['price'];
                }
            }
        }

        return ['meals' => $meals, 'amount' => round($amount, 2)];
    }

    private function summarise(int $booked, int $cancelled, int $skipped): string
    {
        $parts = [];
        if ($booked > 0) {
            $parts[] = "{$booked} booked";
        }
        if ($cancelled > 0) {
            $parts[] = "{$cancelled} cancelled";
        }
        if ($skipped > 0) {
            $parts[] = "{$skipped} skipped (cutoff passed)";
        }

        return empty($parts) ? 'No changes.' : ucfirst(implode(', ', $parts)) . '.';
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     * @throws \Exception when the range is inverted or too wide
     */
    private function range(Request $request): array
    {
        $this->check($request->all(), [
            'from' => ['nullable', 'date'],
            'to'   => ['nullable', 'date'],
        ]);

        // Default to the current Saturday-anchored week, matching the design.
        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : now()->startOfWeek(Carbon::SATURDAY);

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->startOfDay()
            : $from->copy()->addDays(6);

        if ($to->lt($from)) {
            throw new \Exception('The end date cannot be before the start date.');
        }

        if ($from->diffInDays($to) > self::MAX_RANGE_DAYS) {
            throw new \Exception('Please request a shorter date range.');
        }

        return [$from, $to];
    }
}
