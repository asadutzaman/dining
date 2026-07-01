import React, { FC } from 'react';
import { AttributeAction } from '../Actions/Attribute.actions';
import EditAction from 'src/app/components/Actions/EditAction';
import DeleteAction from 'src/app/components/Actions/DeleteAction';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import ViewTabList from 'src/app/components/Tab/ViewTabList';
import AttributeViewTab from '../Tabs/AttributeView.tab';
import AttributeValueViewTab from '../Tabs/AttributeValueView.tab';
import { useLang } from 'src/app/hooks/useLang';

const AttributeView: FC<any> = (props) => {
  const { itemData, loading, handleCallbackFunc, ...restProps } = props;
  const { t } = useLang();
  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Attribute Info'),
      permission: '',
      component: <AttributeViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Attribute Values'),
      permission: '',
      component: <AttributeValueViewTab itemData={itemData} {...restProps} />,
    },
  ];
  return (
    <div className="position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={AttributeAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={AttributeAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>

      {loading === false && (
        <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />
      )}
    </div>
  );
};
export default React.memo(AttributeView);
