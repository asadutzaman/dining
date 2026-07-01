import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select, Divider} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import GroupMemberAddMore from '../AddMore/GroupMember.addMore'
import {useLang} from 'src/app/hooks/useLang'
import {WorkflowList} from 'src/app/modules/company/components/Workflow/data/WorkflowList.data'

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

const ApproverGroupAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    groupMemberAddMoreList,
    setGroupMemberAddMoreList,
  } = props
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
            </Col>

            <Col span={24}>
              <Form.Item label={t('Approver Group Name')} name='name' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={t('Description')} name='description'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation='left' orientationMargin='0'>
            {t('Group Members')}
          </Divider>
          <Row gutter={[16, 16]}>
            <Col sm={24} xs={24}>
              <GroupMemberAddMore
                addMoreItemList={groupMemberAddMoreList}
                setAddMoreItemList={setGroupMemberAddMoreList}
              />
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ApproverGroupAddOrEditForm)
