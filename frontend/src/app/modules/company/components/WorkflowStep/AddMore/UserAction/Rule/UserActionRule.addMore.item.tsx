import React, { FC, useEffect, useState } from 'react';
import { Input, Form, Select, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { KTIcon } from 'src/_metronic/helpers';
import { useLang } from 'src/app/hooks/useLang';

const UserActionRuleAddMoreItem: FC<any> = (props) => {
  const { Option } = Select;
  const { t } = useLang();

  const {
    workflowStepSetupData,
    addMoreItemIndex,
    addMoreItem,
    handleAddMoreItemEdit,
    handleAddMoreItemDelete,
  } = props;

  const [actionRuleValueFieldType, setActionRuleValueFieldType] =
    useState('SELECT');
  const [actionRuleOperatorList, setActionRuleOperatorList] = useState<any[]>(
    workflowStepSetupData.ACTIONS.ACTION_RULES.OPERATOR.options
  );
  const [actionRuleValueList, setActionRuleValueList] = useState<any[]>([]);

  useEffect(() => {
    if (addMoreItem.rule_type) {
      handleActionRuleValueFieldType(addMoreItem.rule_type);
      handleFilterActionOperatorList(addMoreItem.rule_type);
    }
  }, [addMoreItem.rule_type]);

  const handleOnChangeRuleTypeField = (value: any, index: any) => {
    handleAddMoreItemEdit('rule_type', value, index);
    handleAddMoreItemEdit('value', null, index);
    handleActionRuleValueFieldType(value);
    handleFilterActionOperatorList(value);
  };

  const handleActionRuleValueFieldType = (value: any) => {
    const filterItem =
      workflowStepSetupData?.ACTIONS.ACTION_RULES.RULE_TYPE.options.find(
        (item) => item.value == value
      );
    const fieldType = filterItem?.dependentFieldType;
    setActionRuleValueFieldType(fieldType);
    handleFilterActionRuleValueList(fieldType, value);
  };

  const handleFilterActionOperatorList = (value: any) => {
    const filterOperatorList =
      workflowStepSetupData?.ACTIONS.ACTION_RULES.OPERATOR.options.filter(
        (item) => {
          if (item.filterValues.includes(value)) {
            return true;
          } else if (item.filterValues.includes('ALL')) {
            return true;
          }
        }
      );
    setActionRuleOperatorList(filterOperatorList);
  };

  const handleFilterActionRuleValueList = (fieldType: any, value: any) => {
    if (fieldType === 'SELECT') {
      const filterRuleValueField =
        workflowStepSetupData?.ACTIONS.ACTION_RULES.VALUE.find((item) =>
          item.filterValues.includes(value)
        );
      const filterRuleValueList = filterRuleValueField?.options.filter(
        (item) => {
          if (item.filterValues.includes(value)) {
            return true;
          } else if (item.filterValues.includes('ALL')) {
            return true;
          }
        }
      );
      setActionRuleValueList(filterRuleValueList);
    }
  };

  return (
    <tr>
      <td className="td-sn">
        <div>{addMoreItemIndex + 1}</div>
      </td>
      <td className="td-field">
        <Form.Item>
          <Select
            placeholder={t('-- Select --')}
            dropdownMatchSelectWidth={200}
            value={addMoreItem.rule_type}
            onChange={(value) =>
              handleOnChangeRuleTypeField(value, addMoreItemIndex)
            }
          >
            {workflowStepSetupData.ACTIONS.ACTION_RULES.RULE_TYPE.options.map(
              (item, index) => (
                <Option key={`rule-type-${index}`} value={item.value}>
                  {t(item.label)}
                </Option>
              )
            )}
          </Select>
        </Form.Item>
      </td>
      <td className="td-operator">
        <Form.Item>
          <Select
            placeholder={t('-- Select --')}
            dropdownMatchSelectWidth={200}
            value={addMoreItem.operator}
            onChange={(value) =>
              handleAddMoreItemEdit('operator', value, addMoreItemIndex)
            }
          >
            {actionRuleOperatorList.map((item, index) => (
              <Option key={`action-rule-operator-${index}`} value={item.value}>
                {t(item.label)}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </td>
      <td className="td-value">
        <Form.Item>
          <Select
            placeholder={t('-- Select --')}
            dropdownMatchSelectWidth={200}
            value={addMoreItem.value}
            onChange={(value) =>
              handleAddMoreItemEdit('value', value, addMoreItemIndex)
            }
          >
            {actionRuleValueList.map((item, index) => (
              <Option key={`action-rule-value-${index}`} value={item.value}>
                {t(item.label)}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </td>
      <td className="td-actions">
        <Button
          danger
          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
          onClick={() => handleAddMoreItemDelete(addMoreItemIndex)}
        >
          <KTIcon iconName={'trash'} className="fs-3" />
        </Button>
        <span className="ps-3">AND</span>
      </td>
    </tr>
  );
};

export default React.memo(UserActionRuleAddMoreItem);
