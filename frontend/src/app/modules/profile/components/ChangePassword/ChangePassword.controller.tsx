import React, {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useForm} from 'src/app/hooks/useForm'
import {OauthApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import ChangePasswordView from './ChangePassword.view'
import {rules} from './ChangePassword.validate'

const ChangePasswordController: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    formRef,
    initialValues,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
  } = useForm({})

  const handleSubmit = (values: any): void => {
    setLoading(true)
    setIsSubmitting(true)
    const payload = {
      old_password: values.old_password,
      new_password: values.new_password,
      new_password_confirmation: values.new_password_confirmation,
    }

    OauthApi.changePassword(payload)
      .then((res) => {
        Message.success('Password change successfully.')
        setLoading(false)
        setIsSubmitting(false)
        navigate('/')
      })
      .catch((err) => {
        if (err?.status === 409) {
          setErrors(err.data)
        } else if (err?.status === 412) {
          setErrors(err.data)
        } else if (err?.status === 422) {
          Message.error(err.data)
        } else {
          Message.error('A network error occurred. Please try again later.')
        }
        setLoading(false)
        setIsSubmitting(false)
      })
  }

  return (
    <ChangePasswordView
      formRef={formRef}
      loading={loading}
      initialValues={initialValues}
      rules={rules}
      isSubmitting={isSubmitting}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleSubmitFailed={handleSubmitFailed}
    />
  )
}

export default ChangePasswordController
