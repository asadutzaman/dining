import {Button, Form, Input, InputNumber, Select} from 'antd'
import React, {FC, useEffect} from 'react'
import {KTIcon} from 'src/_metronic/helpers'

const RequisitionApprovalItemAddMoreItem: FC<any> = (props) => {
  const {Option} = Select
  const {addMoreItemIndex, addMoreItem, handleAddMoreItemEdit} = props

  useEffect(() => {
    if (addMoreItem.field) {
      handleOnChangeConditionField(addMoreItem.field, addMoreItemIndex)
    }
  }, [addMoreItem.field])

  const handleOnChangeConditionField = (value: any, index: any) => {
    handleAddMoreItemEdit('field', value, addMoreItemIndex)
  }

  return (
    <tr>
      <td>{addMoreItemIndex + 1}</td>
      <td>{addMoreItem.name_en}</td>
      <td>{addMoreItem.current_stock_quantity}</td>
      <td>{addMoreItem.request_quantity}</td>
      <td>
        <Form.Item className='mb-0'>
          <InputNumber
            min={0}
            value={addMoreItem.revised_quantity}
            onChange={(value) => handleAddMoreItemEdit('revised_quantity', value, addMoreItemIndex)}
            style={{width: '100%'}}
          />
        </Form.Item>
      </td>
    </tr>
  )
}

export default React.memo(RequisitionApprovalItemAddMoreItem)
