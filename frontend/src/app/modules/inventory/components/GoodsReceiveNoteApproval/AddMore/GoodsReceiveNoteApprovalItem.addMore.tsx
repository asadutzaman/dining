import React, {FC} from 'react'
import {Message, AntModal} from 'src/app/utils'
import GoodsReceiveNoteApprovalItemAddMoreItem from './GoodsReceiveNoteApprovalItem.addMore.item'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  addMoreItemList: any
  setAddMoreItemList: any
}

const initialState = {
  addMoreItem: {id: null, value: null},
}

const GoodsReceiveNoteApprovalItemAddMore: FC<IProps> = (props) => {
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
      t('Delete Item'),
      t('Are you sure you want to delete this Item?'),
      deleteItemIndex,
      handleDelete,
      t('Delete')
    )
  }

  return (
    <table className='table table-bordered'>
      <thead>
        <tr>
          <th style={{width: '5%'}}>{t('SN')}</th>
          <th style={{width: '20%'}}>{t('Item')}</th>
          <th style={{width: '20%'}}>{t('Shelve')}</th>
          <th style={{width: '15%'}}>{t('Unit Price')}</th>
          <th style={{width: '15%'}}>{t('Quantity')}</th>
          <th style={{width: '20%'}}>{t('Remarks')}</th>
          <th style={{width: '5%'}}>{t('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {addMoreItemList.length > 0 &&
          addMoreItemList.map((item: any, index: any) => (
            <GoodsReceiveNoteApprovalItemAddMoreItem
              key={`add-more-item-${index}`}
              addMoreItemIndex={index}
              addMoreItem={item}
              handleAddMoreItemEdit={handleAddMoreItemEdit}
              handleAddMoreItemDelete={handleAddMoreItemDelete}
            />
          ))}
        {addMoreItemList.length === 0 && (
          <tr>
            <td colSpan={7} align='center'>
              {t('No Item Found!')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default React.memo(GoodsReceiveNoteApprovalItemAddMore)
