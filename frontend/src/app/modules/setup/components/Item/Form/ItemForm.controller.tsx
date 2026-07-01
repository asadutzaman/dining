import React, {FC, useEffect, useState} from 'react'
import {ItemApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import ItemAddOrEditForm from './ItemForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'

const initialState = {
  modalTitle: 'Create Item',
  itemData: {},
  attributeListData: [],
  unitMappingListData: [],
  fields: {
    type: null,
    logistic_id: null,
    item_category_id: null,
    brand_id: null,
    code: null,
    name_en: null,
    name_bn: null,
    description: null,
    base_unit_id: null,
    reorder_qty: null,
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

const ItemFormController: FC<any> = (props) => {
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
  } = useCrudFormService(ItemApi, initialState, props)
  const [attributeListData, setAttributeListData] = useState<any[]>(initialState.attributeListData)
  const [unitMappingListData, setUnitMappingListData] = useState<any[]>(
    initialState.unitMappingListData
  )

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Item')
      handleResetForm()
      loadData()
    } else {
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, reloadForm])

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        type: res.data.type,
        logistic_id: res.data.logistic_id,
        item_category_id: res.data.item_category_id,
        brand_id: res.data.brand_id,
        code: res.data.code,
        name_en: res.data.name_en,
        name_bn: res.data.name_bn,
        description: res.data.description,
        base_unit_id: res.data.base_unit_id,
        reorder_qty: res.data.reorder_qty,
        status: res.data.status,
      }
      if (res.data.item_attributes.length > 0) {
        let dataArray: any[] = []
        res.data.item_attributes.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            attribute_id: item.attribute_id,
            attribute_name: item.attribute_name,
            attribute_value_id: item.attribute_value_id,
            attribute_value_name: item.attribute_value_name,
          }
          dataArray.push(dataObj)
        })
        setAttributeListData(dataArray)
      } else {
        setAttributeListData([])
      }

      if (res.data.item_unit_mappings.length > 0) {
        let dataArray: any[] = []
        res.data.item_unit_mappings.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            unit_id: item.unit_id,
            unit_name: item.unit_name,
            conversion_to_base: item.conversion_to_base,
          }
          dataArray.push(dataObj)
        })
        setUnitMappingListData(dataArray)
      } else {
        setUnitMappingListData([])
      }
      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleSubmit = async (values: any): Promise<void> => {
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
      item_attributes: attributeListData,
      item_unit_mappings: unitMappingListData,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      item_attributes: attributeListData,
      item_unit_mappings: unitMappingListData,
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setAttributeListData([])
  }

  return (
    <div className='form-page-container form-page-container-example'>
      <DrawerForm
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        attributeListData={attributeListData}
        setAttributeListData={setAttributeListData}
        unitMappingListData={unitMappingListData}
        setUnitMappingListData={setUnitMappingListData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={ItemAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(ItemFormController)
