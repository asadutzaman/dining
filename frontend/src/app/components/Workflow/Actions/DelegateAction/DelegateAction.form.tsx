import React, {FC, Fragment, useEffect, useState} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import {ArrayUtils} from 'src/app/utils'
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

const DelegateActionForm: FC<any> = (props) => {
  const {t} = useLang()
  const {TextArea} = Input
  const {Option} = Select
  const {
    formRef,
    confirmText,
    initialValues,
    workflowActionInfo,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    workflowNextStepApproverList,
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

              <Form.Item label='Assign To' name='assignees'>
                <Select
                  showSearch
                  allowClear
                  mode={'multiple'}
                  placeholder={'-- Select --'}
                  // dropdownMatchSelectWidth={100}
                  defaultValue={[]}
                  optionFilterProp='children'
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {workflowNextStepApproverList?.map((approverItem, approverIndex) => (
                    <Option key={`approver-${approverIndex}`} value={approverItem.user_id}>
                      {`${approverItem.approver_group_member_name} [${approverItem.designation_name}]`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

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
export default React.memo(DelegateActionForm)
