<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Models\Dining\MemberNotification;
use App\Services\Dining\MemberNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Screen 1g.
 */
class NotificationController extends BaseMobileController
{
    private MemberNotificationService $notifications;

    public function __construct(MemberNotificationService $notifications)
    {
        $this->notifications = $notifications;
    }

    /**
     * GET /api/mobile/v1/notifications
     *
     * Grouped into TODAY / YESTERDAY / dated sections, matching the design.
     */
    public function index(Request $request)
    {
        return $this->handle(function () use ($request) {
            $this->check($request->all(), [
                'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            ]);

            $member = $this->member();

            $rows = MemberNotification::query()
                ->where('member_id', $member->id)
                ->whereNull('dismissed_at')
                ->orderByDesc('created_at')
                ->limit((int) $request->input('limit', 50))
                ->get();

            return $this->ok([
                'unread_count' => $this->notifications->unreadCount($member),
                'sections'     => $this->group($rows),
            ]);
        });
    }

    /**
     * POST /api/mobile/v1/notifications/read-all
     */
    public function markAllRead()
    {
        return $this->handle(function () {
            $count = $this->notifications->markAllRead($this->member());

            return $this->ok(['marked' => $count], 'All caught up.');
        });
    }

    /**
     * POST /api/mobile/v1/notifications/{id}/read
     */
    public function markRead($id)
    {
        return $this->handle(function () use ($id) {
            $notification = $this->find($id);
            if (!$notification->read_at) {
                $notification->read_at = now();
                $notification->save();
            }

            return $this->ok(null);
        });
    }

    /**
     * POST /api/mobile/v1/notifications/{id}/dismiss
     */
    public function dismiss($id)
    {
        return $this->handle(function () use ($id) {
            $notification = $this->find($id);
            $notification->dismissed_at = now();
            $notification->read_at = $notification->read_at ?: now();
            $notification->save();

            return $this->ok(null, 'Dismissed.');
        });
    }

    /**
     * Scoped to the caller, so an id from another member's feed 404s rather than
     * being actionable.
     */
    private function find($id): MemberNotification
    {
        $notification = MemberNotification::query()
            ->where('member_id', $this->member()->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            abort(404, 'Notification not found.');
        }

        return $notification;
    }

    private function group($rows): array
    {
        return $rows
            ->groupBy(fn ($row) => $row->created_at->format('Y-m-d'))
            ->map(function ($group, $date) {
                $date = Carbon::parse($date);

                return [
                    'date'  => $date->format('Y-m-d'),
                    'label' => match (true) {
                        $date->isToday()     => 'Today',
                        $date->isYesterday() => 'Yesterday',
                        default              => $date->format('D j F'),
                    },
                    'items' => $group->map(fn ($row) => [
                        'id'           => $row->id,
                        'type'         => $row->type,
                        'title'        => $row->title,
                        'body'         => $row->body,
                        'action_route' => $row->action_route,
                        'data'         => $row->data,
                        'is_read'      => $row->read_at !== null,
                        'created_at'   => $row->created_at->format('Y-m-d H:i:s'),
                        'time_label'   => $row->created_at->format('g:i A'),
                    ])->values(),
                ];
            })
            ->values()
            ->all();
    }
}
