import DeleteAction from 'src/app/components/Actions/DeleteAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import MealTokenViewController from '../View/MealTokenView.controller'

export const MealTokenAction = {
  COMMON_ACTION: {
    VIEW: {
      type: 'item',
      title: 'View Token',
      action: 'view',
      link: {to: ''},
      permission: 'auth:mealToken:view',
      component: MealTokenViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Token',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:mealToken:delete',
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
      permission: 'auth:mealToken:view',
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
      permission: 'auth:mealToken:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
}
