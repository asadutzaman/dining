<?php

namespace App\Validators;

use App\Enums\ItemTypeEnum;
use Illuminate\Validation\Rules\Enum;

class ItemValidator extends BaseValidator
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
                    'type'             => ['required', new Enum(ItemTypeEnum::class)],
                    'logistic_id'      => ['required', 'integer', 'exists:logistics,id'],
                    'item_category_id' => ['required', 'integer', 'exists:item_categories,id'],
                    'brand_id'         => ['required', 'integer', 'exists:brands,id'],
                    'base_unit_id'     => ['required', 'integer', 'exists:units,id'],
                    'code'             => ['nullable', 'string', 'max:255'],
                    'name_en'          => ['required', 'string', 'max:255'],
                    'name_bn'          => ['required', 'string', 'max:255'],
                    // 'name_code'        => ['required', 'unique:items,name_code,NULL,id,deleted_at,NULL'],
                    'description'      => ['nullable', 'string', 'max:255'],
                    'reorder_qty'      => ['required', 'numeric', 'gt:0'],
                ];
            case 'PUT':
            case 'PATCH':
                $id = $this->request->id;

                return [
                    'type'             => ['required', new Enum(ItemTypeEnum::class)],
                    'logistic_id'      => ['required', 'integer', 'exists:logistics,id'],
                    'item_category_id' => ['required', 'integer', 'exists:item_categories,id'],
                    'brand_id'         => ['required', 'integer', 'exists:brands,id'],
                    'base_unit_id'     => ['required', 'integer', 'exists:units,id'],
                    'code'             => ['nullable', 'string', 'max:255'],
                    'name_en'          => ['required', 'string', 'max:255'],
                    'name_bn'          => ['required', 'string', 'max:255'],
                    // 'name_code'        => ['required', 'unique:items,name_code,' . $id . ',id,deleted_at,NULL'],
                    'description'      => ['nullable', 'string', 'max:255'],
                    'reorder_qty'      => ['required', 'numeric', 'gt:0'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'item_category_id.required' => 'Item Category is required.',
            'logistic_id.required'      => 'Logistic is required.',
            'type.required'             => 'Type is required.',
            'name.required'             => 'Name is required.',
            'base_unit_id.required'    => 'Base Unit is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'item_category_id' => 'Item Category',
            'logistic_id'      => 'Logistic',
            'type'             => 'Type',
            'name'             => 'Name',
            'base_unit_id'    => 'Base Unit',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
