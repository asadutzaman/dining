import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {ItemApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import ItemView from './ItemView.view'

const initialState = {
  modalTitle: 'Item Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const ItemViewController: FC<any> = (props) => {
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
  } = useCrudViewService(ItemApi, initialState, props)

  useEffect(() => {
    setItemData(initialState.itemData)
    if (entityId && isShowView) {
      loadData()
    }
  }, [entityId, reloadView])

  const loadData = async (): Promise<any> => {
    try {
      return await BaseCrudViewService.loadData()
    } catch (error: any) {
      // console.log(error)
    }
  }

  return (
    <DrawerView
      loading={loading}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={ItemView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(ItemViewController)
