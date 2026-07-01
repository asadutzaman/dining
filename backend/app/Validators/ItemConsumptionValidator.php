<?php

namespace App\Validators;

class ItemConsumptionValidator extends BaseValidator
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
                    'remarks' => ['nullable', 'string'],
                    'itemConsumptionItemList' => ['required', 'array'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'remarks' => ['nullable', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'remarks.required'   => 'Item may only contain letters, numbers, spaces, and - _ & . , characters..',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'remarks' => 'Remarks',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
