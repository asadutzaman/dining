import {useState} from 'react'
import {Message} from '../../utils'
import {useForm} from '../useForm'
import {useLang} from '../useLang'

export const useCrudFormService = (
  CrudServiceApi: any,
  initialState: any = {},
  props: any = {}
) => {
  const {t} = useLang()
  const {entityId, reloadForm, isShowForm, modalFormObject, isShowModalForm, handleCallbackFunc} =
    props

  const [modalTitle, setModalTitle] = useState(t(initialState.modalTitle))
  const [isNewRecord, setIsNewRecord] = useState(initialState.isNewRecord)
  const [itemData, setItemData] = useState(initialState.itemData)
  const [loading, setLoading] = useState(initialState.loading)

  const {
    formRef,
    initialValues,
    isSubmitting,
    setErrors,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
    resetForm,
  } = useForm(initialState.fields)

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
            Message.error(typeof err.data === 'string' ? err.data : JSON.stringify(err.data))
          } else {
            Message.error(t('A network error occurred. Please try again later.'))
          }
          setLoading(false)
          reject(err)
        })
    })
  }

  const handleSubmit = (values: any): void => {
    if (entityId) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  const handleCreate = (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      setIsSubmitting(true)
      CrudServiceApi.create(payload)
        .then((res: any) => {
          Message.success(t(initialState.message.create_success))
          handleCallbackFunc(null, 'hideForm')
          handleCallbackFunc(null, 'reloadListing')
          setLoading(false)
          setIsSubmitting(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data)
          } else if (err?.status === 412) {
            setErrors(err.data)
          } else if (err?.status === 422) {
            Message.error(typeof err.data === 'string' ? err.data : JSON.stringify(err.data))
          } else {
            Message.error(t(initialState.message.network_error))
          }
          setLoading(false)
          setIsSubmitting(false)
          reject(err)
        })
    })
  }

  const handleUpdate = (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      setIsSubmitting(true)
      CrudServiceApi.update(entityId, payload)
        .then((res: any) => {
          Message.success(t(initialState.message.update_success))
          handleCallbackFunc(null, 'hideForm')
          handleCallbackFunc(null, 'updateListItem', entityId, res.data)
          handleCallbackFunc(null, 'reloadView')
          setLoading(false)
          setIsSubmitting(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data)
          } else if (err?.status === 412) {
            setErrors(err.data)
          } else if (err?.status === 422) {
            Message.error(typeof err.data === 'string' ? err.data : JSON.stringify(err.data))
          } else {
            Message.error(t(initialState.message.network_error))
          }
          setLoading(false)
          setIsSubmitting(false)
          reject(err)
        })
    })
  }

  const hookState = {
    modalTitle,
    setModalTitle,
    isNewRecord,
    setIsNewRecord,
    itemData,
    setItemData,
    loading,
    setLoading,
    formRef,
    setErrors,
    initialValues,
    isSubmitting,
    setIsSubmitting,
    entityId,
    isShowForm,
    modalFormObject,
    isShowModalForm,
    reloadForm,
  }

  const hookMethod = {
    loadData,
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleChange,
    resetForm,
    handleSubmitFailed,
    handleCallbackFunc,
  }

  return {
    ...hookState,
    ...hookMethod,
    BaseCrudFormService: {
      ...hookMethod,
    },
  }
}
