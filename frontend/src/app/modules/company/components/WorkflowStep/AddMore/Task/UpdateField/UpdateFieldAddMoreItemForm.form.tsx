import React, {FC, Fragment, useState, useEffect} from 'react'
import {Col, Form, Input, Row, Select} from 'antd'
import {useTranslation} from 'react-i18next'

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

const AddOrEditForm: FC<any> = (props) => {
  const {t} = useTranslation()
  const {Option} = Select
  const {
    formRef,
    initialValues,
    itemData,
    workflowStepSetupData,
    workflowStepActionList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props

  const [fieldValueType, setFieldValueType] = useState('SELECT')
  const [fieldValueList, setFieldValueList] = useState<any[]>(
    workflowStepSetupData.TASK.FIELD_VALUE.options
  )

  useEffect(() => {
    if (itemData.field_name) {
      handleFilterFieldValueList(itemData.field_name)
    }
  }, [itemData.field_name])

  const handleOnChangeFieldName = (value: any) => {
    handleFieldValueType(value)
    handleFilterFieldValueList(value)
  }

  const handleFieldValueType = (value: any) => {
    const filterItem = workflowStepSetupData.TASK.FIELD_NAME.options.find(
      (item) => item.value == value
    )
    setFieldValueType(filterItem?.dependentFieldType)
  }

  const handleFilterFieldValueList = (value: any) => {
    const filterOperatorList = workflowStepSetupData.TASK.FIELD_VALUE.options.filter((item) => {
      if (item.filterValues.includes(value)) {
        return true
      } else if (item.filterValues.includes('ALL')) {
        return true
      }
    })
    setFieldValueList(filterOperatorList)
  }

  return (
    <Fragment>
      <div className='form-page-content form-page-content-update-field'>
        <Form
          {...formItemLayout}
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
            <Col span={24}>
              <Form.Item
                label={t('Action Name')}
                name='action_name'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('User Action')}
                name='action_code'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select placeholder={'-- Select --'} dropdownMatchSelectWidth={200}>
                  {workflowStepActionList?.map((item, index) => (
                    <Option key={`update-fields-action-name-${index}`} value={item.action_code}>
                      {item.action_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('Field Name')}
                name='field_name'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select
                  placeholder={'-- Select --'}
                  dropdownMatchSelectWidth={200}
                  onChange={(value) => handleOnChangeFieldName(value)}
                >
                  {workflowStepSetupData.TASK.FIELD_NAME.options.map((item, index) => (
                    <Option key={`update-fields-name-${index}`} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('Field Value')}
                name='field_value'
                rules={[{required: true, message: 'This field is required.'}]}
              >
                <Select placeholder={'-- Select --'} dropdownMatchSelectWidth={200}>
                  {fieldValueList.map((item, index) => (
                    <Option key={`update-field-value-${index}`} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(AddOrEditForm)
