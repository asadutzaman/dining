import React, {FC} from 'react'
import {Button, Col, Divider, Form, Input, Row} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import {useLang} from 'src/app/hooks/useLang'

interface Values {
  [fieldName: string]: any
}

interface IProps {
  formRef: any
  loading: boolean
  initialValues: Values
  isSubmitting: boolean
  handleChange: (changedValues: any) => void
  handleSubmit: (event: any) => void
  handleSubmitFailed: (values: any) => void
}

const formItemLayout = {
  labelCol: {
    xs: {span: 8},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 16},
    sm: {span: 16},
  },
}

const SmsSettingsViewTab: FC<any> = (props) => {
  const {
    formRef,
    loading,
    initialValues,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props
  const {t} = useLang()

  return (
    <div className='card'>
      <div className='grid-form-content form-page-content-resource p-6'>
        <Form
          {...formItemLayout}
          // labelAlign='left'
          layout='horizontal'
          form={formRef}
          name='resourceForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
          className='mx-auto'
        >
          <Row gutter={[16, 16]}>
            <Divider orientation='left' orientationMargin='0'>
              {t('SMS Settings')}
            </Divider>

            {loading == false && (
              <>
                <Col span={12}>
                  <Form.Item label={t('SMS API Key')} name='sms_api_key'>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label={t('SMS Secret Key')} name='sms_secret_key'>
                    <Input />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Button
                type='primary'
                htmlType='submit'
                className='submit-loading-button float-end'
                disabled={isSubmitting}
                loading={loading}
              >
                {t('Update Settings')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  )
}
export default React.memo(SmsSettingsViewTab)
