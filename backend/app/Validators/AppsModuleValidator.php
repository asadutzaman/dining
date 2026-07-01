<?php

namespace App\Validators;

class AppsModuleValidator extends BaseValidator
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
                    'apps_id'     => ['required', 'integer'],
                    'code'        => ['required', 'string', 'max:50'],
                    'name'        => ['required', 'string', 'max:255'],
                    'description' => ['nullable', 'string', 'max:255'],
                    'sort_order'  => ['required', 'integer'],
                    'status'      => ['required', 'integer'],
                ];

            case 'PUT':
            case 'PATCH':
                return [
                    'apps_id'     => ['required', 'integer'],
                    'code'        => ['required', 'string', 'max:50'],
                    'name'        => ['required', 'string', 'max:255'],
                    'description' => ['nullable', 'string', 'max:255'],
                    'sort_order'  => ['required', 'integer'],
                    'status'      => ['required', 'integer'],
                ];

            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'name.required'     => 'Name is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'apps_id' => 'Apps',
            'sort_order' => 'Sort Order',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
