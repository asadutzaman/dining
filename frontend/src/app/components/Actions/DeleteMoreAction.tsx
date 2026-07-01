import React, { FC } from 'react';
import { Button } from 'antd';
import { usePermissionContext } from '../../hooks/context/usePermissionContext';

interface IProps {
  children?: any;
  entityIndex: any;
  actionItem?: any;
  manageUrl?: boolean;
  btnText?: any;
  handleCallbackFunc?: (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => void;
}

const DeleteMoreAction: FC<IProps> = (props) => {
  const {
    children,
    entityIndex,
    actionItem,
    btnText,
    manageUrl = true,
    handleCallbackFunc,
  } = props;
  const { isPermissionLoaded, hasPermission } = usePermissionContext();

  const handleConfirmDelete = (entityId: any): void => {
    if (manageUrl && handleCallbackFunc) {
      handleCallbackFunc(null, 'delete', entityId);
    }
  };

  if (isPermissionLoaded && hasPermission(actionItem.permission)) {
    return (
      <>
        {children ? (
          <span onClick={() => handleConfirmDelete(entityIndex)}>
            {children}
          </span>
        ) : (
          <Button
            type="primary"
            className="btn btn-delete btn-sm btn-light-danger me-3"
            onClick={() => handleConfirmDelete(entityIndex)}
          >
            {' '}
            {btnText || actionItem.title}
          </Button>
        )}
      </>
    );
  }

  return <></>;
};

export default DeleteMoreAction;
