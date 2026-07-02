import React, {FC, useEffect} from 'react'
import {MemberApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import MemberAddOrEditForm from './MemberForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'

const initialState = {
  modalTitle: 'Create Member',
  itemData: {},
  fields: {
    member_type: 'STUDENT',
    rfid_card_number: null,
    name: null,
    phone: null,
    email: null,
    department_id: null,
    designation_id: null,
    class_name: null,
    section: null,
    roll_no: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
}

const MemberFormController: FC<any> = (props) => {
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
  } = useCrudFormService(MemberApi, initialState, props)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Member')
      resetForm()
      loadData()
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, reloadForm])

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        member_type: res.data.member_type,
        rfid_card_number: res.data.rfid_card_number,
        name: res.data.name,
        phone: res.data.phone,
        email: res.data.email,
        department_id: res.data.department_id,
        designation_id: res.data.designation_id,
        class_name: res.data.class_name,
        section: res.data.section,
        roll_no: res.data.roll_no,
        status: res.data.status,
      }
      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleSubmit = (values: any): void => {
    if (entityId) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  return (
    <div className='form-page-container form-page-container-member'>
      <DrawerForm
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={MemberAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(MemberFormController)
