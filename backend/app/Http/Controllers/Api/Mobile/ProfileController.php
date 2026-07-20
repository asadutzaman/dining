<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Resources\Dining\MemberProfileResource;
use App\Models\Dining\MemberNotification;
use Illuminate\Http\Request;

/**
 * Screen 1f.
 */
class ProfileController extends BaseMobileController
{
    /**
     * GET /api/mobile/v1/profile
     */
    public function show()
    {
        return $this->handle(function () {
            $member = $this->member()->load(['department', 'designation']);

            return $this->ok(new MemberProfileResource($member));
        });
    }

    /**
     * PATCH /api/mobile/v1/profile/preferences
     *
     * The three notification toggles and the language switch. Partial: only the
     * keys present are changed, so a single toggle need not resend the rest.
     */
    public function updatePreferences(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'language'                => ['nullable', 'in:en,bn'],
                'notify_booking_reminder' => ['nullable', 'boolean'],
                'notify_cutoff_warning'   => ['nullable', 'boolean'],
                'notify_weekly_summary'   => ['nullable', 'boolean'],
            ]);

            $member  = $this->member();
            $changes = array_intersect_key($input, array_flip([
                'language',
                'notify_booking_reminder',
                'notify_cutoff_warning',
                'notify_weekly_summary',
            ]));

            // array_intersect_key keeps explicit nulls; drop them so an absent
            // field never clears a stored preference.
            $changes = array_filter($changes, fn ($value) => $value !== null);

            if (!empty($changes)) {
                $member->fill($changes)->save();
            }

            return $this->ok(new MemberProfileResource($member->refresh()), 'Preferences saved.');
        });
    }

    /**
     * POST /api/mobile/v1/profile/report-card
     *
     * "Report a lost or faulty card". The app cannot unlink a card itself -- that
     * would let anyone with a phone disable a card at the counter. This files a
     * notice for the dining office and tells the member what happens next.
     */
    public function reportCard(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'reason' => ['required', 'in:LOST,STOLEN,DAMAGED,NOT_WORKING'],
                'note'   => ['nullable', 'string', 'max:500'],
            ]);

            $member = $this->member();

            MemberNotification::create([
                'member_id'    => $member->id,
                'type'         => 'CARD_REPORT',
                'title'        => 'Card report received',
                'body'         => 'We have logged your ' . strtolower(str_replace('_', ' ', $input['reason'])) .
                    ' card report. Visit the dining office to collect a replacement.',
                'action_route' => 'profile',
                'data'         => [
                    'reason'      => $input['reason'],
                    'note'        => $input['note'] ?? null,
                    'member_code' => $member->member_code,
                    'reported_at' => now()->format('Y-m-d H:i:s'),
                ],
            ]);

            return $this->ok(null, 'Report received. Please visit the dining office for a replacement card.');
        });
    }
}
