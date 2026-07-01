import React, { FC, useState } from 'react';
import { Button } from 'antd';
import { EyeFilled } from '@ant-design/icons';
import { usePermissionContext } from '../../hooks/context/usePermissionContext';

interface IProps {
  entityId: any;
  children?: any;
  component?: any;
  actionItem?: any;
  defaultViewText?: any;
  manageUrl?: boolean;
  handleCallbackFunc?: (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => void;
  [key: string]: any;
}

const ViewAction: FC<IProps> = (props) => {
  const {
    children,
    component: Component,
    entityId,
    actionItem,
    defaultViewText,
    manageUrl = true,
    handleCallbackFunc,
    ...restProps
  } = props;
  const { isPermissionLoaded, hasPermission } = usePermissionContext();
  const [isShowView, setIsShowView] = useState(false);
  const [reloadView, setReloadView] = useState<number>(Date.now());

  const showViewModal = (): void => {
    if (manageUrl && handleCallbackFunc) {
      handleCallbackFunc(null, 'view', entityId);
    } else {
      setIsShowView(true);
      handleReloadView();
    }
  };

  const hideViewModal = () => {
    setIsShowView(false);
  };

  const handleReloadView = () => {
    setReloadView(Date.now());
  };

  const handleCallback = (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => {
    if (!manageUrl && action == 'hideView') {
      hideViewModal();
    } else if (handleCallbackFunc) {
      handleCallbackFunc(event, action, recordId, data);
    }
  };

  if (isPermissionLoaded && hasPermission(actionItem.permission)) {
    return (
      <>
        {children ? (
          <span onClick={() => showViewModal()}>{children}</span>
        ) : (
          <Button
            type="primary"
            className="btn btn-view"
            onClick={() => showViewModal()}
          >
            {' '}
            {actionItem.title}
          </Button>
        )}
        {!manageUrl && (
          <Component
            entityId={entityId}
            reloadView={reloadView}
            isShowView={isShowView}
            handleCallbackFunc={handleCallback}
            {...restProps}
          />
        )}
      </>
    );
  } else if (defaultViewText) {
    return defaultViewText;
  }

  return <></>;
};

export default ViewAction;
