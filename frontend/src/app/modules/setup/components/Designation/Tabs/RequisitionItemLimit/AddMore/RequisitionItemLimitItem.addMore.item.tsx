import React, {FC, useEffect} from 'react'
import {KTIcon} from 'src/_metronic/helpers'
import {Button, Form, InputNumber, Select} from 'antd'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionItemLimitItemAddMoreItem: FC<any> = (props) => {
  const {addMoreItemIndex, addMoreItem, handleAddMoreItemEdit, handleAddMoreItemDelete} = props
  const {t} = useLang()
  const {Option} = Select

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
      <td>{addMoreItem.name}</td>
      <td>
        <Form.Item className='mb-0'>
          <Select
            value={addMoreItem.limit_type}
            placeholder={t('Select')}
            onChange={(value) => handleAddMoreItemEdit('limit_type', value, addMoreItemIndex)}
          >
            <Option value='MONTHLY'>{t('Monthly')}</Option>
            <Option value='YEARLY'>{t('Yearly')}</Option>
          </Select>
        </Form.Item>
      </td>
      <td>
        <Form.Item className='mb-0'>
          <InputNumber
            min={0}
            value={addMoreItem.max_qty}
            onChange={(value) => handleAddMoreItemEdit('max_qty', value, addMoreItemIndex)}
            style={{width: '100%'}}
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

export default React.memo(RequisitionItemLimitItemAddMoreItem)
