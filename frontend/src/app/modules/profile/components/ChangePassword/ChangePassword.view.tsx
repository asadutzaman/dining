import React, { FC } from 'react';
import { Button, Col, Divider, Form, Input, Row } from 'antd';
import { useLang } from 'src/app/hooks/useLang';

interface Values {
  [fieldName: string]: any;
}

interface IProps {
  formRef: any;
  loading: boolean;
  initialValues: Values;
  rules: any;
  isSubmitting: boolean;
  handleChange: (changedValues: any) => void;
  handleSubmit: (event: any) => void;
  handleSubmitFailed: (values: any) => void;
}

const ChangePasswordView: FC<IProps> = (props) => {
  const {
    formRef,
    loading,
    rules,
    initialValues,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props;
  const { t } = useLang();

  return (
    <div className="card">
      <div className="card card-header p-6">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            {t('Change Password')}
          </span>
        </h3>
      </div>

      <div className="grid-form-content form-page-content-resource p-6">
        <Form
          // {...formItemLayout}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          style={{ maxWidth: '70%' }}
          layout="horizontal"
          form={formRef}
          name="resourceForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
          className="mx-auto"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={t('Old Password')}
                name="old_password"
                rules={rules.old_password}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('New Password')}
                name="new_password"
                rules={rules.new_password}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('Confirm New Password')}
                name="new_password_confirmation"
                rules={[
                  {
                    required: true,
                    message: t('Please confirm your new password'),
                  },
                  { min: 6, message: t('Please confirm your new password') },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          t('The password confirmation does not match')
                        );
                      }
                    },
                  }),
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-loading-button float-end"
                disabled={isSubmitting}
                loading={loading}
              >
                {t('Change Password')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default ChangePasswordView;
