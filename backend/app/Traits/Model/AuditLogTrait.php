<?php

namespace App\Traits\Model;

use App\ApiService\Util\AuditLogApiService;
use App\Services\SessionService;
use Illuminate\Support\Arr;

trait AuditLogTrait
{
    protected $skipAuditLog = false;

    protected $skipUser = ['implementer@nurtech.co'];

    protected $auditExclude = [
        'id',
        'uuid',
        'workspace_id',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
        'deleted_at',
        // Workflow
        'assigned_to_user_id',
        'assigned_to_role_id',
        'prev_step_name',
        'step_name',
        'step_action',
        'schedule_status',
        'status',
    ];

    protected $auditInclude = [];

    protected $auditModelClassMap = [
        // 'App\Models\User' => [
        //     'class_name' => 'User',
        //     'events' => ['CREATED', 'UPDATED', 'DELETED']
        // ],
        // 'App\Models\Role' => [
        //     'class_name' => 'Role',
        //     'events' => ['CREATED', 'UPDATED', 'DELETED']
        // ],
    ];

    protected static function bootAuditLogTrait()
    {
        static::created(function($model)  {
            $model->storeAudit('CREATED', $model);
        });

        static::updated(function($model)  {
            $model->storeAudit('UPDATED', $model);
        });

        static::deleted(function($model)  {
            $model->storeAudit('DELETED', $model);
        });
    }

    protected function storeAudit($event, $model)
    {
        $modelClassName = get_class($model) ?? null;
        if($this->skipAuditLog){
            return;
        }
        else if (!$this->isModelAuditable($modelClassName)) {
            return;
        }
        else if ($this->isUserSkipAudit()) {
            return;
        }

        $recordId = $model->id;
        $changes = null;
        $activity = null;
        $component = $this->auditModelClassMap[$modelClassName]['class_name'] ?? null;
        if ($event == 'CREATED') {
            $activity = 'Create ' . $component . ' - #' . $recordId;
            $changes = $this->logValues($event, $model);
        }
        if ($event == 'UPDATED') {
            $activity = 'Modified ' . $component . ' - #' . $recordId;
            $changes = $this->logValues($event, $model);
        }
        if ($event == 'DELETED') {
            $activity = 'Delete ' . $component . ' - #' . $recordId;
            $changes = $this->logValues($event, $model);
        }

        $data = [
            'record_id'     => $model->id ?? null,
            'component'     => $component,
            'action'        => $event,
            'activity'      => $activity,
            'changes'       => json_encode($changes),
            'ip_address'    => request()->ip() ?? null,
            'browser_agent' => request()->header('User-Agent') ?? null,
            'platform'      => 'WEB',
        ];

        $auditLogApiService = new AuditLogApiService();
        $auditLogApiService->store($data);
    }

    protected function logValues($event, $model)
    {
        $data = [];

        $changeAttributes = array_merge($model->getChanges(), ['id' => $model->id]);
        foreach ($changeAttributes as $attribute => $value) {
            if ($this->isAttributeAuditable($attribute)) {
                $oldValue = Arr::get($model->original, $attribute);
                $newValue = Arr::get($model->attributes, $attribute);
                $data[] = [
                    'filed_name' => $attribute,
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                ];
            }
        }
        return $data;
    }

    protected function isUserSkipAudit()
    {
        $sessionService = (new SessionService())->init();
        $userData = $sessionService->getUserData();

        // if (in_array($userData->email, $this->skipUser)) {
        //     return true;
        // }

        return false;
    }

    protected function isModelAuditable($modelClassName)
    {
        $auditModelClassKeys = array_keys($this->auditModelClassMap);
        if (in_array($modelClassName, $auditModelClassKeys)) {
            return true;
        }

        return false;
    }

    protected function isAttributeAuditable($attribute)
    {
        $auditExclude = $this->getAuditExclude();
        if (in_array($attribute, $auditExclude)) {
            return false;
        }

        $auditInclude = $this->getAuditInclude();
        return in_array($attribute, $auditInclude) || empty($include);
    }

    public function getAuditInclude()
    {
        return isset($this->auditInclude) ? (array) $this->auditInclude : [];
    }

    public function getAuditExclude()
    {
        return isset($this->auditExclude) ? (array) $this->auditExclude : [];
    }

}
