import React, {FC, useEffect, useState} from 'react'
import {ItemConsumptionApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import ItemConsumptionAddOrEditForm from './ItemConsumptionForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Item Consumption',
  itemData: {},
  fields: {
    remarks: null,
    branch_id: null,
    item_id: null,
    quantity: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
  itemConsumptionItemList: [
    {
      id: null,
      branch_id: null,
      item_id: null,
      quantity: null,
      balance_quantity: null,
      remarks: null,
    },
  ],
}

const ItemConsumptionFormController: FC<any> = (props) => {
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
  } = useCrudFormService(ItemConsumptionApi, initialState, props)

  const [itemConsumptionItemList, setItemConsumptionItemList] = useState<any>([])
  const [isLoadingItemConsumptionItem, setIsLoadingItemConsumptionItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Item Consumption')
      handleResetForm()
      loadData()
    } else {
      loadData()
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, reloadForm])

  // Call getBranchItemStock API to load form data
  const loadData = (): void => {
    ItemConsumptionApi.getBranchItemStock()
      .then((res: any) => {
        let results = res.data.results
        if (results.length > 0) {
          let dataArray: any[] = []
          results.map((item: any) => {
            if (item.balance_quantity !== 0) {
              dataArray.push({
                id: item.id,
                branch_id: item.branch_id,
                item_id: item.item_id,
                item_type: item?.item_info.type,
                name_en: item?.item_info.name_en,
                name_bn: item?.item_info.name_bn,
                balance_quantity: item.balance_quantity,
                quantity: null,
                remarks: null,
              })
            }
          })
          setItemConsumptionItemList(dataArray)
        } else {
          setItemConsumptionItemList([])
        }
        setIsLoadingItemConsumptionItem(false)
        // resolve(res.data);
      })
      .catch((err) => {
        setIsLoadingItemConsumptionItem(true)
        // reject(err)
      })
  }

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      await handleCreate(values)
    } catch (error: any) {
      handleSubmitFailed(error)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      itemConsumptionItemList: itemConsumptionItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setItemConsumptionItemList([])
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
        component={ItemConsumptionAddOrEditForm}
        isLoadingItemConsumptionItem={isLoadingItemConsumptionItem}
        setIsLoadingItemConsumptionItem={setIsLoadingItemConsumptionItem}
        itemConsumptionItemList={itemConsumptionItemList}
        setItemConsumptionItemList={setItemConsumptionItemList}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default React.memo(ItemConsumptionFormController)
