import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {MealTokenAction} from '../Actions/MealToken.actions'

const MealTokenView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <DeleteAction
            entityId={itemData.id}
            actionItem={MealTokenAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>Token Number</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.token_number}</td>
          </tr>
          <tr>
            <td width={'20%'}>Member</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {itemData.member_code} - {itemData.member_name}
            </td>
          </tr>
          <tr>
            <td width={'20%'}>Meal Type</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.meal_type}</td>
          </tr>
          <tr>
            <td width={'20%'}>Meal Date</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDate(itemData.meal_date)}</td>
          </tr>
          <tr>
            <td width={'20%'}>Amount</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.amount}</td>
          </tr>
          <tr>
            <td width={'20%'}>Payment Status</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.payment_status}</td>
          </tr>
          <tr>
            <td width={'20%'}>Collection Status</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.collection_status}</td>
          </tr>
          <tr>
            <td width={'20%'}>Collected At</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.collected_at)}</td>
          </tr>
          <tr>
            <td width={'20%'}>Issued By</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.issued_by_name}</td>
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
export default React.memo(MealTokenView)
