import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import DepartmentSelect from 'src/app/components/Dropdown/DepartmentSelect'
import DesignationSelect from 'src/app/components/Dropdown/DesignationSelect'
import UploadImage from 'src/app/components/Upload/UploadImage'

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

const MemberAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    imageList,
    setImageList,
    photoId,
  } = props

  return (
    <Fragment>
      <div className='form-page-content form-page-content-member pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='memberForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={'Photo'}>
                <UploadImage imageId={photoId} imageList={imageList} setImageList={setImageList} />
              </Form.Item>

              <Form.Item label={'Member Type'} name='member_type' rules={rules.required}>
                <Select placeholder={'-- Select --'}>
                  <Option key='member-type-staff' value='STAFF'>
                    Staff
                  </Option>
                  <Option key='member-type-student' value='STUDENT'>
                    Student
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item label={'Name'} name='name' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={'RFID Card Number'} name='rfid_card_number'>
                <Input placeholder='Scan or enter card number' />
              </Form.Item>

              <Form.Item label={'Phone'} name='phone'>
                <Input />
              </Form.Item>

              <Form.Item
                label={'Email'}
                name='email'
                rules={[
                  {type: 'email', message: 'Provide valid email'},
                  {max: 100, message: 'Maximum character is 100'},
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.member_type !== cur.member_type}>
                {({getFieldValue}) =>
                  getFieldValue('member_type') === 'STAFF' ? (
                    <>
                      <Form.Item label={'Department'} name='department_id' rules={rules.required}>
                        <DepartmentSelect
                          departmentId={formRef.getFieldValue('department_id')}
                          placeholder='Select Department'
                          onSelect={(value: any) => formRef.setFieldsValue({department_id: value})}
                          onLoad={(value: any) => formRef.setFieldsValue({department_id: value})}
                          onClear={() => formRef.setFieldsValue({department_id: null})}
                        />
                      </Form.Item>

                      <Form.Item label={'Designation'} name='designation_id'>
                        <DesignationSelect
                          designationId={formRef.getFieldValue('designation_id')}
                          placeholder='Select Designation'
                          onSelect={(value: any) => formRef.setFieldsValue({designation_id: value})}
                          onLoad={(value: any) => formRef.setFieldsValue({designation_id: value})}
                          onClear={() => formRef.setFieldsValue({designation_id: null})}
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <Form.Item label={'Class'} name='class_name' rules={rules.required}>
                        <Input />
                      </Form.Item>

                      <Form.Item label={'Section'} name='section'>
                        <Input />
                      </Form.Item>

                      <Form.Item label={'Roll No'} name='roll_no' rules={rules.required}>
                        <Input />
                      </Form.Item>
                    </>
                  )
                }
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
export default React.memo(MemberAddOrEditForm)
