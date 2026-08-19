import React, {FC} from 'react'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import AntTable from 'src/app/components/Table/AntTable'
import {MealSettingAction} from '../Actions/MealSetting.actions'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'

const MealSettingListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'meal_type',
      key: 'meal_type',
      title: 'Meal Type',
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={MealSettingAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'cost',
      key: 'cost',
      title: 'Cost',
      sorter: true,
      width: '13%',
    },
    {
      dataIndex: 'time_window',
      key: 'time_window',
      title: 'Serving Time',
      width: '17%',
      render: (text: string, record: any) =>
        record.start_time && record.end_time
          ? `${String(record.start_time).slice(0, 5)} - ${String(record.end_time).slice(0, 5)}`
          : 'Any time',
    },
    {
      dataIndex: 'effective_from',
      key: 'effective_from',
      title: 'Effective From',
      sorter: true,
      width: '17%',
      render: (value: any) => DateTimeUtils.formatDate(value),
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: 'Status',
      sorter: true,
      width: '15%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      width: '15%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={MealSettingAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ]

  return (
    <div className='px-6'>
      <AntTable
        className='table-layout'
        rowSelection={false}
        scroll={{y: 500}}
        rowSelectionPermission='auth:mealSetting:multiSelect'
        selectedRowKeys={selectedRowKeys}
        dataSource={listData}
        columns={columns}
        loading={loading}
        handleOnChanged={handleOnChanged}
        onChange={handleTableChange}
      />
    </div>
  )
}

export default React.memo(MealSettingListing)
