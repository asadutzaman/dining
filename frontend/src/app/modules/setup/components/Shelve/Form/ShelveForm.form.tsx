import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import BranchSelect from 'src/app/components/Dropdown/BranchSelect';
import { useLang } from 'src/app/hooks/useLang';

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

const ShelveForm: FC<any> = (props) => {
  const { Option } = Select;
  const { TextArea } = Input;
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props;
  const { t } = useLang();

  return (
    <Fragment>
      <div className="grid-form-content form-page-content-resource pe-3">
        <Form
          {...formItemLayout}
          layout="vertical"
          form={formRef}
          name="resourceForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Warehouse')}
                name="branch_id"
                rules={rules.required}
              >
                <BranchSelect
                  branchId={formRef.getFieldValue('branch_id')}
                  placeholder={t('Select Warehouse')}
                  branchType='Warehouse'
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ branch_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ branch_id: value });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Name')} name="name" rules={rules.required}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(ShelveForm);
