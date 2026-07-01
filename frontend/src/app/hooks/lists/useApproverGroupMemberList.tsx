import {useState, useEffect} from 'react'
import {ApproverGroupApi} from 'src/app/api'

export const useApproverGroupMemberList = () => {
  // USED STATES
  const [approverGroupMemberList, setApproverGroupMemberList] = useState<any>([])
  const [loadingApproverGroupMemberList, setLoadingApproverGroupMemberList] =
    useState<boolean>(false)
  const [disabledApproverGroupMemberList, setDisabledApproverGroupMemberList] =
    useState<boolean>(true)

  useEffect(() => {
    loadApproverGroupMemberList()
  }, [])

  const loadApproverGroupMemberList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingApproverGroupMemberList(true)
      const payload = {
        // approver_group_id: approverGroupId,
      }
      ApproverGroupApi.memberDropdown(payload)
        .then((res) => {
          const list = res.data.results
          if (list.length > 0) {
            setApproverGroupMemberList(list)
            setDisabledApproverGroupMemberList(false)
          }
          setLoadingApproverGroupMemberList(false)
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingApproverGroupMemberList(false)
          reject(err)
        })
    })
  }

  return {
    approverGroupMemberList,
    loadingApproverGroupMemberList,
    disabledApproverGroupMemberList,
    setDisabledApproverGroupMemberList,
  }
}
