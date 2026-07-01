import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {WorkflowApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import WorkflowView from './WorkflowView.view'
import {useLang} from 'src/app/hooks/useLang'

const initialState = {
  modalTitle: 'Workflow Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const WorkflowViewController: FC<any> = (props) => {
  const {t} = useLang()
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
  } = useCrudViewService(WorkflowApi, initialState, props)

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
      drawerWidth={'75%'}
      loading={loading}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={WorkflowView}
      handleCallbackFunc={handleCallbackFunc}
    />
  )
}

export default React.memo(WorkflowViewController)
