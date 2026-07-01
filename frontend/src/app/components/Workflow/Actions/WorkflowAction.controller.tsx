import React, {FC} from 'react'
import {Button} from 'antd'
import {useWorkflowActiveStepAction} from 'src/app/hooks/workflow/useWorkflowActiveStepAction'

type Props = {
  entityId: any
  workflowLoading: any
  workflowData: any
  workflowActiveStep: any
  workflowStepActionList: any
  recordData: any
  handleCallbackFunc: any
  [key: string]: any
}

const WorkflowActionController: FC<Props> = (props: Props) => {
  const {
    entityId,
    workflowLoading,
    workflowData,
    workflowActiveStep,
    workflowStepActionList,
    recordData,
    handleCallbackFunc,
    ...restProps
  } = props

  const {activeStepPermittedActionList} = useWorkflowActiveStepAction(
    workflowActiveStep,
    workflowStepActionList,
    recordData
  )

  return activeStepPermittedActionList?.map((item) => {
    const Component = item?.action_component
    return (
      item?.action_component && (
        <Component
          entityId={entityId}
          workflowLoading={workflowLoading}
          workflowData={workflowData}
          workflowActionInfo={item}
          workflowActiveStep={workflowActiveStep}
          handleCallbackFunc={handleCallbackFunc}
          {...restProps}
        />
      )
    )
  })
}

export default React.memo(WorkflowActionController)
