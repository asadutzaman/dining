import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {MealSettingAction} from '../Actions/MealSetting.actions'
import {StatusEnum} from 'src/app/utils/enums'

const MealSettingView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <EditAction
            entityId={itemData.id}
            actionItem={MealSettingAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={MealSettingAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>Meal Type</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.meal_type}</td>
          </tr>
          <tr>
            <td width={'20%'}>Cost</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.cost}</td>
          </tr>
          <tr>
            <td width={'20%'}>Effective From</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDate(itemData.effective_from)}</td>
          </tr>
          <tr>
            <td width={'20%'}>Status</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{StatusEnum[itemData.status]}</td>
          </tr>
          <tr>
            <td width={'20%'}>Created Time</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.created_at)}</td>
          </tr>
          <tr>
            <td width={'20%'}>Updated Time</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDateTimeA(itemData.updated_at)}</td>
          </tr>
        </table>
      </div>
    </div>
  )
}
export default React.memo(MealSettingView)
