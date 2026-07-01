import {Card, Spin} from 'antd'
import React, {FC} from 'react'
import ReportHeader from 'src/app/components/Header/ReportHeader'
import {useLang} from 'src/app/hooks/useLang'

const ItemLowStockListing: FC<any> = (props) => {
  const {pagination, loading, listData} = props
  let showingStart = (pagination?.currentPage - 1) * pagination?.pageSize + 1

  const {t, lang} = useLang()
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Critical':
        return 'badge-light-danger'
      case 'Low':
        return 'badge-light-warning'
      default:
        return 'badge-light-success'
    }
  }

  return (
    <div className='p-6'>
      <Card className='mt-2'>
        <Spin spinning={loading}>
          <div className='listing-page-content listing-page-content-collectionTargetReport'>
            <ReportHeader title={t('Item Low Stock Report')} />

            <table id='table-to-xls' className='table table-bordered table-row-gray-300 gs-2 gy-0'>
              <thead>
                <tr className='text-center'></tr>
                <tr>
                  <th>{t('Serial No.')}</th>
                  <th>{t('Item')}</th>
                  <th>{t('Logistic')}</th>
                  <th>{t('Stock Quantity')}</th>
                  <th>{t('Demand')}</th>
                  <th>{t('Gap')}</th>
                  <th>{t('Reorder Quantity')}</th>
                  <th>{t('Stock Status')}</th>
                  <th>{t('Action')}</th>
                </tr>
              </thead>

              <tbody>
                {listData.length === 0 && (
                  <tr>
                    <td colSpan={10} align='center'>
                      {t('No data found!')}
                    </td>
                  </tr>
                )}

                {listData &&
                  listData.map((itemData, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr key={`${index}`} style={{fontSize: 15}}>
                          <td width={'10'} align='center'>
                            {showingStart++}
                          </td>
                          <td
                            width={'15%'}
                            style={{
                              minWidth: '120px',
                              wordBreak: 'break-all',
                            }}
                          >
                            {lang === 'en' ? itemData.item_name_en : itemData.item_name_bn}
                          </td>
                          <td width={'15%'}>{itemData.logistic_name}</td>
                          <td width={'15%'}>{itemData.stock_qty}</td>
                          <td width={'15%'}>{itemData.demand_qty}</td>
                          <td width={'15%'}>{itemData.gap_qty}</td>
                          <td width={'15%'}>{itemData.reorder_qty}</td>
                          <td width={'15%'}>
                            <span className={`badge ${getRiskBadge(itemData.stock_status)}`}>
                              {itemData.stock_status.toUpperCase()}
                            </span>
                          </td>
                          <td width={'15%'}>
                            {['High_Demand', 'Low_Stock'].includes(itemData.stock_status)
                              ? 'Need Procurement'
                              : 'Stock Ok'}
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Spin>
      </Card>
    </div>
  )
}

export default React.memo(ItemLowStockListing)
