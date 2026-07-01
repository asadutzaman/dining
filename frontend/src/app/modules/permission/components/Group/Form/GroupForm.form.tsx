import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
import {PermissionTypeList} from 'src/app/utils/enums/Permission.enum'
import {rules} from 'src/app/components/Validation/Form.validate'
import {useRoleList} from 'src/app/hooks/lists/useRoleList'

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

const GroupForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed} = props

  const {loadingRoleList, activeRoleList} = useRoleList()

  return (
    <Fragment>
      <div className='grid-form-content form-page-content-resource pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='resourceForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label='Name' name='name' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label='Code' name='code' rules={rules.required}>
                <Input />
              </Form.Item>

              <Form.Item label={'Role'} name='role_ids'>
                <Select
                  showSearch
                  allowClear
                  mode='multiple'
                  placeholder={'-- Select --'}
                  loading={loadingRoleList}
                  optionFilterProp='children'
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {activeRoleList.map((item: any, index: any) => (
                    <Option key={`user-role-${index}`} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label='Description' name='description' rules={rules.required}>
                <Input />
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
export default React.memo(GroupForm)
