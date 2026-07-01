import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
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

const ItemCategoryAddOrEditForm: FC<any> = (props) => {
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
      <div className="form-page-content form-page-content-example pe-3">
        <Form
          {...formItemLayout}
          layout="vertical"
          form={formRef}
          name="itemCategoryForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Item Category Name')}
                name="name"
                rules={rules.required}
              >
                <Input />
              </Form.Item>

              <Form.Item label={t('Description')} name="description">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(ItemCategoryAddOrEditForm);
