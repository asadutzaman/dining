<?php

namespace App\Validators;

use Illuminate\Http\Request;

class OrganizationValidator
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function rules()
    {
        switch ($this->request->method()) {
            case 'GET':
            case 'DELETE':
                return [];

            case 'POST':
                return [
                    'name_en'        => 'required',
                    'short_name'     => 'required',
                    'status'         => 'required',
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name_en'        => 'required',
                    'short_name'     => 'required',
                    'status'         => 'required',
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'name_en.required' => 'Name (in English) is required.',
        ];
    }

    public function attributes()
    {
        return [
            'name_en' => 'Name (in English)',
        ];
    }
}
