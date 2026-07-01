import React, { FC } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import UserActionRuleAddMoreItem from './UserActionRule.addMore.item';
import { useLang } from 'src/app/hooks/useLang';

const initialState = {
  addMoreItem: { id: null, rule_type: null, operator: null, value: null },
  isNewRecord: true,
  loading: false,
};

const UserActionRuleAddMore: FC<any> = (props) => {
  const {
    workflowStepSetupData,
    workflowStepActionRuleList,
    setWorkflowStepActionRuleList,
  } = props;
  const { t } = useLang();

  const handleAddMoreItemInsert = () => {
    setWorkflowStepActionRuleList((prevState) => {
      const addMoreItem = { ...initialState.addMoreItem };
      return [...prevState, addMoreItem];
    });
  };

  const handleAddMoreItemEdit = (name: string, value: any, index: any) => {
    setWorkflowStepActionRuleList((workflowStepActionRuleList) => {
      workflowStepActionRuleList[index][name] = value;
      return [...workflowStepActionRuleList];
    });
  };

  const handleAddMoreItemDelete = (itemIndex: any) => {
    const filterAddMoreItemList = workflowStepActionRuleList.filter(
      (item, index) => index !== itemIndex
    );
    setWorkflowStepActionRuleList(filterAddMoreItemList);
  };

  return (
    <div className="dashboard-form garments-form">
      <table className="table" cellPadding={5}>
        {workflowStepActionRuleList?.length > 0 && (
          <>
            <thead>
              <tr>
                <th>{t('SN')}</th>
                <th>{t('Rule Type')}</th>
                <th>{t('Operator')}</th>
                <th>{t('Value')}</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {workflowStepActionRuleList?.map((item, index) => (
                <UserActionRuleAddMoreItem
                  key={`add-more-rule-item-${index}`}
                  addMoreItemIndex={index}
                  addMoreItem={item}
                  workflowStepSetupData={workflowStepSetupData}
                  handleAddMoreItemEdit={handleAddMoreItemEdit}
                  handleAddMoreItemDelete={handleAddMoreItemDelete}
                />
              ))}
            </tbody>
          </>
        )}
        <tfoot>
          <tr>
            <td colSpan={5}>
              <div className="submit-btn">
                <Button
                  type="default"
                  className="border-primary"
                  onClick={() => handleAddMoreItemInsert()}
                >
                  <PlusOutlined />
                  {t('Add Rule')}
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default React.memo(UserActionRuleAddMore);
