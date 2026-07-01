<?php

namespace App\Listeners;

use App\Events\WorkflowTaskEvent;
use App\Repositories\WorkflowStepTaskProcessRepository;

class WorkflowTaskListener
{
    protected $repository;
    /**
     * Create the event listener.
     */
    public function __construct(WorkflowStepTaskProcessRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Handle the event.
     */
    public function handle(WorkflowTaskEvent $event): void
    {
        $model = $event->model;
        $this->repository->processWorkflowActionTask($model);
    }
}
