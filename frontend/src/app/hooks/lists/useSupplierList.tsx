import {useState, useEffect} from 'react'
import {SupplierApi} from '../../api'

export const useSupplierList = () => {
  // USED STATES
  const [supplierList, setSupplierList] = useState<any>([])
  const [activeSupplierList, setActiveSupplierList] = useState<any>([])
  const [loadingSupplierList, setLoadingSupplierList] = useState<boolean>(false)

  useEffect(() => {
    loadSupplierList()
  }, [])

  const loadSupplierList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingSupplierList(true)
      const payload = {
        $select: 'id,supplier_name,phone,email,address',
        $orderby: 'supplier_name asc',
      }
      SupplierApi.dropdown(payload)
        .then((res) => {
          const list = res.data.results
          if (list.length > 0) {
            setSupplierList(list)
            const activeSuppliers = list.filter((item: any) => item.status === 1)
            setActiveSupplierList(activeSuppliers)
          }
          setLoadingSupplierList(false)
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingSupplierList(false)
          reject(err)
        })
    })
  }

  const getSupplierById = (id: any) => {
    if (!supplierList) {
      return
    }
    return supplierList.find((item: any) => item.id === Number(id))
  }

  const setSupplierFormFieldValue = (formRef: any, key: any, value: any) => {
    if (supplierList?.find((item: any) => item.id === Number(value))) {
      formRef.setFieldsValue({[key]: value})
    } else {
      formRef.setFieldsValue({[key]: null})
    }
  }

  return {
    loadingSupplierList,
    supplierList,
    activeSupplierList,
    setSupplierFormFieldValue,
    getSupplierById,
  }
}
