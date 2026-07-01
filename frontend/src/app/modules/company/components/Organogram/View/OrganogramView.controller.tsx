import React, {FC, useEffect} from 'react'
import {OrganogramApi} from 'src/app/api'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import OrganogramView from './OrganogramView.view'

const initialState = {
  modalTitle: 'Organogram Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const OrganogramViewController: FC<any> = (props) => {
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
  } = useCrudViewService(OrganogramApi, initialState, props)

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
      component={OrganogramView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(OrganogramViewController)
