import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select, InputNumber } from 'antd';
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

const OrganizationForm: FC<any> = (props) => {
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
            <Col span={12} sm={12} xs={24}>
              <Form.Item
                label={t('Name (in English)')}
                name="name_en"
                rules={rules.required}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item
                label={t('Short Name')}
                name="short_name"
                rules={rules.required}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item label={t('Email')} name="email">
                <Input type="email" />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item label={t('Mobile Number')} name="mobile">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item label={t('Telephone')} name="telephone">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item label={t('Description')} name="description">
                <TextArea />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
              <Form.Item label={t('User Limit')} name="user_limit">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12} sm={12} xs={24}>
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

            {/*<Col span={24}>
                             <Form.Item
                            label={t("Parent Node")}
                            name="parent_id"
                        >
                            <Select
                                placeholder={t("-- Select --")}
                                showSearch
                                allowClear
                                popupMatchSelectWidth={200}
                                loading={loadingOrganizationList}
                                optionFilterProp="children"
                                filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
                            >
                                {activeOrganizationList.map((item, index) => (
                                    <Option key={`parent-id-${index}`} value={item.id}>
                                        {lang === "en" ? item.name_en : item.name_bn}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item> 
                        </Col>*/}
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(OrganizationForm);
