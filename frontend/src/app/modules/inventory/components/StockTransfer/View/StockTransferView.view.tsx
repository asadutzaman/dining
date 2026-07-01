import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {StockTransferAction} from '../Actions/StockTransfer.actions'
import {StatusEnum} from 'src/app/utils/enums'
import ViewTabList from 'src/app/components/Tab/ViewTabList'
import StockTransferViewTab from '../Tabs/StockTransferView.tab'
import StockTransferItemViewTab from '../Tabs/StockTransferItemView.tab'
import {useLang} from 'src/app/hooks/useLang'

const StockTransferView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc, loading, ...restProps} = props
  const {t} = useLang()

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Stock Transfer Info'),
      permission: '',
      component: <StockTransferViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Stock Transfer Items'),
      permission: '',
      component: <StockTransferItemViewTab itemData={itemData} {...restProps} />,
    },
  ]
  return (
    <div className='card card-body position-relative'>
      {loading === false && <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />}
    </div>
  )
}
export default React.memo(StockTransferView)
