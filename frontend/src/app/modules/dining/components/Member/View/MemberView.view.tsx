import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {MemberAction} from '../Actions/Member.actions'
import {StatusEnum} from 'src/app/utils/enums'

const MemberView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <EditAction
            entityId={itemData.id}
            actionItem={MemberAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={MemberAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>Member Code</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.member_code}</td>
          </tr>
          <tr>
            <td width={'20%'}>Member Type</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.member_type}</td>
          </tr>
          <tr>
            <td width={'20%'}>Name</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.name}</td>
          </tr>
          <tr>
            <td width={'20%'}>RFID Card Number</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.rfid_card_number}</td>
          </tr>
          <tr>
            <td width={'20%'}>Phone</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.phone}</td>
          </tr>
          <tr>
            <td width={'20%'}>Email</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.email}</td>
          </tr>
          {itemData.member_type === 'STAFF' && (
            <>
              <tr>
                <td width={'20%'}>Department</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.department_name}</td>
              </tr>
              <tr>
                <td width={'20%'}>Designation</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.designation_name}</td>
              </tr>
              <tr>
                <td width={'20%'}>Staff ID</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.staff_id}</td>
              </tr>
            </>
          )}
          {itemData.member_type === 'STUDENT' && (
            <>
              <tr>
                <td width={'20%'}>Class</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.class_name}</td>
              </tr>
              <tr>
                <td width={'20%'}>Section</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.section}</td>
              </tr>
              <tr>
                <td width={'20%'}>Roll No</td>
                <td width={'5%'}>:</td>
                <td width={'75%'}>{itemData.roll_no}</td>
              </tr>
            </>
          )}
          <tr>
            <td width={'20%'}>Due Balance</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.due_balance ?? 0}</td>
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
export default React.memo(MemberView)
