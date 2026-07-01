import React, {FC} from 'react'
import {Message, AntModal} from 'src/app/utils'
import RequisitionApprovalItemAddMoreItem from './RequisitionApprovalItem.addMore.item'
import {Button} from 'antd'
import {KTIcon} from 'src/_metronic/helpers'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  addMoreItemList: any
  setAddMoreItemList: any
}

const RequisitionApprovalItemAddMore: FC<IProps> = (props) => {
  const {addMoreItemList, setAddMoreItemList} = props
  const {t} = useLang()

  const handleAddMoreItemEdit = (fieldName: string, fieldValue: any, fieldIndex: any) => {
    setAddMoreItemList((addMoreItemList: any) => {
      if (fieldName === 'revised_quantity') {
        // if (fieldValue <= 0) {
        //   Message.error(t('Quantity is must be greater than 0'))
        //   return [...addMoreItemList]
        // }
        if (fieldValue >= addMoreItemList[fieldIndex].request_quantity) {
          Message.error(t('Can not exceed Request Quantity'))
        }
        addMoreItemList[fieldIndex][fieldName] = fieldValue
      }
      addMoreItemList[fieldIndex][fieldName] = fieldValue
      return [...addMoreItemList]
    })
  }

  return (
    <table className='table table-bordered'>
      <thead>
        <tr>
          <th style={{width: '5%'}}>{t('SN')}</th>
          <th style={{width: '40%'}}>{t('Product')}</th>
          <th style={{width: '20%'}}>{t('Current Stock Balance')}</th>
          <th style={{width: '15%'}}>{t('Requested Qty')}</th>
          <th style={{width: '20%'}}>{t('Revised Qty')}</th>
        </tr>
      </thead>
      <tbody>
        {addMoreItemList.length > 0 &&
          addMoreItemList.map((item: any, index: any) => (
            <RequisitionApprovalItemAddMoreItem
              key={`add-more-item-${index}`}
              addMoreItemIndex={index}
              addMoreItem={item}
              handleAddMoreItemEdit={handleAddMoreItemEdit}
            />
          ))}
        {addMoreItemList.length === 0 && (
          <tr>
            <td colSpan={4} align='center'>
              {t('No Item Found!')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default React.memo(RequisitionApprovalItemAddMore)
