import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {PaymentAction} from '../Actions/Payment.actions'

const PaymentView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <DeleteAction
            entityId={itemData.id}
            actionItem={PaymentAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>Payment Number</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.payment_number}</td>
          </tr>
          <tr>
            <td width={'20%'}>Member</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {itemData.member_code} - {itemData.member_name}
            </td>
          </tr>
          <tr>
            <td width={'20%'}>Amount</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.amount}</td>
          </tr>
          <tr>
            <td width={'20%'}>Payment Date</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDate(itemData.payment_date)}</td>
          </tr>
          <tr>
            <td width={'20%'}>Method</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.payment_method}</td>
          </tr>
          <tr>
            <td width={'20%'}>Remarks</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.remarks}</td>
          </tr>
          <tr>
            <td width={'20%'}>Collected By</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.collected_by_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>Created Time</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.created_at)}</td>
          </tr>
        </table>
      </div>
    </div>
  )
}
export default React.memo(PaymentView)
