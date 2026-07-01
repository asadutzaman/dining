import React, { FC } from 'react';
import ListItemAction from 'src/app/components/Actions/ListItemAction';
import ViewAction from 'src/app/components/Actions/ViewAction';
import AntTable from 'src/app/components/Table/AntTable';
import { GovtHolidayAction } from '../Actions/GovtHoliday.actions';
import { DateTimeUtils } from 'src/app/utils';
import { useLang } from 'src/app/hooks/useLang';

const GovtHolidayListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props;
  const { t } = useLang();
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      title: t('Holiday Name'),
      sorter: true,
      width: '14%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={GovtHolidayAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className="grid-row-view-action fw-bolder cursor-pointer">
            {text}
          </span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'date',
      key: 'date',
      title: t('Date'),
      sorter: true,
      width: '14%',
      render: (value: string) => {
        const holidayTypeMap: { [key: string]: string } = {
          government_holiday: t('Government Holiday'),
          weekend_holiday: t('Weekend Holiday'),
        };
        return holidayTypeMap[value] || value;
      },
    },
    {
      dataIndex: 'holiday_type',
      key: 'holiday_type',
      title: t('Holiday Type'),
      sorter: true,
      width: '14%',
      render: (value: string) => {
        const holidayTypeMap: { [key: string]: string } = {
          government_holiday: t('Government Holiday'),
          weekend_holiday: t('Weekend Holiday'),
        };
        return holidayTypeMap[value] || value;
      },
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      width: '14%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      sorter: true,
      width: '14%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'updated_at',
      key: 'updated_at',
      title: t('Updated Time'),
      sorter: true,
      width: '14%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '14%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={GovtHolidayAction.LIST_ITEM_ACTION}
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

export default React.memo(GovtHolidayListing);
