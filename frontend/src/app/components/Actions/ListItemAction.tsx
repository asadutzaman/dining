import React, { FC } from 'react';
import ItemAction from './ItemAction';

interface IProps {
  entity?: any;
  entityId: any;
  actionList: any;
  onCheckIsShowAction?: (
    actionItemInfo: string,
    recordItemInfo: any
  ) => boolean;
  handleCallbackFunc?: (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => void;
}

const ListItemAction: FC<IProps> = (props) => {
  const {
    entity,
    entityId,
    actionList,
    handleCallbackFunc,
    onCheckIsShowAction,
  } = props;

  const gridColumnActionDropDownList = actionList.map(
    (item: any, index: any) => {
      return (
        <ItemAction
          key={`grid-action-item${index}`}
          entity={entity}
          entityId={entityId}
          actionItem={item}
          component={item?.component}
          handleCallbackFunc={handleCallbackFunc}
          onCheckIsShowAction={onCheckIsShowAction}
        />
      );
    }
  );

  return (
    <div className="d-flex justify-content-start shrink-0">
      {gridColumnActionDropDownList}
    </div>
  );
};

export default ListItemAction;
