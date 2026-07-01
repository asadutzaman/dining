import React, {FC, useEffect} from 'react'
import {PatientApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import PatientAddOrEditForm from './PatientForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'

const initialState = {
  modalTitle: 'Register Patient',
  itemData: {},
  fields: {
    title: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    date_of_birth: null,
    gender: null,
    blood_group: null,
    marital_status: null,
    religion: null,
    nationality: null,
    occupation: null,
    primary_phone: null,
    secondary_phone: null,
    email: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relation: null,
    current_address: null,
    current_city: null,
    current_state: null,
    current_country: null,
    current_pincode: null,
    permanent_address: null,
    permanent_city: null,
    permanent_state: null,
    permanent_country: null,
    permanent_pincode: null,
    known_allergies: null,
    chronic_diseases: null,
    current_medications: null,
    surgical_history: null,
    insurance_provider: null,
    insurance_policy_number: null,
    insurance_valid_from: null,
    insurance_valid_to: null,
    is_sensitive: false,
    is_vip: false,
    consent_signed: false,
    special_notes: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'Patient registered successfully.',
    update_success: 'Patient updated successfully.',
  },
}

const PatientFormController: FC<any> = (props) => {
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
  } = useCrudFormService(PatientApi, initialState, props)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Patient')
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
      const d = res.data
      const initFormData = {
        title: d.title,
        first_name: d.first_name,
        middle_name: d.middle_name,
        last_name: d.last_name,
        date_of_birth: d.date_of_birth,
        gender: d.gender,
        blood_group: d.blood_group,
        marital_status: d.marital_status,
        religion: d.religion,
        nationality: d.nationality,
        occupation: d.occupation,
        primary_phone: d.primary_phone,
        secondary_phone: d.secondary_phone,
        email: d.email,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_phone: d.emergency_contact_phone,
        emergency_contact_relation: d.emergency_contact_relation,
        current_address: d.current_address,
        current_city: d.current_city,
        current_state: d.current_state,
        current_country: d.current_country,
        current_pincode: d.current_pincode,
        permanent_address: d.permanent_address,
        permanent_city: d.permanent_city,
        permanent_state: d.permanent_state,
        permanent_country: d.permanent_country,
        permanent_pincode: d.permanent_pincode,
        known_allergies: d.known_allergies,
        chronic_diseases: d.chronic_diseases,
        current_medications: d.current_medications,
        surgical_history: d.surgical_history,
        insurance_provider: d.insurance_provider,
        insurance_policy_number: d.insurance_policy_number,
        insurance_valid_from: d.insurance_valid_from,
        insurance_valid_to: d.insurance_valid_to,
        is_sensitive: d.is_sensitive,
        is_vip: d.is_vip,
        consent_signed: d.consent_signed,
        special_notes: d.special_notes,
        status: d.status,
      }
      handleChange(initFormData)
      formRef.setFieldsValue(initFormData)
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
    return BaseCrudFormService.handleCreate({...values})
  }

  const handleUpdate = (values: any): Promise<any> => {
    return BaseCrudFormService.handleUpdate({...values})
  }

  return (
    <div className='form-page-container form-page-container-patient'>
      <DrawerForm
        drawerWidth='80%'
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={PatientAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(PatientFormController)
