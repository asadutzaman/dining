<?php

namespace App\Rules;

use DB;
use Illuminate\Contracts\Validation\Rule;

class UniqueSlug implements Rule
{

    protected $table;

    protected $slugField;

    protected $value;

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($table, $slugField)
    {
        $this->table = $table;
        $this->slugField = $slugField;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $this->value = $value;

        return DB::table($this->table)
            ->where($this->slugField, str_slug($value))
            ->first() === null;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The URL ' . str_slug($this->value) . ' is already taken.';
    }
}
