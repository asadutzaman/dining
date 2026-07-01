import React, {FC, useEffect, useState} from 'react'
import SendSmsAddMoreItemFormModal from './SendSmsAddMoreItemForm.modal'
import {useForm} from 'src/app/hooks/useForm'

const initialState = {
  modalTitle: 'Send SMS',
  itemData: {},
  recipientList: [],
  fields: {
    task_key: 'SEND_SMS',
    task_type: 'SMS',
    task_name: null,

    mobile: null,
    message: null,

    schedule_send_type: 'IMMEDIATELY',
    schedule_interval: null,
    schedule_unit: null,
    schedule_trigger_type: null,
    schedule_trigger_name: null,
    schedule_on_next_day: null,
    schedule_on_next_at: null,
    sort_order: 0,
  },
  isNewRecord: true,
  loading: false,
}

const SendSmsAddMoreItemFormController: FC<any> = (props) => {
  const {
    entity,
    entityIndex,
    reloadForm,
    isShowForm,
    workflowStepSetupData,
    workflowStepActionList,
    setAddMoreItemList,
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

  const [modalTitle, setModalTitle] = useState(initialState.modalTitle)
  const [itemData, setItemData] = useState(initialState.itemData)
  const [recipientList, setRecipientList] = useState<any[]>(initialState.recipientList)
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  useEffect(() => {
    if (entityIndex !== null) {
      handleResetForm()
      setIsNewRecord(false)
      setModalTitle('Send SMS')
      setItemData(entity)
      setIsNewRecord(false)
      loadData()
    } else {
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entity, entityIndex, reloadForm])

  const loadData = (): void => {
    formRef.setFieldsValue({
      ...entity,
    })
    setRecipientList(entity.recipientList)
  }

  const handleSubmit = (values: any): void => {
    if (entityIndex !== null) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  const handleCreate = (values: any): void => {
    setLoading(true)
    setIsSubmitting(true)
    const actionInfo = workflowStepActionList.find((item) => item.action_code == values.action_code)
    const payload = {
      ...values,
      recipientList: recipientList,
      action_code: values.action_code,
      action_name: actionInfo.action_name,
      task_key: initialState.fields.task_key,
      task_type: initialState.fields.task_type,
      sort_order: initialState.fields.sort_order,
    }
    setAddMoreItemList((prevState) => {
      const itemData = {...payload}
      return [...prevState, itemData]
    })

    handleCallbackFunc(null, 'hideForm')
    setLoading(false)
    setIsSubmitting(false)
  }

  const handleUpdate = (values: any): void => {
    setLoading(true)
    setIsSubmitting(true)
    const actionInfo = workflowStepActionList.find((item) => item.action_code == values.action_code)
    const payload = {
      ...values,
      recipientList: recipientList,
      action_code: values.action_code,
      action_name: actionInfo.action_name,
      task_key: initialState.fields.task_key,
      task_type: initialState.fields.task_type,
      sort_order: initialState.fields.sort_order,
    }
    setAddMoreItemList((prevState) => {
      prevState[entityIndex] = {...prevState[entityIndex], ...payload}
      return [...prevState]
    })

    handleCallbackFunc(null, 'hideForm')
    setLoading(false)
    setIsSubmitting(false)
  }

  const handleResetForm = () => {
    setRecipientList(initialState.recipientList)
    resetForm()
  }

  return (
    <div className='form-page-container form-page-container-papersToBeAttached'>
      <SendSmsAddMoreItemFormModal
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        recipientList={recipientList}
        setRecipientList={setRecipientList}
        workflowStepSetupData={workflowStepSetupData}
        workflowStepActionList={workflowStepActionList}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(SendSmsAddMoreItemFormController)
