<?php

namespace App\Validators;

class PaymentValidator extends BaseValidator
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
                    'member_id'     => ['required', 'integer', 'exists:members,id'],
                    'amount'        => ['required', 'numeric', 'min:0.01'],
                    'payment_date'  => ['required', 'date'],
                    'payment_method' => ['nullable', 'in:CASH'],
                    'remarks'       => ['nullable', 'string', 'max:255'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'member_id.required'    => 'Member is required.',
            'member_id.exists'      => 'Member not found.',
            'amount.required'       => 'Amount is required.',
            'amount.min'            => 'Amount must be greater than zero.',
            'payment_date.required' => 'Payment date is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'member_id'    => 'Member',
            'amount'       => 'Amount',
            'payment_date' => 'Payment Date',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
