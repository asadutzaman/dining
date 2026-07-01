import {Button, Form, Input, Select} from 'antd'
import React, {FC, useEffect} from 'react'
import {KTIcon} from 'src/_metronic/helpers'

const AttributeAddMoreItem: FC<any> = (props) => {
  const {Option} = Select
  const {formRef, addMoreItemIndex, addMoreItem, handleAddMoreItemEdit, handleAddMoreItemDelete} =
    props

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
      <td>
        <Form.Item>
          <Input
            value={addMoreItem.value}
            onChange={(e) => handleAddMoreItemEdit('value', e.target.value, addMoreItemIndex)}
          />
        </Form.Item>
      </td>
      <td>
        <Button
          className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mt-1'
          onClick={() => handleAddMoreItemDelete(addMoreItemIndex)}
        >
          <KTIcon iconName='trash' className='fs-3' />
        </Button>
      </td>
    </tr>
  )
}

export default React.memo(AttributeAddMoreItem)
