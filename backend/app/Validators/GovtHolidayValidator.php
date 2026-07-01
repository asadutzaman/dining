<?php

namespace App\Validators;

class GovtHolidayValidator extends BaseValidator
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
                    'day'           => ['integer'],
                    'month'         => ['integer'],
                    'year'          => ['integer'],
                    'date'          => ['required', 'date'],
                    'holiday_type'  => ['required', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'day'           => ['integer'],
                    'month'         => ['integer'],
                    'year'          => ['integer'],
                    'date'          => ['required', 'date'],
                    'holiday_type'  => ['required', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            // 'name.required'   => 'Name is required.',
            'day.required'          => 'Day is required.',
            'month.required'        => 'Month is required.',
            'year.required'         => 'Year is required.',
            'date.required'         => 'Date is required.',
            'holiday_type.required' => 'Holiday type is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            // 'name' => 'Name',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
