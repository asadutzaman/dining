import React, {FC} from 'react'
import {Steps} from 'antd'

type Props = {
  workflowData: any
  workflowActiveStep: any
  [key: string]: any
}

const StepBarProgress: FC<Props> = (props: Props) => {
  const {Step} = Steps
  const {workflowData, workflowActiveStep} = props

  return (
    <div className='mb-7'>
      <Steps current={workflowActiveStep?.id ? workflowActiveStep?.id - 1 : undefined}>
        {workflowData?.workflow_steps?.map((item) => (
          <Step key={`workflow-step-${item.id}`} title={item.step_name} />
        ))}
      </Steps>
    </div>
  )
}

export default React.memo(StepBarProgress)
