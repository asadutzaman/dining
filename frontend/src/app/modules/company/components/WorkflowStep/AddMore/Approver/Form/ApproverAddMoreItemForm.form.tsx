import React, {FC, Fragment, useContext, useEffect, useState} from 'react'
import {Col, Form, Input, Row, Select, Checkbox} from 'antd'
import {useLang} from 'src/app/hooks/useLang'
import {AuthContext} from 'src/app/context/auth/auth.context'
import ApproverGroupSelect from 'src/app/components/Dropdown/ApproverGroupSelect'
import ApproverGroupMemberSelect from 'src/app/components/Dropdown/ApproverGroupMemberSelect'
import {rules} from 'src/app/components/Validation/Form.validate'
import {DesignationSelect} from 'src/app/components/Dropdown'

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
  const {Option} = Select
  const {t} = useLang()
  const {
    formRef,
    initialValues,
    itemData,
    workflowStepSetupData,
    handleOnChangeApprover,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props

  const [approverFieldType, setApproverFieldType] = useState('SELECT')
  const [approverGroup, setApproverGroup] = useState('')
  const [approverTypeList, setApproverTypeList] = useState<any[]>(
    workflowStepSetupData.APPROVERS.APPROVER_TYPE.options
  )
  const [approverList, setApproverList] = useState<any[]>([])
  const [value, setValue] = useState<string>()

  useEffect(() => {
    if (itemData.approver_group) {
      handleOnChangeUserGroup(itemData.approver_group)
    }
  }, [itemData.approver_group])

  const handleOnChangeUserGroup = (value: any) => {
    setApproverGroup(value)
    handleApproverFieldType(value)
    handleFilterApproverTypeList(value)
  }

  const handleFilterApproverTypeList = (value: any) => {
    const filterApproverTypeList = workflowStepSetupData.APPROVERS.APPROVER_TYPE.options.filter(
      (item) => {
        if (item.filterValues.includes(value)) {
          return true
        } else if (item.filterValues.includes('ALL')) {
          return true
        }
      }
    )
    setApproverTypeList(filterApproverTypeList)
  }

  const handleApproverFieldType = (value: any) => {
    const filterItem = workflowStepSetupData.APPROVERS.APPROVER_GROUP.options.find(
      (item) => item.value == value
    )
    const fieldType = filterItem?.dependentFieldType
    setApproverFieldType(fieldType)
    handleFilterApproverList(fieldType, value)
  }

  const handleFilterApproverList = (fieldType: any, value: any) => {
    if (fieldType === 'SELECT') {
      const filterApproverTypeField = workflowStepSetupData.APPROVERS.APPROVER.find((item) =>
        item.filterValues.includes(value)
      )
      const filterApproverTypeList = filterApproverTypeField.options.filter((item) => {
        if (item.filterValues.includes(value)) {
          return true
        } else if (item.filterValues.includes('ALL')) {
          return true
        }
      })
      setApproverList(filterApproverTypeList)
    }
  }

  const onChange = (newValue: string) => {
    setValue(newValue)
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
            <Col span={12}>
              <Form.Item label={t('Approver Mode')} name='approver_mode' rules={rules.required}>
                <Select placeholder={t('-- Select --')}>
                  {workflowStepSetupData.APPROVERS.APPROVER_MODE.options.map((item, index) => (
                    <Option key={`approver-mode-${index}`} value={item.value}>
                      {t(item.label)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={t('Approver Type')} name='approver_type' rules={rules.required}>
                <Select placeholder={t('-- Select --')}>
                  {approverTypeList.map((item, index) => (
                    <Option key={`approver-type-${index}`} value={item.value}>
                      {t(item.label)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {formRef.getFieldValue('approver_mode') === 'USER' && (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={t('Approver Group')}
                  name='approver_group_id'
                  rules={rules.required}
                >
                  <ApproverGroupSelect
                    approverGroupId={formRef.getFieldValue('approver_group_id')}
                    placeholder={t('Select Approver Group')}
                    allowClear={true}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({approver_group_id: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({approver_group_id: value})
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={t('Approvers')}
                  name='approver_group_member_id'
                  rules={rules.required}
                >
                  <ApproverGroupMemberSelect
                    approverGroupId={formRef.getFieldValue('approver_group_id')}
                    approverGroupMemberId={formRef.getFieldValue('approver_group_member_id')}
                    placeholder={t('Select Member')}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({approver_group_member_id: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({approver_group_member_id: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {formRef.getFieldValue('approver_mode') === 'DESIGNATION' && (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={t('Approver Designation')}
                  name='designation_id'
                  rules={rules.required}
                >
                  <DesignationSelect
                    designationId={formRef.getFieldValue('designation_id')}
                    placeholder={t('Select Designation')}
                    allowClear={true}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({designation_id: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({designation_id: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label={t('Sequence')} name='sort_order'>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={[16, 16]}>
            <Col xs={24} md={24}>
              <h3>Step Settings</h3>
              <Form.Item name='multi_step_forward' valuePropName='checked' noStyle>
                <Checkbox>{t('Allow approver to forward multiple step')}</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item name='multi_step_send_back' valuePropName='checked' noStyle>
                <Checkbox>{t('Allow approver to send back multiple step')}</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <h3>Approver Settings</h3>
              <Form.Item name='show_user_in_approver_group' valuePropName='checked' noStyle>
                <Checkbox>{t('Show user in approver group')}</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <Form.Item name='only_show_user_in_approver_group' valuePropName='checked' noStyle>
                <Checkbox>{t('Only show User in approver group')}</Checkbox>
              </Form.Item>
            </Col>
          </Row> */}
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(AddOrEditForm)
