import React, {FC} from 'react'
import {Message, AntModal} from 'src/app/utils'
import StockAdjustmentApprovalItemAddMoreItem from './StockAdjustmentApprovalItem.addMore.item'
import {Button} from 'antd'
import {KTIcon} from 'src/_metronic/helpers'

interface IProps {
  addMoreItemList: any
  setAddMoreItemList: any
}

const initialState = {
  addMoreItem: {id: null, value: null},
}

const StockAdjustmentApprovalItemAddMore: FC<IProps> = (props) => {
  const {addMoreItemList, setAddMoreItemList} = props

  const handleAddMoreItemInsert = () => {
    setAddMoreItemList((prevState: any) => {
      const initialAddMoreItem = {...initialState.addMoreItem}
      return [...prevState, initialAddMoreItem]
    })
  }

  const handleAddMoreItemEdit = (fieldName: string, fieldValue: any, fieldIndex: any) => {
    setAddMoreItemList((addMoreItemList: any) => {
      if (fieldName === 'finished_quantity') {
        if (fieldValue <= 0) {
          Message.error('Quantity is must be greater than 0')
          return [...addMoreItemList]
        }
        addMoreItemList[fieldIndex][fieldName] = fieldValue
      }
      addMoreItemList[fieldIndex][fieldName] = fieldValue
      return [...addMoreItemList]
    })
  }

  const handleDelete = (value: any, action: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (action === 'ok') {
        const filteredAddMoreItemList = addMoreItemList.filter(
          (item: any, index: Number) => index !== value
        )
        setAddMoreItemList(filteredAddMoreItemList)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
  const handleAddMoreItemDelete = (deleteItemIndex: Number) => {
    AntModal.confirm(
      'Delete item',
      'Are you sure you want to delete this Item?',
      deleteItemIndex,
      handleDelete,
      'Delete'
    )
  }

  return (
    <table className='table table-bordered'>
      <thead>
        <tr>
          <th style={{width: '5%'}}>SN</th>
          <th style={{width: '30%'}}>Product</th>
          <th style={{width: '25%'}}>Shelve</th>
          <th style={{width: '15%'}}>Quantity</th>
          <th style={{width: '20%'}}>remarks</th>
          <th style={{width: '5%'}}>Action</th>
        </tr>
      </thead>
      <tbody>
        {addMoreItemList.length > 0 &&
          addMoreItemList.map((item: any, index: any) => (
            <StockAdjustmentApprovalItemAddMoreItem
              key={`add-more-item-${index}`}
              addMoreItemIndex={index}
              addMoreItem={item}
              handleAddMoreItemEdit={handleAddMoreItemEdit}
              handleAddMoreItemDelete={handleAddMoreItemDelete}
            />
          ))}
        {addMoreItemList.length == 0 && (
          <tr>
            <td colSpan={6} align='center'>
              No Item Found!
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default React.memo(StockAdjustmentApprovalItemAddMore)
