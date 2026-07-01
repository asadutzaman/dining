<?php

namespace App\Http\Controllers;

use App\Validators\MealSettingValidator;
use App\Repositories\MealSettingRepository;
use App\Http\Resources\MealSettingResource;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dotenv\Exception\ValidationException;
use App\Exceptions\ValidatorException;

class MealSettingController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(MealSettingRepository $repository, MealSettingValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = MealSettingResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $exists = $this->repository->checkEffectiveFromUnique($request->meal_type, $request->effective_from);
            if ($exists > 0) {
                $this->errorResponse('A cost setting for this meal type already exists for this effective date!');
            }

            $result = $this->repository->create([
                'meal_type'      => $request->meal_type,
                'cost'           => $request->cost,
                'effective_from' => $request->effective_from,
            ]);

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $exists = $this->repository->checkEffectiveFromUnique($request->meal_type, $request->effective_from, $id);
            if ($exists > 0) {
                $this->errorResponse('A cost setting for this meal type already exists for this effective date!');
            }

            $this->repository->update([
                'meal_type'      => $request->meal_type,
                'cost'           => $request->cost,
                'effective_from' => $request->effective_from,
            ], $id);

            DB::commit();
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    // Used by the token screen to fetch today's active cost for a meal type
    public function currentCost(Request $request)
    {
        try {
            $mealType = $request->query('meal_type');
            $date = $request->query('date') ?? now()->format('Y-m-d');
            if (empty($mealType)) {
                $this->errorResponse('Meal type is required!');
            }

            $setting = $this->repository->getEffectiveCost($mealType, $date);
            if (!$setting) {
                $this->notFoundResponse();
            }

            $response = new MealSettingResource($setting);
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
