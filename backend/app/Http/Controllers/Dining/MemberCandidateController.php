<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Repositories\Dining\MemberCandidateRepository;
use App\Http\Resources\Dining\MemberCandidateResource;
use App\Traits\Controller\RestControllerTrait;

class MemberCandidateController extends Controller
{
    private $repository;

    private $resource;

    use RestControllerTrait;

    public function __construct(MemberCandidateRepository $repository)
    {
        $this->repository = $repository;
        $this->resource = MemberCandidateResource::class;
    }
}
