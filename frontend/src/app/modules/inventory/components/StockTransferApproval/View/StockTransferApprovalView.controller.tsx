import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {StockTransferApprovalApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import StockTransferApprovalView from './StockTransferApprovalView.view'

const initialState = {
  modalTitle: 'Stock Transfer Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const StockTransferApprovalViewController: FC<any> = (props) => {
  const {...restProps} = props
  const {
    BaseCrudViewService,
    modalTitle,
    itemData,
    setItemData,
    loading,
    entityId,
    reloadView,
    isShowView,
    handleCallbackFunc,
  } = useCrudViewService(StockTransferApprovalApi, initialState, props)

  useEffect(() => {
    setItemData(initialState.itemData)
    if (entityId && isShowView) {
      loadData()
    }
  }, [entityId, reloadView])

  const loadData = (): Promise<any> => {
    return BaseCrudViewService.loadData()
  }

  return (
    <DrawerView
      drawerWidth={'80%'}
      loading={loading}
      entityId={entityId}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={StockTransferApprovalView}
      handleCallbackFunc={handleCallbackFunc}
      {...restProps}
    />
  )
}

export default React.memo(StockTransferApprovalViewController)
