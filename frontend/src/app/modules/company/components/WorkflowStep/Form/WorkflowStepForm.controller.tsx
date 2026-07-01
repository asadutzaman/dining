import {WorkflowStepApi} from 'src/app/api'
import {useForm} from 'src/app/hooks/useForm'
import {Message} from 'src/app/utils'
import React, {FC, useEffect, useState} from 'react'
import WorkflowStepFormDrawer from './WorkflowStepForm.drawer'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {useLang} from 'src/app/hooks/useLang'

const initialState = {
  modalTitle: 'Create Workflow Step',
  itemData: {
    id: null,
    step_name: null,
    sort_order: null,
    component: null,
    identifier: null,
    status: null,
  },
  workflowStepConditionList: [],
  workflowStepApproverList: [],
  workflowStepActionList: [],
  workflowStepTaskList: [],
  fields: {
    workflow_id: null,
    step_name: null,
    step_type: null,
    duration_in_day: null,
    next_step: null,
    previous_step: null,
    approval_policy_type: null,
    approver_select_type: null,
    instruction: null,
    notes: null,
    sort_order: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
}

const WorkflowStepFormController: FC<any> = (props) => {
  const {t} = useLang()
  const {
    entityId,
    reloadForm,
    isShowForm,
    workflowInfo,
    workflowStepSetupData,
    handleCallbackFunc,
    stepLists,
  } = props
  const {
    formRef,
    initialValues,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
    resetForm,
  } = useForm(initialState.fields)
  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  const [modalTitle, setModalTitle] = useState(initialState.modalTitle)
  const [itemData, setItemData] = useState<any>(initialState.itemData)
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  const [workflowStepConditionList, setWorkflowStepConditionList] = useState<any[]>(
    initialState.workflowStepConditionList
  )
  const [workflowStepApproverList, setWorkflowStepApproverList] = useState<any[]>(
    initialState.workflowStepApproverList
  )
  const [workflowStepActionList, setWorkflowStepActionList] = useState<any[]>(
    initialState.workflowStepActionList
  )
  const [workflowStepTaskList, setWorkflowStepTaskList] = useState<any[]>(
    initialState.workflowStepTaskList
  )

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      handleResetForm()
      loadData()
    } else {
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, reloadForm])

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      WorkflowStepApi.getById(entityId)
        .then((res) => {
          setItemData(res.data)
          setWorkflowStepConditionList(res.data.pre_conditions)
          setWorkflowStepApproverList(res.data.step_approvers)
          setWorkflowStepActionList(res.data.actions)
          setWorkflowStepTaskList(res.data.tasks)
          const initFormDta = {
            step_name: res.data.step_name,
            step_type: res.data.step_type,
            duration_in_day: res.data.duration_in_day,
            approval_policy_type: res.data.approval_policy_type,
            approver_select_type: res.data.approver_select_type,
            instruction: res.data.instruction,
            notes: res.data.notes,
            sort_order: res.data.sort_order,
            next_step: res.data.next_step,
            previous_step: res.data.previous_step,
            status: res.data.status,
          }
          setModalTitle(
            `Edit Workflow Step: ${res.data?.step_name || ''} (${res.data?.sort_order || ''})`
          )

          handleChange(initFormDta)
          formRef.setFieldsValue(initFormDta)
          setLoading(false)
          resolve(res.data)
        })
        .catch((err) => {
          handleErrorMessage(err)
          setLoading(false)
          reject(err)
        })
    })
  }

  const handleSubmit = (values: any): void => {
    // null check for workflowStepConditionList
    workflowStepConditionList.length > 0 &&
      workflowStepConditionList.forEach((element) => {
        if (!element.field_name || !element.operator || !element.field_value) {
          Message.error('Preconditions: Field Name, Field Value & Operator is required')
          return
        }
      })

    if (entityId) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      setIsSubmitting(true)
      const payload = {
        workflowStep: {
          workflow_id: workflowInfo.id,
          step_name: values.step_name,
          step_type: values.step_type,
          approval_policy_type: values.approval_policy_type,
          approver_select_type: values.approver_select_type,
          sort_order: values.sort_order,
          status: values.status,
        },
        workflowStepPrecondition: {
          ...workflowStepConditionList,
        },
        workflowStepApprover: {
          ...workflowStepApproverList,
        },
        workflowStepAction: {
          ...workflowStepActionList,
        },
        workflowStepTask: {
          ...workflowStepTaskList,
        },
      }
      WorkflowStepApi.create(payload)
        .then((res) => {
          handleSuccessMessage(res)
          handleCallbackFunc(null, 'hideForm')
          handleCallbackFunc(null, 'reloadListing')
          setLoading(false)
          setIsSubmitting(false)
          resolve(res)
        })
        .catch((err) => {
          handleErrorMessage(err)
          setLoading(false)
          setIsSubmitting(false)
          reject(err)
        })
    })
  }

  const handleUpdate = (values: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      setIsSubmitting(true)
      const payload = {
        workflowStep: {
          step_name: values.step_name,
          step_type: values.step_type,
          duration_in_day: values.duration_in_day,
          next_step: values.next_step,
          previous_step: values.previous_step,
          approval_policy_type: values.approval_policy_type,
          approver_select_type: values.approver_select_type,
          instruction: values.instruction,
          notes: values.notes,
          sort_order: values.sort_order,
          status: values.status,
        },
        workflowStepPrecondition: {
          ...workflowStepConditionList,
        },
        workflowStepApprover: {
          ...workflowStepApproverList,
        },
        workflowStepAction: {
          ...workflowStepActionList,
        },
        workflowStepTask: {
          ...workflowStepTaskList,
        },
      }
      WorkflowStepApi.update(entityId, payload)
        .then((res) => {
          handleSuccessMessage(res)
          handleCallbackFunc(null, 'hideForm')
          handleCallbackFunc(null, 'updateListItem', entityId, res.data.data)
          handleCallbackFunc(null, 'reloadListing')
          setLoading(false)
          setIsSubmitting(false)
          resolve(res)
        })
        .catch((err) => {
          handleErrorMessage(err)
          setLoading(false)
          setIsSubmitting(false)
          reject(err)
        })
    })
  }

  const handleResetForm = () => {
    setWorkflowStepConditionList(initialState.workflowStepConditionList)
    setWorkflowStepApproverList(initialState.workflowStepApproverList)
    setWorkflowStepActionList(initialState.workflowStepActionList)
    setWorkflowStepTaskList(initialState.workflowStepTaskList)
    resetForm()
  }

  return (
    <div className='form-page-container form-page-container-approvalStep'>
      <WorkflowStepFormDrawer
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        workflowInfo={workflowInfo}
        workflowStepSetupData={workflowStepSetupData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        workflowStepConditionList={workflowStepConditionList}
        setWorkflowStepConditionList={setWorkflowStepConditionList}
        workflowStepApproverList={workflowStepApproverList}
        setWorkflowStepApproverList={setWorkflowStepApproverList}
        workflowStepActionList={workflowStepActionList}
        setWorkflowStepActionList={setWorkflowStepActionList}
        workflowStepTaskList={workflowStepTaskList}
        setWorkflowStepTaskList={setWorkflowStepTaskList}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        stepLists={stepLists}
      />
    </div>
  )
}

export default React.memo(WorkflowStepFormController)
