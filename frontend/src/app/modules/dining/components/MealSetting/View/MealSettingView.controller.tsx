import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {MealSettingApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import MealSettingView from './MealSettingView.view'

const initialState = {
  modalTitle: 'Meal Cost Setting Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const MealSettingViewController: FC<any> = (props) => {
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
  } = useCrudViewService(MealSettingApi, initialState, props)

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
      component={MealSettingView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(MealSettingViewController)
