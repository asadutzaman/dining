<?php

namespace App\Validators;

use Illuminate\Http\Request;

class ResourceValidator
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
                    'permission_type'   => 'required',
                    'name'              => 'required',
                    'display_name'      => 'required',
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'permission_type'   => 'required',
                    'name'              => 'required',
                    'display_name'      => 'required',
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'name.required'         => 'Name is required.',
        ];
    }

    public function attributes()
    {
        return [
            'name'          => 'Name',
        ];
    }
}
