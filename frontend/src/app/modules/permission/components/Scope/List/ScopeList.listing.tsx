import React, { FC } from 'react';
import { CommonUtils } from 'src/app/utils';
import AntTable from 'src/app/components/Table/AntTable';
import ListItemAction from 'src/app/components/Actions/ListItemAction';
import { ScopeAction } from '../Actions/Scope.actions';
import ViewAction from 'src/app/components/Actions/ViewAction';
import { useLang } from 'src/app/hooks/useLang';

const ScopeListing: FC<any> = (props) => {
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
      dataIndex: 'resource_name',
      key: 'resource_name',
      title: t('Resource'),
      sorter: true,
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={ScopeAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className="grid-row-view-action fw-bolder">{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'display_name',
      key: 'display_name',
      title: t('Display Name'),
      sorter: true,
    },
    {
      dataIndex: 'scope',
      key: 'scope',
      title: t('Scope Key'),
      sorter: true,
    },
    {
      dataIndex: 'http_method',
      key: 'http_method',
      title: t('HTTP Method'),
      sorter: true,
    },
    {
      dataIndex: 'uri',
      key: 'uri',
      title: t('Scope URI'),
      sorter: true,
      render: (text: string, record: any, index: number) =>
        text ? text : 'N/A',
    },
    {
      dataIndex: 'action_name',
      key: 'action_name',
      title: t('Action Name'),
      sorter: true,
      render: (text: string, record: any, index: number) =>
        text ? text : 'N/A',
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: t('Status'),
      sorter: true,
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
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={ScopeAction.LIST_ITEM_ACTION}
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

export default React.memo(ScopeListing);
