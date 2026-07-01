import React from 'react';
import { Col, Form } from 'antd';
import { SelectProps } from 'antd/lib/select';
import AttributeSelect from '../AttributeSelect';
import AttributeValueSelect from '../AttributeValueSelect';
import { useLang } from 'src/app/hooks/useLang';

interface DependentProps {
  fieldName: any;
  fieldLabel: any;
  rules?: any;
  gridCol: any;
}

interface Props extends SelectProps {
  formRef: any;
  attributeProps: DependentProps;
  attributeValueProps: DependentProps;
}

const AttributeAttributeValueDependentSelect: React.FC<Props> = (props) => {
  const { formRef } = props;
  const { t } = useLang();

  const {
    fieldLabel: attributeLabel = 'Attribute',
    fieldName: attributeName = 'attribute_id',
    rules: attributeRules = null,
    gridCol: attributeGridCol = { xs: 24, md: 12 },
  } = props.attributeProps || {};

  const {
    fieldLabel: attributeValueLabel = 'Attribute Value',
    fieldName: attributeValueName = 'attribute_value_id',
    rules: attributeValueRules = null,
    gridCol: attributeValueGridCol = { xs: 24, md: 12 },
  } = props.attributeValueProps || {};

  return (
    <>
      <Col {...attributeGridCol}>
        <Form.Item
          label={attributeLabel}
          name={attributeName}
          rules={attributeRules}
        >
          <AttributeSelect
            attributeId={formRef.getFieldValue(attributeName)}
            placeholder={t('Select Attribute')}
            onSelect={(value, option) => {
              formRef.setFieldsValue({ [attributeValueName]: null });
            }}
            onLoad={(value) => {
              formRef.setFieldsValue({ [attributeName]: value });
            }}
          />
        </Form.Item>
      </Col>
      <Col {...attributeValueGridCol}>
        <Form.Item
          label={attributeValueLabel}
          name={attributeValueName}
          rules={attributeValueRules}
        >
          <AttributeValueSelect
            attributeValueId={formRef.getFieldValue(attributeValueName)}
            attributeId={formRef.getFieldValue(attributeName)}
            placeholder={t('Select Attribute Value')}
            onSelect={(value: any, option: any) => {
              //
            }}
            onLoad={(value: any) => {
              formRef.setFieldsValue({ [attributeValueName]: value });
            }}
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default React.memo(AttributeAttributeValueDependentSelect);
