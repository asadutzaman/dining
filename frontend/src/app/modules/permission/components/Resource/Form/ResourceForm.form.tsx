import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { PermissionTypeList } from 'src/app/utils/enums/Permission.enum';
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

const ResourceForm: FC<any> = (props) => {
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
                label={t('Permission Type')}
                name="permission_type"
                rules={rules.required}
              >
                <Select placeholder={t('-- Select --')}>
                  {PermissionTypeList.map((item, index) => (
                    <Option key={index} value={item?.value}>
                      {t(item?.label)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {formRef.getFieldValue('permission_type') === 'RESOURCE' && (
                <Form.Item
                  label={t('Controller Name')}
                  name="controller_name"
                  extra={t('(Ex: AuthController, RoleController)')}
                >
                  <Input />
                </Form.Item>
              )}

              <Form.Item
                label={t('Display Resource Name')}
                name="display_name"
                rules={rules.required}
                extra={t('(Ex: Users, Roles, Groups)')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('Resource Name (ID)')}
                name="name"
                rules={rules.required}
                extra={t('(Ex: user, role, group)')}
              >
                <Input />
              </Form.Item>

              {formRef.getFieldValue === 'RESOURCE' && (
                <Form.Item
                  label={t('Resource URI')}
                  name="resource_uri"
                  extra={t('(Ex: user, role, group)')}
                >
                  <Input />
                </Form.Item>
              )}

              <Form.Item label={t('Status')} name="status">
                <Select placeholder={t('-- Select --')}>
                  <Option key={`status-active`} value={1}>
                    {t('Active')}
                  </Option>
                  <Option key={`status-inactive`} value={0}>
                    {t('In Active')}
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t('Sort Order')}
                name="sort_order"
                extra={t('(Ex: 1, 2, 3)')}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(ResourceForm);
