<?php

namespace App\Validators;

class GoodsReceiveNoteValidator extends BaseValidator
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
                    'ref_challan_no' => ['required'],
                    'remarks'        => ['nullable', 'string'],
                    'grnItemsList'   => ['required', 'array'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'ref_challan_no' => ['required'],
                    'remarks'        => ['nullable', 'string'],
                    'grnItemsList'   => ['required', 'array'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'ref_challan_no.required'   => 'Referance Challan Number is required.',
            'remarks.regex' => 'Remarks may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'ref_challan_no' => 'Referance Challan Number',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
