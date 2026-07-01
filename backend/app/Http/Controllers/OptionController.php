<?php

namespace App\Http\Controllers;

use App\Http\Resources\OptionResource;
use App\Repositories\OptionRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\OptionValidator;
use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;

class OptionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['key', 'value', 'comment'];

    use RestControllerTrait;

    public function __construct(OptionRepository $repository, OptionValidator $validator)
    {
        $this->repository   = $repository;
        $this->validator    = $validator;
        $this->resource     = OptionResource::class;
    }

    public function load()
    {
        try {
            $result = $this->repository->loadOption();
            return $this->successResponse($result);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function save(Request $request)
    {
        try {
            $data = $request->all();
            foreach ($data as $item) {
                $key = isset($item['key']) ? $item['key'] : null;
                $option =  $this->repository->getOptionByKey($key);
                if ($option) {
                    $response = $this->repository->update($item, $option->id);
                }
                else {
                    $result =  $this->repository->create($item);
                    $response = isset($this->resource) ? new $this->resource($result) : $result;
                }
            }

            return $this->successResponse(true);
        }
        catch (ValidationException $e) {
            throw new ValidatorException($e);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

}
