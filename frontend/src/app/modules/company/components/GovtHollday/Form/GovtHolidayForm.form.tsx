import React, { FC, Fragment } from 'react';
import type { DatePickerProps } from 'antd';
import { Form, Input, Row, Col, Select, DatePicker } from 'antd';
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

const GovtHolidayAddOrEditForm: FC<any> = (props) => {
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
          name="exampleForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Holiday Name')}
                name="name"
                rules={rules.required}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder={t('Enter Holiday Name')}
                />
              </Form.Item>

              <Form.Item label={t('Date')} name="date" rules={rules.required}>
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder={t('Select Date')}
                />
              </Form.Item>

              <Form.Item
                label={t('Holiday Type')}
                name="holiday_type"
                rules={rules.required}
              >
                <Select placeholder={t('Select')}>
                  <Option value="government_holiday">
                    {t('Government Holiday')}
                  </Option>
                  <Option value="weekend_holiday">
                    {t('Weekend Holiday')}
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
export default React.memo(GovtHolidayAddOrEditForm);
