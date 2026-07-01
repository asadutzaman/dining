<?php

namespace App\Http\Controllers;

use App\Validators\RequisitionItemLimitValidator;
use App\Repositories\RequisitionItemLimitRepository;
use App\Http\Resources\RequisitionItemLimitResource;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;

class RequisitionItemLimitController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(RequisitionItemLimitRepository $repository, RequisitionItemLimitValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = RequisitionItemLimitResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $payload = $request->all();
            $results = [];
            if (!empty($payload['item_ids']) && is_array($payload['item_ids'])) {
                foreach ($payload['item_ids'] as $itemId) {
                    $data = [
                        'designation_id' => $payload['designation_id'],
                        'item_id'        => $itemId,
                        'limit_type'     => $payload['limit_type'],
                        'max_qty'        => $payload['max_qty'],
                        'effective_from' => $payload['effective_from'],
                    ];
                    $results[] = $this->repository->create($data);
                }
                DB::commit();
                return $this->successResponse($results);
            } else {
                $result = $this->repository->create([
                    'designation_id' => $payload['designation_id'],
                    'item_id'        => $payload['item_id'],
                    'limit_type'     => $payload['limit_type'],
                    'max_qty'        => $payload['max_qty'],
                    'effective_from' => $payload['effective_from'],
                ]);
                DB::commit();
                $response = isset($this->resource) ? new $this->resource($result, false) : $result;
                return $this->successResourceResponse($response);
            }
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }
}
