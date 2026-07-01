import React, {FC} from 'react'
import GroupMemberAddMoreItem from './GroupMember.addMore.item'
import {Button} from 'antd'
import {KTIcon} from '../../../../../../_metronic/helpers'
import {Message} from '../../../../../utils'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  addMoreItemList: any
  setAddMoreItemList: any
}

const initialState = {
  addMoreItem: {id: null, user_id: null, approver_type: null},
}

const GroupMemberAddMore: FC<IProps> = (props) => {
  const {addMoreItemList, setAddMoreItemList} = props
  const {t} = useLang()

  const handleAddMoreItemInsert = () => {
    setAddMoreItemList((prevState: any) => {
      const initialAddMoreItem = {...initialState.addMoreItem}
      return [...prevState, initialAddMoreItem]
    })
  }

  const handleAddMoreItemEdit = (fieldName: string, fieldValue: any, fieldIndex: any) => {
    setAddMoreItemList((addMoreItemList: any) => {
      if (fieldName === 'name') {
        let inValid = /^\S*$/
        if (inValid.test(fieldValue) === false) {
          Message.error('Space Not Allowed')
          return [...addMoreItemList]
        } else {
          addMoreItemList[fieldIndex][fieldName] = fieldValue
          return [...addMoreItemList]
        }
      }
      addMoreItemList[fieldIndex][fieldName] = fieldValue
      return [...addMoreItemList]
    })
  }

  const handleAddMoreItemDelete = (deleteItemIndex: Number) => {
    const filteredAddMoreItemList = addMoreItemList.filter(
      (item: any, index: Number) => index !== deleteItemIndex
    )
    setAddMoreItemList(filteredAddMoreItemList)
  }

  return (
    <table className='table table-bordered' cellPadding={'3px'}>
      <thead>
        <tr>
          <th style={{width: '5%'}}>{t('SN')}</th>
          <th style={{width: '85%'}}>{t('User')}</th>
          {/* <th style={{width: '45%'}}>{t('Approver Type')}</th> */}
          <th style={{width: '10%'}}>{t('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {addMoreItemList &&
          addMoreItemList.map((item: any, index: any) => (
            <GroupMemberAddMoreItem
              key={`add-more-item-${index}`}
              addMoreItemIndex={index}
              addMoreItem={item}
              handleAddMoreItemEdit={handleAddMoreItemEdit}
              handleAddMoreItemDelete={handleAddMoreItemDelete}
            />
          ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={6}>
            <div className='submit-btn'>
              <Button
                type='primary'
                className='btn btn-sm btn-primary h-auto'
                onClick={() => handleAddMoreItemInsert()}
              >
                <KTIcon iconName='plus' className='fs-2' /> {t('Add Member')}
              </Button>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

export default React.memo(GroupMemberAddMore)
