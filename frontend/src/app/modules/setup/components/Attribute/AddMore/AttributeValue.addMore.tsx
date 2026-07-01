import React, {FC} from 'react'
import AttributeAddMoreItem from './AttributeValue.addMore.item'
import {Button} from 'antd'
import {KTIcon} from 'src/_metronic/helpers'
import {Message} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  addMoreItemList: any
  setAddMoreItemList: any
}

const initialState = {
  addMoreItem: {id: null, value: null},
}

const AttributeAddMore: FC<IProps> = (props) => {
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
      if (fieldName === 'value') {
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
          <th style={{width: '10%'}}>{t('SN')}</th>
          <th style={{width: '80%'}}>{t('Value')}</th>
          <th style={{width: '10%'}}>{t('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {addMoreItemList &&
          addMoreItemList.map((item: any, index: any) => (
            <AttributeAddMoreItem
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
                <KTIcon iconName='plus' className='fs-2' /> {t('Add Attribute Value')}
              </Button>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

export default React.memo(AttributeAddMore)
