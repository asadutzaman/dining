import {useLang} from 'src/app/hooks/useLang'
import {Col, Form, Input, Row, Select} from 'antd'
import React, {FC, Fragment} from 'react'
import UserActionRuleAddMore from '../Rule/UserActionRule.addMore'

const AddOrEditForm: FC<any> = (props) => {
  const {t} = useLang()
  const {Option} = Select
  const {
    formRef,
    initialValues,
    workflowStepSetupData,
    workflowStepActionRuleList,
    setWorkflowStepActionRuleList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props

  return (
    <Fragment>
      <div className='form-page-content form-page-content-update-field'>
        <Form
          layout='vertical'
          form={formRef}
          name='updateFieldItemForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label={t('Action Name')}
                name='action_name'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select placeholder={t('-- Select --')} dropdownMatchSelectWidth={200}>
                  {workflowStepSetupData.ACTIONS.USER_ACTION.options.map((item, index) => (
                    <Option key={`action-name-${index}`} value={item.value}>
                      {t(item.label)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Mandatory Comment')}
                name='is_comment_mandatory'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select placeholder={t('-- Select --')} dropdownMatchSelectWidth={200}>
                  <Option value={true}>{t('Yes')}</Option>
                  <Option value={false}>{t('No')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Sort Order')} name='sort_order'>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{paddingTop: 20}}>
            <Col span={24}>
              <h2>{t('This Action Button will be available based on below rules')}</h2>
              <div className={'condition-add-more-content'}>
                <UserActionRuleAddMore
                  workflowStepSetupData={workflowStepSetupData}
                  workflowStepActionRuleList={workflowStepActionRuleList}
                  setWorkflowStepActionRuleList={setWorkflowStepActionRuleList}
                />
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(AddOrEditForm)
