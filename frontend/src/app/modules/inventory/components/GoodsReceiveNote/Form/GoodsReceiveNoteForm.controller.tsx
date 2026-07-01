import React, {FC, useEffect, useState} from 'react'
import dayjs from 'dayjs'
import {GoodsReceiveNoteApi} from 'src/app/api' // This will need to be created
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import GoodsReceiveNoteAddOrEditForm from './GoodsReceiveNoteForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Goods Receive Note',
  itemData: {},
  fields: {
    ref_challan_no: null,
    ref_challan_date: null,
    ref_po_number: null,
    ref_po_date: null,
    remarks: null,
    logistic_id: null,
    supplier_id: null,
    process_status: 'DRAFT',
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
  grnItemList: [
    {
      id: null,
      item_id: null,
      shelve_id: null,
      unit_price: null,
      quantity: null,
      total_price: null,
      remarks: null,
    },
  ],
}

const GoodsReceiveNoteFormController: FC<any> = (props) => {
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
  } = useCrudFormService(GoodsReceiveNoteApi, initialState, props)

  const [grnItemList, setGrnItemList] = useState<any>([])
  const [isLoadingGrnItem, setIsLoadingGrnItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Goods Receive Note')
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
        ref_po_number: res.data.ref_po_number,
        ref_po_date: res.data.ref_po_date ? dayjs(res.data.ref_po_date) : null,
        ref_challan_no: res.data.ref_challan_no,
        ref_challan_date: res.data.ref_challan_date ? dayjs(res.data.ref_challan_date) : null,
        logistic_id: res.data.logistic_id,
        supplier_id: res.data.supplier_id,
        remarks: res.data.remarks,
        process_status: res.data.process_status,
        status: res.data.status,
      }

      if (res.data.goods_receive_note_items_list_data.length > 0) {
        let dataArray: any[] = []
        res.data.goods_receive_note_items_list_data.map((item: any) => {
          let dataObj = {
            id: item.id,
            item_id: item.item_id,
            name: item.item_info.name_en ?? item.item_info.name_bn,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price,
            shelve_id: item.shelve_id,
            expire_date: item.expire_date ? dayjs(item.expire_date) : null,
            remarks: item.remarks,
          }
          dataArray.push(dataObj)
        })
        setGrnItemList(dataArray)
      } else {
        setGrnItemList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleLogisticChange = (value) => {
    formRef.setFieldsValue({logistic_id: value, item_id: null})
    setGrnItemList([])
  }

  const handleItemSelect = (value, option) => {
    formRef.setFieldsValue({item_id: value})
    formRef.setFieldsValue({itemNameCode: option.label})
    let itemExist = grnItemList.find((item: any) => item.item_id == value)
    if (itemExist) {
      Message.error('Item already exists')
    } else {
      setGrnItemList((prev: any) => {
        let newObj = {
          item_id: value,
          shelve_id: null,
          name: option.label,
          unit_price: 0,
          quantity: 1,
          total_price: 0,
          remarks: '',
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
      grnItemsList: grnItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      grnItemsList: grnItemList.filter(
        (item: any) => item.quantity !== 0 && item.quantity !== null
      ),
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  const handleResetForm = () => {
    resetForm()
    setGrnItemList([])
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
        component={GoodsReceiveNoteAddOrEditForm}
        isLoadingGrnItem={isLoadingGrnItem}
        setIsLoadingGrnItem={setIsLoadingGrnItem}
        handleLogisticChange={handleLogisticChange}
        handleItemSelect={handleItemSelect}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        grnItemList={grnItemList}
        setGrnItemList={setGrnItemList}
      />
    </div>
  )
}

export default React.memo(GoodsReceiveNoteFormController)
