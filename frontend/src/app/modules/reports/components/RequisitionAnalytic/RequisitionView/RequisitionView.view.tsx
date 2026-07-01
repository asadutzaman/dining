import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {StatusEnum} from 'src/app/utils/enums'
import ViewTabList from 'src/app/components/Tab/ViewTabList'
import {useLang} from 'src/app/hooks/useLang'
import RequisitionTimelineViewTab from './Tabs/RequisitionTimelineView.tab'
import RequisitionViewTab from './Tabs/RequisitionView.tab'
import RequisitionItemViewTab from './Tabs/RequisitionItemView.tab'

const RequisitionView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc, loading, ...restProps} = props
  const {t} = useLang()

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Timeline'),
      permission: '',
      component: <RequisitionTimelineViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Requisition Info'),
      permission: '',
      component: <RequisitionViewTab itemData={itemData} />,
    },
    // {
    //   tabIndex: 3,
    //   label: t('Requisition Items'),
    //   permission: '',
    //   component: <RequisitionItemViewTab itemData={itemData} {...restProps} />,
    // },
  ]
  return (
    <div className='card card-body position-relative'>
      {loading === false && <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />}
    </div>
  )
}
export default React.memo(RequisitionView)
