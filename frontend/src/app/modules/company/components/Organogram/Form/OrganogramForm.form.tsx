import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import OrganizationOrganogramDependentSelect from 'src/app/components/Dropdown/Dependent/OrganizationOrganogramDependentSelect';
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

const OrganogramForm: FC<any> = (props) => {
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
          <Row gutter={[16, 16]}>
            <OrganizationOrganogramDependentSelect
              formRef={formRef}
              organizationProps={{
                fieldLabel: t('Organization'),
                fieldName: 'organization_id',
                gridCol: { xs: 24, md: 12 },
              }}
              organogramProps={{
                fieldLabel: t('Parent Organogram'),
                fieldName: 'parent_id',
                gridCol: { xs: 24, md: 12 },
              }}
            />
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Name (in English)')}
                name="name_en"
                rules={rules.required}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('Short Name')}
                name="short_name"
                rules={rules.required}
              >
                <Input />
              </Form.Item>

              <Form.Item label={t('Email')} name="email">
                <Input type="email" />
              </Form.Item>

              <Form.Item label={t('Mobile Number')} name="mobile">
                <Input />
              </Form.Item>

              <Form.Item label={t('Telephone')} name="phone">
                <Input />
              </Form.Item>

              <Form.Item label={t('Address')} name="address">
                <TextArea />
              </Form.Item>

              <Form.Item label={t('Status')} name="status">
                <Select placeholder={'--' + t('Select') + '--'}>
                  <Option key={`status-active`} value={1}>
                    {t('Active')}
                  </Option>
                  <Option key={`status-inactive`} value={0}>
                    {t('In Active')}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(OrganogramForm);
