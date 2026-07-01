import {useState, useEffect} from 'react'
import {UnitApi} from '../../api'

export const useUnitList = () => {
  // USED STATES
  const [unitList, setUnitList] = useState<any>([])
  const [activeUnitList, setActiveUnitList] = useState<any>([])
  const [loadingUnitList, setLoadingUnitList] = useState<boolean>(false)

  useEffect(() => {
    loadUnitList()
  }, [])

  const loadUnitList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingUnitList(true)
      const payload = {
        $select: 'id,name,short_name,status',
        $orderby: 'sort_order asc',
      }
      UnitApi.dropdown(payload)
        .then((res) => {
          const list = res.data.results
          if (list.length > 0) {
            setUnitList(list)
            const activeUnits = list.filter((item: any) => item.status === 1)
            setActiveUnitList(activeUnits)
          }
          setLoadingUnitList(false)
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingUnitList(false)
          reject(err)
        })
    })
  }

  const getUnitById = (id: any) => {
    if (!unitList) {
      return
    }
    return unitList.find((item: any) => item.id === Number(id))
  }

  const setUnitFormFieldValue = (formRef: any, key: any, value: any) => {
    if (unitList?.find((item: any) => item.id === Number(value))) {
      formRef.setFieldsValue({[key]: value})
    } else {
      formRef.setFieldsValue({[key]: null})
    }
  }

  return {
    loadingUnitList,
    unitList,
    activeUnitList,
    setUnitFormFieldValue,
    getUnitById,
  }
}
