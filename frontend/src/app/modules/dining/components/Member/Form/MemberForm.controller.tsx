import React, {FC, useEffect, useState} from 'react'
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
    staff_id: null,
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

  const [imageList, setImageList] = useState<any[]>([])
  const [photoId, setPhotoId] = useState<any>(null)
  const [candidateId, setCandidateId] = useState<any>(null)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Member')
      resetForm()
      setImageList([])
      loadData()
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
      setImageList([])
      setPhotoId(null)
      setCandidateId(null)

      if (props.prefillFields) {
        const prefillFormData = {...initialState.fields, ...props.prefillFields}
        setCandidateId(props.prefillFields.candidate_id ?? null)
        handleChange(prefillFormData)
        formRef.setFieldsValue(prefillFormData)
        props.onPrefillConsumed?.()
      }
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
        staff_id: res.data.staff_id,
        class_name: res.data.class_name,
        section: res.data.section,
        roll_no: res.data.roll_no,
        status: res.data.status,
      }
      setPhotoId(res.data.photo_id || null)
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
      photo_id: imageList?.[0]?.file_id ?? null,
      candidate_id: candidateId,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      photo_id: imageList?.[0]?.file_id ?? null,
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
        imageList={imageList}
        setImageList={setImageList}
        photoId={photoId}
      />
    </div>
  )
}

export default React.memo(MemberFormController)
