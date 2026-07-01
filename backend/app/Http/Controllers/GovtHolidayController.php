<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;
use App\Validators\GovtHolidayValidator;
use App\Repositories\GovtHolidayRepository;
use App\Http\Resources\GovtHolidayResource;
use App\Repositories\DisbursementSlotRepository;
use App\Traits\Controller\RestControllerTrait;

class GovtHolidayController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(GovtHolidayRepository $repository, GovtHolidayValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = GovtHolidayResource::class;
    }

    public function store(Request $request)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            // if this date is exist in disbursement_slot
            $disbursementSlots = (new DisbursementSlotRepository())->findWhere('date', $request->date);
            if ($disbursementSlots->count() > 0) {
                $this->errorResponse('This date has been used in disbursement slot');
            }

            $date = Carbon::parse($request->date);
            $result =  $this->repository->create([
                'name'         => $request->name,
                'day'          => (int) $date->day,
                'month'        => (int) $date->month,
                'year'         => (int) $date->year,
                'date'         => $date->format('Y-m-d'),
                'holiday_type' => $request->holiday_type ?? null,
            ]);
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            // if this date is exist in disbursement_slot
            $disbursementSlots = (new DisbursementSlotRepository())->findWhere('date', $request->date);
            if ($disbursementSlots->count() > 0) {
                $this->errorResponse('This date has been used in disbursement slot');
            }

            $date = Carbon::parse($request->date);
            $response =  $this->repository->update([
                'name'         => $request->name,
                'day'          => (int) $date->day,
                'month'        => (int) $date->month,
                'year'         => (int) $date->year,
                'date'         => $date->format('Y-m-d'),
                'holiday_type' => $request->holiday_type ?? null,
            ], $id);

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

    public function destroy($id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $entity = $this->repository->findById($id);
            if (!$entity) {
                $this->notFoundResponse();
            }

            // RECORD DELETE CRITERIA
            // check if this date is past in disbursement_slot
            $disbursementSlots = (new DisbursementSlotRepository())
                ->newQuery()
                ->whereDate('date', '<=', $entity->date)
                ->get();

            if ($disbursementSlots->count() > 0) {
                $this->errorResponse('This date is past in disbursement slot');
            }

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }
            return $this->deleteResponse();
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
