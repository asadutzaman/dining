import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {SupplierAction} from '../Actions/Supplier.actions'
import {StatusEnum} from 'src/app/utils/enums'
import {useLang} from 'src/app/hooks/useLang'

const SupplierView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  const {t} = useLang()
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <EditAction
            entityId={itemData.id}
            actionItem={SupplierAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={SupplierAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>{t('Supplier Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.supplier_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Supplier No')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.supplier_no}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Phone Number')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.phone}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Email Address')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.email}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Address')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.address}</td>
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
export default React.memo(SupplierView)
