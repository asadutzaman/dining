import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import {useLang} from 'src/app/hooks/useLang'

const formItemLayout = {
  labelCol: {
    xs: {span: 6},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

const SupplierAddOrEditForm: FC<any> = (props) => {
  const {TextArea} = Input
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed} = props
  const {t} = useLang()
  return (
    <Fragment>
      <div className='form-page-content form-page-content-example pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='exampleForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Supplier Name')} name='supplier_name' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={t('Phone Number')} name='phone' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={t('Email Address')} name='email'>
                <Input />
              </Form.Item>

              <Form.Item label={t('Address')} name='address'>
                <TextArea />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(SupplierAddOrEditForm)
