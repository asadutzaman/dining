<?php

namespace App\Repositories;

use App\Http\Controllers\Approval\GoodsReceiveNoteApprovalController;
use App\Http\Controllers\Approval\RequisitionApprovalController;
use App\Http\Controllers\Approval\StockAdjustmentApprovalController;
use App\Http\Controllers\Approval\StockTransferApprovalController;
use App\Models\WorkflowStepTask;
use App\Services\ODataService;
use Illuminate\Support\Facades\Log;

class WorkflowStepTaskProcessRepository extends BaseRepository
{
    protected $updateFields = [];
    protected $workflowTaskList = [];
    protected $workflowFiles = [];

    public function processWorkflowActionTask($model)
    {
        $workflowStepTaskRepository = new WorkflowStepTaskRepository();
        $workflowStepId = $model['workflow_step_id'];
        $workflowActionCode = $model['workflow_action_code'];
        $workflowTaskList = $workflowStepTaskRepository->getWorkflowStepTaskList($workflowStepId, $workflowActionCode);
        $this->workflowTaskList = $workflowTaskList;
        // Log::info('Workflow Task', array($workflowTaskList));

        if (empty($workflowTaskList)) {
            return false;
        }

        foreach ($workflowTaskList as $task) {
            // Log::info('Workflow Task', array($task));
            if ($task->task_key == 'UPDATE_FIELD') {
                $this->taskUpdateFields($model, $task);
            } elseif ($task->task_key == 'TO_DO') {
                $this->taskUpdateToDo($model, $task);
            }
            // elseif ($task->task_key == 'SEND_SMS') {
            //     $this->taskSendMessage(ChannelType::SMS, $model, $task);
            // } elseif ($task->task_key == 'SEND_NOTIFICATION') {
            //     $this->taskSendMessage(ChannelType::NOTIFICATION, $model, $task);
            // }
        }
    }

    protected function taskUpdateFields($model, $task)
    {
        $data = [];

        try {
            $workflowRecordId = $model['workflow_record_id'];
            $workflowRepository = new WorkflowRepository();
            $workflowInfo = $workflowRepository->findById($model['workflow_id']);

            $data[$task->field_name] = $task->field_value;
            $this->updateFields[$task->field_name] = $task->field_value;

            // Log::info('Workflow Update Fields', $data);

            if ($workflowInfo->type == 'Requisition') {
                // Call another controller method directly
                $requisitionController = app(RequisitionApprovalController::class);
                $requisitionController->workflowProcess($data, $workflowRecordId);
            }
            if ($workflowInfo->type == 'GoodsReceiveNote') {
                // Call another controller method directly
                $goodsReceiveNoteApprovalController = app(GoodsReceiveNoteApprovalController::class);
                $goodsReceiveNoteApprovalController->workflowProcess($data, $workflowRecordId);
            }
            if ($workflowInfo->type == 'StockAdjustment') {
                // Call another controller method directly
                $stockAdjustmentApprovalController = app(StockAdjustmentApprovalController::class);
                $stockAdjustmentApprovalController->workflowProcess($data, $workflowRecordId);
            }
            if ($workflowInfo->type == 'StockTransfer') {
                // Call another controller method directly
                $stockTransferApprovalController = app(StockTransferApprovalController::class);
                $stockTransferApprovalController->workflowProcess($data, $workflowRecordId);
            }
        } catch (\Exception $e) {
            Log::error('Workflow Update Fields', [
                'data' => $data,
            ]);
            throw $e;
        }
    }

    protected function taskUpdateToDo($model, $task)
    {
        $data = [];

        try {
            $workflowRecordId = $model['workflow_record_id'];
            $workflowRepository = new WorkflowRepository();
            $workflowInfo = $workflowRepository->findById($model['workflow_id']);

            $data['update_fields'][$task->field_name] = $task->field_value;
            $this->updateFields[$task->field_name] = $task->field_value;

            $data['to_do_data'] = $model['to_do_data'];

            Log::info('Workflow Update Fields', $data);

            if ($workflowInfo->type == 'Requisition') {
                // Call another controller method directly
                $requisitionController = app(RequisitionApprovalController::class);
                $requisitionController->updateReviseQuantity($data, $workflowRecordId);
            }
        } catch (\Exception $e) {
            Log::error('Workflow Update Fields', [
                'data' => $data,
            ]);
            throw $e;
        }
    }
}
