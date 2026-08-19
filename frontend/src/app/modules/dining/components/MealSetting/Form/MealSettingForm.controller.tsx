import React, {FC, useEffect} from 'react'
import dayjs from 'dayjs'
import {MealSettingApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import MealSettingAddOrEditForm from './MealSettingForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'

const initialState = {
  modalTitle: 'Create Meal Cost Setting',
  itemData: {},
  fields: {
    meal_type: 'BREAKFAST',
    cost: null,
    start_time: null,
    end_time: null,
    effective_from: null,
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

const MealSettingFormController: FC<any> = (props) => {
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
  } = useCrudFormService(MealSettingApi, initialState, props)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Meal Cost Setting')
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
        meal_type: res.data.meal_type,
        cost: res.data.cost,
        start_time: res.data.start_time ? dayjs(res.data.start_time, 'HH:mm:ss') : null,
        end_time: res.data.end_time ? dayjs(res.data.end_time, 'HH:mm:ss') : null,
        effective_from: res.data.effective_from ? dayjs(res.data.effective_from) : null,
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

  const buildPayload = (values: any) => ({
    ...values,
    effective_from: values.effective_from ? dayjs(values.effective_from).format('YYYY-MM-DD') : null,
    start_time: values.start_time ? dayjs(values.start_time).format('HH:mm:ss') : null,
    end_time: values.end_time ? dayjs(values.end_time).format('HH:mm:ss') : null,
  })

  const handleCreate = (values: any): Promise<any> => {
    return BaseCrudFormService.handleCreate(buildPayload(values))
  }

  const handleUpdate = (values: any): Promise<any> => {
    return BaseCrudFormService.handleUpdate(buildPayload(values))
  }

  return (
    <div className='form-page-container form-page-container-meal-setting'>
      <DrawerForm
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={MealSettingAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(MealSettingFormController)
