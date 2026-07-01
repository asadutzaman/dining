import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ItemConsumptionFormController from '../Form/ItemConsumptionForm.controller'
import ItemConsumptionViewController from '../View/ItemConsumptionView.controller'

export const ItemConsumptionAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Item Consumption',
      action: 'create',
      link: {to: ''},
      permission: 'auth:itemConsumption:create',
      component: ItemConsumptionFormController,
      className: 'grid-view-action',
      // icon: <EyeOutlined />,
    },
    VIEW: {
      type: 'item',
      title: 'View Item Consumption',
      action: 'view',
      link: {to: ''},
      permission: 'auth:itemConsumption:view',
      component: ItemConsumptionViewController,
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
      permission: 'auth:itemConsumption:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
  ],
}
