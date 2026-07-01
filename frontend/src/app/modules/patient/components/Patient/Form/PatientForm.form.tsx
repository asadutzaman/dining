import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select, Tabs, Switch, DatePicker} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'

const formItemLayout = {
  labelCol: {xs: {span: 12}, sm: {span: 12}},
  wrapperCol: {xs: {span: 24}, sm: {span: 24}},
}

const PatientAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed} = props

  const personalTab = (
    <Row gutter={[16, 0]}>
      <Col span={4}>
        <Form.Item label='Title' name='title'>
          <Select placeholder='-- Select --' allowClear>
            <Option value='Mr'>Mr</Option>
            <Option value='Mrs'>Mrs</Option>
            <Option value='Ms'>Ms</Option>
            <Option value='Dr'>Dr</Option>
            <Option value='Prof'>Prof</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item label='First Name' name='first_name' rules={rules.requiredMaxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item label='Middle Name' name='middle_name' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Last Name' name='last_name' rules={rules.requiredMaxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Date of Birth' name='date_of_birth' rules={rules.required}>
          <Input type='date' />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Gender' name='gender' rules={rules.required}>
          <Select placeholder='-- Select --'>
            <Option value='male'>Male</Option>
            <Option value='female'>Female</Option>
            <Option value='other'>Other</Option>
            <Option value='unknown'>Unknown</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Blood Group' name='blood_group'>
          <Select placeholder='-- Select --' allowClear>
            <Option value='A+'>A+</Option>
            <Option value='A-'>A-</Option>
            <Option value='B+'>B+</Option>
            <Option value='B-'>B-</Option>
            <Option value='AB+'>AB+</Option>
            <Option value='AB-'>AB-</Option>
            <Option value='O+'>O+</Option>
            <Option value='O-'>O-</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Marital Status' name='marital_status'>
          <Select placeholder='-- Select --' allowClear>
            <Option value='single'>Single</Option>
            <Option value='married'>Married</Option>
            <Option value='divorced'>Divorced</Option>
            <Option value='widowed'>Widowed</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Religion' name='religion'>
          <Select placeholder='-- Select --' allowClear>
            <Option value='hindu'>Hindu</Option>
            <Option value='muslim'>Muslim</Option>
            <Option value='christian'>Christian</Option>
            <Option value='sikh'>Sikh</Option>
            <Option value='buddhist'>Buddhist</Option>
            <Option value='jain'>Jain</Option>
            <Option value='other'>Other</Option>
            <Option value='none'>None</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Nationality' name='nationality' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Occupation' name='occupation' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
    </Row>
  )

  const contactTab = (
    <Row gutter={[16, 0]}>
      <Col span={8}>
        <Form.Item label='Primary Phone' name='primary_phone' rules={rules.required}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Secondary Phone' name='secondary_phone'>
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Email' name='email' rules={[{type: 'email' as const, message: 'Provide valid email'}, {max: 100, message: 'Maximum character is 100'}]}>
          <Input type='email' />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Emergency Contact Name' name='emergency_contact_name' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Emergency Contact Phone' name='emergency_contact_phone'>
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Emergency Contact Relation' name='emergency_contact_relation' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
    </Row>
  )

  const addressTab = (
    <Row gutter={[16, 0]}>
      <Col span={24}>
        <h6 className='text-muted mb-3'>Current Address</h6>
      </Col>
      <Col span={24}>
        <Form.Item label='Address' name='current_address'>
          <TextArea autoSize={{minRows: 2, maxRows: 3}} />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='City' name='current_city' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='State' name='current_state' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='Country' name='current_country' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='Pincode' name='current_pincode' rules={rules.maxCharacter25}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={24}>
        <h6 className='text-muted mb-3 mt-3'>Permanent Address</h6>
      </Col>
      <Col span={24}>
        <Form.Item label='Address' name='permanent_address'>
          <TextArea autoSize={{minRows: 2, maxRows: 3}} />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='City' name='permanent_city' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='State' name='permanent_state' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='Country' name='permanent_country' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label='Pincode' name='permanent_pincode' rules={rules.maxCharacter25}>
          <Input />
        </Form.Item>
      </Col>
    </Row>
  )

  const medicalTab = (
    <Row gutter={[16, 0]}>
      <Col span={12}>
        <Form.Item label='Known Allergies' name='known_allergies'>
          <TextArea autoSize={{minRows: 3, maxRows: 5}} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Chronic Diseases' name='chronic_diseases'>
          <TextArea autoSize={{minRows: 3, maxRows: 5}} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Current Medications' name='current_medications'>
          <TextArea autoSize={{minRows: 3, maxRows: 5}} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Surgical History' name='surgical_history'>
          <TextArea autoSize={{minRows: 3, maxRows: 5}} />
        </Form.Item>
      </Col>
    </Row>
  )

  const insuranceTab = (
    <Row gutter={[16, 0]}>
      <Col span={12}>
        <Form.Item label='Insurance Provider' name='insurance_provider' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Policy Number' name='insurance_policy_number' rules={rules.maxCharacter100}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Valid From' name='insurance_valid_from'>
          <Input type='date' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label='Valid To' name='insurance_valid_to'>
          <Input type='date' />
        </Form.Item>
      </Col>
    </Row>
  )

  const flagsTab = (
    <Row gutter={[16, 0]}>
      <Col span={8}>
        <Form.Item label='Sensitive Patient' name='is_sensitive' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='VIP Patient' name='is_vip' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Consent Signed' name='consent_signed' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label='Special Notes' name='special_notes'>
          <TextArea autoSize={{minRows: 3, maxRows: 6}} />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item label='Status' name='status'>
          <Select placeholder='-- Select --'>
            <Option value={1}>Active</Option>
            <Option value={0}>Inactive</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  )

  const tabItems = [
    {key: 'personal', label: 'Personal', children: personalTab},
    {key: 'contact', label: 'Contact', children: contactTab},
    {key: 'address', label: 'Address', children: addressTab},
    {key: 'medical', label: 'Medical', children: medicalTab},
    {key: 'insurance', label: 'Insurance', children: insuranceTab},
    {key: 'flags', label: 'Flags', children: flagsTab},
  ]

  return (
    <Fragment>
      <div className='form-page-content form-page-content-patient pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='patientForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Tabs items={tabItems} />
        </Form>
      </div>
    </Fragment>
  )
}

export default React.memo(PatientAddOrEditForm)
