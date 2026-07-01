import React, {FC, useEffect} from 'react'
import {ResourceApi} from 'src/app/api'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import ResourceView from './ResourceView.view'

const initialState = {
  modalTitle: 'Resource Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const ResourceViewController: FC<any> = (props) => {
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
  } = useCrudViewService(ResourceApi, initialState, props)

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
      component={ResourceView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(ResourceViewController)
