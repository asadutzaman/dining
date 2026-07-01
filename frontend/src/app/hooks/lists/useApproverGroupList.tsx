import {useState, useEffect} from 'react'
import {ApproverGroupApi} from 'src/app/api'

export const useApproverGroupList = () => {
  // USED STATES
  const [approverGroupList, setApproverGroupList] = useState<any>([])
  const [activeApproverGroupList, setActiveApproverGroupList] = useState<any>([])
  const [loadingApproverGroupList, setLoadingApproverGroupList] = useState<boolean>(false)

  useEffect(() => {
    loadApproverGroupList()
  }, [])

  const loadApproverGroupList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingApproverGroupList(true)
      const payload = {
        $select: 'id,name,status',
        $orderby: 'sort_order asc',
      }
      ApproverGroupApi.dropdown(payload)
        .then((res) => {
          const list = res.data.results
          setApproverGroupList(list)
          setLoadingApproverGroupList(false)
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingApproverGroupList(false)
          reject(err)
        })
    })
  }

  const getApproverGroupById = (id: any) => {
    if (!approverGroupList) {
      return
    }
    return approverGroupList.find((item: any) => item.id === Number(id))
  }

  const setApproverGroupFormFieldValue = (formRef: any, key: any, value: any) => {
    if (approverGroupList?.find((item: any) => item.id === Number(value))) {
      formRef.setFieldsValue({[key]: value})
    } else {
      formRef.setFieldsValue({[key]: null})
    }
  }

  return {
    loadingApproverGroupList,
    approverGroupList,
    activeApproverGroupList,
    setApproverGroupFormFieldValue,
    getApproverGroupById,
  }
}
