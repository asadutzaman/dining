<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApproverGroupMemberResource;
use App\Repositories\ApproverGroupMemberRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ApproverGroupMemberValidator;

class ApproverGroupMemberController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['approver_group_id', 'user_id', 'approver_type'];

    use RestControllerTrait;

    public function __construct(ApproverGroupMemberRepository $repository, ApproverGroupMemberValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ApproverGroupMemberResource::class;
    }
}
