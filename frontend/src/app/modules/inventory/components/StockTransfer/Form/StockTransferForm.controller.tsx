import React, {FC, useEffect, useState} from 'react'
import {StockTransferApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import StockTransferAddOrEditForm from './StockTransferForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Stock Transfer',
  itemData: {},
  fields: {
    transfer_from: null,
    transfer_to: [],
    reason: null,
    process_status: '',
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
  stockTransferItemList: [{id: null, item_id: null, quantity: null, remarks: null}],
}

const StockTransferFormController: FC<any> = (props) => {
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
  } = useCrudFormService(StockTransferApi, initialState, props)

  const [stockTransferItemList, setStockTransferItemList] = useState<any>([])
  const [isLoadingStockTransferItem, setIsLoadingStockTransferItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Stock Transfer')
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
        transfer_from: res.data.transfer_from,
        transfer_to: res.data.transfer_to?.map((item: any) => Number(item)),
        reason: res.data.reason,
        process_status: res.data.process_status,
        status: res.data.status,
      }

      if (res.data.stockTransferItemsListData.length > 0) {
        let dataArray: any[] = []
        res.data.stockTransferItemsListData.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            name: item.item_info.name_en ?? item.item_info.name_bn,
            quantity: item.quantity,
            remarks: item.remarks,
          }
          dataArray.push(dataObj)
        })
        setStockTransferItemList(dataArray)
      } else {
        setStockTransferItemList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleItemSelect = (value, option) => {
    formRef.setFieldsValue({item_id: value})
    formRef.setFieldsValue({itemNameCode: option.label})
    let itemExist = stockTransferItemList.find((item: any) => item.id == value)
    if (itemExist) {
      Message.error('Item already exists')
    } else {
      setStockTransferItemList((prev: any) => {
        let newObj = {
          item_id: value,
          name: option.label,
          quantity: null,
          remarks: null,
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
      stockTransferItemsList: stockTransferItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      stockTransferItemsList: stockTransferItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setStockTransferItemList([])
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
        drawerWidth={'70%'}
        formRef={formRef}
        initialValues={initialValues}
        component={StockTransferAddOrEditForm}
        isLoadingStockTransferItem={isLoadingStockTransferItem}
        setIsLoadingStockTransferItem={setIsLoadingStockTransferItem}
        handleItemSelect={handleItemSelect}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        stockTransferItemList={stockTransferItemList}
        setStockTransferItemList={setStockTransferItemList}
      />
    </div>
  )
}

export default React.memo(StockTransferFormController)
