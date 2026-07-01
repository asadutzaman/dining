import React, {FC, useEffect, useState} from 'react'
import ApproverAddMoreItemFormModal from './ApproverAddMoreItemForm.modal'
import {useForm} from 'src/app/hooks/useForm'
import {useApproverGroupList} from 'src/app/hooks/lists/useApproverGroupList'
import {useApproverGroupMemberList} from 'src/app/hooks/lists/useApproverGroupMemberList'
import {useDesignationList} from 'src/app/hooks/lists/useDesignationList'

const initialState = {
  modalTitle: 'Add Approver',
  itemData: {},
  workflowStepActionRuleList: [],
  fileUpload: [],
  fields: {
    approver_group_id: null,
    approver_group_member_id: null,
    approver_type: null,
    // approver_alias_text: null,
    // multi_step_forward: null,
    // multi_step_send_back: null,
    // show_user_in_approver_group: null,
    // only_show_user_in_approver_group: null,
    sort_order: 0,
  },
  isNewRecord: true,
  loading: false,
}

const ApproverAddMoreItemFormController: FC<any> = (props) => {
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
  const [approverAliasText, setApproverAliasText] = useState<any>('')
  const [approverId, setApproverId] = useState<any>(null)

  const {approverGroupList} = useApproverGroupList()
  const {approverGroupMemberList} = useApproverGroupMemberList()
  const {designationList} = useDesignationList()

  useEffect(() => {
    if (entityIndex !== null) {
      resetForm()
      setIsNewRecord(false)
      setModalTitle('Update Approver')
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
      approver_mode: entity.approver_mode,
      designation_id: entity.designation_id,
      approver_group_id: entity.approver_group_id,
      approver_group_member_id: entity.approver_group_member_id,
      approver_type: entity.approver_type,
      // multi_step_forward: entity.multi_step_forward,
      // multi_step_send_back: entity.multi_step_send_back,
      // show_user_in_approver_group: entity.show_user_in_approver_group,
      // only_show_user_in_approver_group: entity.only_show_user_in_approver_group,
      // organogram_id: entity.organogram_id,
      sort_order: entity.sort_order,
    })
  }

  const handleOnChangeApprover = (value: any, option: any) => {
    setItemData((prevState) => {
      return {
        ...prevState,
        approver_group_member_id: value,
        // approver_alias_text: option.aliasText,
      }
    })

    setApproverId(value)
    setApproverAliasText(option.aliasText)
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
      approver_mode: values.approver_mode,
      designation_id: values.designation_id,
      designation_name:
        designationList.find((item) => item.id === values.designation_id)?.title || '',
      approver_group_id: values.approver_group_id,
      approver_group_name:
        approverGroupList.find((item) => item.id === values.approver_group_id)?.name || '',
      approver_group_member_id: values.approver_group_member_id,
      approver_group_member_name: approverGroupMemberList.find(
        (item) => item.id === values.approver_group_member_id
      )?.user_info.name,
      approver_type: values.approver_type,
      // approver_alias_text: approverAliasText,
      // multi_step_forward: values.multi_step_forward,
      // multi_step_send_back: values.multi_step_send_back,
      // show_user_in_approver_group: values.show_user_in_approver_group,
      // only_show_user_in_approver_group: values.only_show_user_in_approver_group,
      sort_order: values.sort_order,
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
    const payload = {
      ...values,
      approver_mode: values.approver_mode,
      designation_id: values.designation_id,
      designation_name:
        designationList.find((item) => item.id === values.designation_id)?.title || '',
      approver_group_id: values.approver_group_id,
      approver_group_name:
        approverGroupList.find((item) => item.id === values.approver_group_id)?.name || '',
      approver_group_member_id: values.approver_group_member_id,
      approver_group_member_name: approverGroupMemberList.find(
        (item) => item.id === values.approver_group_member_id
      )?.user_info.name,
      approver_type: values.approver_type,
      // approver_alias_text: approverAliasText,
      // multi_step_forward: values.multi_step_forward,
      // multi_step_send_back: values.multi_step_send_back,
      // show_user_in_approver_group: values.show_user_in_approver_group,
      // only_show_user_in_approver_group: values.only_show_user_in_approver_group,
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
    <div className='form-page-container form-page-container-papersToBeAttached'>
      <ApproverAddMoreItemFormModal
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        handleOnChangeApprover={handleOnChangeApprover}
        workflowStepSetupData={workflowStepSetupData}
        addMoreItemList={addMoreItemList}
        setAddMoreItemList={setAddMoreItemList}
        workflowStepActionRuleList={workflowStepActionRuleList}
        setWorkflowStepActionRuleList={setWorkflowStepActionRuleList}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(ApproverAddMoreItemFormController)
