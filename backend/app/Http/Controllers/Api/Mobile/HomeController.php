<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Repositories\Dining\MealSettingRepository;
use App\Services\Dining\HallOccupancyService;
use App\Services\Dining\MealBookingService;
use App\Services\Dining\MemberNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Screen 1a. Everything above the fold in one round trip -- the home screen is
 * the app's cold-start path, and four parallel requests there would show four
 * separate spinners.
 */
class HomeController extends BaseMobileController
{
    private MealBookingService $bookings;

    private MealSettingRepository $settings;

    private HallOccupancyService $occupancy;

    private MemberNotificationService $notifications;

    public function __construct(
        MealBookingService $bookings,
        MealSettingRepository $settings,
        HallOccupancyService $occupancy,
        MemberNotificationService $notifications
    ) {
        $this->bookings      = $bookings;
        $this->settings      = $settings;
        $this->occupancy     = $occupancy;
        $this->notifications = $notifications;
    }

    /**
     * GET /api/mobile/v1/home
     */
    public function index(Request $request)
    {
        return $this->handle(function () {
            $member   = $this->member();
            $today    = now()->startOfDay();
            $tomorrow = $today->copy()->addDay();

            $todayPlan    = $this->bookings->planForDay($member, $today);
            $tomorrowPlan = $this->bookings->planForDay($member, $tomorrow);

            return $this->ok([
                'greeting' => [
                    'salutation' => $this->salutation(),
                    'name'       => $this->firstName($member->name),
                    'initials'   => $member->initials(),
                    'date'       => $today->format('Y-m-d'),
                    'date_label' => $today->format('l j F'),
                ],

                'now_serving' => $this->nowServing($todayPlan, $tomorrowPlan, $today),

                'occupancy' => $this->occupancy->forMeal(),

                'today' => $todayPlan,

                'tomorrow' => [
                    'meal_date'    => $tomorrowPlan['meal_date'],
                    'day_full'     => $tomorrowPlan['day_full'],
                    'booked_count' => $tomorrowPlan['booked_count'],
                    'day_total'    => $tomorrowPlan['day_total'],
                    // Drives the dark prompt card: "Tomorrow is empty".
                    'is_empty'     => $tomorrowPlan['booked_count'] === 0,
                ],

                'unread_notifications' => $this->notifications->unreadCount($member),
                'due_balance'          => (float) $member->due_balance,
            ]);
        });
    }

    /**
     * The banner in the hero.
     *
     * While a meal is being served this is the pulsing "NOW SERVING" card. The
     * rest of the time it announces the next sitting instead of vanishing --
     * an absent card collapses the hero and leaves the header photo looking
     * cropped, and "when can I next eat?" is the question a member has between
     * meals anyway.
     */
    private function nowServing(array $todayPlan, array $tomorrowPlan, Carbon $today): ?array
    {
        $current = $this->settings->getCurrentMeal($today->format('Y-m-d'));

        if (!empty($current['meal_type'])) {
            $cell = collect($todayPlan['meals'])->firstWhere('meal_type', $current['meal_type']);

            return [
                'meal_type'   => $current['meal_type'],
                'is_live'     => true,
                'meal_date'   => $today->format('Y-m-d'),
                'until'       => $cell['serving_to'] ?? null,
                'until_label' => !empty($cell['serving_to'])
                    ? Carbon::parse($cell['serving_to'])->format('g:i A')
                    : null,
                'starts_at'       => null,
                'starts_at_label' => null,
                'cost'        => (float) ($current['cost'] ?? 0),
                // BOOKED means "go and scan"; CONSUMED means they already ate.
                'state'       => $cell['state'] ?? null,
                'is_booked'   => in_array($cell['state'] ?? null, [
                    MealBookingService::STATE_BOOKED,
                    MealBookingService::STATE_CONSUMED,
                ], true),
            ];
        }

        $next = $this->settings->getNextServing($today);

        if (!$next) {
            return null;
        }

        $setting = $next['setting'];

        /*
         * getNextServing() only ever looks at today or tomorrow, and index() has
         * already built both plans -- so the member's booking state for the next
         * sitting is resolved without another query, whichever day it falls on.
         */
        $plan = $next['meal_date'] === $today->format('Y-m-d') ? $todayPlan : $tomorrowPlan;
        $cell = collect($plan['meals'])->firstWhere('meal_type', $next['meal_type']);

        return [
            'meal_type'       => $next['meal_type'],
            'is_live'         => false,
            'meal_date'       => $next['meal_date'],
            'until'           => $setting->end_time,
            'until_label'     => !empty($setting->end_time)
                ? Carbon::parse($setting->end_time)->format('g:i A')
                : null,
            'starts_at'       => $setting->start_time,
            'starts_at_label' => Carbon::parse($setting->start_time)->format('g:i A'),
            'cost'            => (float) $setting->cost,
            'state'           => $cell['state'] ?? null,
            'is_booked'       => in_array($cell['state'] ?? null, [
                MealBookingService::STATE_BOOKED,
                MealBookingService::STATE_CONSUMED,
            ], true),
        ];
    }

    private function salutation(): string
    {
        $hour = (int) now()->format('G');

        return match (true) {
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            default    => 'Good evening',
        };
    }

    private function firstName(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return $parts[0] ?? '';
    }
}
