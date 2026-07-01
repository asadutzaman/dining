import React, {FC, useEffect} from 'react'
import {UserApi} from 'src/app/api'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import UserView from './UserView.view'

const initialState = {
  modalTitle: 'User Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const UserViewController: FC<any> = (props) => {
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
  } = useCrudViewService(UserApi, initialState, props)

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
      component={UserView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(UserViewController)
