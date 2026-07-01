import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col} from 'antd'
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

const ApproveActionForm: FC<any> = (props) => {
  const {t} = useLang()
  const {TextArea} = Input
  const {
    formRef,
    confirmText,
    initialValues,
    workflowActionInfo,
    fileList,
    setFileList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props

  return (
    <Fragment>
      <div className='border border-gray rounded mt-3 p-5'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='workflowTransitionForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <div className='form-item-row'>
                <h3>{confirmText}</h3>
              </div>

              <Form.Item
                label={t('Write Comment:')}
                name='comment'
                rules={workflowActionInfo.is_comment_mandatory ? rules.required : rules.notRequired}
              >
                <TextArea autoSize={{minRows: 3, maxRows: 5}} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ApproveActionForm)
