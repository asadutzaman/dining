import React, {FC} from 'react'
import AntTable from 'src/app/components/Table/AntTable'
import {ItemStockReportAction} from '../Action/ItemStockReport.actions'
import {AmountFormatUtils, DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ReportHeader from 'src/app/components/Header/ReportHeader'

const ItemStockListing: FC<any> = (props) => {
  const {t, lang} = useLang()
  const {
    loading,
    listData,
    pagination,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
    logisticName,
  } = props
  let showingStart = (pagination?.currentPage - 1) * pagination?.pageSize + 1

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Risk':
        return 'warning'
      case 'Danger':
        return 'danger'
      default:
        return 'success'
    }
  }

  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: t('Serial No.'),
      sorter: false,
      width: '20%',
      render: (value: any, record: any, index: number) => showingStart + index,
    },
    {
      dataIndex: lang === 'en' ? 'item_name_en' : 'item_name_bn',
      key: lang === 'en' ? 'item_name_en' : 'item_name_bn',
      title: t('Item'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'category_name',
      key: 'category_name',
      title: t('Category'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'unit_name',
      key: 'unit_name',
      title: t('Unit'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'total_grn_qty',
      key: 'total_grn_qty',
      title: t('Total GRN Qty'),
      sorter: false,
      width: '20%',
      render: (text: string, record: any, index: number) => {
        return record.total_grn_qty > 0 ? (
          <ViewAction
            entityId={record.id}
            actionItem={ItemStockReportAction.COMMON_ACTION.GRN_VIEW}
            defaultViewText={text}
            handleCallbackFunc={handleCallbackFunc}
          >
            <span className='grid-row-view-action fw-bolder cursor-pointer'>
              {AmountFormatUtils.formatWithDecimal(record.total_grn_qty)}
            </span>
          </ViewAction>
        ) : (
          <span className='grid-row-view-action'>
            {AmountFormatUtils.formatWithDecimal(record.total_grn_qty)}
          </span>
        )
      },
    },
    {
      dataIndex: 'total_disburse_qty',
      key: 'total_disburse_qty',
      title: t('Total Disburse Qty'),
      sorter: false,
      width: '20%',
      render: (text: string, record: any, index: number) =>
        record.total_disburse_qty > 0 ? (
          <ViewAction
            entityId={record.id}
            actionItem={ItemStockReportAction.COMMON_ACTION.DISBURSEMENT_VIEW}
            // To Prevent it from opening grn view here (manageUrl & component)
            manageUrl={false}
            component={ItemStockReportAction.COMMON_ACTION.DISBURSEMENT_VIEW.component}
            defaultViewText={text}
            handleCallbackFunc={handleCallbackFunc}
          >
            <span className='grid-row-view-action fw-bolder cursor-pointer'>
              {AmountFormatUtils.formatWithDecimal(record.total_disburse_qty)}
            </span>
          </ViewAction>
        ) : (
          <span className='grid-row-view-action'>
            {AmountFormatUtils.formatWithDecimal(record.total_disburse_qty)}
          </span>
        ),
    },
    // {
    //   dataIndex: 'total_disburse_qty',
    //   key: 'total_disburse_qty',
    //   title: t('Total Disburse Qty'),
    //   sorter: false,
    //   width: '20%',
    // },
    {
      dataIndex: 'current_stock',
      key: 'current_stock',
      title: t('Current Stock'),
      sorter: false,
      width: '20%',
      render: (value: any) => AmountFormatUtils.formatWithDecimal(value),
    },
    {
      dataIndex: 'running_demand',
      key: 'running_demand',
      title: t('Running Demand'),
      sorter: false,
      width: '20%',
      render: (value: any) => AmountFormatUtils.formatWithDecimal(value),
    },
    {
      dataIndex: 'demand_stock_gap',
      key: 'demand_stock_gap',
      title: t('Demand-Stock Gap'),
      sorter: false,
      width: '20%',
      render: (value: any) => AmountFormatUtils.formatWithDecimal(value),
    },
    {
      dataIndex: 'risk_status',
      key: 'risk_status',
      title: t('Risk Status'),
      sorter: false,
      width: '10%',
      render: (value: any) => (
        <span className={`badge badge-light-${getRiskBadge(value)}`}>{value.toUpperCase()}</span>
      ),
    },
    {
      dataIndex: 'last_grn_date',
      key: 'last_grn_date',
      title: t('Last GRN Date'),
      sorter: false,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'last_disburse_date',
      key: 'last_disburse_date',
      title: t('Last Disburse Date'),
      sorter: false,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
  ]

  return (
    <div className='px-6'>
      <ReportHeader title={t('Item Stock Analytics') + ' - ' + logisticName} />
      <AntTable
        className='table-layout'
        rowSelection={false}
        rowSelectionPermission='auth:requisition:multiSelect'
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

export default React.memo(ItemStockListing)
