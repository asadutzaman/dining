import React, {FC} from 'react'
import {useLang} from 'src/app/hooks/useLang'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'
import {ReconcileStatusEnum} from 'src/app/utils/enums/Status.enum'

const RequisitionViewTab: FC<any> = (props) => {
  const {itemData} = props
  const {t} = useLang()

  return (
    <div className='container-fluid'>
      {/* --- New Recipient Section --- */}
      <div className='d-flex justify-content-between align-items-start mb-10 ps-2'>
        <div>
          <h4 className='fw-bold text-gray-800 mb-1'>{t('Requisition To')}</h4>
          <div className='fs-5 text-gray-700'>
            <div className='fw-bolder'>{t('Deputy Commissioner (Logistics)')}</div>
            <div>{t('Dhaka Metropolitan Police, Dhaka')}</div>
          </div>
        </div>

        {/* Right Side: Metadata */}
        <div
          className='text-end border border-secondary p-4 rounded bg-light-dark'
          style={{minWidth: '250px'}}
        >
          <div className='d-flex justify-content-between mb-1'>
            <span className='fw-bolder text-gray-800 me-2'>{t('Requisition No')}:</span>
            <span className='text-gray-700'>{itemData.requisition_number}</span>
          </div>
          <div className='d-flex justify-content-between mb-1'>
            <span className='fw-bolder text-gray-800 me-2'>{t('Date')}:</span>
            <span className='text-gray-700'>{DateTimeUtils.formatDate(itemData.created_at)}</span>
          </div>
          <div className='d-flex justify-content-between'>
            <span className='fw-bolder text-gray-800 me-2'>{t('Disbursement Date')}:</span>
            <span className='text-gray-700'>
              {['APPROVED', 'DISBURSED'].includes(itemData.process_status) ? (
                <span className='text-danger fw-bolder'>
                  {DateTimeUtils.formatDate(itemData.disbursement_date)}{' '}
                  {itemData.disbursement_start_time} - {itemData.disbursement_end_time}
                </span>
              ) : (
                '-'
              )}
            </span>
          </div>
        </div>
      </div>

      <div className='ps-2 mb-10'>
        <div className='border-0 pt-5'>
          <h3 className='align-items-start flex-column'>
            <span className='fw-bolder fs-3 mb-1'>
              {t('Application Subject')}: {itemData.subject}
            </span>
            <br />
            <span className='mt-1 fw-bold fs-7'>{itemData.description}</span>
          </h3>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className='table-responsive'>
        <h3 className='fw-bolder mb-4 text-center'>
          {t('Logistics')} : {itemData.logistic_name}
        </h3>
        <table className='table table-row-bordered table-row-gray-300 align-middle gs-0 gy-3'>
          <thead>
            <tr className='fw-bolder bg-light'>
              <th className='ps-4 min-w-50px rounded-start'>{t('Sl No')}</th>
              <th className='min-w-250px'>{t('Item Details')}</th>
              <th className='min-w-100px'>{t('Type')}</th>
              <th className='min-w-100px text-end pe-4'>{t('Requested / Revised Quantity')}</th>
              <th className='min-w-100px text-end pe-4'>{t('Receipts last month')}</th>
              <th className='min-w-100px'>{t('Remarks')}</th>
            </tr>
          </thead>
          <tbody>
            {itemData.requisitionItemsListData !== undefined &&
              itemData.requisitionItemsListData.map((item: any, index: any) => (
                <tr key={`local-${index}`}>
                  <td className='ps-4 text-dark fw-bold'>{++index}</td>
                  <td className='text-dark fw-bold'>
                    [{item.item_info.code}] - {item.item_info.name_en}
                  </td>
                  <td className='text-dark fw-bold'>{item.item_info.type}</td>
                  <td className='text-end pe-4 fw-bolder'>
                    {itemData.revised_status !== null && item.revised_quantity !== null ? (
                      <>
                        <span className='text-muted text-decoration-line-through'>
                          {item.request_quantity}
                        </span>{' '}
                        | {item.revised_quantity}
                      </>
                    ) : (
                      item.request_quantity
                    )}
                  </td>
                  <td className='text-end pe-4 fw-bolder'>{item.receipts_last_month}</td>
                  <td>{item.remarks}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* --- Footer Section with Both Sides --- */}
      <div className='d-flex justify-content-between mt-15 px-10'>
        {/* Left Side: Approved By */}
        <div className='text-start'>
          <h5 className='fw-bolder text-gray-800 mb-4'>Approved By:</h5>
          <div className='border-bottom border-gray-400 w-200px mb-2 mx-auto'></div>
          <h5 className='fw-bolder text-gray-800 mb-1'>Hamid Sarwar</h5>
          <div className='text-gray-600 fw-bold fs-6'>Deputy Commissioner</div>
          <div className='text-gray-600 fs-7'>Agargaon Police Station</div>
        </div>

        {/* Right Side: Requested By */}
        <div className='text-start'>
          <h5 className='fw-bolder text-gray-800 mb-4'>Requested By:</h5>
          <div className='border-bottom border-gray-400 w-200px mb-2'></div>
          <div className='d-flex flex-column'>
            <div className='text-gray-700 fw-bold fs-6'>{itemData.created_by_name}</div>
            <div className='text-gray-600 fw-bold fs-6'>{itemData.created_by_designation}</div>
            <div className='text-gray-600 fs-7'>{itemData.branch_name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(RequisitionViewTab)
