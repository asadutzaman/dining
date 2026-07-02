import DeleteAction from 'src/app/components/Actions/DeleteAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import PaymentViewController from '../View/PaymentView.controller'

export const PaymentAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Payment',
      action: 'view',
      link: {to: ''},
      permission: 'auth:payment:view',
      component: PaymentViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Payment',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:payment:delete',
      component: '',
      className: 'grid-view-action',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'View',
      action: 'active',
      link: {to: ''},
      permission: 'auth:payment:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:payment:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
}
