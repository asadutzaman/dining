<?php

namespace App\Validators;

use Illuminate\Http\Request;

class AuthValidator
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
                    'name' => ['required', 'string', 'max:255'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name' => ['required', 'string', 'max:255'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'name.required' => 'Name is required.'
        ];
    }

    public function attributes()
    {
        return [
            'name' => 'Name',
        ];
    }

}
