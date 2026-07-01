import React, { FC } from 'react';
import { CommonUtils } from 'src/app/utils';
import AntTable from 'src/app/components/Table/AntTable';
import ListItemAction from 'src/app/components/Actions/ListItemAction';
import { ResourceAction } from '../Actions/Resource.actions';
import ViewAction from 'src/app/components/Actions/ViewAction';
import { useLang } from 'src/app/hooks/useLang';

const ResourceListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleRefresh,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props;
  const { t } = useLang();

  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: t('SN'),
      render: (text: string, record: any, index: number) => {
        return CommonUtils.ToLocalNumber(index + 1, false);
      },
    },
    {
      dataIndex: 'display_name',
      key: 'display_name',
      title: t('Display Name'),
      sorter: true,
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={ResourceAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className="grid-row-view-action fw-bolder">{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'name',
      key: 'name',
      title: t('Resource Name (ID)'),
      sorter: true,
      render: (text: string, record: any, index: number) =>
        text ? text : 'N/A',
    },
    {
      dataIndex: 'resource_uri',
      key: 'resource_uri',
      title: t('Resource URI'),
      sorter: true,
      render: (text: string, record: any, index: number) =>
        text ? text : 'N/A',
    },
    {
      dataIndex: 'controller_name',
      key: 'controller_name',
      title: t('Controller'),
      sorter: true,
      render: (text: string, record: any, index: number) =>
        text ? text : 'N/A',
    },
    {
      dataIndex: 'permission_type',
      key: 'permission_type',
      title: t('Type'),
      sorter: true,
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: t('Status'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(
          record,
          record.status,
          onChangeSwitchToggle
        ),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={ResourceAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ];

  return (
    <div className="px-6">
      <AntTable
        className="table-layout"
        rowSelection={false}
        rowSelectionPermission="auth:example:multiSelect"
        selectedRowKeys={selectedRowKeys}
        dataSource={listData}
        columns={columns}
        loading={loading}
        handleOnChanged={handleOnChanged}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default React.memo(ResourceListing);
