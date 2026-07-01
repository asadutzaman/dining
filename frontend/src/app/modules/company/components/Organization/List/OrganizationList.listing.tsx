import React, { FC } from 'react';
import ListItemAction from 'src/app/components/Actions/ListItemAction';
import ViewAction from 'src/app/components/Actions/ViewAction';
import AntTable from 'src/app/components/Table/AntTable';
import { CommonUtils, DateTimeUtils } from 'src/app/utils';
import { OrganizationAction } from '../Actions/Organization.actions';
import { useLang } from 'src/app/hooks/useLang';

const OrganizationListing: FC<any> = (props) => {
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
      dataIndex: 'name_en',
      key: 'name_en',
      title: t('Name'),
      sorter: true,
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={OrganizationAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className="grid-row-view-action fw-bolder">{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'parent_en',
      key: 'parent_en',
      title: t('Parent Node'),
    },
    {
      dataIndex: 'short_name',
      key: 'short_name',
      title: t('Short Name'),
      sorter: true,
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      sorter: false,
      width: '10%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      sorter: true,
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
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
          actionList={OrganizationAction.LIST_ITEM_ACTION}
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

export default React.memo(OrganizationListing);
