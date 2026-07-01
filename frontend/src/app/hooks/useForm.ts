import {useState, useEffect} from 'react'
import {Form} from 'antd'

export const useForm = (initialState = {}) => {
  const initialValues = initialState
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState<any>({})
  const [formRef] = Form.useForm()

  useEffect(() => {
    if (typeof initialValues === 'object') {
      setFormValues(initialValues)
    }
  }, [])

  useEffect(() => {
    let errorArray: any = []
    if (Object.keys(errors).length) {
      for (const errorKey of Object.keys(errors)) {
        let errorObj = {
          name: errorKey,
          errors: [errors[errorKey]],
        }
        errorArray.push(errorObj)
      }
      formRef.setFields(errorArray)
    }
  }, [errors])

  const handleChange = (changedValues: any, allValues?: any) => {
    if (typeof changedValues === 'object') {
      if (allValues) {
        setFormValues({
          ...allValues,
          ...changedValues,
        })
      } else {
        setFormValues({
          ...formValues,
          ...changedValues,
        })
      }
    }
  }

  // const handleSubmitFailed = (values: any): void => {
  // 	// console.log(values);
  // 	setIsSubmitting(false);
  // }

  const handleSubmitFailed = (error: any): void => {
    if (error?.data) {
      setErrors(error.data)
    }
    setIsSubmitting(false)
  }

  const setFormFieldsValue = (values: any) => {
    if (typeof values === 'object') {
      setFormValues({
        ...formValues,
        ...values,
      })
      formRef.setFieldsValue(values)
    } else {
      setFormValues({
        ...formValues,
        ...values,
      })
    }
  }

  const resetForm = () => {
    formRef.resetFields()
  }

  return {
    formRef,
    initialValues,
    formValues,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    setFormFieldsValue,
    resetForm,
    handleChange,
    handleSubmitFailed,
  }
}
