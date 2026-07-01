import React, { FC } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  TimePicker,
  Checkbox,
} from 'antd';
// import type { CheckboxOptionType, GetProp } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import { useLang } from 'src/app/hooks/useLang';
import dayjs from 'dayjs';

interface Values {
  [fieldName: string]: any;
}

interface IProps {
  formRef: any;
  loading: boolean;
  initialValues: Values;
  isSubmitting: boolean;
  handleChange: (changedValues: any) => void;
  handleSubmit: (event: any) => void;
  handleSubmitFailed: (values: any) => void;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
};

const TimeSlotSettingsViewTab: FC<any> = (props) => {
  const {
    formRef,
    loading,
    initialValues,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props;
  const { t } = useLang();
  const startTime =
    formRef.getFieldValue('office_start_time') || dayjs('10:00', 'HH:mm');
  const endTime =
    formRef.getFieldValue('office_end_time') || dayjs('12:00', 'HH:mm');

  const weekendOptions = [
    { label: t('Saturday'), value: 'Saturday' },
    { label: t('Sunday'), value: 'Sunday' },
    { label: t('Monday'), value: 'Monday' },
    { label: t('Tuesday'), value: 'Tuesday' },
    { label: t('Wednesday'), value: 'Wednesday' },
    { label: t('Thursday'), value: 'Thursday' },
    { label: t('Friday'), value: 'Friday' },
  ];

  return (
    <div className="card">
      <div className="grid-form-content form-page-content-resource p-6">
        <Form
          {...formItemLayout}
          // labelAlign='left'
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
          <Divider orientation="left" orientationMargin="0">
            {t('Time Slot Settings')}
          </Divider>
          <Row gutter={24}>
            {loading === false && (
              <>
                <Col span={12}>
                  <Form.Item
                    label={t('Office Hours (in 24-hour format)')}
                    name="office_hours"
                    rules={rules.required}
                  >
                    <TimePicker.RangePicker
                      defaultValue={[startTime, endTime]}
                      format={'HH:mm'}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={t('Slot Duration (in minutes)')}
                    name="slot_duration"
                    rules={rules.required}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={t('Slot Capacity (Persons)')}
                    name="slot_capacity"
                    rules={rules.required}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Divider orientation="left" orientationMargin="0">
            {t('Weekend Days')}
          </Divider>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="weekends_days"
                rules={rules.required}
                wrapperCol={{ span: 24 }}
              >
                <Checkbox.Group
                  options={weekendOptions}
                  className="flex flex-row gap-2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-loading-button float-end"
                disabled={isSubmitting}
                loading={loading}
              >
                {t('Update Settings')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};
export default React.memo(TimeSlotSettingsViewTab);
