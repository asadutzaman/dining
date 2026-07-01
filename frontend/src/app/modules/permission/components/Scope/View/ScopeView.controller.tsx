import React, {FC, useEffect} from 'react'
import {ScopeApi} from 'src/app/api'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import ScopeView from './ScopeView.view'

const initialState = {
  modalTitle: 'Scope Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const ScopeViewController: FC<any> = (props) => {
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
  } = useCrudViewService(ScopeApi, initialState, props)

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
      component={ScopeView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(ScopeViewController)
