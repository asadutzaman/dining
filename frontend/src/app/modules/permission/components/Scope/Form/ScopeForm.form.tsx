import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { HttpMethodList } from 'src/app/utils/enums/Permission.enum';
import { rules } from 'src/app/components/Validation/Form.validate';
import { useResourceList } from 'src/app/hooks/lists/useResourceList';
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

const ScopeForm: FC<any> = (props) => {
  const { Option } = Select;
  const { TextArea } = Input;
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props;
  // USED HOOKS
  const { resourceList, loadingResourceList } = useResourceList();
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
                label={t('Resource')}
                name="resource_id"
                rules={rules.required}
              >
                <Select
                  placeholder={t('-- Select --')}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={200}
                  loading={loadingResourceList}
                  filterOption={(input, option: any) =>
                    option?.children
                      ?.toLowerCase()
                      ?.indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {resourceList &&
                    resourceList.map((item: any, index: any) => (
                      <Option key={index} value={item.id}>
                        {t(item.display_name)}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item label={t('HTTP Method')} name="http_method">
                <Select allowClear placeholder={t('-- Select --')}>
                  {HttpMethodList &&
                    HttpMethodList.map((item, index) => (
                      <Option key={index} value={item.value}>
                        {t(item.label)}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={t('Display Scope Name')}
                name="display_name"
                rules={rules.required}
                extra={t('(Ex: Update, Delete, Change Password)')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('Controller Action Name')}
                name="action_name"
                extra={t('(Ex: update, changePassword, verifyUserEmail)')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('Scope Key')}
                name="scope"
                rules={rules.required}
                extra={t(
                  '(Format: microservice_prefix : resourceURI : EndpointURI) - (Ex: group:update, chat:chatList)'
                )}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('Endpoint URI')}
                name="uri"
                extra={t('(Ex: /group, /group/*, /oauth/reset-password)')}
              >
                <Input />
              </Form.Item>

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
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(ScopeForm);
