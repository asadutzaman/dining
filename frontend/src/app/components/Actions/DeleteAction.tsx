import React, { FC } from 'react';
import { Button } from 'antd';
import { usePermissionContext } from '../../hooks/context/usePermissionContext';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  children?: any;
  entityId: any;
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

const DeleteAction: FC<IProps> = (props) => {
  const { t } = useLang();
  const {
    children,
    entityId,
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
          <span onClick={() => handleConfirmDelete(entityId)}>{children}</span>
        ) : (
          <Button
            danger
            className="btn btn-delete btn-sm btn-light-danger me-3"
            onClick={() => handleConfirmDelete(entityId)}
          >
            {t(btnText) || t(actionItem.title)}
          </Button>
        )}
      </>
    );
  }

  return <></>;
};

export default DeleteAction;
