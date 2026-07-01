import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
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

const WorkflowAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {t} = useLang()
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed, WorkflowList} =
    props
  return (
    <Fragment>
      <div className='form-page-content form-page-content-example pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='departmentForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Workflow Name')} name='workflow_code' rules={rules.required}>
                <Select
                  showSearch
                  allowClear
                  placeholder={t('Select')}
                  onChange={(value: any, option: any) => {}}
                >
                  {WorkflowList.map((item, index) => (
                    <Option
                      key={`workflow-identifier-${index}`}
                      value={item.workflow_code}
                      dataItem={item}
                    >
                      {item.workflow_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={t('Status')} name='status'>
                <Select placeholder={t('Select')}>
                  <Option key={`status-active`} value={1}>
                    {t('Active')}
                  </Option>
                  <Option key={`status-inactive`} value={0}>
                    {t('In Active')}
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
export default React.memo(WorkflowAddOrEditForm)
