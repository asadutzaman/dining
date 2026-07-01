import {useContext, useEffect, useState} from 'react'
import {AuthContext} from 'src/app/context/auth/auth.context'
import {WorkflowUtils} from 'src/app/utils'

export const useWorkflowActiveStepAction = (
  activeStepData: any,
  activeStepActionList: any,
  recordData: any
) => {
  const {userId} = useContext<any>(AuthContext)
  const [activeStepPermittedActionList, setActiveStepPermittedActionList] = useState<any>([])

  useEffect(() => {
    if (userId && activeStepData && activeStepActionList && recordData) {
      if (activeStepData) {
        processWorkflowActiveStep(activeStepData)
      }
    }
  }, [userId, activeStepData, activeStepActionList, recordData])

  const processWorkflowActiveStep = (activeStepData: any) => {
    const activeStepPermittedActionList = filterStepPermittedActionList(
      activeStepData,
      activeStepActionList
    )
    setActiveStepPermittedActionList(activeStepPermittedActionList)
  }

  const filterStepPermittedActionList = (step: any, stepActionList: any) => {
    if (step === '' || step === undefined || step === null) {
      return []
    }

    if (step.myStep === false) {
      return []
    }

    let permittedActionList: any[] = []
    stepActionList.forEach(function (item) {
      if (hasMatchActionRules(item?.action_rules)) {
        permittedActionList.push(item)
      }
    })

    return permittedActionList
  }

  const hasMatchActionRules = (rulesList): boolean => {
    if (rulesList.length === 0) {
      return true
    } else {
      // for (const key in rulesList) {
      //   const item = rulesList[key]

      //   if (item.rule_type === 'USER' && item.value === userId) {
      //     return true
      //   }
      //   if (item.rule_type === 'STATUS' && item.value === recordData.process_status) {
      //     return true
      //   }
      // }

      const statusValues = rulesList
        .filter((item) => item.rule_type === 'STATUS')
        .map((item) => item.value)

      if (statusValues.includes(recordData.process_status)) {
        return true
      }

      return false
    }
  }

  return {
    activeStepPermittedActionList,
  }
}
