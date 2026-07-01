import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionItemLimitView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  const {t} = useLang()

  return (
    <div className='card card-body position-relative'>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1'>
          <tr>
            <td width={'20%'}>{t('Designation')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.designation_title}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Item')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.item_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Limit Type')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.limit_type}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Max Qty')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.max_qty}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Effective From')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDate(itemData.effective_from)}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Status')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{StatusEnum[itemData.status]}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Created Time')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.created_at)}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Updated Time')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.updated_at)}</td>
          </tr>
        </table>
      </div>
    </div>
  )
}
export default React.memo(RequisitionItemLimitView)
