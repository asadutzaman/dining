import React, { FC } from 'react';
import { usePermissionContext } from '../../hooks/context/usePermissionContext';
import { KTIcon } from '../../../_metronic/helpers';
import { Button } from 'antd';

interface IProps {
  entity?: any;
  entityId: any;
  actionItem?: any;
  component?: any;
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

const ItemAction: FC<IProps> = (props) => {
  const {
    entity,
    entityId,
    actionItem,
    component: Component,
    handleCallbackFunc,
    onCheckIsShowAction,
  } = props;
  const { isPermissionLoaded, hasPermission } = usePermissionContext();

  if (isPermissionLoaded && hasPermission(actionItem.permission)) {
    if (onCheckIsShowAction) {
      if (onCheckIsShowAction(actionItem, entity)) {
        return (
          <Component
            entityId={entityId}
            actionItem={actionItem}
            handleCallbackFunc={handleCallbackFunc}
          >
            <Button className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mt-1">
              {' '}
              <KTIcon iconName={actionItem.icon} className="fs-3" />{' '}
            </Button>
          </Component>
        );
      }
    } else {
      return (
        <Component
          entityId={entityId}
          actionItem={actionItem}
          handleCallbackFunc={handleCallbackFunc}
        >
          <Button className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mt-1">
            {' '}
            <KTIcon iconName={actionItem.icon} className="fs-3" />{' '}
          </Button>
        </Component>
      );
    }
  }

  return <></>;
};

export default ItemAction;
