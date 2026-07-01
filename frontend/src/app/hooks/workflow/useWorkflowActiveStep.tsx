import {useContext, useEffect, useState} from 'react'
import {WorkflowActionDataList} from 'src/app/components/Workflow/Actions/WorkflowAction.data'
import {AuthContext} from 'src/app/context/auth/auth.context'
import {WorkflowUtils} from 'src/app/utils'

export const useWorkflowActiveStep = (
  workflowData: any,
  activeStepCode: string,
  recordData?: any
) => {
  const {userId} = useContext<any>(AuthContext)
  const [activeStepData, setActiveStepData] = useState<any>({})
  const [activeStepActionList, setActiveStepActionList] = useState<any>([])
  const [workflowNextStepApproverList, setWorkflowNextStepApproverList] = useState<any[]>([])

  useEffect(() => {
    if (userId && workflowData && activeStepCode) {
      const activeStepData = loadActiveStepData(activeStepCode)
      if (activeStepData) {
        console.log('Active Step Data:', activeStepData)
        setActiveStepData(activeStepData)
        processWorkflowActiveStep(activeStepData)
      }
    }
  }, [userId, workflowData, activeStepCode])

  const loadActiveStepData = (activeStepCode: string) => {
    return workflowData.workflow_steps.find((step: any) => step.step_code === activeStepCode)
  }

  const processWorkflowActiveStep = (activeStepData: any) => {
    const nextStep = loadNextStep(activeStepData)

    if (activeStepData) {
      const activeStepConditions = loadActiveStepConditions(activeStepData)
      console.log('Active Step Conditions:', activeStepConditions)
    }

    if (activeStepData) {
      const activeStepActionList = loadActiveStepActionList(activeStepData)
      console.log('Active Step Action List:', activeStepActionList)
      setActiveStepActionList(activeStepActionList)
    }

    const nextStepApproverList = loadStepApproverList(nextStep)
    setWorkflowNextStepApproverList(nextStepApproverList)
    console.log('Next Step Approver List:', nextStepApproverList)
  }

  const loadActiveStepConditions = (step: any) => {
    if (step === '' || step === undefined || step === null) {
      return []
    }

    const activeStepConditions: any[] = []

    for (const conditionKey in step.pre_conditions) {
      const conditionItem = step.pre_conditions[conditionKey]
      activeStepConditions.push(conditionItem)
    }

    return activeStepConditions
  }

  const loadActiveStepActionList = (step: any) => {
    if (step === '' || step === undefined || step === null) {
      return []
    }

    const activeStepActionList: any[] = []

    for (const actionKey in step.actions) {
      const actionItem = step.actions[actionKey]
      const actionItemData = WorkflowActionDataList.find(
        (item) => item.action_code === actionItem.action_code
      )
      const actionItemMergedData = {...actionItemData, ...actionItem}
      activeStepActionList.push(actionItemMergedData)
    }

    return processOrderBy(activeStepActionList)
  }

  const loadNextStep = (step: any) => {
    const steps = workflowData.workflow_steps

    const activeStepIndex = step.stepIndex
    const nextStepIndex = activeStepIndex + 1

    return steps.find((item) => item.stepIndex == nextStepIndex)
  }

  const loadStepApproverList = (step: any) => {
    if (step === '' || step === undefined || step === null) {
      return []
    }

    const activeStepApproverList: any[] = []

    for (const approverKey in step.step_approvers) {
      const approverItem = step.step_approvers[approverKey]
      activeStepApproverList.push(approverItem)
    }

    return activeStepApproverList
  }

  const processOrderBy = (objectArray) => {
    objectArray.sort((a, b) => a.sort_order - b.sort_order)
    return objectArray
  }

  const getMyWorkflowActiveStepFilters = (activeStepIndex: any, fieldList: any[] = []): string => {
    const activeStepData = loadActiveStepData(activeStepIndex)
    const activeStepConditionList = loadActiveStepConditions(activeStepData)

    if (activeStepConditionList.length === 0) {
      return ''
    }

    let filterCondition: any[] = []

    for (const key in activeStepConditionList) {
      const conditionItem = activeStepConditionList[key]
      const fieldName = conditionItem.field_name
      if (fieldList.includes(fieldName)) {
        const fieldOperator = conditionItem.operator
        const mysqlOperator = WorkflowUtils.convertArithmeticOperator(fieldOperator)
        const fieldValue = conditionItem.field_value
        const filterConditionItem = `${fieldName} ${mysqlOperator} '${fieldValue}'`
        filterCondition.push(filterConditionItem)
      }
    }

    let filterString = ''

    if (filterCondition.length) {
      filterString += ' AND ('
      filterString += filterCondition.join(' OR ')
      filterString += ')'
    }

    return filterString
  }

  return {
    activeStepData,
    getMyWorkflowActiveStepFilters,
    activeStepActionList,
    workflowNextStepApproverList,
  }
}
