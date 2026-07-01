import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {StockAdjustmentAction} from '../Actions/StockAdjustment.actions'
import {StatusEnum} from 'src/app/utils/enums'
import ViewTabList from 'src/app/components/Tab/ViewTabList'
import StockAdjustmentViewTab from '../Tabs/StockAdjustmentView.tab'
import StockAdjustmentItemViewTab from '../Tabs/StockAdjustmentItemView.tab'
import {useLang} from 'src/app/hooks/useLang'

const StockAdjustmentView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc, loading, ...restProps} = props
  const {t} = useLang()

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Stock Adjustment Info'),
      permission: '',
      component: <StockAdjustmentViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Stock Adjustment Items'),
      permission: '',
      component: <StockAdjustmentItemViewTab itemData={itemData} {...restProps} />,
    },
  ]
  return (
    <div className='card card-body position-relative'>
      {loading === false && <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />}
    </div>
  )
}
export default React.memo(StockAdjustmentView)
