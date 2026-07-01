import React, {FC} from 'react'
import {Table} from 'antd'
import {ApproverAddMoreItemActions} from '../Actions/ApproverAddMoreItem.actions'
import ListMoreItemAction from 'src/app/components/Actions/ListMoreItemAction'

const ApproverAddMoreItemListing: FC<any> = (props) => {
  const {workflowStepSetupData, loadingAddMoreItem, addMoreItemList, handleCallbackFunc} = props
  const columns = [
    {
      dataIndex: 'approver_mode',
      key: 'approver_mode',
      title: 'Approver Mode',
    },
    {
      dataIndex: 'designation_name',
      key: 'designation_name',
      title: 'Designation',
    },
    {
      dataIndex: 'approver_group_name',
      key: 'approver_group_name',
      title: 'Approver Group',
      // render: (text: string, record: any, index: number) => record.approver_group?.name,
      // render: (text: string, record: any, index: number) => {
      //   const approverGroupInfo = workflowStepSetupData.APPROVERS.APPROVER_GROUP.options.find(
      //     (item) => item.value == text
      //   )
      //   return approverGroupInfo?.label || text
      // },
    },
    {
      dataIndex: 'approver_group_member_name',
      key: 'approver_group_member_name',
      title: 'Approvers',
      // render: (text: string, record: any, index: number) => record.approver_group_member_name,
    },
    {
      dataIndex: 'approver_type',
      key: 'approver_type',
      title: 'Approver Type',
      render: (text: string, record: any, index: number) => {
        const approverTypeInfo = workflowStepSetupData?.APPROVERS.APPROVER_TYPE.options.find(
          (item) => item.value == text
        )
        return approverTypeInfo?.label || text
      },
    },
    {
      dataIndex: 'sort_order',
      key: 'sort_order',
      title: 'Sequence',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      render: (text: string, record: any, index: number) => (
        <ListMoreItemAction
          entityIndex={index}
          actionList={ApproverAddMoreItemActions.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ]

  return (
    <div className='listing-content listing-content-papers-to-be-attached'>
      <Table
        className='table-layout'
        rowKey={(record, index) =>
          index === undefined ? Math.random().toString() : index.toString()
        }
        rowClassName={(record, index) => (index % 2 === 0 ? 'odd' : 'even')}
        dataSource={addMoreItemList}
        columns={columns}
        pagination={false}
        loading={loadingAddMoreItem}
        bordered={false}
      />
    </div>
  )
}

export default ApproverAddMoreItemListing
