<?php

namespace App\Http\Controllers;

use App\Http\Resources\CodeSequenceResource;
use App\Repositories\CodeSequenceRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\CodeSequenceValidator;

class CodeSequenceController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(CodeSequenceRepository $repository, CodeSequenceValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = CodeSequenceResource::class;
    }

}
