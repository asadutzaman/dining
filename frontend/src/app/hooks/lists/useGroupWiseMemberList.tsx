import {useState, useEffect} from 'react'
import {ApproverGroupApi} from 'src/app/api'

export const useGroupWiseMemberList = () => {
  // USED STATES
  const [approverGroupMemberList, setApproverGroupMemberList] = useState<any>([])
  const [loadingApproverGroupMemberList, setLoadingApproverGroupMemberList] =
    useState<boolean>(false)
  const [disabledApproverGroupMemberList, setDisabledApproverGroupMemberList] =
    useState<boolean>(true)

  // useEffect(() => {
  //   loadApproverGroupMemberList()
  // }, [])

  const loadApproverGroupMemberList = (approverGroupId: Number): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingApproverGroupMemberList(true)
      const payload = {
        approver_group_id: approverGroupId,
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

  const loadApproverGroupMemberListByGroupId = (approverGroupId: Number) => {
    loadApproverGroupMemberList(approverGroupId)

    // if (approverGroupMemberList.length === 0) {
    //   loadApproverGroupMemberList().then((res) => {
    //     if (approverGroupId) {
    //       const filteredList = res.results.filter(
    //         (item: any) => item.approver_group_id === Number(approverGroupId)
    //       )
    //       setApproverGroupMemberList(filteredList)
    //       setDisabledApproverGroupMemberList(false)
    //     }
    //   })
    // } else {
    //   if (approverGroupId) {
    //     const filteredList = approverGroupMemberList.filter(
    //       (item: any) => item.approver_group_id === Number(approverGroupId)
    //     )
    //     setApproverGroupMemberList(filteredList)
    //     setDisabledApproverGroupMemberList(false)
    //   }
    // }
  }

  return {
    approverGroupMemberList,
    loadingApproverGroupMemberList,
    loadApproverGroupMemberListByGroupId,
    disabledApproverGroupMemberList,
    setDisabledApproverGroupMemberList,
  }
}
