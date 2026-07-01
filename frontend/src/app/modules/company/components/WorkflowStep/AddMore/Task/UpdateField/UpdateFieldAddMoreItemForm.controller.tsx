import React, {FC, useEffect, useState} from 'react'
import UpdateFieldAddMoreItemFormModal from './UpdateFieldAddMoreItemForm.modal'
import {useForm} from 'src/app/hooks/useForm'

const initialState = {
  modalTitle: 'Update Fields',
  itemData: {},
  fileUpload: [],
  fields: {
    task_key: 'UPDATE_FIELD',
    task_type: 'Update Fields',
    task_name: null,

    field_name: null,
    field_value: null,
    sort_order: 0,
  },
  isNewRecord: true,
  loading: false,
}

const UpdateFieldAddMoreItemFormController: FC<any> = (props) => {
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
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  useEffect(() => {
    if (entityIndex !== null) {
      resetForm()
      setIsNewRecord(false)
      setModalTitle('Update Fields')
      setItemData(entity)
      setIsNewRecord(false)
      loadData()
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entity, entityIndex, reloadForm])

  const loadData = (): void => {
    formRef.setFieldsValue({
      task_name: entity.task_name,
      action_code: entity.action_code,
      action_name: entity.action_name,
      field_name: entity.field_name,
      field_value: entity.field_value,
      sort_order: entity.sort_order,
    })
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
    const actionInfo = workflowStepActionList.find(
      (item) => item.action_code === values.action_code
    )
    const payload = {
      action_code: values.action_code,
      action_name: actionInfo?.action_name,
      // action_name: values.action_name || actionInfo?.action_name,
      field_name: values.field_name,
      field_value: values.field_value,
      task_name: values.task_name,
      task_key: initialState.fields.task_key,
      task_type: initialState.fields.task_type,
      sort_order: initialState.fields.sort_order,
    }
    setAddMoreItemList((prevState) => {
      console.log(prevState)
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
    const actionInfo = workflowStepActionList.find(
      (item) => item.action_code === values.action_code
    )
    const payload = {
      action_code: values.action_code,
      action_name: actionInfo.action_name,
      field_name: values.field_name,
      field_value: values.field_value,
      task_name: values.task_name,
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

  return (
    <div className='form-page-container form-page-container-papersToBeAttached'>
      <UpdateFieldAddMoreItemFormModal
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
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

export default React.memo(UpdateFieldAddMoreItemFormController)
