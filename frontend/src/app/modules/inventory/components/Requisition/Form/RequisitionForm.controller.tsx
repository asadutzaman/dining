import React, {FC, useEffect, useState} from 'react'
import {RequisitionApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import RequisitionAddOrEditForm from './RequisitionForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Requisition',
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
  requisitionItemList: [{id: null, item_id: null, request_quantity: null}],
}

const RequisitionFormController: FC<any> = (props) => {
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
  } = useCrudFormService(RequisitionApi, initialState, props)

  const [requisitionItemList, setRequisitionItemList] = useState<any>([])
  const [isLoadingRequisitionItem, setIsLoadingRequisitionItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Requisition')
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
        subject: res.data.subject,
        description: res.data.description,
        logistic_id: res.data.logistic_id,
        process_status: res.data.process_status,
        status: res.data.status,
      }

      if (res.data.requisitionItemsListData.length > 0) {
        let dataArray: any[] = []
        res.data.requisitionItemsListData.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            name: item.item_info.name_en ?? item.item_info.name_bn,
            request_quantity: item.request_quantity,
          }
          dataArray.push(dataObj)
        })
        setRequisitionItemList(dataArray)
      } else {
        setRequisitionItemList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleLogisticChange = (value) => {
    formRef.setFieldsValue({logistic_id: value, item_id: null})
    setRequisitionItemList([])
  }

  const handleItemSelect = (value, option, logisticId) => {
    formRef.setFieldsValue({item_id: value})
    formRef.setFieldsValue({itemNameCode: option.label})
    formRef.setFieldsValue({logisticId: logisticId})
    let itemExist = requisitionItemList.find((item: any) => item.id === value)
    if (itemExist) {
      Message.error('Item already exists')
    } else {
      setRequisitionItemList((prev: any) => {
        let newObj = {
          item_id: value,
          name: option.label,
        }
        return [...prev, newObj]
      })
    }
  }

  const handleSubmit = async (values: any): Promise<void> => {
    // null check
    const hasEmptyQuantity = requisitionItemList.some(
      (item: any) => !item.request_quantity || item.request_quantity.toString().trim() === ''
    )
    if (hasEmptyQuantity) {
      Message.error('Request quantity is required')
      return
    }
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
      requisitionItemsList: requisitionItemList.filter(
        (item: any) => item.request_quantity !== 0 && item.request_quantity !== null
      ),
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      requisitionItemsList: requisitionItemList.filter(
        (item: any) => item.request_quantity !== 0 && item.request_quantity !== null
      ),
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setRequisitionItemList([])
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
        component={RequisitionAddOrEditForm}
        isLoadingRequisitionItem={isLoadingRequisitionItem}
        setIsLoadingRequisitionItem={setIsLoadingRequisitionItem}
        handleLogisticChange={handleLogisticChange}
        handleItemSelect={handleItemSelect}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        requisitionItemList={requisitionItemList}
        setRequisitionItemList={setRequisitionItemList}
      />
    </div>
  )
}

export default React.memo(RequisitionFormController)
