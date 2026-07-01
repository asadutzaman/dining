import {Card, Spin} from 'antd'
import React, {FC} from 'react'
import ReportHeader from 'src/app/components/Header/ReportHeader'
import {useLang} from 'src/app/hooks/useLang'

const ItemRequisitionStatusListing: FC<any> = (props) => {
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
            <ReportHeader title={t('DMP Unit Wise Requisition Statistics Report')} />

            <table id='table-to-xls' className='table table-bordered table-row-gray-300 gs-2 gy-0'>
              <thead>
                <tr className='text-center'></tr>
                <tr>
                  <th>{t('Serial No.')}</th>
                  <th>{t('DMP Unit')}</th>
                  <th>{t('Total Requisitions')}</th>
                  <th>{t('Pending Requisitions')}</th>
                  <th>{t('Approved Requisitions')}</th>
                  <th>{t('Rejected Requisitions')}</th>
                  <th>{t('Delayed Requisitions')}</th>
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
                            {itemData.branch_name}
                          </td>
                          <td width={'15%'}>{itemData.total_count}</td>
                          <td width={'15%'}>{itemData.pending_count}</td>
                          <td width={'15%'}>{itemData.approved_count}</td>
                          <td width={'15%'}>{itemData.rejected_count}</td>
                          <td width={'15%'}>{itemData.delayed_count}</td>
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

export default React.memo(ItemRequisitionStatusListing)
