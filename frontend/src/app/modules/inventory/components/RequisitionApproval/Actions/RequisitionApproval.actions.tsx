import ViewAction from 'src/app/components/Actions/ViewAction'
import RequisitionApprovalViewController from '../View/RequisitionApprovalView.controller'

export const RequisitionApprovalAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Requisition Approval',
      action: 'view',
      link: {to: ''},
      permission: 'auth:requisitionApproval:view',
      component: RequisitionApprovalViewController,
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
      permission: 'auth:requisitionApproval:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
  ],
}
