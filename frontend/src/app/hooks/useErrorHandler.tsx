import {useState} from 'react'
import {Message} from '../utils'
import {HttpStatusCodeEnum} from '../utils/enums'

export const useErrorHandler = () => {
  const [error, setError] = useState<any>(null)

  const handleErrorMessage = (err: any, setErrors?: any, options?: any) => {
    console.error('error', err)

    const errorStatus = err.status
    const errorMsg = err.data
    setError(err)

    if (!errorStatus) {
      Message.error('A network error occurred. Please try again later.')
    } else if (errorStatus === HttpStatusCodeEnum.UNAUTHORIZED_401) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.PAYMENT_REQUIRED_402) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.FORBIDDEN_403) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.NOT_FOUND_404) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.METHOD_NOT_ALLOWED_405) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.CONFLICT_409 && setErrors) {
      setErrors(err.data.error)
    } else if (errorStatus === HttpStatusCodeEnum.PRECONDITION_FAILED_412 && setErrors) {
      setErrors(err.data.error)
    } else if (errorStatus === HttpStatusCodeEnum.UNPROCESSABLE_ENTITY_422) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.TOO_MANY_REQUESTS_429) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.INTERNAL_SERVER_ERROR_500) {
      Message.error(errorMsg)
    } else if (errorStatus === HttpStatusCodeEnum.NOT_IMPLEMENTED_501) {
      Message.error(errorMsg)
    } else {
      Message.error('Something went wrong. Please try again.')
    }
  }

  const handleSuccessMessage = (res: any) => {
    const successMsg = res.data?.data?.message
    if (successMsg) {
      Message.success(successMsg)
    } else {
      Message.success('The operation performed successfully.')
    }
  }

  const showSuccessMessage = (message: any) => {
    Message.success(message)
  }

  const showErrorMessage = (message: any) => {
    Message.error(message)
  }

  return {error, handleErrorMessage, handleSuccessMessage, showErrorMessage, showSuccessMessage}
}
