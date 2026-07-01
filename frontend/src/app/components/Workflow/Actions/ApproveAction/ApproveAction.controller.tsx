import React, {FC, Fragment, useEffect, useState} from 'react'
import {Button} from 'antd'
import WorkflowSingleActionModal from '../WorkflowSingleAction.modal'
import {useForm} from 'src/app/hooks/useForm'
import ApproveActionForm from './ApproveAction.form'
import {WorkflowTransitionApi} from 'src/app/api'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'

const initialState = {
  fields: {
    name_en: null,
    name_bn: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
}

const ApproveActionController: FC<any> = (props) => {
  const {
    entityId,
    // workflowLoading,
    workflowData,
    workflowActionInfo,
    workflowActiveStep,
    // handleWorkflowValidation,
    handleCallbackFunc,
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
  const {handleErrorMessage, handleSuccessMessage} = useErrorHandler()

  const [isShowFormModal, setIsShowFormModal] = useState(false)
  const [reloadForm, setReloadForm] = useState<number>(Date.now())
  const [loading, setLoading] = useState(initialState.loading)

  const modalTitle = workflowActionInfo.action_alias_text || workflowActionInfo.action_name
  const sendToText = 'Next Step'
  const submitBtnText = `Yes, ${
    workflowActionInfo.action_alias_text || workflowActionInfo.action_name
  }`
  const confirmText = `Are you sure to ${
    workflowActionInfo.action_alias_text?.toLowerCase() ||
    workflowActionInfo.action_name?.toLowerCase()
  } this application?`

  useEffect(() => {
    resetForm()
  }, [reloadForm])

  const showFormModal = (): void => {
    setIsShowFormModal(true)
    handleReloadForm()
    // if (
    // handleWorkflowValidation(
    //   workflowActionInfo.action_name,
    //   workflowActionInfo.action_code
    //   // workflowActionInfo.action_alias_text
    // )
    // ) {
    //   setIsShowFormModal(true)
    //   handleReloadForm()
    // }
  }

  const hideFormModal = () => {
    setIsShowFormModal(false)
  }

  const handleReloadForm = () => {
    setReloadForm(Date.now())
  }

  const handleCallback = (event: any, action: string, recordId?: any, data?: any) => {
    if (action === 'hideForm') {
      hideFormModal()
    } else if (handleCallbackFunc) {
      handleCallbackFunc(event, action, recordId, data)
    }
  }

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      await handleCreate(values)
    } catch (error: any) {
      console.error('Form submission error:', error)
      handleSubmitFailed(error)
    }
  }

  const handleCreate = (values: any): void => {
    setLoading(true)
    setIsSubmitting(true)
    const payload = {
      workflow_id: workflowData.id,
      workflow_step_id: workflowActiveStep.id,
      workflow_record_id: entityId,
      workflow_action_name: workflowActionInfo.action_name,
      workflow_action_code: workflowActionInfo.action_code,
      workflow_action_alias_text:
        workflowActionInfo.action_alias_text || workflowActionInfo.action_name,
      workflow_action_button_color: workflowActionInfo.action_button_color,
      comment: values.comment,
    }
    WorkflowTransitionApi.create(payload)
      .then((res: any) => {
        // Message.success(res)
        handleSuccessMessage(res)
        handleCallback(null, 'hideForm')
        handleCallback(null, 'reloadListItem', entityId)
        handleCallback(null, 'reloadView')
        handleCallback(null, 'reloadListing')
        setLoading(false)
        setIsSubmitting(false)
      })
      .catch((err: any) => {
        // Message.error(err)
        handleErrorMessage(err)
        setLoading(false)
        setIsSubmitting(false)
      })
  }

  return (
    <Fragment>
      <WorkflowSingleActionModal
        drawerWidth={'50%'}
        loading={loading}
        formRef={formRef}
        modalTitle={modalTitle}
        submitBtnText={submitBtnText}
        confirmText={confirmText}
        sendToText={sendToText}
        isSubmitting={isSubmitting}
        isShowFormModal={isShowFormModal}
        workflowActionInfo={workflowActionInfo}
        initialValues={initialValues}
        component={ApproveActionForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallback}
      />
      <Button
        className={`btn btn-sm ${workflowActionInfo.action_button_class} me-3 mb-2`}
        onClick={() => showFormModal()}
      >
        {workflowActionInfo.action_type === 'APPROVAL'
          ? workflowActionInfo.action_alias_text || workflowActionInfo.action_name
          : `To Do: ${workflowActionInfo.action_alias_text}`}
      </Button>
    </Fragment>
  )
}
export default React.memo(ApproveActionController)
