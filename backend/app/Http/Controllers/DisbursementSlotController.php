<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;
use App\Validators\DisbursementSlotValidator;
use App\Repositories\DisbursementSlotRepository;
use App\Http\Resources\DisbursementSlotResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\ApplicationSettingRepository;

class DisbursementSlotController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $applicationSettingRepository;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(DisbursementSlotRepository $repository, DisbursementSlotValidator $validator, ApplicationSettingRepository $applicationSettingRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = DisbursementSlotResource::class;
        $this->applicationSettingRepository = $applicationSettingRepository;
    }

    public function generateTimeSlots()
    {
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate(request(), $this->validator->rules(), $this->validator->messages());
            }
            $result = $this->repository->generateTimeSlots();
            DB::commit();
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage());
        }
    }
}
