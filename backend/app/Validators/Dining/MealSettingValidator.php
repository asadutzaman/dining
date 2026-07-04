<?php

namespace App\Validators\Dining;

use App\Validators\BaseValidator;

class MealSettingValidator extends BaseValidator
{
    protected $request;

    public function __construct()
    {
        $this->request = request();
    }

    public function rules()
    {
        switch ($this->request->method()) {
            case 'GET':
            case 'DELETE':
                return [];

            case 'POST':
            case 'PUT':
            case 'PATCH':
                return [
                    'meal_type'      => ['required', 'in:BREAKFAST,LUNCH,DINNER'],
                    'cost'           => ['required', 'numeric', 'min:0'],
                    'effective_from' => ['required', 'date'],
                    // Optional serving window; if one is set the other is required, end after start.
                    'start_time'     => ['nullable', 'date_format:H:i:s', 'required_with:end_time'],
                    'end_time'       => ['nullable', 'date_format:H:i:s', 'required_with:start_time', 'after:start_time'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'meal_type.required'      => 'Meal type is required.',
            'cost.required'           => 'Cost is required.',
            'effective_from.required' => 'Effective from date is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'meal_type'      => 'Meal Type',
            'cost'           => 'Cost',
            'effective_from' => 'Effective From',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
