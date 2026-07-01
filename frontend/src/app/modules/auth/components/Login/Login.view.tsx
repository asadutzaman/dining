import {Form, Input} from 'antd'
import React, {FC} from 'react'
import {IProps} from './Login.types'

const LoginView: FC<IProps> = (props) => {
  const {
    formRef,
    rules,
    initialValues,
    loading,
    setLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props

  return (
    <Form
      className='form w-100'
      id='kt_login_signin_form'
      form={formRef}
      name='loginForm'
      layout='vertical'
      scrollToFirstError={true}
      initialValues={initialValues}
      onValuesChange={handleChange}
      onFinish={handleSubmit}
      onFinishFailed={handleSubmitFailed}
    >
      <div className='text-center mb-11'>
        <h1 className='text-dark fw-bolder mb-3'>Sign In</h1>
        <span className='text-gray-500 fw-semibold fs-6'>Starter</span>
      </div>

      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-dark'>Email</label>
        <Form.Item name='username' rules={rules.email}>
          <Input placeholder='Email' autoComplete='on' className={'form-control bg-transparent'} />
        </Form.Item>
      </div>

      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-dark fs-6 mb-0'>Password</label>
        <Form.Item name='password' rules={rules.password}>
          <Input type='password' autoComplete='on' className={'form-control bg-transparent'} />
        </Form.Item>
      </div>

      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={isSubmitting}
          // disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Login</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
    </Form>
  )
}

export default React.memo(LoginView)
