import React, {FC} from 'react'
import {useLang} from 'src/app/hooks/useLang'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'

const RequisitionItemViewTab: FC<any> = (props) => {
  const {itemData} = props
  const {t} = useLang()

  return (
    <div className='table-responsive'>
      <table className='table table-bordered align-middle gs-1 gy-1'>
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Item Code & Name')}</th>
            <th>{t('Type')}</th>
            <th>{t('Requested / Revised Quantity')}</th>
            <th>{t('Receipts last month')}</th>
            <th>{t('Remarks')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.requisitionItemsListData !== undefined &&
            itemData.requisitionItemsListData.map((item: any, index: any) => (
              <tr key={`local-${index}`}>
                <td>{++index}</td>
                <td>
                  [{item.item_info.code}] - {item.item_info.name_en}
                </td>
                <td>{item.item_info.type}</td>
                <td>
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
                <td>{item.receipts_last_month}</td>
                <td>{item.remarks}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
export default React.memo(RequisitionItemViewTab)
