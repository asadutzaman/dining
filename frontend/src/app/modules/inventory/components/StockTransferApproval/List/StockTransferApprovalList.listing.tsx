import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {StockTransferApprovalAction} from '../Actions/StockTransferApproval.actions'
import {useLang} from 'src/app/hooks/useLang'

const StockTransferApprovalListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props;
  const { t } = useLang();

  const onCheckIsShowAction = (
    actionItemInfo: any,
    recordItemInfo: any
  ): boolean => {
    if (
      actionItemInfo.title === 'Edit' &&
      !['DRAFT'].includes(recordItemInfo.process_status)
    ) {
      return false;
    }
    if (
      actionItemInfo.title === 'Delete' &&
      !['DRAFT', 'SUBMITTED'].includes(recordItemInfo.process_status)
    ) {
      return false;
    }
    return true;
  };

  const columns = [
    {
      dataIndex: 'transfer_to_branch',
      key: 'transfer_to_branch',
      title: t('Transfer To'),
      sorter: false,
      width: '20%',
      /* render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={StockTransferApprovalAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ), */
      render: (text: string | any[], record: any, index: number) => {
        const displayText = Array.isArray(text)
          ? text.map((branch: any) => branch.branch_name).join(', ')
          : text;
        return (
          <ViewAction
            entityId={record.id}
            actionItem={StockTransferApprovalAction.COMMON_ACTION.VIEW}
            defaultViewText={displayText}
            handleCallbackFunc={handleCallbackFunc}
          >
            <span className="grid-row-view-action fw-bolder cursor-pointer">
              {displayText}
            </span>
          </ViewAction>
        );
      },
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      title: t('Reason'),
      sorter: true,
      width: '20%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      sorter: true,
      width: '15%',
      render: (text: string, record: any, index: number) =>
        text === 'APPROVED' ? (
          <span className="badge badge-success">{text}</span>
        ) : (
          <span className="badge badge-warning">{text}</span>
        ),
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      width: '15%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      width: '15%',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={StockTransferApprovalAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
          onCheckIsShowAction={onCheckIsShowAction}
        />
      ),
    },
  ];

  return (
    <div className="px-6">
      <AntTable
        className="table-layout"
        rowSelection={false}
        rowSelectionPermission="auth:requisition:multiSelect"
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

export default React.memo(StockTransferApprovalListing);
