import React, {FC} from 'react'
import {Badge, Segmented} from 'antd'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  workflowSteps: any[]
  activeStep: string
  handleStepChange: (value: any) => void
  activeStepRecordQty?: number
  [key: string]: any
}

const SegmentedStep: FC<IProps> = (props) => {
  const {t} = useLang()
  const {workflowSteps, activeStep, handleStepChange, activeStepRecordQty} = props

  return (
    <Segmented
      options={workflowSteps?.map((step) => ({
        label: (
          <div className='d-flex flex-column align-items-center py-2'>
            <span className='text-muted'>{t(step.step_key)}</span>
            <span className='fw-bold'>
              {t(step.step_name)}{' '}
              <Badge count={activeStep === step.step_code ? activeStepRecordQty || 0 : ''}></Badge>
            </span>
          </div>
        ),
        value: step.step_code,
        disabled: step.myStep ? false : true,
      }))}
      block
      shape='round'
      size='middle'
      value={activeStep}
      onChange={(value) => handleStepChange(value)}
    />
  )
}

export default SegmentedStep
