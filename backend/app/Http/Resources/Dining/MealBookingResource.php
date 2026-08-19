<?php

namespace App\Http\Resources\Dining;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A single booking row as the bookings list renders it (screen 1d).
 */
class MealBookingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'meal_date'      => $this->meal_date?->format('Y-m-d'),
            'meal_type'      => $this->meal_type,
            'unit_price'     => (float) $this->unit_price,
            'booking_status' => $this->booking_status,
            'charge_status'  => $this->charge_status,
            'charged_amount' => (float) $this->charged_amount,
            'source'         => $this->source,

            'cutoff_at'    => $this->cutoff_at?->format('Y-m-d H:i:s'),
            'can_cancel'   => $this->isCancellable(),
            'locked'       => $this->isLocked(),

            'booked_at'    => $this->booked_at?->format('Y-m-d H:i:s'),
            'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),

            // Present once the member has actually scanned at the counter.
            'token_number' => $this->whenLoaded('mealToken', fn () => $this->mealToken?->token_number),
            'consumed_at'  => $this->whenLoaded('mealToken', fn () => $this->mealToken?->collected_at?->format('Y-m-d H:i:s')),
        ];
    }
}
