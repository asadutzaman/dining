import React, {FC} from 'react'
import WorkflowStepListController from '../../WorkflowStep/List/WorkflowStepList.controller'

const WorkflowTabSteps: FC<any> = (props) => {
  const {workflowInfo} = props
  return (
    <div className='approval-steps-content'>
      <WorkflowStepListController workflowInfo={workflowInfo} workflowId={workflowInfo.id} />
    </div>
  )
}
export default React.memo(WorkflowTabSteps)
