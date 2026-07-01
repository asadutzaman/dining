import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {ExampleAction} from '../Actions/Example.actions'
import {StatusEnum} from 'src/app/utils/enums'

const ExampleView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc} = props
  return (
    <div className='card card-body position-relative'>
      <div className='row mb-7'>
        <div className='col-lg-12'>
          <EditAction
            entityId={itemData.id}
            actionItem={ExampleAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={ExampleAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <tr>
            <td width={'20%'}>Title</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.title}</td>
          </tr>
          <tr>
            <td width={'20%'}>Description</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.description}</td>
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
      {/* <div className='row mb-7'>
                <label className='col-lg-4 fw-bold text-muted'>Title</label>
                <div className='col-lg-8'>
                    <span className='fw-bolder fs-6 text-dark'>{itemData.title}</span>
                </div>
            </div>

            <div className='row mb-7'>
                <label className='col-lg-4 fw-bold text-muted'>Description</label>
                <div className='col-lg-8'>
                    <span className='fw-bolder fs-6 text-dark'>{itemData.description}</span>
                </div>
            </div> */}
    </div>
  )
}
export default React.memo(ExampleView)
