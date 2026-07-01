import {Button, Form, Input, Select} from 'antd'
import React, {FC, useEffect} from 'react'
import {KTIcon} from 'src/_metronic/helpers'
import UserSelect from 'src/app/components/Dropdown/UserSelect'
import {useLang} from 'src/app/hooks/useLang'

const GroupMemberAddMoreItem: FC<any> = (props) => {
  const {t} = useLang()
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
        <Form.Item className='mb-0'>
          <UserSelect
            userId={addMoreItem.user_id}
            placeholder={t('Select User')}
            allowClear={true}
            onChange={(value) => handleAddMoreItemEdit('user_id', value, addMoreItemIndex)}
          />
        </Form.Item>
      </td>
      {/* <td>
        <Form.Item className='mb-0'>
          <Select
            value={addMoreItem.approver_type}
            placeholder={t('Select')}
            onChange={(value) => handleAddMoreItemEdit('approver_type', value, addMoreItemIndex)}
          >
            <Option key={`status-active`} value={'APPROVER'}>
              {t('APPROVER')}
            </Option>
            <Option key={`status-inactive`} value={'REVIEWER'}>
              {t('REVIEWER')}
            </Option>
          </Select>
        </Form.Item>
      </td> */}
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

export default React.memo(GroupMemberAddMoreItem)
