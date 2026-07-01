import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import {StatusEnum} from 'src/app/utils/enums'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {UserAction} from '../Actions/User.actions'
import {useLang} from 'src/app/hooks/useLang'

const UserView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  const {t} = useLang()
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <EditAction
            entityId={itemData.id}
            actionItem={UserAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={UserAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>{t('Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Email')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.email}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Mobile')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.phone}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Employee ID')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.employee_id}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Designation')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.designation_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Logistic')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.logistic_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Branch')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.branch_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Department')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.department_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Roles')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.role_name_list?.map((role) => role).join(', ')}</td>
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
export default React.memo(UserView)
