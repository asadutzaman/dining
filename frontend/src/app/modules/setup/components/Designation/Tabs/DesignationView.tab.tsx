import React, {FC} from 'react'

const DesignationViewTab: FC<any> = (props) => {
  const {itemData} = props

  return (
    <div className='table-responsive'>
      <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1'>
        <tbody>
          <tr>
            <td width={'20%'}>Designation Name</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.title}</td>
          </tr>
          <tr>
            <td width={'20%'}>Grade</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.grade}</td>
          </tr>
          <tr>
            <td width={'20%'}>Description</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.description}</td>
          </tr>
          <tr>
            <td width={'20%'}>Status</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.status === 1 ? 'Active' : 'Inactive'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default React.memo(DesignationViewTab)
