import React, {FC, useEffect, useState} from 'react'
import AttributeAddOrEditForm from './AttributeForm.form'
import {AttributeApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Attribute',
  itemData: {},
  fields: {
    name: null,
    description: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
  attributeValueAddMoreList: [{id: null, value: null}],
}

const AttributeFormController: FC<any> = (props) => {
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
  } = useCrudFormService(AttributeApi, initialState, props)
  const [attributeValueAddMoreList, setAttributeValueAddMoreList] = useState<any>([])

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Attribute')
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
        name: res.data.name,
        description: res.data.description,
        status: res.data.status,
      }

      if (res.data.attributeValueListData.length > 0) {
        let dataArray: any[] = []
        res.data.attributeValueListData.map((item: any) => {
          let dataObj = {
            id: item.id,
            value: item.value,
          }
          dataArray.push(dataObj)
        })
        setAttributeValueAddMoreList(dataArray)
      } else {
        setAttributeValueAddMoreList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleSubmit = async (values: any): Promise<void> => {
    // null check
    const hasEmptyValue = attributeValueAddMoreList.some(
      (item: any) => !item.value || item.value.toString().trim() === ''
    )
    if (hasEmptyValue) {
      Message.error('Value is required')
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
      attributeValueList: attributeValueAddMoreList,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      attributeValueList: attributeValueAddMoreList,
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setAttributeValueAddMoreList([])
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
        component={AttributeAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        attributeValueAddMoreList={attributeValueAddMoreList}
        setAttributeValueAddMoreList={setAttributeValueAddMoreList}
      />
    </div>
  )
}

export default React.memo(AttributeFormController)
