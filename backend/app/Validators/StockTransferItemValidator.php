<?php

namespace App\Validators;

class StockTransferItemValidator extends BaseValidator
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
                    'stock_transfer_id' => ['required'],
                    'reason' => ['nullable', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'stock_transfer_id' => ['required'],
                    'reason' => ['nullable', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'stock_transfer_id.required'   => 'Stock transfer ID is required.',
            'reason.regex' => 'Reason may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'stock_transfer_id' => 'Stock Transfer ID',
            'reason' => 'Reason',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
