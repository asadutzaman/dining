import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {GoodsReceiveNoteAction} from '../Actions/GoodsReceiveNote.actions'
import {StatusEnum} from 'src/app/utils/enums'
import ViewTabList from 'src/app/components/Tab/ViewTabList'
import GoodsReceiveNoteViewTab from '../Tabs/GoodsReceiveNoteView.tab'
import GoodsReceiveNoteItemViewTab from '../Tabs/GoodsReceiveNoteItemView.tab'
import {useLang} from 'src/app/hooks/useLang'

const GoodsReceiveNoteView: FC<any> = (props) => {
  const {itemData, handleCallbackFunc, loading, ...restProps} = props
  const {t} = useLang()

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('Goods Receive Note Info'),
      permission: '',
      component: <GoodsReceiveNoteViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: t('Goods Receive Note Items'),
      permission: '',
      component: <GoodsReceiveNoteItemViewTab itemData={itemData} {...restProps} />,
    },
  ]
  return (
    <div className='card card-body position-relative'>
      {loading === false && <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />}
    </div>
  )
}
export default React.memo(GoodsReceiveNoteView)
