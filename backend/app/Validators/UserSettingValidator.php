<?php

namespace App\Validators;

use Illuminate\Http\Request;

class UserSettingValidator
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
                    'user_id' => ['required']
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'user_id' => ['required']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'user_id.required'          => 'User id is required.',
        ];
    }

    public function attributes()
    {
        return [
            'user_id'     => 'User',
        ];
    }

}
