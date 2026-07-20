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

                'now_serving' => $this->nowServing($todayPlan, $today),

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
     * The pulsing banner. Present only while a meal is actually being served,
     * and it reports whether this member is booked for it.
     */
    private function nowServing(array $todayPlan, Carbon $today): ?array
    {
        $current = $this->settings->getCurrentMeal($today->format('Y-m-d'));

        if (empty($current['meal_type'])) {
            return null;
        }

        $cell = collect($todayPlan['meals'])->firstWhere('meal_type', $current['meal_type']);

        return [
            'meal_type'  => $current['meal_type'],
            'until'      => $cell['serving_to'] ?? null,
            'until_label'=> !empty($cell['serving_to'])
                ? Carbon::parse($cell['serving_to'])->format('g:i A')
                : null,
            'cost'       => (float) ($current['cost'] ?? 0),
            // BOOKED means "go and scan"; CONSUMED means they already ate.
            'state'      => $cell['state'] ?? null,
            'is_booked'  => in_array($cell['state'] ?? null, [
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
