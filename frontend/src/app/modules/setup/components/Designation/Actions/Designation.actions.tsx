import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import DesignationFormController from '../Form/DesignationForm.controller'
import DesignationViewController from '../View/DesignationView.controller'
import ViewLink from 'src/app/components/Link/ViewLink'

export const DesignationAction = {
  COMMON_ACTION: {
    LISTING: {
      type: 'item',
      title: 'Job Order',
      action: 'list',
      link: {to: 'designation', urlPrefix: '/admin/setup'},
      permission: 'example:create',
      component: '',
      className: 'grid-view-action',
      icon: '',
    },
    CREATE: {
      type: 'item',
      title: 'New Designation',
      action: 'create',
      link: {to: ''},
      permission: 'auth:designation:create',
      component: DesignationFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Designation',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:designation:edit',
      component: DesignationFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Designation',
      action: 'view',
      link: {to: ''},
      permission: 'auth:designation:view',
      component: DesignationViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Designation',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:designation:delete',
      component: '',
      className: 'grid-view-action',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'View',
      action: 'active',
      link: {to: 'view'},
      permission: 'auth:designation:view',
      component: ViewLink,
      className: 'grid-view-action',
      icon: 'information-4',
    },
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: {to: ''},
      permission: 'auth:designation:edit',
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
      permission: 'auth:designation:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:designation:multiSelect',
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
        permission: 'auth:designation:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
}
