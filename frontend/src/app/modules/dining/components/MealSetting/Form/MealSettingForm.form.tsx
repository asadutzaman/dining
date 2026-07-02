import React, {FC, Fragment} from 'react'
import {Form, InputNumber, Row, Col, Select, DatePicker} from 'antd'
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

const MealSettingAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed} = props
  return (
    <Fragment>
      <div className='form-page-content form-page-content-meal-setting pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='mealSettingForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={'Meal Type'} name='meal_type' rules={rules.required}>
                <Select placeholder={'-- Select --'}>
                  <Option key='meal-type-breakfast' value='BREAKFAST'>
                    Breakfast
                  </Option>
                  <Option key='meal-type-lunch' value='LUNCH'>
                    Lunch
                  </Option>
                  <Option key='meal-type-dinner' value='DINNER'>
                    Dinner
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item label={'Cost'} name='cost' rules={rules.required}>
                <InputNumber style={{width: '100%'}} min={0} step={0.01} precision={2} />
              </Form.Item>

              <Form.Item label={'Effective From'} name='effective_from' rules={rules.required}>
                <DatePicker style={{width: '100%'}} placeholder='Select Date' />
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
export default React.memo(MealSettingAddOrEditForm)
