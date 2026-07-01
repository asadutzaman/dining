import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select, InputNumber } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import UnitSelect from 'src/app/components/Dropdown/UnitSelect';
import { useLang } from 'src/app/hooks/useLang';

const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 16 },
    sm: { span: 16 },
  },
};

const AddOrEditForm: FC<any> = (props) => {
  const { Option } = Select;
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    itemData,
  } = props;
  const { t } = useLang();

  return (
    <Fragment>
      <div className="border border-gray rounded mt-3 p-5">
        <Form
          {...formItemLayout}
          layout="horizontal"
          form={formRef}
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Unit')} name="unit_id">
                <UnitSelect
                  unitId={formRef.getFieldValue('unit_id')}
                  placeholder={t('Select Unit')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ unit_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ unit_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('Conversion to Base Unit')}
                name="conversion_to_base"
              >
                <InputNumber
                  placeholder="10"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(AddOrEditForm);
