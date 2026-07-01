import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import PatientFormController from '../Form/PatientForm.controller'
import PatientViewController from '../View/PatientView.controller'

export const PatientAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Patient',
      action: 'create',
      link: {to: ''},
      permission: 'auth:patient:create',
      component: PatientFormController,
      className: 'grid-view-action',
    },
    VIEW: {
      type: 'item',
      title: 'View Patient',
      action: 'view',
      link: {to: ''},
      permission: 'auth:patient:view',
      component: PatientViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Patient',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:patient:edit',
      component: PatientFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Patient',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:patient:delete',
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
      permission: 'auth:patient:view',
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
      permission: 'auth:patient:edit',
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
      permission: 'auth:patient:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:patient:multiSelect',
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
        permission: 'auth:patient:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
}
