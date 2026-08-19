<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class MealSetting extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'meal_type',
        'cost',
        'start_time',
        'end_time',
        'cutoff_day_offset',
        'cutoff_time',
        'effective_from',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                => 'integer',
        'created_by'        => 'integer',
        'updated_by'        => 'integer',
        'status'            => 'integer',
        'cutoff_day_offset' => 'integer',
        // Decimal
        'cost'       => 'decimal:2',
        //Date
        'effective_from' => 'date:Y-m-d',
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        // String
        'meal_type'   => 'string',
        'start_time'  => 'string',
        'end_time'    => 'string',
        'cutoff_time' => 'string',
    ];

    protected $dates = [
        'effective_from', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status'            => StatusEnum::ACTIVE,
        'cutoff_day_offset' => 0,
    ];

    /**
     * The instant bookings close for this meal on a given date. Null when the
     * meal has no configured deadline, meaning it accepts bookings until service.
     */
    public function cutoffFor($mealDate): ?Carbon
    {
        if (empty($this->cutoff_time)) {
            return null;
        }

        return Carbon::parse($mealDate)
            ->startOfDay()
            ->addDays((int) $this->cutoff_day_offset)
            ->setTimeFromTimeString($this->cutoff_time);
    }

    /**
     * Human phrasing of the rule, e.g. "Book before 9:00 PM the night before".
     * Rendered under each meal on the single-day booking screen.
     */
    public function cutoffLabel(): ?string
    {
        if (empty($this->cutoff_time)) {
            return null;
        }

        $time   = Carbon::parse($this->cutoff_time)->format('g:i A');
        $offset = (int) $this->cutoff_day_offset;

        if ($offset === 0) {
            return "Book before {$time} same day";
        }
        if ($offset === -1) {
            return "Book before {$time} the night before";
        }

        $days = abs($offset);

        return "Book before {$time}, {$days} days ahead";
    }
}
