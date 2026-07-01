import ViewAction from 'src/app/components/Actions/ViewAction'
import StockAdjustmentApprovalViewController from '../View/StockAdjustmentApprovalView.controller'

export const StockAdjustmentApprovalAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Stock Adjustment',
      action: 'view',
      link: {to: ''},
      permission: 'auth:stockAdjustmentApproval:view',
      component: StockAdjustmentApprovalViewController,
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
      permission: 'auth:stockAdjustmentApproval:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
  ],
}
