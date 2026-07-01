import React, {FC} from 'react'
import {WorkflowStepAction} from '../Actions/WorkflowStep.actions'
import {Col, Row} from 'react-bootstrap'
import CreateAction from 'src/app/components/Actions/CreateAction'
import {useLang} from 'src/app/hooks/useLang'

const WorkflowStepListFilter: FC<any> = (props) => {
  const {t} = useLang()
  const {handleCallbackFunc} = props

  return (
    <div className='p-2'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>{t('Workflow Step List')}</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <CreateAction
            actionItem={WorkflowStepAction.COMMON_ACTION.CREATE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </Col>
      </Row>
    </div>
  )
}
export default React.memo(WorkflowStepListFilter)
