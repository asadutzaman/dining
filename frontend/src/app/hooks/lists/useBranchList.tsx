import {useState, useEffect} from 'react'
import {BranchApi} from 'src/app/api'

export const useBranchList = () => {
  // USED STATES
  const [branchList, setBranchList] = useState<any>([])
  const [warehouseList, setWarehouseList] = useState<any>([])
  const [thanaList, setThanaList] = useState<any>([])
  const [loadingBranchList, setLoadingBranchList] = useState<boolean>(false)
  const [disabledBranchList, setDisabledBranchList] = useState<boolean>(true)

  useEffect(() => {
    loadBranchList()
  }, [])

  const loadBranchList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingBranchList(true)
      const payload = {
        $select: 'id,name,parent_id,type,status',
        $orderby: 'sort_order asc',
      }
      BranchApi.dropdown(payload)
        .then((res) => {
          const list = res.data.results
          if (list.length > 0) {
            setBranchList(list)
            setWarehouseList(list.filter((item: any) => item.type === 'Warehouse'))
            setThanaList(list.filter((item: any) => item.type === 'Branch'))
          }
          setLoadingBranchList(false)
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingBranchList(false)
          reject(err)
        })
    })
  }

  const getBranchById = (id: any) => {
    if (!branchList) {
      return
    }
    return branchList.find((item: any) => item.id === Number(id))
  }

  const setBranchFormFieldValue = (formRef: any, key: any, value: any) => {
    if (branchList?.find((item: any) => item.id === Number(value))) {
      formRef.setFieldsValue({[key]: value})
    } else {
      formRef.setFieldsValue({[key]: null})
    }
  }

  return {
    branchList,
    warehouseList,
    thanaList,
    loadingBranchList,
    setBranchFormFieldValue,
    getBranchById,
    disabledBranchList,
    setDisabledBranchList,
  }
}
