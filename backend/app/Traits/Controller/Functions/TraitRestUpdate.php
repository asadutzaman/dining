<?php

namespace App\Traits\Controller\Functions;

use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;

trait TraitRestUpdate
{
    public function update(Request $request, $id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            $response = $this->repository->update($request->all(), $id);

            // Get Data
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
