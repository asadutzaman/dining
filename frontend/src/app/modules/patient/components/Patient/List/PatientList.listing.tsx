import React, {FC} from 'react'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import AntTable from 'src/app/components/Table/AntTable'
import {PatientAction} from '../Actions/Patient.actions'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'

const PatientListing: FC<any> = (props) => {
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
      dataIndex: 'mrn',
      key: 'mrn',
      title: 'MRN',
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'full_name',
      key: 'full_name',
      title: 'Full Name',
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={PatientAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action'>{text || `${record.first_name} ${record.last_name}`}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'gender',
      key: 'gender',
      title: 'Gender',
      sorter: true,
      width: '10%',
      render: (value: any) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '',
    },
    {
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      title: 'Date of Birth',
      sorter: true,
      width: '12%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'primary_phone',
      key: 'primary_phone',
      title: 'Primary Phone',
      sorter: true,
      width: '13%',
    },
    {
      dataIndex: 'blood_group',
      key: 'blood_group',
      title: 'Blood Group',
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: 'Status',
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={PatientAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission='auth:patient:multiSelect'
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

export default React.memo(PatientListing)
