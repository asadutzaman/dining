<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\ApplicationSettingResource;
use App\Repositories\ApplicationSettingRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ApplicationSettingValidator;
use Dotenv\Exception\ValidationException;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ApplicationSettingController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ApplicationSettingRepository $repository, ApplicationSettingValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ApplicationSettingResource::class;
    }

    public function store(Request $request)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $formData = $request->all();
            foreach ($formData as $key => $value) {
                if ($key == 'office_hours') {
                    $startTime = date('H:i', strtotime($value[0])); // e.g., "05:17"
                    $endTime = date('H:i', strtotime($value[1]));   // e.g., "14:17"

                    // Convert strings to Carbon objects
                    $startTimeCarbon = Carbon::createFromFormat('H:i', $startTime);
                    $endTimeCarbon = Carbon::createFromFormat('H:i', $endTime);

                    // Calculate difference in hours
                    $totalOfficeHours = $startTimeCarbon->diffInHours($endTimeCarbon);
                    // Log::info($totalOfficeHours);

                    // Convert the Difference into Minutes
                    $totalOfficeHoursInMinutes = $totalOfficeHours * 60;
                    // Log::info($totalOfficeHoursInMinutes);

                    //Finding Out Daily Slot Quantity Limit
                    $dailySlotQuantityLimit = (int) ($totalOfficeHoursInMinutes / $formData['slot_duration']);
                    // Log::info($dailySlotQuantityLimit);

                    $dailyAssignSlotQuantityLimit = (int) $dailySlotQuantityLimit * $formData['slot_capacity'];
                    // Log::info($dailyAssignSlotQuantityLimit);

                    // Store as separate values
                    $this->repository->findAndUpdate('office_start_time', $startTime);
                    $this->repository->findAndUpdate('office_end_time', $endTime);
                    $this->repository->findAndUpdate('daily_slot_quantity_limit', $dailySlotQuantityLimit);
                    $this->repository->findAndUpdate('daily_assign_slot_quantity_limit', $dailyAssignSlotQuantityLimit);
                    continue;
                }

                $this->repository->findAndUpdate($key, $value);
            }


            $result =  $this->repository->get();
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
