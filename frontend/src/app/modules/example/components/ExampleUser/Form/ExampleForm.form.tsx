import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'

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

const ExampleAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed} = props
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
              <Form.Item label={'Title'} name='title' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={'Description'} name='description'>
                <TextArea autoSize={{minRows: 3, maxRows: 5}} />
              </Form.Item>

              <Form.Item label='Status' name='status'>
                <Select placeholder={'--' + 'Select' + '--'}>
                  <Option key={`status-active`} value={1}>
                    Active
                  </Option>
                  <Option key={`status-inactive`} value={0}>
                    InActive
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ExampleAddOrEditForm)
