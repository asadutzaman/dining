<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Validators\Dining\PaymentValidator;
use App\Repositories\Dining\PaymentRepository;
use App\Repositories\Dining\MemberRepository;
use App\Repositories\CodeSequenceRepository;
use App\Http\Resources\Dining\PaymentResource;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dotenv\Exception\ValidationException;
use App\Exceptions\ValidatorException;

class PaymentController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(PaymentRepository $repository, PaymentValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = PaymentResource::class;
    }

    public function store(Request $request)
    {
        /*
         * STEP-1: VALIDATE MEMBER HAS ENOUGH DUE BALANCE TO COLLECT AGAINST
         * STEP-2: GENERATE PAYMENT NUMBER
         * STEP-3: CREATE PAYMENT (LEDGER ENTRY)
         * STEP-4: REDUCE MEMBER RUNNING DUE BALANCE
         */
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $member = (new MemberRepository())->findById($request->member_id);
            if (!$member) {
                $this->errorResponse('Member not found!');
            }

            if ((float) $request->amount > (float) $member->due_balance) {
                $this->errorResponse('Payment amount cannot exceed the member\'s due balance of ' . $member->due_balance . '!');
            }

            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('PAYMENT');
            if ($latestCodeSequence == null) {
                $this->errorResponse('Number Sequence not found!');
            }

            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            $paymentResult = $this->repository->create([
                'payment_number' => $latestCodeSequence,
                'member_id'      => $request->member_id,
                'amount'         => $request->amount,
                'payment_date'   => $request->payment_date,
                'payment_method' => $request->payment_method ?? 'CASH',
                'remarks'        => $request->remarks,
                'collected_by'   => $userData['id'] ?? null,
            ]);

            if (empty($paymentResult)) {
                $this->errorResponse('Payment collection failed!');
            }

            (new CodeSequenceRepository())->updateNextSequenceByLabel('PAYMENT');

            (new MemberRepository())->decrementDueBalance($request->member_id, $request->amount);

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($paymentResult) : $paymentResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $payment = $this->repository->findById($id);
            if (!$payment) {
                $this->notFoundResponse();
            }

            // Reverse the running due balance since this collected amount is being voided
            (new MemberRepository())->incrementDueBalance($payment->member_id, $payment->amount);

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }

            DB::commit();
            return $this->deleteResponse();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }
}
