import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {StockAdjustmentApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import StockAdjustmentView from './StockAdjustmentView.view'

const initialState = {
  modalTitle: 'Stock Adjustment Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const StockAdjustmentViewController: FC<any> = (props) => {
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
  } = useCrudViewService(StockAdjustmentApi, initialState, props)

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
      loading={loading}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={StockAdjustmentView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(StockAdjustmentViewController)
