import React, { FC } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import WorkflowStepConditionAddMoreItem from './WorkflowStepCondition.addMore.item';
import { useLang } from 'src/app/hooks/useLang';

const initialState = {
  addMoreItem: {
    id: null,
    field_name: null,
    operator: null,
    field_value: null,
  },
  isNewRecord: true,
  loading: false,
};

const WorkflowStepConditionAddMore: FC<any> = (props) => {
  const { workflowStepSetupData, addMoreItemList, setAddMoreItemList } = props;
  const { t } = useLang();

  const handleAddMoreItemInsert = () => {
    setAddMoreItemList((prevState) => {
      const addMoreItem = { ...initialState.addMoreItem };
      return [...prevState, addMoreItem];
    });
  };

  const handleAddMoreItemEdit = (name: string, value: any, index: any) => {
    setAddMoreItemList((addMoreItemList) => {
      addMoreItemList[index][name] = value;
      return [...addMoreItemList];
    });
  };

  const handleAddMoreItemDelete = (itemIndex: any) => {
    const filterAddMoreItemList = addMoreItemList.filter(
      (item, index) => index !== itemIndex
    );
    setAddMoreItemList(filterAddMoreItemList);
  };

  return (
    <div className="dashboard-form garments-form">
      <table className="table" cellPadding={5}>
        {addMoreItemList.length > 0 && (
          <>
            <thead>
              <tr>
                <th>{t('SN')}</th>
                <th>{t('Field')}</th>
                <th>{t('Operator')}</th>
                <th>{t('Value')}</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {addMoreItemList.map((item, index) => (
                <WorkflowStepConditionAddMoreItem
                  key={`add-more-condition-item-${index}`}
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
                  {t('Add Condition')}
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default React.memo(WorkflowStepConditionAddMore);
