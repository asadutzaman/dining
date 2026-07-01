import React, {FC, useEffect} from 'react'
import StepBarProgress from 'src/app/components/Workflow/StepBarProgress'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'
import {ReconcileStatusEnum} from 'src/app/utils/enums/Status.enum'
import {useWorkflow} from 'src/app/hooks/workflow/useWorkflow'

const RequisitionTimelineViewTab: FC<any> = (props) => {
  const {itemData} = props
  const {workflowData, workflowLoading} = useWorkflow('Requisition', 'REQUISITION_APPROVAL')
  const [activeStepData, setActiveStepData] = React.useState<any>()

  useEffect(() => {
    if (workflowData && !workflowLoading) {
      let currentStepCode = 'SUBMITTED'
      if (itemData.process_status == 'SUBMITTED') {
        currentStepCode = 'DELEGATION'
      } else if (itemData.process_status == 'DELEGATED') {
        currentStepCode = 'APPROVAL'
      } else if (itemData.process_status == 'APPROVED') {
        currentStepCode = 'DISBURSEMENT'
      } else if (
        itemData.process_status == 'DISBURSED' ||
        itemData.process_status == 'ACKNOWLEDGED'
      ) {
        currentStepCode = 'ACKNOWLEDGEMENT'
      } else {
        currentStepCode = 'DELEGATION'
      }
      const activeStepData = workflowData.workflow_steps?.find(
        (step: any) => step.step_code === currentStepCode
      )
      setActiveStepData(activeStepData)
    }
  }, [workflowData, workflowLoading])

  return (
    <div className='pe-20'>
      <StepBarProgress workflowData={workflowData} workflowActiveStep={activeStepData} />
    </div>
  )
}
export default React.memo(RequisitionTimelineViewTab)
