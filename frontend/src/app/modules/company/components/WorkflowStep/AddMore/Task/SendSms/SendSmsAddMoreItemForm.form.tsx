import OpenModal from 'src/app/components/Modal/OpenModal'
// import WorkflowStepRecipientAddMore from "@/modules/Workflow/components/WorkflowStep/AddMore/Recipient/WorkflowStepRecipient.addMore";
import {Col, Form, Input, Row, Select} from 'antd'
import React, {FC, Fragment} from 'react'
import {useTranslation} from 'react-i18next'
import Placeholders from '../Placeholder/Placeholders'

const AddOrEditForm: FC<any> = (props) => {
  const {TextArea} = Input
  const {Option} = Select
  const {t} = useTranslation()
  const {
    formRef,
    initialValues,
    itemData,
    recipientList,
    setRecipientList,
    workflowStepSetupData,
    workflowStepActionList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props
  return (
    <Fragment>
      <div className='form-page-content form-page-content-papersToBeAttached'>
        <Form
          layout='vertical'
          form={formRef}
          name='sendSmsItemForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row>
            <Col xs={24} md={24}>
              <Form.Item
                label={t('Task Name')}
                name='task_name'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item
                label={t('User Action')}
                name='action_code'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select placeholder={'-- Select --'} dropdownMatchSelectWidth={200}>
                  {workflowStepActionList?.map((item, index) => (
                    <Option key={`update-fields-action-name-${index}`} value={item.action_code}>
                      {item.action_alias_text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {/* <Col xs={24} md={24}>
              <WorkflowStepRecipientAddMore
                itemData={itemData}
                workflowStepSetupData={workflowStepSetupData}
                addMoreItemList={recipientList}
                setAddMoreItemList={setRecipientList}
              />
            </Col> */}
            <Col xs={24} md={24}>
              <Form.Item label={t('Subject')} name='subject'>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <OpenModal
                modalTitle={t('Content Placeholders')}
                btnType='default'
                btnSize='small'
                btnText={t('Content Placeholders')}
                component={<Placeholders />}
              />

              <Form.Item
                label={t('Text Message')}
                name='message'
                rules={[{required: true, message: 'This field is required.'}]}
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

export default React.memo(AddOrEditForm)
