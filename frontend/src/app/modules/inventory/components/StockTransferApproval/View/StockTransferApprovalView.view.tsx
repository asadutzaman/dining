import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {StockTransferApprovalAction} from '../Actions/StockTransferApproval.actions'
import {StatusEnum} from 'src/app/utils/enums'
import ViewTabList from 'src/app/components/Tab/ViewTabList'
import StockTransferApprovalViewTab from '../Tabs/StockTransferApprovalView.tab'
import StockTransferApprovalItemViewTab from '../Tabs/StockTransferApprovalItemView.tab'
import {Col, Divider, Row, Timeline} from 'antd'
import StepBarProgress from 'src/app/components/Workflow/StepBarProgress'
import WorkflowActionController from 'src/app/components/Workflow/Actions/WorkflowAction.controller'
import WorkflowActivityTimeline from 'src/app/components/Workflow/Actions/WorkflowActivityTimeline'
import {useLang} from 'src/app/hooks/useLang'

const StockTransferApprovalView: FC<any> = (props) => {
  const {
    itemData, 
    handleCallbackFunc, 
    loading, 
    entityId,
    workflowLoading,
    workflowData,
    workflowActiveStep,
    activeStepActionList,
    workflowNextStepApproverList,
    ...restProps
  } = props
  const {t} = useLang()

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Stock Transfer Info'),
      permission: '',
      component: <StockTransferApprovalViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Stock Transfer Items'),
      permission: '',
      component: <StockTransferApprovalItemViewTab itemData={itemData} {...restProps} />,
    },
  ]
  return (
    <div className='card card-body position-relative'>
      <Row gutter={[16, 16]}>
        <Col span={18} className='mb-7'>
          <div className='pe-20'>
            <StepBarProgress workflowData={workflowData} workflowActiveStep={workflowActiveStep} />
          </div>

          {itemData && (
            <>
              <WorkflowActionController
                entityId={entityId}
                workflowLoading={workflowLoading}
                workflowData={workflowData}
                workflowActiveStep={workflowActiveStep}
                workflowStepActionList={activeStepActionList}
                workflowNextStepApproverList={workflowNextStepApproverList}
                recordData={itemData}
                handleCallbackFunc={handleCallbackFunc}
              />
              <br />
              <span className='text-danger'>
                [N.B: {t('Do first TO DO Task before another action')}]
              </span>
            </>
          )}

          {loading === false && (
            <div className='mt-7'>
              <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />
            </div>
          )}
        </Col>

        <Col span={6} className='border border-gray-300 rounded p-5'>
          {!loading && workflowData.id && entityId && (
            <WorkflowActivityTimeline workflowRecordId={entityId} workflowId={workflowData.id} />
          )}
        </Col>
      </Row>
    </div>
  )
}
export default React.memo(StockTransferApprovalView)
