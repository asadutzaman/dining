<?php

namespace App\Traits\Controller\Functions;

use App\Exceptions\ValidatorException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait TraitRestStore
{
    public function store(Request $request)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            $result =  $this->repository->create($request->all());
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
