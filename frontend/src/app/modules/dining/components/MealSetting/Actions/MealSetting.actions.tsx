import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import MealSettingFormController from '../Form/MealSettingForm.controller'
import MealSettingViewController from '../View/MealSettingView.controller'

export const MealSettingAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Meal Cost Setting',
      action: 'create',
      link: {to: ''},
      permission: 'auth:mealSetting:create',
      component: MealSettingFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Meal Cost Setting',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:mealSetting:edit',
      component: MealSettingFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Meal Cost Setting',
      action: 'view',
      link: {to: ''},
      permission: 'auth:mealSetting:view',
      component: MealSettingViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Meal Cost Setting',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:mealSetting:delete',
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
      permission: 'auth:mealSetting:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: {to: ''},
      permission: 'auth:mealSetting:edit',
      component: EditAction,
      className: '',
      modalId: 'edit',
      icon: 'pencil',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:mealSetting:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
}
