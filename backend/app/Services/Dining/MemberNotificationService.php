<?php

namespace App\Services\Dining;

use App\Models\Dining\Member;
use App\Models\Dining\MemberNotification;
use Carbon\Carbon;

/**
 * Writes the in-app notification feed (screen 1g). Each factory method below
 * corresponds to one card in the design, so the wording lives in one place
 * rather than being assembled at each call site.
 */
class MemberNotificationService
{
    /**
     * Preference gate per notification type. Transactional messages -- "your
     * booking is confirmed" -- are always delivered; only the nudges are opt-out,
     * matching the three toggles on the profile screen.
     */
    private const PREFERENCE_FOR_TYPE = [
        MemberNotification::TYPE_CUTOFF_WARNING   => 'notify_cutoff_warning',
        MemberNotification::TYPE_BOOKING_REMINDER => 'notify_booking_reminder',
        MemberNotification::TYPE_WEEKLY_SUMMARY   => 'notify_weekly_summary',
    ];

    public function push(Member $member, string $type, string $title, string $body, ?string $route = null, array $data = []): ?MemberNotification
    {
        $preference = self::PREFERENCE_FOR_TYPE[$type] ?? null;

        if ($preference !== null && !$member->{$preference}) {
            return null;
        }

        return MemberNotification::create([
            'member_id'    => $member->id,
            'type'         => $type,
            'title'        => $title,
            'body'         => $body,
            'action_route' => $route,
            'data'         => $data ?: null,
        ]);
    }

    public function bookingConfirmed(Member $member, $mealDate, string $mealType, float $price): ?MemberNotification
    {
        $date = Carbon::parse($mealDate);
        $meal = ucfirst(strtolower($mealType));
        $when = $date->isToday() ? 'today' : $date->format('D d M');

        return $this->push(
            $member,
            MemberNotification::TYPE_BOOKING_CONFIRMED,
            'Booking confirmed',
            "{$meal} {$when} is booked · ৳" . number_format($price, 0) . '. Scan your card at the counter.',
            'booking/' . $date->format('Y-m-d') . '/' . $mealType,
            ['meal_date' => $date->format('Y-m-d'), 'meal_type' => $mealType, 'price' => $price]
        );
    }

    public function bookingCancelled(Member $member, $mealDate, string $mealType, float $price): ?MemberNotification
    {
        $date = Carbon::parse($mealDate);
        $meal = strtolower($mealType);

        return $this->push(
            $member,
            MemberNotification::TYPE_BOOKING_CANCELLED,
            'Booking cancelled',
            $date->format('l') . " {$meal} cancelled before cutoff — ৳" . number_format($price, 0) . ' removed from your due.',
            'bookings',
            ['meal_date' => $date->format('Y-m-d'), 'meal_type' => $mealType]
        );
    }

    public function cutoffWarning(Member $member, $mealDate, string $mealType, Carbon $cutoffAt): ?MemberNotification
    {
        $meal    = strtolower($mealType);
        $minutes = max(0, (int) now()->diffInMinutes($cutoffAt, false));

        return $this->push(
            $member,
            MemberNotification::TYPE_CUTOFF_WARNING,
            ucfirst($meal) . ' cutoff soon',
            "{$minutes} minutes left to book or cancel today's {$meal}. Cutoff is " . $cutoffAt->format('g:i A') . '.',
            'booking/' . Carbon::parse($mealDate)->format('Y-m-d') . '/' . $mealType,
            ['meal_date' => Carbon::parse($mealDate)->format('Y-m-d'), 'meal_type' => $mealType]
        );
    }

    public function bookingReminder(Member $member, $mealDate, ?Carbon $nextCutoff = null): ?MemberNotification
    {
        $date = Carbon::parse($mealDate);
        $body = $date->format('l') . ' has no bookings yet.';

        if ($nextCutoff) {
            $body .= ' Breakfast cutoff is ' . $nextCutoff->format('g:i A') . ' tonight.';
        }

        return $this->push(
            $member,
            MemberNotification::TYPE_BOOKING_REMINDER,
            "Book tomorrow's meals",
            $body,
            'week',
            ['meal_date' => $date->format('Y-m-d')]
        );
    }

    public function weeklyPlanSaved(Member $member, $from, $to, int $mealCount, float $total): ?MemberNotification
    {
        $from = Carbon::parse($from);
        $to   = Carbon::parse($to);

        return $this->push(
            $member,
            MemberNotification::TYPE_WEEKLY_PLAN_SAVED,
            'Weekly plan saved',
            "{$mealCount} meals booked for " . $from->format('D d') . ' – ' . $to->format('D d M') .
                ' · ৳' . number_format($total, 0) . ' estimated.',
            'week',
            ['from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d'), 'meals' => $mealCount, 'total' => $total]
        );
    }

    public function markAllRead(Member $member): int
    {
        return MemberNotification::query()
            ->where('member_id', $member->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function unreadCount(Member $member): int
    {
        return MemberNotification::query()
            ->where('member_id', $member->id)
            ->whereNull('read_at')
            ->count();
    }
}
