<?php

namespace App\Validators;

use Illuminate\Http\Request;

class WorkspaceValidator
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
                    'name'=>'required'
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name'=>'required'
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
