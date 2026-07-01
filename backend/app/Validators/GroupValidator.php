<?php

namespace App\Validators;

use Illuminate\Http\Request;

class GroupValidator
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
                    'name' => 'required',
                    'code' => 'required'
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name' => 'required',
                    'code' => 'required'
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'name.required' => 'Name is required.',
            'code.required' => 'Code is required.'
        ];
    }

    public function attributes()
    {
        return [
            'name' => 'Name',
            'code' => 'Code',
        ];
    }
}
