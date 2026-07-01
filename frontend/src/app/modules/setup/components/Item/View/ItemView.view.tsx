import React, { FC } from 'react';
import { DateTimeUtils } from 'src/app/utils';
import EditAction from 'src/app/components/Actions/EditAction';
import DeleteAction from 'src/app/components/Actions/DeleteAction';
import { ItemAction } from '../Actions/Item.actions';
import { StatusEnum } from 'src/app/utils/enums';
import ItemViewTab from '../Tabs/ItemView.tab';
import ItemAttributeViewTab from '../Tabs/ItemAttributeView.tab';
import ViewTabList from 'src/app/components/Tab/ViewTabList';
import UnitMappingViewTab from '../Tabs/UnitMappingView.tab';
import { useLang } from 'src/app/hooks/useLang';

const ItemView: FC<any> = (props) => {
  const { itemData, loading, handleCallbackFunc, ...restProps } = props;
  const { t } = useLang();
  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Item Info'),
      permission: '',
      component: <ItemViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Item Attributes'),
      permission: '',
      component: <ItemAttributeViewTab itemData={itemData} {...restProps} />,
    },
    {
      tabIndex: 3,
      label: t('Unit Mapping'),
      permission: '',
      component: <UnitMappingViewTab itemData={itemData} {...restProps} />,
    },
  ];
  return (
    <div className="card card-body position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={ItemAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={ItemAction.COMMON_ACTION.DELETE}
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
export default React.memo(ItemView);
