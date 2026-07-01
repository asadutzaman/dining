import React, {FC, useEffect, useState} from 'react'
import UserActionAddMoreItemFormModal from './UserActionAddMoreItemForm.modal'
import {useForm} from 'src/app/hooks/useForm'

const initialState = {
  modalTitle: 'Add Action',
  itemData: {},
  workflowStepActionRuleList: [],
  fileUpload: [],
  fields: {
    action_name: null,
    action_code: null,
    action_alias_text: null,
    action_button_color: null,
    is_comment_mandatory: null,
    action_button_align: null,
    action_rules: [],
    sort_order: 0,
  },
  isNewRecord: true,
  loading: false,
}

const UserActionAddMoreItemFormController: FC<any> = (props) => {
  const {
    entity,
    entityIndex,
    reloadForm,
    isShowForm,
    workflowStepSetupData,
    addMoreItemList,
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
  const [workflowStepActionRuleList, setWorkflowStepActionRuleList] = useState<any[]>(
    initialState.workflowStepActionRuleList
  )
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  useEffect(() => {
    if (entityIndex !== null) {
      resetForm()
      setIsNewRecord(false)
      setModalTitle('Update Fields')
      setItemData(entity)
      setWorkflowStepActionRuleList(entity?.action_rules)
      setIsNewRecord(false)
      loadData()
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
      setItemData(initialState.itemData)
      setWorkflowStepActionRuleList(initialState.workflowStepActionRuleList)
    }
  }, [entity, entityIndex, reloadForm])

  const loadData = (): void => {
    formRef.setFieldsValue({
      action_name: entity.action_name,
      is_comment_mandatory: entity.is_comment_mandatory,
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
    const payload = {
      ...values,
      action_code: values.action_name,
      action_name: values.action_name,
      is_comment_mandatory: values.is_comment_mandatory,
      action_rules: workflowStepActionRuleList,
      sort_order: values.sort_order,
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
    const payload = {
      ...values,
      action_code: values.action_name,
      action_name: values.action_name,
      is_comment_mandatory: values.is_comment_mandatory,
      action_rules: workflowStepActionRuleList,
      sort_order: values.sort_order,
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
    <div className='form-page-container form-page-container'>
      <UserActionAddMoreItemFormModal
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        workflowStepSetupData={workflowStepSetupData}
        addMoreItemList={addMoreItemList}
        setAddMoreItemList={setAddMoreItemList}
        workflowStepActionRuleList={workflowStepActionRuleList}
        setWorkflowStepActionRuleList={setWorkflowStepActionRuleList}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        stepLists={props.stepLists}
      />
    </div>
  )
}

export default React.memo(UserActionAddMoreItemFormController)
