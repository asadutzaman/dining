import ViewAction from 'src/app/components/Actions/ViewAction'
import GoodsReceiveNoteApprovalViewController from '../View/GoodsReceiveNoteApprovalView.controller'

export const GoodsReceiveNoteApprovalAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Goods Receive Note',
      action: 'view',
      link: {to: ''},
      permission: 'auth:goodsReceiveNoteApproval:view',
      component: GoodsReceiveNoteApprovalViewController,
      className: 'grid-view-action',
      // icon: <EyeOutlined />,
      modalId: 'view',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'View',
      action: 'active',
      link: {to: ''},
      permission: 'auth:goodsReceiveNoteApproval:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
  ],
}
