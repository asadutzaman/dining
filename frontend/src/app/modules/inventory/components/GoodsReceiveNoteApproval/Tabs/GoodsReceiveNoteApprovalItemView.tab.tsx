import React, {FC} from 'react'
import {useLang} from 'src/app/hooks/useLang'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'

const GoodsReceiveNoteApprovalItemViewTab: FC<any> = (props) => {
  const {itemData} = props
  const {t} = useLang()

  return (
    <div className='table-responsive'>
      <table className='table table-bordered align-middle gs-1 gy-1'>
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Item')}</th>
            <th>{t('Item Code')}</th>
            {/* <th>{t('Shelve')}</th> */}
            <th>{t('Quantity')}</th>
            {/* <th>{t('Unit Price')}</th>
            <th>{t('Total Price')}</th> */}
            <th>{t('Expire Date')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.goods_receive_note_items_list_data !== undefined &&
            itemData.goods_receive_note_items_list_data.map((localItem: any, localIndex: any) => (
              <tr key={`local-${localIndex}`}>
                <td>{++localIndex}</td>
                <td>{localItem.item_info.name_en ?? localItem.item_info.name_bn}</td>
                <td>{localItem.item_info.code}</td>
                {/* <td>{localItem.shelve_info.name}</td> */}
                <td>{localItem.quantity}</td>
                {/* <td>{localItem.unit_price}</td>
                <td>{localItem.total_price}</td> */}
                <td>{DateTimeUtils.formatDate(localItem.expire_date)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
export default React.memo(GoodsReceiveNoteApprovalItemViewTab)
