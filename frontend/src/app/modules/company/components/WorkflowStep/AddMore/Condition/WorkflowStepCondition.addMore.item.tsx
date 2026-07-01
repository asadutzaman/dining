import React, { FC, useState, useEffect } from 'react';
import { Input, Form, Select, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { KTIcon } from 'src/_metronic/helpers';
import { useLang } from 'src/app/hooks/useLang';

const WorkflowStepConditionAddMoreItem: FC<any> = (props) => {
  const { Option } = Select;
  const { t } = useLang();
  const {
    workflowStepSetupData,
    addMoreItemIndex,
    addMoreItem,
    handleAddMoreItemEdit,
    handleAddMoreItemDelete,
  } = props;

  const [conditionValueFieldType, setConditionValueFieldType] =
    useState('SELECT');
  const [conditionOperatorList, setConditionOperatorList] = useState<any[]>(
    workflowStepSetupData.PRECONDITION.OPERATOR.options
  );
  const [conditionValueList, setConditionValueList] = useState<any[]>(
    workflowStepSetupData.PRECONDITION.VALUE.options
  );

  useEffect(() => {
    if (addMoreItem.field_name) {
      handleOnChangeConditionField(addMoreItem.field_name, addMoreItemIndex);
    }
  }, [addMoreItem.field_name]);

  const handleOnChangeConditionField = (value: any, index: any) => {
    handleAddMoreItemEdit('field_name', value, addMoreItemIndex);
    handleValueFieldType(value);
    handleFilterOperatorList(value);
    handleFilterConditionValueList(value);
  };

  const handleValueFieldType = (value: any) => {
    const filterItem = workflowStepSetupData.PRECONDITION.FIELD.options.find(
      (item) => item.value == value
    );
    setConditionValueFieldType(filterItem.dependentFieldType);
  };

  const handleFilterOperatorList = (value: any) => {
    const filterOperatorList =
      workflowStepSetupData.PRECONDITION.OPERATOR.options.filter((item) => {
        if (item.filterValues.includes(value)) {
          return true;
        } else if (item.filterValues.includes('ALL')) {
          return true;
        }
      });
    setConditionOperatorList(filterOperatorList);
  };

  const handleFilterConditionValueList = (value: any) => {
    const filterOperatorList =
      workflowStepSetupData.PRECONDITION.VALUE.options.filter((item) => {
        if (item.filterValues.includes(value)) {
          return true;
        } else if (item.filterValues.includes('ALL')) {
          return true;
        }
      });
    setConditionValueList(filterOperatorList);
  };

  return (
    <tr>
      <td className="td-sn">
        <div>{addMoreItemIndex + 1}</div>
      </td>
      <td className="td-field">
        <Form.Item>
          <Select
            placeholder={t('Select')}
            value={addMoreItem.field_name}
            onChange={(value) =>
              handleOnChangeConditionField(value, addMoreItemIndex)
            }
          >
            {workflowStepSetupData.PRECONDITION.FIELD.options.map(
              (item, index) => (
                <Option key={`pre-condition-field-${index}`} value={item.value}>
                  {item.label}
                </Option>
              )
            )}
          </Select>
        </Form.Item>
      </td>
      <td className="td-operator">
        <Form.Item>
          <Select
            placeholder={t('Select')}
            value={addMoreItem.operator}
            onChange={(value) =>
              handleAddMoreItemEdit('operator', value, addMoreItemIndex)
            }
          >
            {conditionOperatorList.map((item, index) => (
              <Option
                key={`pre-condition-operator-${index}`}
                value={item.value}
              >
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </td>
      <td className="td-value">
        <Form.Item>
          {/* {conditionValueFieldType == 'SELECT' ? ( */}
          <Select
            placeholder={t('Select')}
            value={addMoreItem.field_value}
            onChange={(value) =>
              handleAddMoreItemEdit('field_value', value, addMoreItemIndex)
            }
          >
            {conditionValueList.map((item, index) => (
              <Option key={`pre-condition-value-${index}`} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
          {/* ) : (
            <Input
              value={addMoreItem.value}
              onChange={(event) =>
                handleAddMoreItemEdit('value', event.target.value, addMoreItemIndex)
              }
            />
          )} */}
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
        <span className="ps-3">OR</span>
      </td>
    </tr>
  );
};

export default React.memo(WorkflowStepConditionAddMoreItem);
