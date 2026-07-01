import ListMoreItemAction from 'src/app/components/Actions/ListMoreItemAction'
import {Table, Tooltip} from 'antd'
import {FC} from 'react'
import {UserActionAddMoreItemActions} from '../Actions/UserActionAddMoreItem.actions'

const UserActionAddMoreItemListing: FC<any> = (props) => {
  const {loadingAddMoreItem, addMoreItemList, handleCallbackFunc} = props
  const columns = [
    {
      dataIndex: 'action_alias_text',
      key: 'action_alias_text',
      title: 'Action',
      render: (text: string, record: any, index: number) => {
        return record.action_name?.replaceAll('_', ' ')
      },
    },
    // {
    //   dataIndex: 'action_button_color',
    //   key: 'action_button_color',
    //   title: 'Color',
    //   render: (text: string, record: any, index: number) =>
    //     text ? (
    //       <Tooltip title={text}>
    //         <span
    //           style={{
    //             display: 'inline-block',
    //             width: '15px',
    //             height: '15px',
    //             backgroundColor: text,
    //             verticalAlign: 'middle',
    //           }}
    //         ></span>
    //       </Tooltip>
    //     ) : (
    //       '-'
    //     ),
    // },
    // {
    //   dataIndex: 'action_button_align',
    //   key: 'action_button_align',
    //   title: 'Alignment',
    //   render: (text: string, record: any, index: number) => text ?? '-',
    // },
    {
      dataIndex: 'is_comment_mandatory',
      key: 'is_comment_mandatory',
      title: 'Mandatory Comment',
      render: (text: string, record: any, index: number) => (text == '1' ? 'Yes' : 'No'),
    },
    {
      dataIndex: 'sort_order',
      key: 'sort_order',
      title: 'Order',
      render: (text: string, record: any, index: number) => text ?? '-',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      render: (text: string, record: any, index: number) => (
        <ListMoreItemAction
          entityIndex={index}
          actionList={UserActionAddMoreItemActions.LIST_ITEM_ACTION}
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

export default UserActionAddMoreItemListing
