import React, {FC, useEffect, useState} from 'react'
import {useForm} from 'src/app/hooks/useForm'
import {useUnitList} from 'src/app/hooks/lists/useUnitList'
import UnitMappingFormModal from './UnitMappingForm.modal'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Add Unit Mapping',
  itemData: {},
  fields: {},
  isNewRecord: true,
  loading: false,
}

const UnitMappingFormController: FC<any> = (props) => {
  const {entity, entityIndex, reloadForm, isShowForm, setMoreItemListData, handleCallbackFunc} =
    props
  const {
    formRef,
    initialValues,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
    resetForm,
  } = useForm(initialState.fields)
  const {unitList, loadingUnitList} = useUnitList()

  const [modalTitle, setModalTitle] = useState(initialState.modalTitle)
  const [itemData, setItemData] = useState(initialState.itemData)
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  useEffect(() => {
    if (entityIndex !== null) {
      setIsNewRecord(false)
      setModalTitle('Edit UnitMapping')
      resetForm()
      setItemData(entity)
      setIsNewRecord(false)
      formRef.setFieldsValue({
        unit_id: entity.unit_id,
        conversion_to_base: entity.conversion_to_base,
      })
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entity, entityIndex, reloadForm])

  const handleSubmit = (values: any): void => {
    // check undefined & null
    if (!values.unit_id || !values.conversion_to_base) {
      Message.error('Unit & Conversion to Base is required')
      return
    }
    if (entityIndex !== null) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  const handleCreate = (values: any): void => {
    setLoading(true)
    setIsSubmitting(true)
    console.log(values)

    const payload = {
      unit_id: values.unit_id,
      unit_name: unitList.find((item) => item.id == Number(values.unit_id))?.name || '',
      conversion_to_base: values.conversion_to_base,
    }

    setMoreItemListData((prevState: any) => {
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
      unit_id: values.unit_id,
      unit_name: unitList.find((item) => item.id == Number(values.unit_id))?.name || '',
      conversion_to_base: values.conversion_to_base,
    }
    setMoreItemListData((prevState: any) => {
      prevState[entityIndex] = {...prevState[entityIndex], ...payload}
      return [...prevState]
    })

    handleCallbackFunc(null, 'hideForm')
    setLoading(false)
    setIsSubmitting(false)
  }

  return (
    <div className='form-page-container form-page-container'>
      <UnitMappingFormModal
        modalWidth={'30%'}
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(UnitMappingFormController)
