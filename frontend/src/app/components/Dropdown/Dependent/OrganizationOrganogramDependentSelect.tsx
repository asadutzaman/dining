import React from 'react';
import { Col, Form } from 'antd';
import { SelectProps } from 'antd/lib/select';
import OrganizationSelect from '../OrganizationSelect';
import OrganogramSelect from '../OrganogramSelect';
import { useLang } from 'src/app/hooks/useLang';

interface DependentProps {
  fieldName: any;
  fieldLabel: any;
  rules?: any;
  gridCol: any;
}

interface Props extends SelectProps {
  formRef: any;
  organizationProps: DependentProps;
  organogramProps: DependentProps;
}

const OrganizationOrganogramDependentSelect: React.FC<Props> = (props) => {
  const { formRef } = props;
  const { t } = useLang();

  const {
    fieldLabel: organizationLabel = 'Organization',
    fieldName: organizationName = 'organization_id',
    rules: organizationRules = null,
    gridCol: organizationGridCol = { xs: 24, md: 12 },
  } = props.organizationProps || {};

  const {
    fieldLabel: organogramLabel = 'Organogram',
    fieldName: organogramName = 'organogram_id',
    rules: organogramRules = null,
    gridCol: organogramGridCol = { xs: 24, md: 12 },
  } = props.organogramProps || {};

  return (
    <>
      <Col {...organizationGridCol}>
        <Form.Item
          label={organizationLabel}
          name={organizationName}
          rules={organizationRules}
        >
          <OrganizationSelect
            organizationId={formRef.getFieldValue(organizationName)}
            placeholder={t('Select Organization')}
            onSelect={(value, option) => {
              formRef.setFieldsValue({ [organogramName]: null });
            }}
            onLoad={(value) => {
              formRef.setFieldsValue({ [organizationName]: value });
            }}
          />
        </Form.Item>
      </Col>
      <Col {...organogramGridCol}>
        <Form.Item
          label={organogramLabel}
          name={organogramName}
          rules={organogramRules}
        >
          <OrganogramSelect
            organogramId={formRef.getFieldValue(organogramName)}
            organizationId={formRef.getFieldValue(organizationName)}
            placeholder={t('Select Organogram')}
            onSelect={(value: any, option: any) => {
              //
            }}
            onLoad={(value: any) => {
              formRef.setFieldsValue({ [organogramName]: value });
            }}
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default React.memo(OrganizationOrganogramDependentSelect);
