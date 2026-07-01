import React, { FC } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { usePermissionContext } from '../../hooks/context/usePermissionContext';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  bulkAction: any;
  handleCallbackFunc: (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => void;
  [key: string]: any;
}

const BulkAction: FC<IProps> = (props) => {
  const { bulkAction, handleCallbackFunc, ...restProps } = props;
  const { isPermissionLoaded, hasPermission } = usePermissionContext();
  const { t } = useLang();
  const bulkActionDropDownList = (
    <Menu>
      {bulkAction.action_list.map((item: any, index: any) => {
        if (isPermissionLoaded && hasPermission(item.permission)) {
          return (
            <Menu.Item key={`${index}`}>
              {item.type == 'item' && (
                <Button
                  type="text"
                  onClick={() => handleCallbackFunc('bulkAction', item.action)}
                >
                  {t(item.title)}
                </Button>
              )}
              {item.type == 'load_drawer_view' && (
                <Button type="text">{item.component}</Button>
              )}
              {item.type == 'component' && (
                <item.component
                  handleCallbackFunc={handleCallbackFunc}
                  {...restProps}
                />
              )}
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );

  if (isPermissionLoaded && hasPermission(bulkAction.permission)) {
    return (
      <div className="filter-box-right button-box bulk-action-button-box">
        <Dropdown
          overlay={bulkActionDropDownList}
          trigger={['click']}
          placement="bottomRight"
        >
          <button type="button" className="btn btn-sm btn-light-primary me-3">
            <EllipsisOutlined />
          </button>
        </Dropdown>
      </div>
    );
  }

  return <></>;
};

export default BulkAction;
