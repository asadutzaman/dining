<?php

namespace App\Http\Controllers;

use App\Services\SessionService;
use Exception;
use App\Models\User;
use App\Constants\Common;
use Illuminate\Support\Str;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Services\DateTimeService;
use App\Exceptions\ErrorException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use App\Repositories\GroupRepository;
use Intervention\Image\Facades\Image;
use App\Exceptions\DataErrorException;
use App\Exceptions\ValidatorException;
use App\ApiService\Util\MailApiService;
use App\Services\PasswordPatternService;
use App\Repositories\InvitationRepository;
use App\Repositories\UserSettingRepository;
use App\Repositories\PasswordResetRepository;
use App\Repositories\RequestAccessRepository;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Validation\ValidationException;
use App\Repositories\ApplicantProfileRepository;
use App\Repositories\OauthAccessTokenRepository;
use App\Repositories\OauthRefreshTokenRepository;

class AuthController extends Controller
{
    use RestControllerTrait;

    private $user;

    private $repository;

    // private $invitationRepository;

    private $passwordResetRepository;

    private $oauthAccessTokenRepository;

    private $oauthRefreshTokenRepository;

    private $applicantProfileRepository;

    private $mailApiService;

    private $jwtService;



    public function __construct(
        UserRepository $repository,
        PasswordResetRepository $passwordResetRepository,
        OauthAccessTokenRepository $oauthAccessTokenRepository,
        OauthRefreshTokenRepository $oauthRefreshTokenRepository,
        // InvitationRepository $invitationRepository,
        ApplicantProfileRepository $applicantProfileRepository,
    ) {
        $this->repository = $repository;
        $this->passwordResetRepository = $passwordResetRepository;
        $this->oauthAccessTokenRepository = $oauthAccessTokenRepository;
        $this->oauthRefreshTokenRepository = $oauthRefreshTokenRepository;
        // $this->invitationRepository = $invitationRepository;
        $this->applicantProfileRepository = $applicantProfileRepository;

        $this->mailApiService = new MailApiService();
        $this->jwtService = new JwtService();
        $this->setUser();
    }

    public function setUser()
    {
        try {
            $tokenInfo = $this->jwtService->getTokeInfo();
            $userId = isset($tokenInfo->id) ? $tokenInfo->id : null;
            if ($userId) {
                $this->user = $this->repository->getById($userId);
            }
        } catch (\Exception $e) {
            $this->user = null;
        }
    }

    public function checkValidLoginInfo(Request $request)
    {
        try {
            $this->validate(
                $request,
                [
                    'username' => 'required|max:255',
                    'password' => 'required|min:6',
                    // 'user_captcha_token' => 'required',
                ],
                [
                    'username.required' => 'The Email or Phone field is required.'
                ]
            );


            $credentials = $request->only('username', 'password', 'device_type', 'device_id', 'identifier', 'web_device_token', 'mobile_device_token');
            $username = $credentials['username'];
            $user = $this->repository->findBy('email', $username);

            if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
                $this->validateLoginWithEmail($request, $user, $credentials);
            } else {
                $this->validateLoginWithPhone($request, $user, $credentials);
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Login credentials is verified.',
                'organization_ids' => $user->organization_ids,
                'organogram_ids' => $user->organogram_ids,
            ], 200);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function switchLoginOrganization(Request $request)
    {
        try {
            $this->validate(
                $request,
                [
                    'user_id' => 'required',
                    'organization_id' => 'required',
                    'organogram_id' => 'required',
                ]
            );

            $credentials = $request->only('user_id', 'organization_id', 'organogram_id');
            $userId = $credentials['user_id'];
            $user = $this->repository->findById($userId);

            if (!$user) {
                throw new DataErrorException(['username' => 'Sorry, we do not recognize this user.']);
            }

            $tokens = $this->jwtService->generateTokens($user, $credentials);
            return response()->json([
                'data' => [
                    'access_token'  => $tokens['accessToken'],
                    'refresh_token' => $tokens['refreshToken'],
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function login(Request $request)
    {
        try {
            $this->validate(
                $request,
                [
                    'username' => 'required|max:255',
                    'password' => 'required|min:6',
                ],
                [
                    'username.required' => 'The Email or Phone field is required.'
                ]
            );

            $credentials = $request->only('username', 'password', 'organization_id', 'organogram_id', 'device_type', 'device_id', 'identifier', 'web_device_token', 'mobile_device_token');
            $username = $credentials['username'];
            $user = $this->repository->findBy('email', $username);

            if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
                $this->validateLoginWithEmail($request, $user, $credentials);
            } else {
                $this->validateLoginWithPhone($request, $user, $credentials);
            }

            // Revoke Previous Tokens
            // $this->oauthAccessTokenRepository->revokePreviousTokens($user->id);

            // Create New Token
            $options = [
                'username' => $credentials['username'],
                'device_type' => $credentials['device_type'],
            ];
            $tokens = $this->jwtService->generateTokens($user, $options);
            // $this->updateUserDeviceToken($user->id, $credentials);
            return response()->json([
                'data' => [
                    'access_token'  => $tokens['accessToken'],
                    'refresh_token' => $tokens['refreshToken'],
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function validateLoginWithEmail(Request $request, $user, $credentials)
    {
        $this->validate(
            $request,
            [
                'username' => 'required|email|max:255',
                'password' => 'required|min:6'
            ],
            [
                'username.max' => 'The email address may not be greater than 255 characters.'
            ]
        );

        if (!$user) {
            throw new DataErrorException(['username' => 'Sorry, we do not recognize this email address.']);
        }

        if (!$this->attempt($user, $credentials)) {
            throw new DataErrorException(['password' => 'Password is not valid']);
        }

        if ($user->status == Common::NO) {
            throw new ErrorException('Your Account is Inactive');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'web' && $user->web_access == Common::NO) {
            throw new ErrorException('Web access is not allowed.');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'mobile' && $user->app_access == Common::NO) {
            throw new ErrorException('Mobile access is not allowed.');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'mobile' && $user->app_access == Common::YES && $user->device_id) {
            if (isset($credentials['device_id']) && isset($credentials['identifier'])) {
                $requestAccessRepository = new RequestAccessRepository();

                $whereConditions = [
                    'device_id' => $credentials['device_id'],
                    'identifier' => $credentials['identifier'],
                ];
                $deviceInfo = $requestAccessRepository->getDeviceInfoByConditions($whereConditions, ['id']);

                if (isset($deviceInfo->id) && $deviceInfo->id != $user->device_id) {
                    throw new DataErrorException(['username' => 'Sorry, This device is not authorized.']);
                }
            } else {
                throw new DataErrorException(['username' => 'Sorry, This device is not authorized.']);
            }
        }

        return true;
    }

    public function validateLoginWithPhone(Request $request,  $user, $credentials)
    {
        $this->validate(
            $request,
            [
                'username' => 'required|max:20',
                'password' => 'required|min:6'
            ],
            [
                'username.max' => 'The phone number may not be greater than 20 characters.'
            ]
        );

        if (!$user) {
            throw new DataErrorException(['username' => 'Sorry, we do not recognize this phone number.']);
        }

        if (!$this->attempt($user, $credentials)) {
            throw new DataErrorException(['password' => 'Password is not valid']);
        }

        if ($user->status == Common::NO) {
            throw new ErrorException('Your Account is Inactive');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'web' && $user->web_access == Common::NO) {
            throw new ErrorException('Web access is not allowed.');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'mobile' && $user->app_access == Common::NO) {
            throw new ErrorException('Mobile access is not allowed.');
        }

        if (isset($credentials['device_type']) && $credentials['device_type'] == 'mobile' && $user->app_access == Common::YES && $user->device_id) {
            if (isset($credentials['device_id']) && isset($credentials['identifier'])) {
                $requestAccessRepository = new RequestAccessRepository();

                $whereConditions = [
                    'device_id' => $credentials['device_id'],
                    'identifier' => $credentials['identifier'],
                ];
                $deviceInfo = $requestAccessRepository->getDeviceInfoByConditions($whereConditions, ['id']);

                if (isset($deviceInfo->id) && $deviceInfo->id != $user->device_id) {
                    throw new DataErrorException(['username' => 'Sorry, This device is not authorized.']);
                }
            } else {
                throw new DataErrorException(['username' => 'Sorry, This device is not authorized.']);
            }
        }

        return true;
    }

    public function validateIdTokenAndGenerateAccessToken(Request $request)
    {
        try {
            $this->validate($request, [
                'id_token' => 'required',
            ]);
            $idToken = $request->post('id_token');
            $tokenRepository = new OauthAccessTokenRepository();
            $accessTokenInfo = $tokenRepository->getAccessTokenInfoByIdToken($idToken);
            if (empty($accessTokenInfo)) {
                throw new ErrorException('Id token not found.');
            }

            $tokenInfo = $this->jwtService->getTokeInfoFomAccessToken($accessTokenInfo);
            $user = $this->repository->getById($tokenInfo->id);
            $options = [
                'organogram_id' => isset($tokenInfo->organogram_id) ? $tokenInfo->organogram_id :  null,
                'organization_id' => isset($tokenInfo->organization_id) ? $tokenInfo->organization_id : null,
            ];
            $tokens = $this->jwtService->generateTokens($user, $options);
            return response()->json([
                'data' => [
                    'access_token'  => $tokens['accessToken'],
                    'refresh_token' => $tokens['refreshToken'],
                ]
            ]);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function updateUserDeviceToken($userId, $credentials)
    {
        $deviceType = $credentials['device_type'] ?? '';
        $deviceToken =  $credentials['web_device_token'] ?? '';

        if ($deviceType == 'mobile') {
            $deviceToken =  $credentials['mobile_device_token'] ?? '';
        }

        $userSettingRepository = new UserSettingRepository();
        $userSettingRepository->updateUserDeviceToken($userId, $deviceType, $deviceToken);
    }

    public function attempt($user, $credentials)
    {
        if ($user) {
            if (!Hash::check($credentials['password'], $user->password)) {
                throw new DataErrorException(['password' => 'Password is not valid']);
            }
            return true;
        }

        return false;
    }

    public function register(Request $request)
    {
        // return $request->all();
        try {
            DB::beginTransaction();

            // get password rules from service
            $password = PasswordPatternService::passwordPolicyMaker();
            $pattern = '/' . $password['pattern'] . '/';
            $length = $password['patterns']['length'];
            $message = $password['patterns']['message'];

            $this->validate(
                $request,
                [
                    'email'              => ['required', 'email', 'unique:users'],
                    'phone'              => ['required', 'unique:users'],
                    'password'           => ['required', "min:$length", "regex:$pattern"],
                ],
                [
                    'password.regex' => $message,
                ]
            );

            // Get Data
            $data = $request->all();
            $data['status'] = 1;

            // Default Group ID
            // $groupRepository = new GroupRepository();
            // $defaultGroup = $groupRepository->findBy('used_as_default', 1);
            // $data['group_ids'] = isset($defaultGroup->id) ? ["{$defaultGroup->id}"] : null;

            // Create User
            $result =  $this->repository->create($data);

            // INSERT DATA INTO APPLICANT PROFILE
            $applicantProfile['user_id'] = $result->id;
            $applicantProfile['name_en'] = $request->name;
            $applicantProfile['email'] = $request->email;
            $applicantProfile['mobile_no'] = $request->phone;
            $applicantProfile['registration_type'] = $request->registration_type;
            $applicantProfile['institute_organization_type'] = $request->institute_organization_type;
            $applicantProfile['institute_organization_id'] = $request->institute_organization_id;
            $applicantProfile['institute_organization_other'] = $request->institute_organization_other;
            $applicantProfile['status'] = 1;
            $this->applicantProfileRepository->create($applicantProfile);

            // Generate Activation Link
            // $resetToken = $this->generateResetToken($result);
            // $userActivationUrl = config('api.base_url') . 'en/auth/verify-email/' . $resetToken;
            // $data['userActivationUrl'] = $userActivationUrl;

            // Send Email
            // $this->mailApiService->sendRegisterMail($data['email'], $data);

            DB::commit();

            // return response()->json([
            //     'success' => true,
            //     'message' => 'Please confirm your email address.',
            //     'userActivationUrl' => $userActivationUrl,
            // ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {

            DB::rollBack();
            throw $e;
        }
    }

    public function verifyUserEmail(Request $request)
    {
        $this->validate($request, [
            'verifyToken' => 'required',
        ]);

        $data  = $request->all();
        $token = $data['verifyToken'];
        $resetToken =  $this->passwordResetRepository->findBy('token', $token);
        if (!$resetToken) {
            return response()->json(['message' => 'Verification code is invalid.'], 400);
        }

        $user = $this->repository->findBy('email', $resetToken->email);
        if ($user->status == Common::YES) {
            return response()->json(['message' => 'Account already verified..'], 200);
        } else {
            $user->status = Common::YES;
            $user->email_verified_at = DateTimeService::getCurrentDateTime();
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'You have successfully verified your email address.'
            ], 200);
        }
    }

    public function verifyUserPhone(Request $request)
    {
        $this->validate($request, [
            'verifyToken' => 'required',
        ]);

        $data  = $request->all();
        $token = $data['verifyToken'];
        $resetToken =  $this->passwordResetRepository->findBy('token', $token);
        if (!$resetToken) {
            return response()->json(['message' => 'Verification code is invalid.'], 400);
        }

        $user = $this->repository->findBy('phone', $resetToken->email);
        if ($user->status == Common::YES) {
            return response()->json(['message' => 'Account already verified..'], 200);
        } else {
            $user->status = Common::YES;
            $user->phone_verified_at = DateTimeService::getCurrentDateTime();
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'You have successfully verified your phone number.'
            ], 200);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            DB::beginTransaction();

            $this->validate($request, [
                'email' => 'required|email',
            ]);

            //Get user details
            $user = $this->repository->findBy('email', $request->input('email'));
            if (!$user) {
                throw new DataErrorException(['email' => 'Sorry, we do not recognize this email address.']);
            }

            $resetToken   = $this->generateResetToken($user);
            $forgotPasswordUrl = config('api.base_url') . 'en/auth/reset-password/' . $resetToken;

            // Send Mail
            $data = [
                'userInfo'          => $user,
                'forgotPasswordUrl' => $forgotPasswordUrl,
            ];

            $this->mailApiService->sendForgotPasswordMail($user['email'], $data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Please check your email to recover your password.',
                'forgotPasswordUrl' => $forgotPasswordUrl,
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            DB::beginTransaction();

            $this->validate($request, [
                'resetToken' => 'required',
                'password' => 'required|min:6',
                'confirm_password' => 'required|min:6',
            ]);

            $data = $request->all();
            $resetToken = $data['resetToken'];
            $resetToken =  $this->passwordResetRepository->findBy('token', $resetToken);
            if (!$resetToken) {
                throw new ErrorException('Password reset token is invalid or has expired.');
            }

            // Check timestamps
            $resetTime = Carbon::parse($resetToken->created_at)->timestamp;
            $unixNow = Carbon::now()->format('U');
            if ($unixNow - $resetTime > 86400) {
                throw new ErrorException('Token has expired.');
            }

            // Password check
            $password = $data['password'];
            $confirmPassword = $data['confirm_password'];
            if ($password !== $confirmPassword) {
                throw new DataErrorException(['confirm_password' => 'The password confirmation does not match']);
            }

            // Password Save
            $user = $this->repository->findBy('email', $resetToken->email);
            $user->password = $password;
            $user->save();

            // Send Email
            $this->mailApiService->sendResetPasswordMail($user['email'], $user);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Password successfully changed.'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function changePassword(Request $request)
    {
        $this->validate($request, [
            'old_password'              => 'required|min:6',
            'new_password'              => 'required|min:6',
            'new_password_confirmation' => 'required|min:6',
        ]);

        $data = $request->all();
        $oldPassword             = $data['old_password'];
        $newPassword             = $data['new_password'];
        $newPasswordConfirmation = $data['new_password_confirmation'];
        if ($newPassword !== $newPasswordConfirmation) {
            throw new DataErrorException(['new_password_confirmation' => 'The password confirmation does not match']);
        }

        $user = $this->user;
        if ($user) {
            if (Hash::check($oldPassword, $user->password)) {
                $user->password = $newPassword;
                $user->save();

                // Revoke This User Other Tokens
                $sessionService = (new SessionService())->init();
                $token = $sessionService->getUserToken();
                $this->oauthAccessTokenRepository->revokeOtherTokenThisUser($user->id, $token);

                return response()->json([
                    'success' => true,
                    'message' => 'Password has been changed successfully'
                ]);
            }
            throw new DataErrorException(['old_password' => 'The old password is incorrect']);
        }

        throw new ErrorException('Your session has expired. Please log in');
    }

    public function invitePeople(Request $request)
    {
        try {
            DB::beginTransaction();

            $this->validate($request, [
                'email' => 'required|email',
            ]);

            $token  = Str::random(30);

            // Send Mail
            $data = [
                'token'          => $token,
                'email'          => $request->input('email'),
                // 'inviter_id'     => isset($this->user->id) ? $this->user->id : null,
            ];

            // Save Database
            // $result =  $this->invitationRepository->create($data);

            $data['invitation_url'] = config('api.base_url');

            // Send Mail
            $this->mailApiService->sendInvitePeopleMail($data['email'], $data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sed Invitation Successfully',
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function logout(Request $request)
    {
        if ($this->user) {
            $sessionService = (new SessionService())->init();
            $token = $sessionService->getUserToken();
            $this->oauthAccessTokenRepository->revokeToken($token);

            return response()->json([
                'success' => true,
                'message' => 'Logout successfully'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unable to Logout'
            ]);
        }
    }

    public function generateResetToken(User $user)
    {
        $randomToken   = Str::random(30);
        $data = [
            'email' => $user->email,
            'token' => $randomToken
        ];
        $result = $this->passwordResetRepository->create($data);
        return $randomToken;
    }

    public function refreshToken(Request $request)
    {
        try {
            $this->validate($request, [
                'refresh_token' => 'required',
            ]);

            $refreshToken = $request->post('refresh_token');
            $refreshTokenInfo = $this->oauthRefreshTokenRepository->getRefreshTokenInfo($refreshToken);
            if (empty($refreshTokenInfo)) {
                throw new ErrorException('Refresh token not found.');
            }

            $tokenInfo = $this->jwtService->getTokeInfoFomAccessToken($refreshTokenInfo);
            $user = $this->repository->getById($tokenInfo->id);
            $options = [
                'organogram_id' => isset($tokenInfo->organogram_id) ? $tokenInfo->organogram_id :  null,
                'organization_id' => isset($tokenInfo->organization_id) ? $tokenInfo->organization_id : null,
            ];
            $tokens = $this->jwtService->generateTokens($user, $options);
            return response()->json([
                'data' => [
                    'access_token'  => $tokens['accessToken'],
                    'refresh_token' => $tokens['refreshToken'],
                ]
            ]);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function jsonError($message)
    {
        return response()->json(['message' => $message], 400);
    }

    public function loadUserScopes(Request $request)
    {
        try {
            $this->validate($request, [
                'user_id'    => 'required',
            ]);

            $userId = request()->input('user_id');
            $scopes = $this->repository->getUserScopes($userId);


            return response()->json($scopes);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function OtpCode(Request $request)
    {
        try {
            $data['email'] = $request->email;

            $this->validate(
                $request,
                [
                    'email'    => ['required', 'email', 'unique:users'],
                    'phone'    => ['required', 'unique:users'],
                    // 'user_captcha_token' => ['required'],
                ]
            );

            $otp = random_int(100000, 999999);
            $data['otp'] = $otp;

            $message =  $this->mailApiService->sendOtpCodeMail($data['email'], $data);

            if ($message->code == 200) {
                return response()->json($data);
            }
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function passwordPattern()
    {
        $data = [];
        $data['password_pattern'] = PasswordPatternService::passwordPolicyMaker();
        return response()->json($data);
    }
}
