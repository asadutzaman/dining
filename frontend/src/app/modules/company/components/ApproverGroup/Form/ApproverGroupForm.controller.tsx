import React, {FC, useEffect, useState} from 'react'
import {ApproverGroupApi} from '../../../../../api'
import DrawerForm from '../../../../../components/Drawer/DrawerForm'
import ApproverGroupAddOrEditForm from './ApproverGroupForm.form'
import {useCrudFormService} from '../../../../../hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Approver Group',
  itemData: {},
  fields: {
    workflow_code: null,
    name: null,
    short_name: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
  groupMemberAddMoreList: [{id: null, user_id: null, approver_type: null}],
}

const ApproverGroupFormController: FC<any> = (props) => {
  const {
    BaseCrudFormService,
    entityId,
    modalTitle,
    setModalTitle,
    isNewRecord,
    setIsNewRecord,
    isShowForm,
    reloadForm,
    itemData,
    loading,
    resetForm,
    isSubmitting,
    formRef,
    initialValues,
    handleChange,
    handleSubmitFailed,
    handleCallbackFunc,
  } = useCrudFormService(ApproverGroupApi, initialState, props)
  const [groupMemberAddMoreList, setGroupMemberAddMoreList] = useState<any>([])

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Approver Group')
      resetForm()
      handleResetForm()
      loadData()
    } else {
      resetForm()
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, reloadForm])

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        workflow_code: res.data.workflow_code,
        name: res.data.name,
        description: res.data.description,
        status: res.data.status,
      }

      if (res.data.approverGroupMemberListData.length > 0) {
        let dataArray: any[] = []
        res.data.approverGroupMemberListData.map((item: any) => {
          let dataObj = {
            id: item.id,
            user_id: item.user_id,
            approver_type: item.approver_type,
          }
          dataArray.push(dataObj)
        })
        setGroupMemberAddMoreList(dataArray)
      } else {
        setGroupMemberAddMoreList([])
      }

      // setGroupMemberAddMoreList(res.data.approverGroupMemberListData);
      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleSubmit = async (values: any): Promise<void> => {
    // null check
    const hasEmptyUser = groupMemberAddMoreList.some(
      (item: any) => !item.user_id || item.user_id.toString().trim() === ''
    )
    if (hasEmptyUser) {
      Message.error('User is required')
      return
    }
    try {
      if (entityId) {
        await handleUpdate(values)
      } else {
        await handleCreate(values)
      }
    } catch (error: any) {
      // console.error('Form submission error:', error)
      handleSubmitFailed(error)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      approverGroupMemberList: groupMemberAddMoreList,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      approverGroupMemberList: groupMemberAddMoreList,
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setGroupMemberAddMoreList([])
  }

  return (
    <div className='form-page-container form-page-container-example'>
      <DrawerForm
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={ApproverGroupAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        groupMemberAddMoreList={groupMemberAddMoreList}
        setGroupMemberAddMoreList={setGroupMemberAddMoreList}
      />
    </div>
  )
}

export default React.memo(ApproverGroupFormController)
