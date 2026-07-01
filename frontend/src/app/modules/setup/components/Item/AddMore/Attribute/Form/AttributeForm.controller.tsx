import React, {FC, useEffect, useState} from 'react'
import AttributeFormModal from './AttributeForm.modal'
import {useForm} from 'src/app/hooks/useForm'
import {useAttributeList} from 'src/app/hooks/lists/useAttributeList'
import {useAttributeValueList} from 'src/app/hooks/lists/useAttributeValueList'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Add Attribute',
  itemData: {},
  fields: {},
  isNewRecord: true,
  loading: false,
}

const AttributeFormController: FC<any> = (props) => {
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
  const {attributeList, loadingAttributeList} = useAttributeList()
  const {attributeValueList, loadingAttributeValueList} = useAttributeValueList()

  const [modalTitle, setModalTitle] = useState(initialState.modalTitle)
  const [itemData, setItemData] = useState(initialState.itemData)
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [loading, setLoading] = useState(initialState.loading)

  useEffect(() => {
    if (entityIndex !== null) {
      setIsNewRecord(false)
      setModalTitle('Edit Attribute')
      resetForm()
      setItemData(entity)
      setIsNewRecord(false)
      formRef.setFieldsValue({
        attribute_id: entity.attribute_id,
        attribute_value_id: entity.attribute_value_id,
      })
    } else {
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entity, entityIndex, reloadForm])

  const handleSubmit = (values: any): void => {
    // check undefined & null
    if (!values.attribute_id || !values.attribute_value_id) {
      Message.error('Attribute & Value is required')
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

    const payload = {
      attribute_id: values.attribute_id,
      attribute_name:
        attributeList.find((item) => item.id === Number(values.attribute_id))?.name || '',
      attribute_value_id: values.attribute_value_id,
      attribute_value_name:
        attributeValueList.find((item) => item.id === Number(values.attribute_value_id))?.value ||
        '',
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
      attribute_id: values.attribute_id,
      attribute_name:
        attributeList.find((item) => item.id === Number(values.attribute_id))?.name || '',
      attribute_value_id: values.attribute_value_id,
      attribute_value_name:
        attributeValueList.find((item) => item.id === Number(values.attribute_value_id))?.value ||
        '',
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
      <AttributeFormModal
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

export default React.memo(AttributeFormController)
