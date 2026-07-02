<?php

namespace App\Validators\Dining;

use App\Validators\BaseValidator;

class MealTokenValidator extends BaseValidator
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
                return [
                    'member_id'      => ['required', 'integer', 'exists:members,id'],
                    'meal_type'      => ['required', 'in:BREAKFAST,LUNCH,DINNER'],
                    'meal_date'      => ['required', 'date'],
                    'payment_status' => ['required', 'in:PAID,DUE'],
                    'payment_method' => ['required_if:payment_status,PAID', 'nullable', 'in:CASH'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'member_id.required'      => 'Member is required.',
            'member_id.exists'        => 'Member not found.',
            'meal_type.required'      => 'Meal type is required.',
            'meal_date.required'      => 'Meal date is required.',
            'payment_status.required' => 'Payment status is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'member_id'      => 'Member',
            'meal_type'      => 'Meal Type',
            'meal_date'      => 'Meal Date',
            'payment_status' => 'Payment Status',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
