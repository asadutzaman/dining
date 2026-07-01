import {useState} from 'react'
import {Message} from '../../utils'
import {useForm} from '../useForm'
import {useLang} from '../useLang'

export const useCrudViewService = (
  CrudServiceApi: any,
  initialState: any = {},
  props: any = {}
) => {
  const {t} = useLang()
  const {entityId, reloadView, isShowView, handleCallbackFunc} = props

  const modalTitle = initialState.modalTitle
  const [itemData, setItemData] = useState(initialState.itemData)
  const [loading, setLoading] = useState(initialState.loading)
  const {setErrors} = useForm(initialState.fields)

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      CrudServiceApi.getById(entityId)
        .then((res: any) => {
          setItemData(res.data)
          setLoading(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data)
          } else if (err?.status === 412) {
            setErrors(err.data)
          } else if (err?.status === 422) {
            Message.error(err.data)
          } else {
            Message.error(t('A network error occurred. Please try again later.'))
          }
          setLoading(false)
          reject(err)
        })
    })
  }

  const hookState = {
    modalTitle,
    itemData,
    setItemData,
    loading,
    setLoading,
    entityId,
    reloadView,
    isShowView,
  }

  const hookMethod = {
    loadData,
    handleCallbackFunc,
  }

  return {
    ...hookState,
    ...hookMethod,
    BaseCrudViewService: {
      ...hookMethod,
    },
  }
}
