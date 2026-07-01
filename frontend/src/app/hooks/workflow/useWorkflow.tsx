import {useContext, useEffect, useState} from 'react'
import {WorkflowApi} from 'src/app/api'
import {AuthContext} from 'src/app/context/auth/auth.context'

export const useWorkflow = (workflowType: string, workflowCode: string) => {
  const [workflowData, setWorkflowData] = useState<any>({workflowId: null})
  const [workflowLoading, setWorkflowLoading] = useState<boolean>(false)
  const {userId} = useContext<any>(AuthContext)

  useEffect(() => {
    if (userId && workflowType && workflowCode) {
      loadWorkflowData()
    }
  }, [userId, workflowType, workflowCode])

  const loadWorkflowData = (): Promise<any> => {
    setWorkflowLoading(true)
    return new Promise((resolve, reject) => {
      const payload = {
        $filter: `type='${workflowType}' AND workflow_code='${workflowCode}'`,
      }
      WorkflowApi.getByWhere(payload)
        .then((res) => {
          processWorkflowResponse(res.data)
          setWorkflowLoading(false)
          resolve(res)
        })
        .catch((err) => {
          setWorkflowLoading(false)
          // handleErrorMessage(err)
          reject(err)
        })
    })
  }

  const processWorkflowResponse = (result: any) => {
    let steps = result.workflow_steps.map((item, index) => {
      return {
        stepIndex: index + 1,
        myStep: false,
        bulkActiveStep: false,
        ...item,
      }
    })

    steps = setMySteps(steps)
    result['workflow_steps'] = steps
    setWorkflowData(result)
  }

  const setMySteps = (steps: any) => {
    for (const key in steps) {
      const item = steps[key]
      if (checkIsApproverExist(item.step_approvers)) {
        steps[key]['myStep'] = true
      }
    }
    return steps
  }

  const checkIsApproverExist = (approvers) => {
    if (approvers.some((item) => item.approver_mode === 'DESIGNATION')) {
      return approvers.some((item) => item.user_ids?.includes(userId))
    } else if (approvers.some((item) => item.approver_mode === 'USER')) {
      return approvers.some((item) => item.user_id === userId)
    } else {
      return false
    }
  }
  return {workflowData, workflowLoading}
}
