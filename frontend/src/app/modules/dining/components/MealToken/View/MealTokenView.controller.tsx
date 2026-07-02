import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {MealTokenApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import MealTokenView from './MealTokenView.view'

const initialState = {
  modalTitle: 'Token Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const MealTokenViewController: FC<any> = (props) => {
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
  } = useCrudViewService(MealTokenApi, initialState, props)

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
      component={MealTokenView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(MealTokenViewController)
