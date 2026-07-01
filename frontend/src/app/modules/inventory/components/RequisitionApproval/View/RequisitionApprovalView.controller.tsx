import React, {FC, useEffect} from 'react'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {RequisitionApprovalApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import RequisitionApprovalView from './RequisitionApprovalView.view'

const initialState = {
  modalTitle: 'Requisition Approval Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const RequisitionApprovalViewController: FC<any> = (props) => {
  const {
    // workflowLoading,
    // workflowData,
    // workflowActiveStep,
    // activeStepActionList,
    // workflowNextStepApproverList,
    ...restProps
  } = props
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
  } = useCrudViewService(RequisitionApprovalApi, initialState, props)

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
      drawerWidth={'85%'}
      loading={loading}
      entityId={entityId}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={RequisitionApprovalView}
      // workflowLoading={workflowLoading}
      // workflowData={workflowData}
      // workflowActiveStep={workflowActiveStep}
      // activeStepActionList={activeStepActionList}
      // workflowNextStepApproverList={workflowNextStepApproverList}
      handleCallbackFunc={handleCallbackFunc}
      {...restProps}
    />
  )
}

export default React.memo(RequisitionApprovalViewController)
