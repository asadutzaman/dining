import React, { FC, Fragment, useEffect, useState } from 'react';
import { Form, Input, Row, Col, Select, Card, Tree } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import DesignationSelect from 'src/app/components/Dropdown/DesignationSelect';
import DepartmentSelect from 'src/app/components/Dropdown/DepartmentSelect';
import { useRoleList } from 'src/app/hooks/lists/useRoleList';
import LogisticSelect from 'src/app/components/Dropdown/LogisticSelect';
import BranchSelect from 'src/app/components/Dropdown/BranchSelect';
import { useLang } from 'src/app/hooks/useLang';
import { BranchApi } from 'src/app/api';
import { useErrorHandler } from 'src/app/hooks/useErrorHandler';

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

const UserForm: FC<any> = (props) => {
  const { Option } = Select;
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    checkedKeys,
    setCheckedKeys,
    branchTreeData,
  } = props;
  const { t } = useLang();
  // USED HOOKS
  const { roleList, loadingRoleList } = useRoleList();
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  const onExpand = (expandedKeysValue: any) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (data: any, event: any) => {
    const checkedKeysValue: any[] = event.checked ? [event.node.key] : [];

    setCheckedKeys(checkedKeysValue);

    let selectedBranchId: number = 0;
    checkedKeysValue.forEach(function (element) {
      var organogramArray = element.split('key-');
      selectedBranchId = Number(organogramArray[1]);
    });
    formRef.setFieldsValue({
      branch_id: selectedBranchId,
    });
  };

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
            <Col span={8}>
              <Form.Item label={t('Name')} name="name" rules={rules.required}>
                <Input placeholder={t('Name')} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Login Email')}
                name="email"
                rules={rules.required}
              >
                <Input type="email" placeholder={t('Email')} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Login Phone')}
                name="phone"
                rules={rules.required}
              >
                <Input placeholder={t('Phone')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label={t('Employee ID')}
                name="employee_id"
                rules={rules.required}
              >
                <Input placeholder={t('Employee ID')} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Designation')}
                name="designation_id"
                rules={rules.required}
              >
                <DesignationSelect
                  designationId={formRef.getFieldValue('designation_id')}
                  placeholder={t('Select Designation')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ designation_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ designation_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Logistic')} name="logistic_id">
                <LogisticSelect
                  logisticId={formRef.getFieldValue('logistic_id')}
                  placeholder={t('Select Logistic')}
                  allowClear={true}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ logistic_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ logistic_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            {/* <Col span={8}>
              <Form.Item label={t('Branch')} name='branch_id' rules={rules.required}>
                <BranchSelect
                  branchId={formRef.getFieldValue('branch_id')}
                  placeholder={t('Select branch')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({branch_id: value})
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({branch_id: value})
                  }}
                />
              </Form.Item>
            </Col> */}

            <Col span={8}>
              <Form.Item
                label={t('Department')}
                name="department_id"
                rules={rules.required}
              >
                <DepartmentSelect
                  departmentId={formRef.getFieldValue('department_id')}
                  placeholder={t('Select Department')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ department_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ department_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Roles')}
                name="role_ids"
                rules={rules.required}
              >
                <Select
                  showSearch
                  allowClear
                  mode="multiple"
                  placeholder={t('-- Select --')}
                  loading={loadingRoleList}
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    option?.children
                      ?.toLowerCase()
                      ?.indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {roleList &&
                    roleList.map((item: any, index: any) => (
                      <Option key={`user-group-${index}`} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
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

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label={t('Password')}
                name="password"
                // rules={rules.required}
              >
                <Input type="password" autoComplete="new-password" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={t('Confirm Password')}
                name="confirm_password"
                dependencies={['password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          t('The two passwords that you entered do not match!')
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input type="password" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={t('Select DMP Unit')}
                name="branch_id"
                rules={rules.required}
              >
                {branchTreeData && (
                  <Card>
                    <div className={'organogram-tree'}>
                      <Tree
                        multiple={false}
                        checkable
                        checkStrictly={true}
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onCheck={onCheck}
                        checkedKeys={checkedKeys}
                        treeData={branchTreeData}
                      />
                    </div>
                  </Card>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(UserForm);
