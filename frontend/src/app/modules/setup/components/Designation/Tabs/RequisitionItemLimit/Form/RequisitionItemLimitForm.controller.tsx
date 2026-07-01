import React, {FC, useEffect, useState} from 'react'
import dayjs from 'dayjs'
import {RequisitionItemLimitApi} from 'src/app/api'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import RequisitionItemLimitAddOrEditForm from './RequisitionItemLimitForm.form'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import {Message} from 'src/app/utils'

const initialState = {
  modalTitle: 'Create Requisition Item Limit',
  itemData: {},
  fields: {
    designation_id: null,
    effective_from: null,
    item_ids: [],
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
      name: null,
      limit_type: 'MONTHLY',
      max_qty: 0,
    },
  ],
}

const RequisitionItemLimitFormController: FC<any> = (props) => {
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
  } = useCrudFormService(RequisitionItemLimitApi, initialState, props)

  const [grnItemList, setGrnItemList] = useState<any>([])
  const [isLoadingGrnItem, setIsLoadingGrnItem] = useState<boolean>(false)

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit Requisition Item Limit')
      resetForm()
      handleResetForm()
      loadData()
    } else {
      resetForm()
      handleResetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
      if (props.designationId) {
        handleChange({designation_id: props.designationId})
        formRef.setFieldsValue({designation_id: props.designationId})
      }
    }
  }, [entityId, reloadForm])

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        designation_id: res.data.designation_id,
        effective_from: res.data.effective_from ? dayjs(res.data.effective_from) : null,
        status: res.data.status,
      }

      if (res.data.item_id) {
        let dataArray: any[] = []
        dataArray.push({
          item_id: res.data.item_id,
          name: res.data.item_name,
          limit_type: res.data.limit_type,
          max_qty: res.data.max_qty,
        })
        setGrnItemList(dataArray)
        initFormDta['item_ids'] = [res.data.item_id]
      } else {
        setGrnItemList([])
      }

      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)
    })
  }

  const handleItemSelect = (value?: any, option?: any) => {}

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
    const effectiveFrom = values.effective_from ? dayjs(values.effective_from).format('YYYY-MM-DD') : null
    const list = (grnItemList || []).filter((x: any) => x.item_id)
    const requests = list.map((x: any) =>
      RequisitionItemLimitApi.create({
        designation_id: values.designation_id || props.designationId,
        item_id: x.item_id,
        limit_type: x.limit_type,
        max_qty: x.max_qty,
        effective_from: effectiveFrom,
      })
    )
    return Promise.all(requests)
      .then((resList) => {
        Message.success('The operation performed successfully.')
        handleCallbackFunc(null, 'hideForm')
        handleCallbackFunc(null, 'reloadListing')
        return resList
      })
      .catch((err) => {
        throw err
      })
  }

  const handleUpdate = (values: any): Promise<any> => {
    if (!grnItemList?.[0]) {
      throw new Error('No item selected')
    }
    const x = grnItemList[0]
    const payload = {
      designation_id: values.designation_id || props.designationId,
      item_id: x.item_id,
      limit_type: x.limit_type,
      max_qty: x.max_qty,
      effective_from: values.effective_from ? dayjs(values.effective_from).format('YYYY-MM-DD') : null,
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
        component={RequisitionItemLimitAddOrEditForm}
        isLoadingGrnItem={isLoadingGrnItem}
        setIsLoadingGrnItem={setIsLoadingGrnItem}
        handleItemSelect={handleItemSelect}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        grnItemList={grnItemList}
        setGrnItemList={setGrnItemList}
        designationId={props.designationId}
      />
    </div>
  )
}

export default React.memo(RequisitionItemLimitFormController)
