import ViewAction from 'src/app/components/Actions/ViewAction'
import StockTransferApprovalViewController from '../View/StockTransferApprovalView.controller'

export const StockTransferApprovalAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Stock Transfer',
      action: 'view',
      link: {to: ''},
      permission: 'auth:stockTransferApproval:view',
      component: StockTransferApprovalViewController,
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
      permission: 'auth:stockTransferApproval:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
  ],
}
