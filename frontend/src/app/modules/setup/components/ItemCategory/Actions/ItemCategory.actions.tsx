import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ItemCategoryFormController from '../Form/ItemCategoryForm.controller'
import ItemCategoryViewController from '../View/ItemCategoryView.controller'

export const ItemCategoryAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Item Category',
      action: 'create',
      link: {to: ''},
      permission: 'auth:itemCategory:create',
      component: ItemCategoryFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Item Category',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:itemCategory:edit',
      component: ItemCategoryFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Item Category',
      action: 'view',
      link: {to: ''},
      permission: 'auth:itemCategory:view',
      component: ItemCategoryViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Item Category',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:itemCategory:delete',
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
      permission: 'auth:itemCategory:view',
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
      permission: 'auth:itemCategory:edit',
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
      permission: 'auth:itemCategory:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:itemCategory:multiSelect',
    action_list: [
      {
        type: 'item',
        title: 'Mark as Active',
        action: 'active',
        link: {to: ''},
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Mark as Inactive',
        action: 'inactive',
        link: {to: ''},
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Delete',
        action: 'delete',
        link: {to: ''},
        permission: 'auth:itemCategory:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
}
