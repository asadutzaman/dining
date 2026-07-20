<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Dining\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Base for the KhaiDai mobile API.
 *
 * The staff web client consumes bare payloads via RestControllerTrait; the app
 * gets a consistent envelope instead, so the Android client can decode every
 * response -- success or failure -- into one sealed type without special-casing
 * status codes at each call site.
 */
abstract class BaseMobileController extends Controller
{
    protected function ok($data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    protected function fail(string $message, int $status = 422, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => (object) $errors,
        ], $status);
    }

    /**
     * Run a handler, converting the failure modes the domain services raise into
     * envelope responses. Keeps every action free of repeated try/catch noise.
     */
    protected function handle(callable $action): JsonResponse
    {
        try {
            return $action();
        } catch (ValidationException $e) {
            return $this->fail('Please check the highlighted fields.', 422, $e->errors());
        } catch (\Throwable $e) {
            // Domain rules ("cutoff passed", "code expired") are written for the
            // member and are safe to show. Anything unexpected is logged and
            // replaced, so internals never reach the app.
            Log::error('[MobileApi] ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file'      => $e->getFile() . ':' . $e->getLine(),
            ]);

            return $this->fail(
                $e instanceof \Exception && $e->getMessage() !== ''
                    ? $e->getMessage()
                    : 'Something went wrong. Please try again.',
                422
            );
        }
    }

    /**
     * Validate, throwing so handle() renders the errors.
     *
     * @throws ValidationException
     */
    protected function check(array $data, array $rules, array $messages = []): array
    {
        return Validator::make($data, $rules, $messages)->validate();
    }

    /**
     * The authenticated member. Routes are behind auth:member, so this is only
     * null if the guard is misconfigured -- worth failing loudly rather than
     * silently returning another member's data.
     */
    protected function member(): Member
    {
        $member = auth('member')->user();

        if (!$member instanceof Member) {
            abort(401, 'Authentication required.');
        }

        return $member;
    }
}
