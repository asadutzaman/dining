import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {GoodsReceiveNoteApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import GoodsReceiveNoteView from './GoodsReceiveNoteView.view'

const initialState = {
  modalTitle: 'Goods Receive Note Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const GoodsReceiveNoteViewController: FC<any> = (props) => {
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
  } = useCrudViewService(GoodsReceiveNoteApi, initialState, props)

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
      component={GoodsReceiveNoteView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(GoodsReceiveNoteViewController)
