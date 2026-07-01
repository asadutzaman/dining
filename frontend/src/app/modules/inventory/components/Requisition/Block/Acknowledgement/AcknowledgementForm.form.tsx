import React, {FC, Fragment} from 'react'
import {Form, Row, Col, Select} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import {useLang} from 'src/app/hooks/useLang'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

const AcknowledgementForm: FC<any> = (props) => {
  const {Option} = Select
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed, itemData} = props
  const {t} = useLang()

  return (
    <Fragment>
      <div className='border border-gray rounded mt-3 p-5'>
        <Form
          {...formItemLayout}
          form={formRef}
          layout='vertical'
          name='archiveContentBulkAddForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Process Status')} name='process_status' rules={rules.required}>
                <Select placeholder={t('-- Select --')}>
                  <Option key={`process-status-yes`} value={1}>
                    {t('Yes')}
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
export default React.memo(AcknowledgementForm)
