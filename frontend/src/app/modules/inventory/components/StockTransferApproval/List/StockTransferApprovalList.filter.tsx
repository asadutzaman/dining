import React, {FC} from 'react'
import {Input, Form, Spin} from 'antd'
import {Col, Row} from 'react-bootstrap'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'
import SegmentedStep from 'src/app/components/Workflow/Segmented.step'
import {useLang} from 'src/app/hooks/useLang'

const StockTransferApprovalListFilter: FC<any> = (props) => {
  const {Search} = Input
  const {
    handleOnChanged,
    handleCallbackFunc,
    workflowData,
    activeStep,
    workflowLoading,
    handleStepChange,
    activeStepRecordQty,
  } = props
  const {t} = useLang()

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col span={24} className='pb-6'>
          {workflowLoading && <Spin size='small' />}
          {workflowLoading === false && (
            <SegmentedStep
              workflowSteps={workflowData?.workflow_steps}
              activeStep={activeStep}
              workflowLoading={workflowLoading}
              handleStepChange={handleStepChange}
              activeStepRecordQty={activeStepRecordQty}
            />
          )}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={4} xs={12}>
          <Form.Item name='search'>
            <Search
              placeholder={t('Search')}
              onSearch={(value) => handleOnChanged('search', value)}
            />
          </Form.Item>
        </Col>

        <Col md={8} xs={12}>
          <div className='d-flex justify-content-end'>
            <button
              title={t('Refresh')}
              type='button'
              className='btn btn-sm btn-light-primary me-3'
              onClick={(event) => handleCallbackFunc(null, 'reloadListing')}
            >
              <RefreshIcon />
            </button>
          </div>
        </Col>
      </Row>
    </div>
  )
}
export default React.memo(StockTransferApprovalListFilter)
