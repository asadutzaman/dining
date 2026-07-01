import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import AttributeAttributeValueDependentSelect from 'src/app/components/Dropdown/Dependent/AttributeAttributeValueDependentSelect'
import {useLang} from 'src/app/hooks/useLang'

const formItemLayout = {
  labelCol: {
    xs: {span: 6},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 18},
    sm: {span: 18},
  },
}

const AddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed, itemData} = props
  const {t} = useLang()

  return (
    <Fragment>
      <div className='border border-gray rounded mt-3 p-5'>
        <Form
          {...formItemLayout}
          layout='horizontal'
          form={formRef}
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <AttributeAttributeValueDependentSelect
                formRef={formRef}
                attributeProps={{
                  fieldLabel: t('Attribute'),
                  fieldName: 'attribute_id',
                  gridCol: {xs: 24, md: 24},
                }}
                attributeValueProps={{
                  fieldLabel: t('Value'),
                  fieldName: 'attribute_value_id',
                  gridCol: {xs: 24, md: 24},
                }}
              />
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(AddOrEditForm)
