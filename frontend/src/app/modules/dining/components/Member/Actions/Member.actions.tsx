import DeleteAction from 'src/app/components/Actions/DeleteAction'
import EditAction from 'src/app/components/Actions/EditAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import MemberFormController from '../Form/MemberForm.controller'
import MemberViewController from '../View/MemberView.controller'

export const MemberAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Member',
      action: 'create',
      link: {to: ''},
      permission: 'auth:member:create',
      component: MemberFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Member',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:member:edit',
      component: MemberFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Member',
      action: 'view',
      link: {to: ''},
      permission: 'auth:member:view',
      component: MemberViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Member',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:member:delete',
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
      permission: 'auth:member:view',
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
      permission: 'auth:member:edit',
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
      permission: 'auth:member:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
}
