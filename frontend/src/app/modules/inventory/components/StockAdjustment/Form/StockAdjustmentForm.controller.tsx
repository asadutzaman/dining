import React, {FC, useEffect, useState} from 'react'
import {StockAdjustmentApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import StockAdjustmentAddOrEditForm from './StockAdjustmentForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Stock Adjustment',
  itemData: {},
  fields: {
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
  stockAdjustmentItemList: [
    {id: null, item_id: null, quantity: null, shelve_id: null, remarks: null},
  ],
}

const StockAdjustmentFormController: FC<any> = (props) => {
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
  } = useCrudFormService(StockAdjustmentApi, initialState, props)

  const [stockAdjustmentItemList, setStockAdjustmentItemList] = useState<any>([])
  const [isLoadingStockAdjustmentItem, setIsLoadingStockAdjustmentItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Stock Adjustment')
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
        reason: res.data.reason,
        adjustment_type: res.data.adjustment_type,
        process_status: res.data.process_status,
        status: res.data.status,
      }

      if (res.data.stock_adjustment_items_list_data.length > 0) {
        let dataArray: any[] = []
        res.data.stock_adjustment_items_list_data.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            name: item.item_info.name_en ?? item.item_info.name_bn,
            quantity: item.quantity,
            shelve_id: item.shelve_id,
            remarks: item.remarks,
          }
          dataArray.push(dataObj)
        })
        setStockAdjustmentItemList(dataArray)
      } else {
        setStockAdjustmentItemList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleItemSelect = (value, option) => {
    formRef.setFieldsValue({item_id: value})
    formRef.setFieldsValue({itemNameCode: option.label})
    let itemExist = stockAdjustmentItemList.find((item: any) => item.id == value)
    if (itemExist) {
      Message.error('Item already exists')
    } else {
      setStockAdjustmentItemList((prev: any) => {
        let newObj = {
          item_id: value,
          name: option.label,
        }
        return [...prev, newObj]
      })
    }
  }

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      if (entityId) {
        await handleUpdate(values)
      } else {
        await handleCreate(values)
      }
    } catch (error: any) {
      handleSubmitFailed(error)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      stockAdjustmentItemsList: stockAdjustmentItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      stockAdjustmentItemsList: stockAdjustmentItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setStockAdjustmentItemList([])
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
        component={StockAdjustmentAddOrEditForm}
        isLoadingStockAdjustmentItem={isLoadingStockAdjustmentItem}
        setIsLoadingStockAdjustmentItem={setIsLoadingStockAdjustmentItem}
        handleItemSelect={handleItemSelect}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        stockAdjustmentItemList={stockAdjustmentItemList}
        setStockAdjustmentItemList={setStockAdjustmentItemList}
      />
    </div>
  )
}

export default React.memo(StockAdjustmentFormController)
